import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { StatsCards } from './StatsCards';
import { LoanManagementTable } from './LoanManagementTable';
import { ApprovalQueue } from './ApprovalQueue';
import { AnalyticsView } from './AnalyticsView';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  BarChart3,
  Coffee,
  RotateCcw,
  Sparkles,
  QrCode,
  Radio,
  Bell
} from 'lucide-react';
import { CounterQRModal } from '../common/CounterQRModal';

export const ShopkeeperDashboard: React.FC = () => {
  const { loans, stats, notifications, sseConnected, refreshData } = useSanctuary();

  const [activeSubTab, setActiveSubTab] = useState<'loans' | 'approvals' | 'analytics'>('loans');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const pendingCount = stats?.pendingCount || 0;
  const overdueCount = stats?.overdueCount || 0;
  const dueTodayCount = stats?.dueTodayCount || 0;

  // Filtered loans for table
  const filteredLoans = loans.filter((loan) => {
    // Filter by tab
    if (currentFilter === 'pending' && loan.status !== 'pending') return false;
    if (currentFilter === 'active' && (loan.status !== 'active' || loan.isOverdue || loan.isDueToday)) return false;
    if (currentFilter === 'due_today' && !loan.isDueToday) return false;
    if (currentFilter === 'overdue' && !loan.isOverdue) return false;
    if (currentFilter === 'returned' && loan.status !== 'returned') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = loan.borrowerName.toLowerCase().includes(q);
      const matchId = loan.id.toLowerCase().includes(q);
      const matchPhone = loan.phoneNumber.includes(q);
      const matchBook = loan.bookNames.some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchId && !matchPhone && !matchBook) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Top Banner & Shop Info */}
      <div className="bg-white rounded-3xl border border-sanctuary-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sanctuary-900 text-sanctuary-200 flex items-center justify-center shadow-warm">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-black text-coffee-dark">
                Shopkeeper Command Hub
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Manage book lending requests, monitor returns, and track reading circulation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sanctuary-100/70 hover:bg-sanctuary-200/80 text-sanctuary-900 text-xs font-semibold border border-sanctuary-200 transition-colors"
          >
            <QrCode className="w-4 h-4 text-sanctuary-700" />
            <span>Counter Standee</span>
          </button>

          <button
            onClick={() => refreshData()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
            title="Refresh database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-time Alerts Banner for Due Today & Overdue */}
      {(overdueCount > 0 || dueTodayCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {overdueCount > 0 && (
            <div
              onClick={() => {
                setActiveSubTab('loans');
                setCurrentFilter('overdue');
              }}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-rose-100/80 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-200/60 rounded-xl text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950">
                    {overdueCount} Book Loan(s) Overdue
                  </h4>
                  <p className="text-[11px] text-rose-800">
                    Committed return dates have passed. Click to view & send WhatsApp reminder.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700">&rarr;</span>
            </div>
          )}

          {dueTodayCount > 0 && (
            <div
              onClick={() => {
                setActiveSubTab('loans');
                setCurrentFilter('due_today');
              }}
              className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100/80 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-200/60 rounded-xl text-orange-800">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-orange-950">
                    {dueTodayCount} Book(s) Due for Return Today
                  </h4>
                  <p className="text-[11px] text-orange-800">
                    Expected at the counter drop-box today.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-700">&rarr;</span>
            </div>
          )}
        </div>
      )}

      {/* Sub-Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-sanctuary-200 pb-3 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('loans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeSubTab === 'loans'
              ? 'bg-sanctuary-900 text-white shadow-warm'
              : 'text-stone-600 hover:bg-sanctuary-100/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Loans Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeSubTab === 'approvals'
              ? 'bg-sanctuary-900 text-white shadow-warm'
              : 'text-stone-600 hover:bg-sanctuary-100/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Approval Queue</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-sanctuary-900 text-white shadow-warm'
              : 'text-stone-600 hover:bg-sanctuary-100/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monthly Analytics & Reports</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'loans' && (
        <div className="space-y-6">
          {/* Stats KPI Cards */}
          <StatsCards
            currentFilter={currentFilter}
            onSelectFilter={(f) => setCurrentFilter(f)}
          />

          {/* Table / Cards */}
          <LoanManagementTable
            loans={filteredLoans}
            currentFilter={currentFilter}
            onSelectFilter={(f) => setCurrentFilter(f)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />
        </div>
      )}

      {activeSubTab === 'approvals' && (
        <ApprovalQueue />
      )}

      {activeSubTab === 'analytics' && (
        <AnalyticsView />
      )}

      {/* Counter Standee Modal */}
      <CounterQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
};
