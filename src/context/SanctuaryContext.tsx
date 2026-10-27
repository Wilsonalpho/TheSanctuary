import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Loan, LoanStats, SystemNotification, BookItem } from '../types/loan';
import { api } from '../utils/api';
import { soundEffects, requestNotificationPermission, showBrowserNotification } from '../utils/audioAlert';

interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
}

interface SanctuaryContextType {
  loans: Loan[];
  books: BookItem[];
  stats: LoanStats | null;
  notifications: SystemNotification[];
  loading: boolean;
  sseConnected: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  activeTab: 'borrow' | 'my-loans' | 'shopkeeper';
  setActiveTab: (tab: 'borrow' | 'my-loans' | 'shopkeeper') => void;
  refreshData: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  requestNotifications: () => Promise<boolean>;
  selectedLoanForModal: Loan | null;
  setSelectedLoanForModal: (loan: Loan | null) => void;
}

const SanctuaryContext = createContext<SanctuaryContextType | undefined>(undefined);

export const SanctuaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'borrow' | 'my-loans' | 'shopkeeper'>('borrow');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedLoanForModal, setSelectedLoanForModal] = useState<Loan | null>(null);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    soundEffects.enabled = newVal;
    if (newVal) {
      soundEffects.playSuccessTone();
    }
  };

  const requestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      addToast({
        type: 'success',
        title: 'Notifications Enabled',
        message: 'You will receive real-time alerts for new borrow requests and overdue books.',
      });
    }
    return granted;
  };

  const refreshBooks = useCallback(async () => {
    try {
      const fetchedBooks = await api.getBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedLoans, fetchedStats, fetchedNotifs, fetchedBooks] = await Promise.all([
        api.getLoans(),
        api.getStats(),
        api.getNotifications(),
        api.getBooks(),
      ]);
      setLoans(fetchedLoans);
      setStats(fetchedStats);
      setNotifications(fetchedNotifs.alerts);
      setBooks(fetchedBooks);
    } catch (err) {
      console.error('Failed to load Sanctuary data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Connect to Server-Sent Events (SSE) for real-time live updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setSseConnected(true);
          reconnectAttempts = 0;
        };

        eventSource.addEventListener('connected', () => {
          setSseConnected(true);
          reconnectAttempts = 0;
        });

      // New borrow request received from customer
      eventSource.addEventListener('new_request', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          soundEffects.playNewRequestChime();
          showBrowserNotification('📖 New Book Borrow Request', {
            body: data.message,
          });
          addToast({
            type: 'warning',
            title: 'New Borrow Request Pending',
            message: data.message,
          });
          refreshData();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      // Loan approved
      eventSource.addEventListener('loan_approved', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          soundEffects.playSuccessTone();
          addToast({
            type: 'success',
            title: 'Loan Approved',
            message: data.message,
          });
          refreshData();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      // Loan rejected
      eventSource.addEventListener('loan_rejected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          addToast({
            type: 'info',
            title: 'Loan Rejected',
            message: data.message,
          });
          refreshData();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      // Loan returned
      eventSource.addEventListener('loan_returned', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          soundEffects.playSuccessTone();
          addToast({
            type: 'success',
            title: 'Book Returned',
            message: data.message,
          });
          refreshData();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      // Loan extended
      eventSource.addEventListener('loan_extended', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          addToast({
            type: 'info',
            title: 'Due Date Extended',
            message: data.message,
          });
          refreshData();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      // Book Catalog live events
      eventSource.addEventListener('book_added', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          addToast({
            type: 'info',
            title: 'Catalog Updated',
            message: data.message,
          });
          refreshBooks();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      eventSource.addEventListener('book_updated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          addToast({
            type: 'info',
            title: 'Book Updated',
            message: data.message,
          });
          refreshBooks();
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      });

      eventSource.addEventListener('book_deleted', () => {
        refreshBooks();
      });

      eventSource.onerror = () => {
        setSseConnected(false);
        if (eventSource) {
          eventSource.close();
        }
        reconnectAttempts++;
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeout = setTimeout(connectSSE, 5000);
        }
      };
    } catch {
      setSseConnected(false);
    }
  };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      clearTimeout(reconnectTimeout);
    };
  }, [addToast, refreshData, refreshBooks]);

  return (
    <SanctuaryContext.Provider
      value={{
        loans,
        books,
        stats,
        notifications,
        loading,
        sseConnected,
        soundEnabled,
        toggleSound,
        activeTab,
        setActiveTab,
        refreshData,
        refreshBooks,
        toasts,
        removeToast,
        addToast,
        requestNotifications,
        selectedLoanForModal,
        setSelectedLoanForModal,
      }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
};

export const useSanctuary = () => {
  const context = useContext(SanctuaryContext);
  if (!context) {
    throw new Error('useSanctuary must be used within a SanctuaryProvider');
  }
  return context;
};
