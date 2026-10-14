import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Phone,
  HelpCircle
} from 'lucide-react';
import { Loan } from '../../types/loan';

export const ReturnLookup: React.FC = () => {
  const { loans, setSelectedLoanForModal } = useSanctuary();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const cleanQ = query.trim().toLowerCase();
  const filteredLoans = loans.filter((l) => {
    if (!cleanQ) return false;
    const phoneDigits = l.phoneNumber.replace(/[^0-9]/g, '');
    const queryDigits = cleanQ.replace(/[^0-9]/g, '');

    return (
      l.id.toLowerCase().includes(cleanQ) ||
      l.borrowerName.toLowerCase().includes(cleanQ) ||
      l.email.toLowerCase().includes(cleanQ) ||
      (queryDigits && phoneDigits.includes(queryDigits))
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const renderStatusBadge = (loan: Loan) => {
    if (loan.status === 'pending') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded text-[10px] font-medium flex items-center gap-1 border border-zinc-200">
          <Clock className="w-2.5 h-2.5 text-zinc-500" />
          Pending
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-medium flex items-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5 text-white" />
          Overdue ({Math.abs(loan.daysLeft || 0)}d)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-2 py-0.5 bg-zinc-800 text-white rounded text-[10px] font-medium flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-zinc-300" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-900 rounded text-[10px] font-medium flex items-center gap-1 border border-zinc-200">
          <CheckCircle className="w-2.5 h-2.5 text-zinc-600" />
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[10px] font-medium border border-zinc-200">
        Returned
      </span>
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in text-xs">
      {/* Search Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm text-center space-y-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto">
          <Search className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-base text-zinc-950 tracking-tight">
            Check Loan Status
          </h2>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Find your active book loans and return schedule.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mx-auto pt-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
            }}
            placeholder="Phone Number or Loan ID (e.g. SAN-8490)"
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-400">
          <span>Samples:</span>
          {['SAN-8490', 'SAN-8488'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                setSearched(true);
              }}
              className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[10px] font-mono"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-2">
          {filteredLoans.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 text-center space-y-1.5">
              <HelpCircle className="w-6 h-6 text-zinc-300 mx-auto" />
              <p className="font-medium text-zinc-800 text-xs">No records found</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                No active loans found for &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoanForModal(loan)}
                  className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded">
                        {loan.id}
                      </span>
                      {renderStatusBadge(loan)}
                    </div>

                    <div className="flex items-start gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <p className="font-medium text-zinc-900 text-xs truncate">
                        {loan.bookNames.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>Due: <strong className="text-zinc-800">{loan.committedReturnDate}</strong></span>
                      <span className="text-zinc-300">•</span>
                      <span>{loan.borrowerName}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-400 hover:text-zinc-900 font-medium whitespace-nowrap">
                    View &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return Instructions */}
      <div className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-4 space-y-1.5 text-zinc-600 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-medium text-zinc-900 text-xs">
          <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
          <span>How to Return Books</span>
        </div>
        <p>
          Drop your book in the return bin at the counter during open hours (7:30 AM – 9:00 PM). Staff will inspect and mark your loan as returned.
        </p>
      </div>
    </div>
  );
};
