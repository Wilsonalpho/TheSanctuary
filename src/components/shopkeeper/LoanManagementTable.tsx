import React, { useState } from 'react';
import { Loan } from '../../types/loan';
import { useSanctuary } from '../../context/SanctuaryContext';
import { api } from '../../utils/api';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Phone,
  Mail,
  MessageCircle,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';

interface LoanManagementTableProps {
  loans: Loan[];
  currentFilter: string;
  onSelectFilter: (f: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const LoanManagementTable: React.FC<LoanManagementTableProps> = ({
  loans,
  currentFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
}) => {
  const { setSelectedLoanForModal, refreshData, addToast } = useSanctuary();
  const [actionMenuLoanId, setActionMenuLoanId] = useState<string | null>(null);

  // Quick mark as returned
  const handleQuickReturn = async (loan: Loan) => {
    try {
      await api.returnLoan(loan.id, 'Good condition');
      addToast({
        type: 'success',
        title: 'Book Returned',
        message: `Marked "${loan.bookNames[0]}" as returned!`,
      });
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Return failed';
      addToast({ type: 'danger', title: 'Error', message });
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Records' },
    { id: 'pending', label: 'Pending Approval' },
    { id: 'active', label: 'Active Loans' },
    { id: 'due_today', label: 'Due Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'returned', label: 'Returned' },
  ];

  const renderBadge = (loan: Loan) => {
    if (loan.status === 'pending') {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-200 w-fit">
          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
          Pending
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-rose-200 w-fit">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Overdue ({Math.abs(loan.daysLeft || 0)}d)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-2.5 py-1 bg-orange-100 text-orange-950 rounded-full text-xs font-semibold flex items-center gap-1 border border-orange-300 w-fit">
          <Clock className="w-3 h-3 text-orange-700" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-200 w-fit">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Active ({loan.daysLeft}d left)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-semibold border border-stone-200 w-fit">
        Returned
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-sanctuary-200 shadow-sm overflow-hidden space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-6 border-b border-sanctuary-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentFilter === tab.id
                  ? 'bg-sanctuary-900 text-white shadow-sm'
                  : 'bg-sanctuary-50 hover:bg-sanctuary-100 text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search borrower, book, phone..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/40"
          />
        </div>
      </div>

      {/* Content: Cards on Mobile, Table on Tablet/Desktop */}
      {loans.length === 0 ? (
        <div className="p-12 text-center text-stone-500 space-y-2">
          <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-coffee-dark">No book loans found</p>
          <p className="text-xs text-stone-400">Try adjusting your filter or search query.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (hidden on md and up) */}
          <div className="md:hidden divide-y divide-sanctuary-100">
            {loans.map((loan) => {
              const cleanPhone = loan.phoneNumber.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hi ${loan.borrowerName}, friendly return reminder from The Sanctuary Coffee for your borrowed book: ${loan.bookNames[0]} ☕`
              )}`;

              return (
                <div key={loan.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sanctuary-900 bg-sanctuary-100 px-2 py-0.5 rounded">
                      {loan.id}
                    </span>
                    {renderBadge(loan)}
                  </div>

                  <div className="flex gap-3 items-start">
                    <img
                      src={loan.photoUrl}
                      alt="Books"
                      onClick={() => setSelectedLoanForModal(loan)}
                      className="w-16 h-16 rounded-xl object-cover border border-sanctuary-200 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0" onClick={() => setSelectedLoanForModal(loan)}>
                      <h4 className="font-serif font-bold text-coffee-dark text-sm truncate">
                        {loan.bookNames[0]}
                      </h4>
                      {loan.bookNames.length > 1 && (
                        <p className="text-[11px] text-sanctuary-700">+{loan.bookNames.length - 1} more book(s)</p>
                      )}
                      <p className="text-xs text-stone-600 mt-0.5 font-medium">{loan.borrowerName}</p>
                      <p className="text-[11px] text-stone-400">Due: {loan.committedReturnDate}</p>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-sanctuary-50 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${loan.phoneNumber}`}
                        className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700"
                        title="WhatsApp Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleQuickReturn(loan)}
                          className="px-3 py-1.5 bg-sanctuary-800 text-white rounded-lg font-medium text-xs flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Returned
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedLoanForModal(loan)}
                        className="px-3 py-1.5 border border-sanctuary-300 text-coffee-dark rounded-lg font-medium text-xs flex items-center gap-1"
                      >
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop / Tablet Table View (hidden on small screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sanctuary-50/70 border-b border-sanctuary-200 text-stone-500 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Photo / ID</th>
                  <th className="py-3 px-4">Book Title(s)</th>
                  <th className="py-3 px-4">Borrower Info</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sanctuary-100 text-stone-700">
                {loans.map((loan) => {
                  const cleanPhone = loan.phoneNumber.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hi ${loan.borrowerName}, friendly reminder from The Sanctuary Coffee regarding your book loan "${loan.bookNames[0]}". ☕`
                  )}`;

                  return (
                    <tr key={loan.id} className="hover:bg-sanctuary-50/40 transition-colors">
                      {/* Photo & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={loan.photoUrl}
                            alt="Book"
                            onClick={() => setSelectedLoanForModal(loan)}
                            className="w-11 h-11 rounded-xl object-cover border border-sanctuary-200 shrink-0 cursor-pointer hover:opacity-90"
                          />
                          <div>
                            <span className="font-mono font-bold text-sanctuary-900 block">
                              {loan.id}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {loan.borrowDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Book Title(s) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div
                          onClick={() => setSelectedLoanForModal(loan)}
                          className="cursor-pointer"
                        >
                          <p className="font-serif font-bold text-coffee-dark text-sm leading-tight hover:text-sanctuary-700 truncate">
                            {loan.bookNames[0]}
                          </p>
                          {loan.bookNames.length > 1 && (
                            <p className="text-[11px] text-sanctuary-600 font-semibold mt-0.5">
                              +{loan.bookNames.length - 1} additional book(s)
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Borrower Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-coffee-dark text-xs">{loan.borrowerName}</p>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-mono">{loan.phoneNumber}</span>
                          <span className="text-stone-300">•</span>
                          <span className="truncate max-w-[120px]">{loan.email}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            loan.isOverdue
                              ? 'text-rose-700'
                              : loan.isDueToday
                              ? 'text-amber-800'
                              : 'text-stone-700'
                          }`}
                        >
                          {loan.committedReturnDate}
                        </span>
                        {loan.returnDate && (
                          <span className="text-[11px] text-emerald-700 block">
                            Returned: {loan.returnDate}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderBadge(loan)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Reminder */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Quick Return button if active or overdue */}
                          {loan.status === 'active' && (
                            <button
                              onClick={() => handleQuickReturn(loan)}
                              className="px-2.5 py-1.5 bg-sanctuary-100 hover:bg-sanctuary-200 text-sanctuary-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Mark as returned"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return</span>
                            </button>
                          )}

                          {/* Full details */}
                          <button
                            onClick={() => setSelectedLoanForModal(loan)}
                            className="px-2.5 py-1.5 border border-sanctuary-200 hover:bg-sanctuary-50 text-coffee-dark rounded-xl text-xs font-medium transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
