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
  RotateCcw,
  QrCode,
  Radio,
  Library
} from 'lucide-react';
import { CounterQRModal } from '../common/CounterQRModal';

export const ShopkeeperDashboard: React.FC = () => {
  const { loans, stats, refreshData } = useSanctuary();

  const [activeSubTab, setActiveSubTab] = useState<'loans' | 'approvals' | 'analytics'>('loans');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const pendingCount = stats?.pendingCount || 0;
  const overdueCount = stats?.overdueCount || 0;
  const dueTodayCount = stats?.dueTodayCount || 0;

  const filteredLoans = loans.filter((loan) => {
    if (currentFilter === 'pending' && loan.status !== 'pending') return false;
    if (currentFilter === 'active' && (loan.status !== 'active' || loan.isOverdue || loan.isDueToday)) return false;
    if (currentFilter === 'due_today' && !loan.isDueToday) return false;
    if (currentFilter === 'overdue' && !loan.isOverdue) return false;
    if (currentFilter === 'returned' && loan.status !== 'returned') return false;

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
    <div className="max-w-7xl mx-auto py-5 sm:py-6 px-4 sm:px-6 space-y-4 animate-fade-in text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <Library className="w-4 h-4 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base text-zinc-950 tracking-tight">
                Shopkeeper Dashboard
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                <Radio className="w-2 h-2 text-zinc-900" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Loan management, returns, and circulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800 text-xs font-medium transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-500" />
            <span>Standee QR</span>
          </button>

          <button
            onClick={() => refreshData()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
            title="Refresh records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {(overdueCount > 0 || dueTodayCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {overdueCount > 0 && (
            <div
              onClick={() => {
                setActiveSubTab('loans');
                setCurrentFilter('overdue');
              }}
              className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-zinc-100 rounded-md text-zinc-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">
                    {overdueCount} Overdue Loan(s)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Return date has elapsed. Click to review or send WhatsApp notice.
                  </p>
                </div>
              </div>
              <span className="text-xs text-zinc-400 font-medium">&rarr;</span>
            </div>
          )}

          {dueTodayCount > 0 && (
            <div
              onClick={() => {
                setActiveSubTab('loans');
                setCurrentFilter('due_today');
              }}
              className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-zinc-100 rounded-md text-zinc-800">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">
                    {dueTodayCount} Book(s) Due Today
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Expected at the counter drop-box today.
                  </p>
                </div>
              </div>
              <span className="text-xs text-zinc-400 font-medium">&rarr;</span>
            </div>
          )}
        </div>
      )}

      {/* Subtab Segmented Control */}
      <div className="flex items-center gap-1 border-b border-zinc-200/80 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('loans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'loans'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Loans</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'approvals'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Approvals</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-white text-[9px] font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'analytics'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Subtab views */}
      {activeSubTab === 'loans' && (
        <div className="space-y-4">
          <StatsCards
            currentFilter={currentFilter}
            onSelectFilter={(f) => setCurrentFilter(f)}
          />

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

      <CounterQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
};
