import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'loans.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Generate realistic initial data
function generateSeedLoans() {
  const today = new Date();
  const formatYMD = (d) => d.toISOString().split('T')[0];

  const addDays = (d, days) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  };

  const seed = [
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
      status: "pending", // Pending approval
      notes: "Reading with an oat cortado on the patio.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 mins ago
    },
    {
      id: "SAN-8490",
      bookNames: ["The Midnight Library - Matt Haig", "Days at the Morisaki Bookshop - Satoshi Yagisawa"],
      borrowerName: "David Kim",
      phoneNumber: "+1 (555) 782-4190",
      email: "david.kim@example.com",
      address: "88 Pinecrest Ave, Suite 2",
      borrowDate: formatYMD(addDays(today, -7)),
      committedReturnDate: formatYMD(today), // DUE TODAY!
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
      committedReturnDate: formatYMD(addDays(today, -4)), // OVERDUE by 4 days!
      photoUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
      status: "active",
      approvedAt: formatYMD(addDays(today, -18)),
      notes: "Sent courtesy reminder message via WhatsApp yesterday",
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

  return seed;
}

export function loadLoans() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = generateSeedLoans();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db file:', err);
    return [];
  }
}

export function saveLoans(loans) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(loans, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db file:', err);
    return false;
  }
}

export function generateLoanId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SAN-${randomNum}`;
}

const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

function generateSeedBooks() {
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

export function loadBooks() {
  try {
    if (!fs.existsSync(BOOKS_FILE)) {
      const seed = generateSeedBooks();
      fs.writeFileSync(BOOKS_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading books file:', err);
    return [];
  }
}

export function saveBooks(books) {
  try {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing books file:', err);
    return false;
  }
}

export function generateBookId() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `BK-${randomNum}`;
}
