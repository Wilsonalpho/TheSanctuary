import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { Loan } from '../../types/loan';
import { api } from '../../utils/api';
import {
  Clock,
  BookOpen,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Sparkles,
  ExternalLink,
  MapPin
} from 'lucide-react';

export const ApprovalQueue: React.FC = () => {
  const { loans, refreshData, addToast, setSelectedLoanForModal } = useSanctuary();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingLoans = loans.filter((l) => l.status === 'pending');

  const handleApprove = async (loan: Loan) => {
    setProcessingId(loan.id);
    try {
      await api.approveLoan(loan.id);
      addToast({
        type: 'success',
        title: 'Loan Approved!',
        message: `${loan.borrowerName} can now take "${loan.bookNames[0]}".`,
      });
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      addToast({ type: 'danger', title: 'Approval Error', message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (loanId: string) => {
    if (!rejectReason.trim()) {
      addToast({ type: 'warning', title: 'Note required', message: 'Please specify reason for rejection' });
      return;
    }
    setProcessingId(loanId);
    try {
      await api.rejectLoan(loanId, rejectReason);
      addToast({
        type: 'info',
        title: 'Request Declined',
        message: `Loan ${loanId} marked as rejected.`,
      });
      setRejectingId(null);
      setRejectReason('');
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingLoans.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-sanctuary-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-coffee-dark">
          No Pending Borrow Requests
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          All customer lending submissions have been processed. New requests will pop up in real-time with an audible chime.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          <h3 className="font-serif text-lg font-bold text-coffee-dark">
            Requests Awaiting Counter Approval ({pendingLoans.length})
          </h3>
        </div>
        <span className="text-xs text-amber-800 bg-amber-100 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
          Action Required Before Books Leave
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingLoans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white rounded-3xl border-2 border-amber-300 shadow-warm p-5 space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            {/* Top row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sanctuary-900 bg-sanctuary-100 px-2.5 py-1 rounded-lg">
                  {loan.id}
                </span>
                <span className="text-[11px] text-stone-400">
                  {new Date(loan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Photo & Book Info */}
              <div className="flex gap-4 items-start">
                <div
                  onClick={() => setSelectedLoanForModal(loan)}
                  className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border border-sanctuary-200 shrink-0 cursor-pointer relative group"
                >
                  <img
                    src={loan.photoUrl}
                    alt="Book Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sanctuary-700">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{loan.bookNames.length} Book(s)</span>
                  </div>
                  {loan.bookNames.map((book, i) => (
                    <p key={i} className="font-serif font-bold text-coffee-dark text-sm sm:text-base leading-tight truncate">
                      {book}
                    </p>
                  ))}
                  <p className="text-xs text-stone-500 pt-1">
                    Return by: <strong className="text-sanctuary-900">{loan.committedReturnDate}</strong>
                  </p>
                </div>
              </div>

              {/* Borrower Info */}
              <div className="bg-sanctuary-50/60 p-3 rounded-2xl border border-sanctuary-100 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-coffee-dark">
                  <User className="w-3.5 h-3.5 text-sanctuary-600" />
                  <span>{loan.borrowerName}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-sanctuary-600" />
                  <span>{loan.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-3.5 h-3.5 text-sanctuary-600" />
                  <span className="truncate">{loan.email}</span>
                </div>
                {loan.address && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-sanctuary-600 shrink-0" />
                    <span className="truncate">{loan.address}</span>
                  </div>
                )}
                {loan.notes && (
                  <p className="text-[11px] text-stone-500 italic pt-1">
                    Customer note: &ldquo;{loan.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Reject reason expansion */}
            {rejectingId === loan.id ? (
              <div className="space-y-2 pt-2 border-t border-sanctuary-100">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State rejection reason (e.g. book already reserved)"
                  className="w-full text-xs p-2 rounded-xl border border-rose-300"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectConfirm(loan.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            ) : (
              /* Approval buttons */
              <div className="flex items-center gap-2 pt-3 border-t border-sanctuary-100">
                <button
                  type="button"
                  onClick={() => setRejectingId(loan.id)}
                  disabled={processingId === loan.id}
                  className="flex-1 py-2 px-3 border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(loan)}
                  disabled={processingId === loan.id}
                  className="flex-2 w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-warm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {processingId === loan.id ? 'Approving...' : 'Approve & Hand Over'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
