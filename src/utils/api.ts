import { Loan, LoanStats, SystemNotification, AnalyticsData, CatalogBook, BookItem } from '../types/loan';
import { localStore } from './localStore';

const API_BASE = '/api';

/**
 * Executes a network fetch against the backend API.
 * If the backend is unreachable or returns non-JSON (e.g. Netlify/Vercel SPA static index.html fallback),
 * it seamlessly and gracefully falls back to localStore so the application runs 100% autonomously.
 */
async function fetchWithFallback<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If server responded with an error or returned HTML (typical on static hosts like Netlify/Vercel SPA rewrites)
    if (!res.ok || !contentType.includes('application/json')) {
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error(`API responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Fetch loans with query params
  async getLoans(params?: { status?: string; search?: string; month?: string; year?: string }): Promise<Loan[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.month) query.append('month', params.month);
    if (params?.year) query.append('year', params.year);

    return fetchWithFallback(
      `${API_BASE}/loans?${query.toString()}`,
      undefined,
      () => localStore.getLoans(params)
    );
  },

  // Fetch loan by ID
  async getLoanById(id: string): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans/${id}`,
      undefined,
      () => localStore.getLoanById(id)
    );
  },

  // Submit new loan request (Borrower Portal)
  async submitLoan(formData: FormData): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans`,
      {
        method: 'POST',
        body: formData,
      },
      () => localStore.submitLoan(formData)
    );
  },

  // Approve loan (Shopkeeper Portal)
  async approveLoan(id: string, shopkeeperNote?: string): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans/${id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopkeeperNote }),
      },
      () => localStore.approveLoan(id, shopkeeperNote)
    );
  },

  // Reject loan (Shopkeeper Portal)
  async rejectLoan(id: string, reason: string): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans/${id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      },
      () => localStore.rejectLoan(id, reason)
    );
  },

  // Return book
  async returnLoan(id: string, returnCondition: string, notes?: string): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans/${id}/return`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnCondition, notes }),
      },
      () => localStore.returnLoan(id, returnCondition, notes)
    );
  },

  // Extend due date
  async extendLoan(id: string, newReturnDate: string, reason?: string): Promise<Loan> {
    return fetchWithFallback(
      `${API_BASE}/loans/${id}/extend`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newReturnDate, reason }),
      },
      () => localStore.extendLoan(id, newReturnDate, reason)
    );
  },

  // Stats
  async getStats(): Promise<LoanStats> {
    return fetchWithFallback(
      `${API_BASE}/stats`,
      undefined,
      () => localStore.getStats()
    );
  },

  // Notifications
  async getNotifications(): Promise<{ unreadCount: number; alerts: SystemNotification[] }> {
    return fetchWithFallback(
      `${API_BASE}/notifications`,
      undefined,
      () => localStore.getNotifications()
    );
  },

  // Analytics
  async getAnalytics(year?: string, month?: string): Promise<AnalyticsData> {
    const query = new URLSearchParams();
    if (year) query.append('year', year);
    if (month) query.append('month', month);

    return fetchWithFallback(
      `${API_BASE}/analytics?${query.toString()}`,
      undefined,
      () => localStore.getAnalytics(year, month)
    );
  },

  // Books Database Management
  async getBooks(params?: { search?: string; category?: string }): Promise<BookItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);

    return fetchWithFallback(
      `${API_BASE}/books?${query.toString()}`,
      undefined,
      () => localStore.getBooks(params)
    );
  },

  async getBookById(id: string): Promise<BookItem> {
    return fetchWithFallback(
      `${API_BASE}/books/${id}`,
      undefined,
      () => localStore.getBookById(id)
    );
  },

  async createBook(formData: FormData): Promise<BookItem> {
    return fetchWithFallback(
      `${API_BASE}/books`,
      {
        method: 'POST',
        body: formData,
      },
      () => localStore.createBook(formData)
    );
  },

  async updateBook(id: string, formData: FormData): Promise<BookItem> {
    return fetchWithFallback(
      `${API_BASE}/books/${id}`,
      {
        method: 'PUT',
        body: formData,
      },
      () => localStore.updateBook(id, formData)
    );
  },

  async deleteBook(id: string): Promise<{ success: boolean }> {
    return fetchWithFallback(
      `${API_BASE}/books/${id}`,
      {
        method: 'DELETE',
      },
      () => localStore.deleteBook(id)
    );
  },

  // Coffee shop book catalog (alias for borrower quick selection)
  async getCatalog(): Promise<CatalogBook[]> {
    return fetchWithFallback(
      `${API_BASE}/books`,
      undefined,
      () => localStore.getBooks()
    );
  }
};
