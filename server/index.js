import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadLoans, saveLoans, generateLoanId } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for book photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `book-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Server-Sent Events (SSE) clients list
let sseClients = [];

function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// SSE endpoint for real-time dashboard updates & notifications
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connection acknowledgement
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, message: 'Connected to The Sanctuary live stream' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Helper to determine loan state relative to date
function augmentLoan(loan) {
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = loan.status === 'active' && loan.committedReturnDate < todayStr;
  const isDueToday = loan.status === 'active' && loan.committedReturnDate === todayStr;
  
  // Calculate days overdue or days left
  let daysDifference = 0;
  if (loan.committedReturnDate) {
    const returnTime = new Date(loan.committedReturnDate + 'T00:00:00').getTime();
    const todayTime = new Date(todayStr + 'T00:00:00').getTime();
    daysDifference = Math.round((returnTime - todayTime) / (1000 * 60 * 60 * 24));
  }

  return {
    ...loan,
    isOverdue,
    isDueToday,
    daysLeft: daysDifference,
  };
}

// 1. GET /api/loans - fetch loans with optional filters
app.get('/api/loans', (req, res) => {
  const loans = loadLoans();
  const { status, search, month, year } = req.query;

  let filtered = loans.map(augmentLoan);

  if (status && status !== 'all') {
    if (status === 'overdue') {
      filtered = filtered.filter(l => l.isOverdue);
    } else if (status === 'due_today') {
      filtered = filtered.filter(l => l.isDueToday);
    } else {
      filtered = filtered.filter(l => l.status === status);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l => 
      l.borrowerName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phoneNumber.includes(q) ||
      l.id.toLowerCase().includes(q) ||
      l.bookNames.some(b => b.toLowerCase().includes(q))
    );
  }

  if (year) {
    filtered = filtered.filter(l => {
      const date = l.borrowDate || l.createdAt;
      return date && date.startsWith(year);
    });
  }

  if (month && year) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    filtered = filtered.filter(l => {
      const date = l.borrowDate || l.createdAt;
      return date && date.startsWith(prefix);
    });
  }

  // Sort: pending first, then overdue, then due today, then most recent
  filtered.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    if (a.isOverdue && !b.isOverdue) return -1;
    if (b.isOverdue && !a.isOverdue) return 1;
    return new Date(b.createdAt || b.borrowDate).getTime() - new Date(a.createdAt || a.borrowDate).getTime();
  });

  res.json(filtered);
});

// 2. GET /api/loans/:id - single loan detail
app.get('/api/loans/:id', (req, res) => {
  const loans = loadLoans();
  const found = loans.find(l => l.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Loan request not found' });
  }
  res.json(augmentLoan(found));
});

// 3. POST /api/loans - submit new loan request by borrower
app.post('/api/loans', upload.single('photo'), (req, res) => {
  try {
    const loans = loadLoans();
    const body = req.body;

    let bookNames = [];
    if (Array.isArray(body.bookNames)) {
      bookNames = body.bookNames;
    } else if (typeof body.bookNames === 'string') {
      try {
        const parsed = JSON.parse(body.bookNames);
        bookNames = Array.isArray(parsed) ? parsed : [body.bookNames];
      } catch (e) {
        bookNames = body.bookNames.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (!bookNames || bookNames.length === 0) {
      return res.status(400).json({ error: 'At least one book name is required' });
    }
    if (!body.borrowerName || !body.phoneNumber || !body.email || !body.committedReturnDate) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Determine photoUrl: either uploaded file or base64 photoData
    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (body.photoBase64) {
      // Save base64 data to disk
      try {
        const matches = body.photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1].includes('png') ? '.png' : '.jpg';
          const filename = `book-cam-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
          photoUrl = `/uploads/${filename}`;
        }
      } catch (err) {
        console.error('Failed to parse base64 image:', err);
      }
    } else if (body.photoUrl) {
      photoUrl = body.photoUrl;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newLoan = {
      id: generateLoanId(),
      bookNames,
      borrowerName: body.borrowerName.trim(),
      phoneNumber: body.phoneNumber.trim(),
      email: body.email.trim(),
      address: body.address ? body.address.trim() : '',
      borrowDate: todayStr,
      committedReturnDate: body.committedReturnDate,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      status: 'pending', // Requires Shopkeeper approval!
      notes: body.notes ? body.notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    loans.unshift(newLoan);
    saveLoans(loans);

    // Notify connected shopkeepers via SSE!
    const augmented = augmentLoan(newLoan);
    broadcastSSE('new_request', {
      type: 'new_request',
      loan: augmented,
      message: `New borrow request received from ${newLoan.borrowerName} for ${newLoan.bookNames.length} book(s)!`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(augmented);
  } catch (err) {
    console.error('Error creating loan request:', err);
    res.status(500).json({ error: 'Server failed to process lending form' });
  }
});

// 4. POST /api/loans/:id/approve - shopkeeper approves request
app.post('/api/loans/:id/approve', (req, res) => {
  const loans = loadLoans();
  const index = loans.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  loans[index].status = 'active';
  loans[index].approvedAt = todayStr;
  if (req.body.shopkeeperNote) {
    loans[index].shopkeeperNote = req.body.shopkeeperNote;
  }

  saveLoans(loans);
  const updated = augmentLoan(loans[index]);

  broadcastSSE('loan_approved', {
    type: 'loan_approved',
    loan: updated,
    message: `Loan for ${updated.borrowerName} (${updated.id}) has been approved!`,
    timestamp: new Date().toISOString()
  });

  res.json(updated);
});

// 5. POST /api/loans/:id/reject - shopkeeper rejects request
app.post('/api/loans/:id/reject', (req, res) => {
  const loans = loadLoans();
  const index = loans.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  loans[index].status = 'rejected';
  loans[index].rejectionReason = req.body.reason || 'Book unavailable or details could not be verified.';

  saveLoans(loans);
  const updated = augmentLoan(loans[index]);

  broadcastSSE('loan_rejected', {
    type: 'loan_rejected',
    loan: updated,
    message: `Loan ${updated.id} rejected. Reason: ${loans[index].rejectionReason}`,
    timestamp: new Date().toISOString()
  });

  res.json(updated);
});

// 6. POST /api/loans/:id/return - mark book as returned
app.post('/api/loans/:id/return', (req, res) => {
  const loans = loadLoans();
  const index = loans.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  loans[index].status = 'returned';
  loans[index].returnDate = todayStr;
  loans[index].returnCondition = req.body.returnCondition || 'Good condition';
  if (req.body.notes) {
    loans[index].returnNotes = req.body.notes;
  }

  saveLoans(loans);
  const updated = augmentLoan(loans[index]);

  broadcastSSE('loan_returned', {
    type: 'loan_returned',
    loan: updated,
    message: `${updated.bookNames[0]} returned by ${updated.borrowerName}`,
    timestamp: new Date().toISOString()
  });

  res.json(updated);
});

// 7. POST /api/loans/:id/extend - extend committed return date
app.post('/api/loans/:id/extend', (req, res) => {
  const loans = loadLoans();
  const index = loans.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  const { newReturnDate, reason } = req.body;
  if (!newReturnDate) {
    return res.status(400).json({ error: 'New return date is required' });
  }

  loans[index].committedReturnDate = newReturnDate;
  loans[index].extensionNotes = reason || 'Customer requested extension';

  saveLoans(loans);
  const updated = augmentLoan(loans[index]);

  broadcastSSE('loan_extended', {
    type: 'loan_extended',
    loan: updated,
    message: `Return date extended to ${newReturnDate} for ${updated.borrowerName}`,
    timestamp: new Date().toISOString()
  });

  res.json(updated);
});

// 8. GET /api/stats - dashboard summary metrics
app.get('/api/stats', (req, res) => {
  const loans = loadLoans().map(augmentLoan);

  const pending = loans.filter(l => l.status === 'pending');
  const active = loans.filter(l => l.status === 'active');
  const dueToday = loans.filter(l => l.isDueToday);
  const overdue = loans.filter(l => l.isOverdue);
  const returned = loans.filter(l => l.status === 'returned');

  // Total books borrowed (considering each loan may have multiple books)
  const totalBooksCount = loans.reduce((acc, l) => acc + (l.bookNames ? l.bookNames.length : 1), 0);

  // Return rate: returned / (returned + overdue + finished)
  const totalCompletedOrOverdue = returned.length + overdue.length;
  const onTimeRate = totalCompletedOrOverdue > 0
    ? Math.round((returned.length / totalCompletedOrOverdue) * 100)
    : 100;

  res.json({
    pendingCount: pending.length,
    activeCount: active.length,
    dueTodayCount: dueToday.length,
    overdueCount: overdue.length,
    returnedCount: returned.length,
    totalLoans: loans.length,
    totalBooksCount,
    onTimeRate
  });
});

// 9. GET /api/notifications - current system alerts
app.get('/api/notifications', (req, res) => {
  const loans = loadLoans().map(augmentLoan);

  const alerts = [];

  // Pending approval notifications
  const pending = loans.filter(l => l.status === 'pending');
  pending.forEach(l => {
    alerts.push({
      id: `pending-${l.id}`,
      type: 'pending_approval',
      severity: 'warning',
      title: 'Borrow Request Pending Approval',
      message: `${l.borrowerName} submitted a borrow request for: ${l.bookNames.join(', ')}`,
      loanId: l.id,
      timestamp: l.createdAt
    });
  });

  // Due today notifications
  const dueToday = loans.filter(l => l.isDueToday);
  dueToday.forEach(l => {
    alerts.push({
      id: `due-${l.id}`,
      type: 'due_today',
      severity: 'info',
      title: 'Book Due for Return Today',
      message: `"${l.bookNames[0]}" borrowed by ${l.borrowerName} is due today!`,
      loanId: l.id,
      phoneNumber: l.phoneNumber,
      timestamp: new Date().toISOString()
    });
  });

  // Overdue notifications
  const overdue = loans.filter(l => l.isOverdue);
  overdue.forEach(l => {
    alerts.push({
      id: `overdue-${l.id}`,
      type: 'overdue',
      severity: 'danger',
      title: 'Book Loan Overdue!',
      message: `"${l.bookNames[0]}" borrowed by ${l.borrowerName} is ${Math.abs(l.daysLeft)} days overdue! (Due: ${l.committedReturnDate})`,
      loanId: l.id,
      phoneNumber: l.phoneNumber,
      timestamp: l.committedReturnDate
    });
  });

  res.json({
    unreadCount: alerts.length,
    alerts
  });
});

// 10. GET /api/analytics - monthly and yearly statistics
app.get('/api/analytics', (req, res) => {
  const loans = loadLoans().map(augmentLoan);
  const { year = new Date().getFullYear().toString(), month } = req.query;

  // Monthly breakdown for selected year (Jan - Dec)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = monthNames.map((name, index) => {
    const monthNum = String(index + 1).padStart(2, '0');
    const prefix = `${year}-${monthNum}`;

    const monthLoans = loans.filter(l => {
      const d = l.borrowDate || l.createdAt;
      return d && d.startsWith(prefix);
    });

    const monthReturned = monthLoans.filter(l => l.status === 'returned').length;
    const monthOverdue = monthLoans.filter(l => l.isOverdue).length;

    return {
      month: name,
      monthNum: index + 1,
      totalLoans: monthLoans.length,
      returned: monthReturned,
      overdue: monthOverdue
    };
  });

  // Top borrowed books
  const bookFrequency = {};
  loans.forEach(l => {
    if (Array.isArray(l.bookNames)) {
      l.bookNames.forEach(b => {
        bookFrequency[b] = (bookFrequency[b] || 0) + 1;
      });
    }
  });

  const popularBooks = Object.entries(bookFrequency)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status breakdown
  const statusCounts = {
    pending: loans.filter(l => l.status === 'pending').length,
    active: loans.filter(l => l.status === 'active' && !l.isOverdue && !l.isDueToday).length,
    dueToday: loans.filter(l => l.isDueToday).length,
    overdue: loans.filter(l => l.isOverdue).length,
    returned: loans.filter(l => l.status === 'returned').length,
  };

  res.json({
    year,
    monthlyData,
    popularBooks,
    statusCounts,
    totalRecorded: loans.length
  });
});

// 11. Quick catalog of coffee shop books for fast selection or auto-suggest
app.get('/api/catalog', (req, res) => {
  const catalog = [
    { id: 1, title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", category: "Magical Realism", available: true },
    { id: 2, title: "Days at the Morisaki Bookshop", author: "Satoshi Yagisawa", category: "Contemporary", available: true },
    { id: 3, title: "The Midnight Library", author: "Matt Haig", category: "Fiction", available: false },
    { id: 4, title: "Norwegian Wood", author: "Haruki Murakami", category: "Literary Fiction", available: false },
    { id: 5, title: "Klara and the Sun", author: "Kazuo Ishiguro", category: "Speculative Fiction", available: false },
    { id: 6, title: "A Gentleman in Moscow", author: "Amor Towles", category: "Historical Fiction", available: true },
    { id: 7, title: "What You Are Looking For Is in the Library", author: "Michiko Aoyama", category: "Japanese Fiction", available: true },
    { id: 8, title: "The Little Paris Bookshop", author: "Nina George", category: "Romance / Fiction", available: true },
    { id: 9, title: "Sweet Bean Paste", author: "Durian Sukegawa", category: "Fiction", available: true },
    { id: 10, title: "Convenience Store Woman", author: "Sayaka Murata", category: "Satire", available: true },
  ];
  res.json(catalog);
});

// 12. Serve frontend static assets if dist exists
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`☕ The Sanctuary server listening on http://localhost:${PORT}`);
});
