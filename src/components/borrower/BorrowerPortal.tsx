import React, { useState } from 'react';
import { LendingForm } from './LendingForm';
import { SubmissionSuccess } from './SubmissionSuccess';
import { Loan } from '../../types/loan';
import { Coffee, BookOpen, QrCode, ShieldCheck, Heart } from 'lucide-react';

export const BorrowerPortal: React.FC = () => {
  const [submittedLoan, setSubmittedLoan] = useState<Loan | null>(null);

  if (submittedLoan) {
    return <SubmissionSuccess loan={submittedLoan} onReset={() => setSubmittedLoan(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 sm:px-0 space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sanctuary-100 text-sanctuary-800 text-xs font-semibold border border-sanctuary-200">
          <QrCode className="w-3.5 h-3.5 text-sanctuary-700" />
          <span>Scanned from Cafe Table QR Code</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-coffee-dark tracking-tight">
          Borrow a Book at The Sanctuary
        </h1>
        <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Grab a coffee, pick a favorite title from our shelves, and take it with you. Fill in your details below and present your confirmation to the barista.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-stone-600">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-sanctuary-200 shadow-sm">
            <Coffee className="w-3.5 h-3.5 text-sanctuary-600" /> Free with any beverage
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-sanctuary-200 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-sanctuary-600" /> 14-day standard return
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-sanctuary-200 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-sanctuary-600" /> Secure & private
          </span>
        </div>
      </div>

      {/* Lending Form */}
      <LendingForm onSuccess={(loan) => setSubmittedLoan(loan)} />

      {/* Warm Footer Note */}
      <div className="text-center text-xs text-stone-400 flex items-center justify-center gap-1 pt-4">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
        <span>for book lovers at The Sanctuary Cafe</span>
      </div>
    </div>
  );
};
