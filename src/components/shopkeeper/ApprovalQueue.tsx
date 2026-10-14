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
  CheckCircle,
  XCircle,
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
        title: 'Loan Approved',
        message: `${loan.borrowerName} approved for "${loan.bookNames[0]}".`,
      });
      await refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (loanId: string) => {
    if (!rejectReason.trim()) {
      addToast({ type: 'warning', title: 'Note required', message: 'Specify reason for rejection.' });
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
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center space-y-2 text-xs">
        <CheckCircle className="w-5 h-5 text-zinc-300 mx-auto" />
        <h3 className="font-semibold text-zinc-900 text-sm">
          No Pending Requests
        </h3>
        <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
          All customer lending submissions have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <h3 className="font-semibold text-zinc-900 text-sm">
            Requests Awaiting Approval ({pendingLoans.length})
          </h3>
        </div>
        <span className="text-[10px] text-zinc-600 bg-zinc-100 font-medium px-2 py-0.5 rounded border border-zinc-200/60">
          Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pendingLoans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white rounded-xl border border-zinc-200/80 p-4 space-y-3 shadow-sm hover:border-zinc-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                  {loan.id}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(loan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Photo & Book Info */}
              <div className="flex gap-3 items-start">
                <div
                  onClick={() => setSelectedLoanForModal(loan)}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 cursor-pointer relative group"
                >
                  <img
                    src={loan.photoUrl}
                    alt="Book Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                    <BookOpen className="w-3 h-3" />
                    <span>{loan.bookNames.length} Book(s)</span>
                  </div>
                  {loan.bookNames.map((book, i) => (
                    <p key={i} className="font-medium text-zinc-900 text-xs truncate">
                      {book}
                    </p>
                  ))}
                  <p className="text-[11px] text-zinc-500 pt-0.5">
                    Return by: <strong className="text-zinc-800">{loan.committedReturnDate}</strong>
                  </p>
                </div>
              </div>

              {/* Borrower Info */}
              <div className="bg-zinc-50/70 p-2.5 rounded-lg border border-zinc-100 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-medium text-zinc-800">
                  <User className="w-3 h-3 text-zinc-400" />
                  <span>{loan.borrowerName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  <span>{loan.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span className="truncate">{loan.email}</span>
                </div>
                {loan.address && (
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{loan.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {rejectingId === loan.id ? (
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for declining"
                  className="w-full text-xs p-1.5 rounded-md border border-zinc-200"
                />
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectConfirm(loan.id)}
                    className="px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-medium rounded"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setRejectingId(loan.id)}
                  disabled={processingId === loan.id}
                  className="py-1.5 px-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3 h-3 text-zinc-400" /> Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(loan)}
                  disabled={processingId === loan.id}
                  className="flex-1 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  {processingId === loan.id ? 'Approving...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
