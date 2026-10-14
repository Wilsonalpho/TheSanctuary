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
  Sparkles,
  Phone,
  HelpCircle
} from 'lucide-react';
import { Loan } from '../../types/loan';

export const ReturnLookup: React.FC = () => {
  const { loans, setSelectedLoanForModal } = useSanctuary();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  // Search by loan ID, phone number, borrower name, or email
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
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
          Pending Approval
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Overdue ({Math.abs(loan.daysLeft || 0)}d)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-700" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Active Loan
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-semibold border border-stone-200">
        Returned
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Search Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sanctuary-200 shadow-warm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sanctuary-100 text-sanctuary-800 flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-coffee-dark">
            Look Up Your Book Loan
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
            Check return dates, view your loan approval status, or find return instructions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="Enter Phone Number or Loan ID (e.g. SAN-8490)"
              className="w-full text-sm pl-4 pr-4 py-3 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/40"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-sanctuary-800 hover:bg-sanctuary-900 text-white text-sm font-semibold rounded-2xl shadow-warm transition-all"
          >
            Search
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-stone-500">
          <span>Try quick sample:</span>
          {['SAN-8490', 'SAN-8488', '555'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                setSearched(true);
              }}
              className="px-2.5 py-1 bg-sanctuary-50 hover:bg-sanctuary-100 text-sanctuary-800 rounded-lg border border-sanctuary-200 font-mono text-[11px]"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-600 px-2 font-medium">
            <span>Search Results ({filteredLoans.length})</span>
          </div>

          {filteredLoans.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-sanctuary-200 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="font-semibold text-coffee-dark text-sm">No active loans found</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn&apos;t find any records matching &ldquo;{query}&rdquo;. Check your phone number or ask the counter barista.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoanForModal(loan)}
                  className="bg-white p-5 rounded-3xl border border-sanctuary-200 shadow-sm hover:shadow-warm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sanctuary-800 bg-sanctuary-100 px-2 py-0.5 rounded">
                        {loan.id}
                      </span>
                      {renderStatusBadge(loan)}
                    </div>

                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-sanctuary-600 shrink-0 mt-0.5" />
                      <div>
                        {loan.bookNames.map((b, i) => (
                          <p key={i} className="font-serif font-bold text-coffee-dark text-base">
                            {b}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sanctuary-500" />
                        Committed Due: <strong>{loan.committedReturnDate}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-sanctuary-500" />
                        {loan.phoneNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-sanctuary-700 font-semibold group-hover:underline">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return Instructions Card */}
      <div className="bg-sanctuary-50/70 border border-sanctuary-200 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-sanctuary-900 font-serif font-bold text-base">
          <RotateCcw className="w-5 h-5 text-sanctuary-700" />
          <span>How to Return Books at The Sanctuary</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          1. Bring your book(s) to our cafe at any time during open hours (7:30 AM – 9:00 PM).<br />
          2. Drop the book in our designated oak Return Bin located next to the espresso bar.<br />
          3. Our staff will inspect the book and mark your record as returned. You will receive an email receipt confirming your completed loan!
        </p>
      </div>
    </div>
  );
};
