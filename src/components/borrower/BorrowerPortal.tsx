import React, { useState } from 'react';
import { LendingForm } from './LendingForm';
import { SubmissionSuccess } from './SubmissionSuccess';
import { Loan } from '../../types/loan';
import { BookOpen, QrCode, ShieldCheck } from 'lucide-react';

export const BorrowerPortal: React.FC = () => {
  const [submittedLoan, setSubmittedLoan] = useState<Loan | null>(null);

  if (submittedLoan) {
    return <SubmissionSuccess loan={submittedLoan} onReset={() => setSubmittedLoan(null)} />;
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-8 px-4 sm:px-0 space-y-6 animate-fade-in">
      {/* Minimalist Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium border border-zinc-200/70">
          <QrCode className="w-3 h-3 text-zinc-500" />
          <span>Table Lending Portal</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
          Borrow a Book
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Select your title, complete the lending form below, and present your screen to the counter.
        </p>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-zinc-400" /> 14-day standard lending
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-zinc-400" /> Secure checkout
          </span>
        </div>
      </div>

      {/* Lending Form */}
      <LendingForm onSuccess={(loan) => setSubmittedLoan(loan)} />

      {/* Minimalist Footer */}
      <div className="text-center text-[10px] text-zinc-400 pt-2">
        <span>The Sanctuary Library & Lounge</span>
      </div>
    </div>
  );
};
