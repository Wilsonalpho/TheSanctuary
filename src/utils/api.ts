import { Loan, LoanStats, SystemNotification, AnalyticsData, CatalogBook } from '../types/loan';

const API_BASE = '/api';

export const api = {
  // Fetch loans with query params
  async getLoans(params?: { status?: string; search?: string; month?: string; year?: string }): Promise<Loan[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.month) query.append('month', params.month);
    if (params?.year) query.append('year', params.year);

    const res = await fetch(`${API_BASE}/loans?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch loans');
    return res.json();
  },

  // Fetch loan by ID
  async getLoanById(id: string): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans/${id}`);
    if (!res.ok) throw new Error('Loan not found');
    return res.json();
  },

  // Submit new loan request (Borrower Portal)
  async submitLoan(formData: FormData): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit loan request');
    }
    return res.json();
  },

  // Approve loan (Shopkeeper Portal)
  async approveLoan(id: string, shopkeeperNote?: string): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopkeeperNote }),
    });
    if (!res.ok) throw new Error('Failed to approve loan');
    return res.json();
  },

  // Reject loan (Shopkeeper Portal)
  async rejectLoan(id: string, reason: string): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to reject loan');
    return res.json();
  },

  // Return book
  async returnLoan(id: string, returnCondition: string, notes?: string): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnCondition, notes }),
    });
    if (!res.ok) throw new Error('Failed to mark book as returned');
    return res.json();
  },

  // Extend due date
  async extendLoan(id: string, newReturnDate: string, reason?: string): Promise<Loan> {
    const res = await fetch(`${API_BASE}/loans/${id}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newReturnDate, reason }),
    });
    if (!res.ok) throw new Error('Failed to extend return date');
    return res.json();
  },

  // Stats
  async getStats(): Promise<LoanStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ unreadCount: number; alerts: SystemNotification[] }> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  // Analytics
  async getAnalytics(year?: string, month?: string): Promise<AnalyticsData> {
    const query = new URLSearchParams();
    if (year) query.append('year', year);
    if (month) query.append('month', month);

    const res = await fetch(`${API_BASE}/analytics?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Coffee shop book catalog
  async getCatalog(): Promise<CatalogBook[]> {
    const res = await fetch(`${API_BASE}/catalog`);
    if (!res.ok) return [];
    return res.json();
  }
};
