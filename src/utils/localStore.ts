import { Loan, LoanStats, SystemNotification, AnalyticsData, BookItem } from '../types/loan';

const LOANS_STORAGE_KEY = 'the_sanctuary_loans_v1';
const BOOKS_STORAGE_KEY = 'the_sanctuary_books_v1';

function formatYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, days: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

function generateInitialLoans(): Loan[] {
  const today = new Date();
  return [
    {
      id: "SAN-8491",
      bookNames: ["Before the Coffee Gets Cold - Toshikazu Kawaguchi"],
      borrowerName: "Maya Lin",
      phoneNumber: "+1 (555) 349-8201",
      email: "maya.lin@example.com",
      address: "Apartment 4B, 142 Willow Lane",
      borrowDate: formatYMD(today),
      committedReturnDate: formatYMD(addDays(today, 14)),
      photoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      status: "pending",
      notes: "Reading with an oat cortado on the patio.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "SAN-8490",
      bookNames: ["The Midnight Library - Matt Haig", "Days at the Morisaki Bookshop - Satoshi Yagisawa"],
      borrowerName: "David Kim",
      phoneNumber: "+1 (555) 782-4190",
      email: "david.kim@example.com",
      address: "88 Pinecrest Ave, Suite 2",
      borrowDate: formatYMD(addDays(today, -7)),
      committedReturnDate: formatYMD(today), // DUE TODAY
      photoUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
      status: "active",
      approvedAt: formatYMD(addDays(today, -7)),
      notes: "Regular morning customer",
      createdAt: addDays(today, -7).toISOString()
    },
    {
      id: "SAN-8488",
      bookNames: ["Norwegian Wood - Haruki Murakami"],
      borrowerName: "Sophia Martinez",
      phoneNumber: "+1 (555) 234-9012",
      email: "sophia.m@example.com",
      address: "12 Elm St, Apt 3",
      borrowDate: formatYMD(addDays(today, -18)),
      committedReturnDate: formatYMD(addDays(today, -4)), // OVERDUE
      photoUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
      status: "active",
      approvedAt: formatYMD(addDays(today, -18)),
      notes: "Courtesy reminder sent via WhatsApp",
      createdAt: addDays(today, -18).toISOString()
    },
    {
      id: "SAN-8485",
      bookNames: ["Klara and the Sun - Kazuo Ishiguro"],
      borrowerName: "Marcus Vance",
      phoneNumber: "+1 (555) 671-8823",
      email: "marcus.v@example.com",
      address: "450 Market Street",
      borrowDate: formatYMD(addDays(today, -5)),
      committedReturnDate: formatYMD(addDays(today, 9)),
      photoUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
      status: "active",
      approvedAt: formatYMD(addDays(today, -5)),
      notes: "First time borrower",
      createdAt: addDays(today, -5).toISOString()
    },
    {
      id: "SAN-8472",
      bookNames: ["A Gentleman in Moscow - Amor Towles"],
      borrowerName: "Elena Rostova",
      phoneNumber: "+1 (555) 912-3401",
      email: "elena.r@example.com",
      address: "220 Cedar Terrace",
      borrowDate: formatYMD(addDays(today, -25)),
      committedReturnDate: formatYMD(addDays(today, -11)),
      returnDate: formatYMD(addDays(today, -12)),
      photoUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
      status: "returned",
      returnCondition: "Pristine condition, returned with bookmark intact.",
      approvedAt: formatYMD(addDays(today, -25)),
      createdAt: addDays(today, -25).toISOString()
    },
    {
      id: "SAN-8460",
      bookNames: ["What You Are Looking For Is in the Library - Michiko Aoyama"],
      borrowerName: "Oliver Wright",
      phoneNumber: "+1 (555) 443-1289",
      email: "oliver.w@example.com",
      address: "",
      borrowDate: formatYMD(addDays(today, -40)),
      committedReturnDate: formatYMD(addDays(today, -26)),
      returnDate: formatYMD(addDays(today, -25)),
      photoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      status: "returned",
      returnCondition: "Good condition",
      approvedAt: formatYMD(addDays(today, -40)),
      createdAt: addDays(today, -40).toISOString()
    },
    {
      id: "SAN-8451",
      bookNames: ["The Little Paris Bookshop - Nina George"],
      borrowerName: "Chloe Bennett",
      phoneNumber: "+1 (555) 887-3421",
      email: "chloe.b@example.com",
      address: "109 Sunset Blvd",
      borrowDate: formatYMD(addDays(today, -60)),
      committedReturnDate: formatYMD(addDays(today, -46)),
      returnDate: formatYMD(addDays(today, -45)),
      photoUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
      status: "returned",
      returnCondition: "Returned on time",
      approvedAt: formatYMD(addDays(today, -60)),
      createdAt: addDays(today, -60).toISOString()
    }
  ];
}

function generateInitialBooks(): BookItem[] {
  return [
    {
      id: "BK-101",
      title: "Before the Coffee Gets Cold",
      author: "Toshikazu Kawaguchi",
      category: "Magical Realism",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      available: true,
      description: "In a small back alley in Tokyo, there is a cafe which has been serving carefully brewed coffee for more than one hundred years.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-102",
      title: "Days at the Morisaki Bookshop",
      author: "Satoshi Yagisawa",
      category: "Japanese Fiction",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
      available: true,
      description: "A heartwarming tale of second chances, family love, and the wonder of used books in Tokyo's literary district.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-103",
      title: "The Midnight Library",
      author: "Matt Haig",
      category: "Contemporary Fiction",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
      available: false,
      description: "Between life and death there is a library with endless books offering chances to undo past regrets.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-104",
      title: "Norwegian Wood",
      author: "Haruki Murakami",
      category: "Literary Fiction",
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
      available: false,
      description: "A poignant coming-of-age story set against 1960s Tokyo student movements, music, and nostalgia.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-105",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      category: "Speculative Fiction",
      image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
      available: false,
      description: "An Artificial Friend watches the world and customers from a store window with outstanding observation.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-106",
      title: "A Gentleman in Moscow",
      author: "Amor Towles",
      category: "Historical Fiction",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      available: true,
      description: "A Russian aristocrat is sentenced to spend the remainder of his days inside the luxurious Hotel Metropol.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-107",
      title: "What You Are Looking For Is in the Library",
      author: "Michiko Aoyama",
      category: "Japanese Fiction",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
      available: true,
      description: "An enigmatic Tokyo librarian hands readers an unexpected title and felt trinket that changes their lives.",
      createdAt: new Date().toISOString()
    },
    {
      id: "BK-108",
      title: "The Little Paris Bookshop",
      author: "Nina George",
      category: "Romance & Philosophy",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
      available: true,
      description: "Monsieur Perdu prescribes novels for the hardships of life on his floating barge bookstore on the Seine.",
      createdAt: new Date().toISOString()
    }
  ];
}

function augmentLoan(loan: Loan): Loan {
  const todayStr = formatYMD(new Date());
  const isOverdue = loan.status === 'active' && loan.committedReturnDate < todayStr;
  const isDueToday = loan.status === 'active' && loan.committedReturnDate === todayStr;

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
    daysLeft: daysDifference
  };
}

function readStoredLoans(): Loan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOANS_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialLoans();
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return generateInitialLoans();
  }
}

function writeStoredLoans(loans: Loan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function readStoredBooks(): BookItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialBooks();
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return generateInitialBooks();
  }
}

function writeStoredBooks(books: BookItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export const localStore = {
  getLoans(params?: { status?: string; search?: string; month?: string; year?: string }): Loan[] {
    const loans = readStoredLoans().map(augmentLoan);
    let filtered = [...loans];

    if (params?.status && params.status !== 'all') {
      if (params.status === 'overdue') {
        filtered = filtered.filter(l => l.isOverdue);
      } else if (params.status === 'due_today') {
        filtered = filtered.filter(l => l.isDueToday);
      } else {
        filtered = filtered.filter(l => l.status === params.status);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(l =>
        l.borrowerName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phoneNumber.includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.bookNames.some(b => b.toLowerCase().includes(q))
      );
    }

    if (params?.year) {
      filtered = filtered.filter(l => {
        const d = l.borrowDate || l.createdAt;
        return d && d.startsWith(params.year!);
      });
    }

    if (params?.month && params?.year) {
      const prefix = `${params.year}-${String(params.month).padStart(2, '0')}`;
      filtered = filtered.filter(l => {
        const d = l.borrowDate || l.createdAt;
        return d && d.startsWith(prefix);
      });
    }

    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      if (a.isOverdue && !b.isOverdue) return -1;
      if (b.isOverdue && !a.isOverdue) return 1;
      return new Date(b.createdAt || b.borrowDate).getTime() - new Date(a.createdAt || a.borrowDate).getTime();
    });

    return filtered;
  },

  getLoanById(id: string): Loan {
    const loans = readStoredLoans().map(augmentLoan);
    const found = loans.find(l => l.id === id);
    if (!found) throw new Error('Loan not found');
    return found;
  },

  submitLoan(formData: FormData): Loan {
    const loans = readStoredLoans();
    let bookNames: string[] = [];
    const bookNamesRaw = formData.get('bookNames') as string;
    try {
      bookNames = JSON.parse(bookNamesRaw);
    } catch {
      bookNames = (bookNamesRaw || '').split(',').map(s => s.trim()).filter(Boolean);
    }

    const borrowerName = (formData.get('borrowerName') as string) || '';
    const phoneNumber = (formData.get('phoneNumber') as string) || '';
    const email = (formData.get('email') as string) || '';
    const address = (formData.get('address') as string) || '';
    const committedReturnDate = (formData.get('committedReturnDate') as string) || '';
    const notes = (formData.get('notes') as string) || '';
    const photoBase64 = (formData.get('photoBase64') as string) || '';

    const newLoan: Loan = {
      id: `SAN-${Math.floor(1000 + Math.random() * 9000)}`,
      bookNames,
      borrowerName: borrowerName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      borrowDate: formatYMD(new Date()),
      committedReturnDate,
      photoUrl: photoBase64 || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    loans.unshift(newLoan);
    writeStoredLoans(loans);
    return augmentLoan(newLoan);
  },

  approveLoan(id: string, shopkeeperNote?: string): Loan {
    const loans = readStoredLoans();
    const index = loans.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Loan not found');

    loans[index].status = 'active';
    loans[index].approvedAt = formatYMD(new Date());
    if (shopkeeperNote) loans[index].shopkeeperNote = shopkeeperNote;

    writeStoredLoans(loans);
    return augmentLoan(loans[index]);
  },

  rejectLoan(id: string, reason: string): Loan {
    const loans = readStoredLoans();
    const index = loans.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Loan not found');

    loans[index].status = 'rejected';
    loans[index].rejectionReason = reason;

    writeStoredLoans(loans);
    return augmentLoan(loans[index]);
  },

  returnLoan(id: string, condition: string, notes?: string): Loan {
    const loans = readStoredLoans();
    const index = loans.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Loan not found');

    loans[index].status = 'returned';
    loans[index].returnDate = formatYMD(new Date());
    loans[index].returnCondition = condition;
    if (notes) loans[index].returnNotes = notes;

    writeStoredLoans(loans);
    return augmentLoan(loans[index]);
  },

  extendLoan(id: string, newDate: string, reason?: string): Loan {
    const loans = readStoredLoans();
    const index = loans.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Loan not found');

    loans[index].committedReturnDate = newDate;
    loans[index].extensionNotes = reason || 'Customer requested extension';

    writeStoredLoans(loans);
    return augmentLoan(loans[index]);
  },

  getStats(): LoanStats {
    const loans = readStoredLoans().map(augmentLoan);
    const pending = loans.filter(l => l.status === 'pending');
    const active = loans.filter(l => l.status === 'active');
    const dueToday = loans.filter(l => l.isDueToday);
    const overdue = loans.filter(l => l.isOverdue);
    const returned = loans.filter(l => l.status === 'returned');
    const totalBooksCount = loans.reduce((acc, l) => acc + (l.bookNames ? l.bookNames.length : 1), 0);

    const totalCompletedOrOverdue = returned.length + overdue.length;
    const onTimeRate = totalCompletedOrOverdue > 0
      ? Math.round((returned.length / totalCompletedOrOverdue) * 100)
      : 100;

    return {
      pendingCount: pending.length,
      activeCount: active.length,
      dueTodayCount: dueToday.length,
      overdueCount: overdue.length,
      returnedCount: returned.length,
      totalLoans: loans.length,
      totalBooksCount,
      onTimeRate
    };
  },

  getNotifications(): { unreadCount: number; alerts: SystemNotification[] } {
    const loans = readStoredLoans().map(augmentLoan);
    const alerts: SystemNotification[] = [];

    loans.filter(l => l.status === 'pending').forEach(l => {
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

    loans.filter(l => l.isDueToday).forEach(l => {
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

    loans.filter(l => l.isOverdue).forEach(l => {
      alerts.push({
        id: `overdue-${l.id}`,
        type: 'overdue',
        severity: 'danger',
        title: 'Book Loan Overdue!',
        message: `"${l.bookNames[0]}" borrowed by ${l.borrowerName} is ${Math.abs(l.daysLeft || 0)} days overdue!`,
        loanId: l.id,
        phoneNumber: l.phoneNumber,
        timestamp: l.committedReturnDate
      });
    });

    return {
      unreadCount: alerts.length,
      alerts
    };
  },

  getAnalytics(year = new Date().getFullYear().toString(), month?: string): AnalyticsData {
    const loans = readStoredLoans().map(augmentLoan);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyData = monthNames.map((name, index) => {
      const monthNum = String(index + 1).padStart(2, '0');
      const prefix = `${year}-${monthNum}`;

      const monthLoans = loans.filter(l => {
        const d = l.borrowDate || l.createdAt;
        return d && d.startsWith(prefix);
      });

      return {
        month: name,
        monthNum: index + 1,
        totalLoans: monthLoans.length,
        returned: monthLoans.filter(l => l.status === 'returned').length,
        overdue: monthLoans.filter(l => l.isOverdue).length
      };
    });

    const bookFrequency: Record<string, number> = {};
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

    const statusCounts = {
      pending: loans.filter(l => l.status === 'pending').length,
      active: loans.filter(l => l.status === 'active' && !l.isOverdue && !l.isDueToday).length,
      dueToday: loans.filter(l => l.isDueToday).length,
      overdue: loans.filter(l => l.isOverdue).length,
      returned: loans.filter(l => l.status === 'returned').length,
    };

    return {
      year,
      monthlyData,
      popularBooks,
      statusCounts,
      totalRecorded: loans.length
    };
  },

  getBooks(params?: { search?: string; category?: string }): BookItem[] {
    const books = readStoredBooks();
    let filtered = [...books];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(b => b.category.toLowerCase() === params.category!.toLowerCase());
    }

    return filtered;
  },

  getBookById(id: string): BookItem {
    const books = readStoredBooks();
    const found = books.find(b => b.id === id);
    if (!found) throw new Error('Book not found');
    return found;
  },

  createBook(formData: FormData): BookItem {
    const books = readStoredBooks();
    const title = (formData.get('title') as string) || '';
    const author = (formData.get('author') as string) || '';
    const category = (formData.get('category') as string) || 'General';
    const description = (formData.get('description') as string) || '';
    const available = formData.get('available') === 'true';
    const image = (formData.get('imageBase64') as string) || (formData.get('image') as string) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

    const newBook: BookItem = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      image,
      available,
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    books.unshift(newBook);
    writeStoredBooks(books);
    return newBook;
  },

  updateBook(id: string, formData: FormData): BookItem {
    const books = readStoredBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');

    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const availableStr = formData.get('available') as string;
    const image = (formData.get('imageBase64') as string) || (formData.get('image') as string);

    if (title) books[index].title = title.trim();
    if (author) books[index].author = author.trim();
    if (category) books[index].category = category.trim();
    if (description !== undefined && description !== null) books[index].description = description.trim();
    if (availableStr !== null && availableStr !== undefined) books[index].available = availableStr === 'true';
    if (image) books[index].image = image;

    books[index].updatedAt = new Date().toISOString();
    writeStoredBooks(books);
    return books[index];
  },

  deleteBook(id: string): { success: boolean } {
    const books = readStoredBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    books.splice(index, 1);
    writeStoredBooks(books);
    return { success: true };
  }
};
