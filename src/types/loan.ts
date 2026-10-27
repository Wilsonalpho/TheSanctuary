export type LoanStatus = 'pending' | 'active' | 'returned' | 'rejected';

export interface Loan {
  id: string;
  bookNames: string[];
  borrowerName: string;
  phoneNumber: string;
  email: string;
  address?: string;
  borrowDate: string; // YYYY-MM-DD
  committedReturnDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  photoUrl: string;
  status: LoanStatus;
  notes?: string;
  returnCondition?: string;
  returnNotes?: string;
  rejectionReason?: string;
  shopkeeperNote?: string;
  extensionNotes?: string;
  approvedAt?: string;
  createdAt: string;
  // Augmented properties
  isOverdue?: boolean;
  isDueToday?: boolean;
  daysLeft?: number;
}

export interface LoanStats {
  pendingCount: number;
  activeCount: number;
  dueTodayCount: number;
  overdueCount: number;
  returnedCount: number;
  totalLoans: number;
  totalBooksCount: number;
  onTimeRate: number;
}

export interface SystemNotification {
  id: string;
  type: 'pending_approval' | 'due_today' | 'overdue' | 'system';
  severity: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  loanId?: string;
  phoneNumber?: string;
  timestamp: string;
}

export interface AnalyticsData {
  year: string;
  monthlyData: {
    month: string;
    monthNum: number;
    totalLoans: number;
    returned: number;
    overdue: number;
  }[];
  popularBooks: {
    title: string;
    count: number;
  }[];
  statusCounts: {
    pending: number;
    active: number;
    dueToday: number;
    overdue: number;
    returned: number;
  };
  totalRecorded: number;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  available: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CatalogBook = BookItem;
