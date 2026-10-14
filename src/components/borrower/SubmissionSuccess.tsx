import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Loan } from '../../types/loan';
import {
  Check,
  Clock,
  BookOpen,
  Calendar,
  RotateCcw,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import { useSanctuary } from '../../context/SanctuaryContext';

interface SubmissionSuccessProps {
  loan: Loan;
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ loan, onReset }) => {
  const { loans, setActiveTab } = useSanctuary();

  const currentLoan = loans.find(l => l.id === loan.id) || loan;

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#18181b', '#71717a', '#d4d4d8']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const isApproved = currentLoan.status === 'active';

  return (
    <div className="max-w-md mx-auto py-6 px-4 animate-fade-in text-xs">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-zinc-100 space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-900">
            {isApproved ? (
              <Check className="w-5 h-5 text-zinc-900" />
            ) : (
              <Clock className="w-5 h-5 text-zinc-600" />
            )}
          </div>
          <h2 className="font-semibold text-base text-zinc-950 tracking-tight">
            {isApproved ? 'Borrow Request Approved' : 'Request Submitted'}
          </h2>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
            {isApproved
              ? 'Your loan has been verified. You may take your book.'
              : 'Please show this screen to the counter staff before taking books.'}
          </p>

          <div className="pt-1">
            <span className="inline-block px-2.5 py-1 rounded bg-zinc-100 text-[11px] font-mono font-medium text-zinc-700">
              ID: {currentLoan.id}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div className="space-y-2 bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Book(s)
                </span>
                <ul className="mt-0.5 space-y-0.5">
                  {currentLoan.bookNames.map((b, i) => (
                    <li key={i} className="font-medium text-zinc-900 text-xs">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 text-[11px]">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Borrower</span>
                <p className="font-medium text-zinc-800 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-zinc-400" />
                  {currentLoan.borrowerName}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Return Due</span>
                <p className="font-medium text-zinc-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {currentLoan.committedReturnDate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Contact details recorded securely for return verification.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-zinc-50/60 border-t border-zinc-100 flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Borrow Another
          </button>
          <button
            onClick={() => setActiveTab('my-loans')}
            className="flex-1 py-2 px-3 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>My Loans</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
