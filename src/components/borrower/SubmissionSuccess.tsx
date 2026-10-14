import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Loan } from '../../types/loan';
import {
  CheckCircle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  Coffee,
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

  // Find updated status from context (in case shopkeeper approves in real-time!)
  const currentLoan = loans.find(l => l.id === loan.id) || loan;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c79870', '#debfa4', '#7e462a', '#1c130e']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const isApproved = currentLoan.status === 'active';

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-warm-lg border border-sanctuary-200 overflow-hidden">
        {/* Banner */}
        <div className={`p-8 text-center text-white transition-colors duration-500 ${isApproved ? 'bg-emerald-800' : 'bg-gradient-to-br from-sanctuary-800 to-sanctuary-950'}`}>
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-3">
            {isApproved ? (
              <CheckCircle className="w-10 h-10 text-emerald-300 animate-pulse" />
            ) : (
              <Clock className="w-10 h-10 text-amber-300 animate-pulse" />
            )}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">
            {isApproved ? 'Borrow Request Approved!' : 'Request Sent to Barista!'}
          </h2>
          <p className="text-sm text-sanctuary-200 mt-1">
            {isApproved
              ? 'Your loan has been officially verified. Happy reading!'
              : 'Our shop staff is reviewing your request on their dashboard now.'}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-xs font-mono font-bold tracking-wider">
            <span>REQUEST ID:</span>
            <span className="text-sanctuary-200">{currentLoan.id}</span>
          </div>
        </div>

        {/* Status Callout Card */}
        <div className="p-6 border-b border-sanctuary-100 bg-[#fdfcf9]">
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-sanctuary-200 bg-white">
            <Coffee className="w-6 h-6 text-sanctuary-600 shrink-0 mt-0.5" />
            <div className="text-xs text-coffee-dark space-y-1">
              <strong className="block text-sm font-semibold text-sanctuary-900">
                {isApproved ? '✅ Verified by The Sanctuary' : 'Next Step: Present at the Counter'}
              </strong>
              <p className="text-stone-600 leading-relaxed">
                {isApproved
                  ? 'Feel free to take your book(s) home or enjoy them anywhere in our cafe.'
                  : 'Please show this screen or your name to the barista before taking the book(s) off the premises.'}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Details Summary */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-sanctuary-700">
            Loan Receipt Details
          </h3>

          <div className="space-y-3 bg-sanctuary-50/50 p-4 rounded-2xl border border-sanctuary-100">
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-sanctuary-600 shrink-0 mt-1" />
              <div>
                <span className="text-xs text-stone-500">Book(s) to Borrow:</span>
                <ul className="mt-0.5">
                  {currentLoan.bookNames.map((b, i) => (
                    <li key={i} className="font-serif font-bold text-coffee-dark text-base">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sanctuary-100 text-xs">
              <div>
                <span className="text-stone-500">Borrower:</span>
                <p className="font-semibold text-coffee-dark flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-sanctuary-500" />
                  {currentLoan.borrowerName}
                </p>
              </div>

              <div>
                <span className="text-stone-500">Return By Date:</span>
                <p className="font-semibold text-sanctuary-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-sanctuary-600" />
                  {currentLoan.committedReturnDate}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your contact details are encrypted and securely stored for book retrieval only.</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-stone-50 border-t border-sanctuary-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sanctuary-800 hover:bg-sanctuary-900 text-white font-semibold rounded-2xl shadow-warm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Borrow Another Book
          </button>
          <button
            onClick={() => setActiveTab('my-loans')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-sanctuary-300 hover:bg-sanctuary-100 text-coffee-dark font-medium rounded-2xl transition-all"
          >
            <span>Track My Loans</span>
            <ArrowRight className="w-4 h-4 text-sanctuary-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
