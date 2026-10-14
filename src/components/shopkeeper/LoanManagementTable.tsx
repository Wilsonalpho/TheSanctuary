import React, { useState } from 'react';
import { Loan } from '../../types/loan';
import { useSanctuary } from '../../context/SanctuaryContext';
import { api } from '../../utils/api';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Phone,
  MessageCircle,
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

  const handleQuickReturn = async (loan: Loan) => {
    try {
      await api.returnLoan(loan.id, 'Good condition');
      addToast({
        type: 'success',
        title: 'Book Returned',
        message: `Marked "${loan.bookNames[0]}" as returned.`,
      });
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Return failed';
      addToast({ type: 'danger', title: 'Error', message });
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active' },
    { id: 'due_today', label: 'Due Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'returned', label: 'Returned' },
  ];

  const renderBadge = (loan: Loan) => {
    if (loan.status === 'pending') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded text-[10px] font-medium flex items-center gap-1 border border-zinc-200 w-fit">
          <Clock className="w-2.5 h-2.5 text-zinc-500" />
          Pending
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-medium flex items-center gap-1 w-fit">
          <AlertTriangle className="w-2.5 h-2.5 text-white" />
          Overdue ({Math.abs(loan.daysLeft || 0)}d)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-2 py-0.5 bg-zinc-800 text-white rounded text-[10px] font-medium flex items-center gap-1 w-fit">
          <Clock className="w-2.5 h-2.5 text-zinc-300" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-900 rounded text-[10px] font-medium flex items-center gap-1 border border-zinc-200 w-fit">
          <CheckCircle className="w-2.5 h-2.5 text-zinc-600" />
          Active ({loan.daysLeft}d)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[10px] font-medium border border-zinc-200 w-fit">
        Returned
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden space-y-3">
      {/* Top Filter and Search Bar */}
      <div className="p-3.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                currentFilter === tab.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100/80 hover:bg-zinc-200/60 text-zinc-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search loans..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Content */}
      {loans.length === 0 ? (
        <div className="p-10 text-center text-zinc-400 space-y-1.5 text-xs">
          <BookOpen className="w-6 h-6 text-zinc-300 mx-auto" />
          <p className="font-medium text-zinc-800">No records found</p>
          <p className="text-[11px] text-zinc-400">Try adjusting your filter or search query.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-zinc-100 text-xs">
            {loans.map((loan) => {
              const cleanPhone = loan.phoneNumber.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${loan.borrowerName}, this is a reminder from The Sanctuary regarding your borrowed book: ${loan.bookNames[0]}.`
              )}`;

              return (
                <div key={loan.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded">
                      {loan.id}
                    </span>
                    {renderBadge(loan)}
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <img
                      src={loan.photoUrl}
                      alt="Books"
                      onClick={() => setSelectedLoanForModal(loan)}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0" onClick={() => setSelectedLoanForModal(loan)}>
                      <h4 className="font-medium text-zinc-900 text-xs truncate">
                        {loan.bookNames[0]}
                      </h4>
                      {loan.bookNames.length > 1 && (
                        <p className="text-[10px] text-zinc-400">+{loan.bookNames.length - 1} more book(s)</p>
                      )}
                      <p className="text-[11px] text-zinc-500 mt-0.5">{loan.borrowerName}</p>
                      <p className="text-[10px] text-zinc-400">Due: {loan.committedReturnDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${loan.phoneNumber}`}
                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700"
                        title="Call"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleQuickReturn(loan)}
                          className="px-2 py-1 bg-zinc-900 text-white rounded text-[10px] font-medium"
                        >
                          Return
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedLoanForModal(loan)}
                        className="px-2 py-1 border border-zinc-200 text-zinc-700 rounded text-[10px] font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-50/70 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">ID / Date</th>
                  <th className="py-2.5 px-3.5">Book Title(s)</th>
                  <th className="py-2.5 px-3.5">Borrower</th>
                  <th className="py-2.5 px-3.5">Due Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {loans.map((loan) => {
                  const cleanPhone = loan.phoneNumber.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${loan.borrowerName}, this is a reminder from The Sanctuary regarding your book loan: "${loan.bookNames[0]}".`
                  )}`;

                  return (
                    <tr key={loan.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* ID / Photo */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={loan.photoUrl}
                            alt="Book"
                            onClick={() => setSelectedLoanForModal(loan)}
                            className="w-8 h-8 rounded-md object-cover border border-zinc-200 shrink-0 cursor-pointer"
                          />
                          <div>
                            <span className="font-mono font-medium text-zinc-900 block text-xs">
                              {loan.id}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {loan.borrowDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Book Title */}
                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div
                          onClick={() => setSelectedLoanForModal(loan)}
                          className="cursor-pointer"
                        >
                          <p className="font-medium text-zinc-900 truncate">
                            {loan.bookNames[0]}
                          </p>
                          {loan.bookNames.length > 1 && (
                            <p className="text-[10px] text-zinc-400">
                              +{loan.bookNames.length - 1} more
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <p className="font-medium text-zinc-900">{loan.borrowerName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{loan.phoneNumber}</p>
                      </td>

                      {/* Due Date */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            loan.isOverdue
                              ? 'text-zinc-950 font-bold'
                              : loan.isDueToday
                              ? 'text-zinc-800'
                              : 'text-zinc-600'
                          }`}
                        >
                          {loan.committedReturnDate}
                        </span>
                        {loan.returnDate && (
                          <span className="text-[10px] text-zinc-400 block">
                            Ret: {loan.returnDate}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {renderBadge(loan)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="WhatsApp Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {loan.status === 'active' && (
                            <button
                              onClick={() => handleQuickReturn(loan)}
                              className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1"
                              title="Mark as returned"
                            >
                              <RotateCcw className="w-3 h-3 text-zinc-500" />
                              <span>Return</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLoanForModal(loan)}
                            className="px-2 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-md text-[11px] font-medium transition-colors"
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
