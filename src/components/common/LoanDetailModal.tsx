import React, { useState } from 'react';
import { Loan } from '../../types/loan';
import { useSanctuary } from '../../context/SanctuaryContext';
import { api } from '../../utils/api';
import {
  X,
  BookOpen,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface LoanDetailModalProps {
  loan: Loan | null;
  onClose: () => void;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({ loan, onClose }) => {
  const { refreshData, addToast } = useSanctuary();
  const [submitting, setSubmitting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReturnInput, setShowReturnInput] = useState(false);
  const [returnCondition, setReturnCondition] = useState('Pristine / Good condition');
  const [returnNotes, setReturnNotes] = useState('');
  const [showExtendInput, setShowExtendInput] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');

  if (!loan) return null;

  // WhatsApp click-to-chat helper
  const cleanPhone = loan.phoneNumber.replace(/[^0-9]/g, '');
  const booksText = loan.bookNames.join(', ');
  let whatsappMsg = `Hello ${loan.borrowerName}, this is The Sanctuary regarding your book loan ("${booksText}"). `;
  if (loan.isOverdue) {
    whatsappMsg += `Your scheduled return date was ${loan.committedReturnDate}. Please drop by when convenient to return or extend it. Thank you.`;
  } else if (loan.isDueToday) {
    whatsappMsg += `This is a reminder that it is due for return today. Thank you.`;
  } else {
    whatsappMsg += `Scheduled for return by ${loan.committedReturnDate}.`;
  }
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await api.approveLoan(loan.id);
      addToast({
        type: 'success',
        title: 'Loan Approved',
        message: `Loan for ${loan.borrowerName} has been approved.`,
      });
      await refreshData();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addToast({ type: 'warning', title: 'Note required', message: 'Please provide a reason for rejection.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.rejectLoan(loan.id, rejectReason);
      addToast({
        type: 'info',
        title: 'Request Declined',
        message: `Loan ${loan.id} has been marked as rejected.`,
      });
      await refreshData();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    setSubmitting(true);
    try {
      await api.returnLoan(loan.id, returnCondition, returnNotes);
      addToast({
        type: 'success',
        title: 'Book Returned',
        message: `Marked "${booksText}" as returned.`,
      });
      await refreshData();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Return operation failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtend = async () => {
    if (!newDueDate) {
      addToast({ type: 'warning', title: 'Date required', message: 'Please choose a new return date.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.extendLoan(loan.id, newDueDate);
      addToast({
        type: 'success',
        title: 'Loan Extended',
        message: `Return date updated to ${newDueDate}`,
      });
      await refreshData();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Extension failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setSubmitting(false);
    }
  };

  // Status badge
  const getStatusBadge = () => {
    if (loan.status === 'pending') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded text-[11px] font-medium flex items-center gap-1 border border-zinc-200">
          <Clock className="w-3 h-3 text-zinc-500" />
          Pending Approval
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[11px] font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-white" />
          Overdue ({Math.abs(loan.daysLeft || 0)}d)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-2 py-0.5 bg-zinc-800 text-white rounded text-[11px] font-medium flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-300" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-900 rounded text-[11px] font-medium flex items-center gap-1 border border-zinc-200">
          <CheckCircle className="w-3 h-3 text-zinc-600" />
          Active ({loan.daysLeft}d left)
        </span>
      );
    }
    if (loan.status === 'returned') {
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[11px] font-medium flex items-center gap-1 border border-zinc-200">
          <RotateCcw className="w-3 h-3 text-zinc-400" />
          Returned
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[11px] font-medium border border-zinc-200">
        Rejected
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-xl border border-zinc-200 my-6">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
              {loan.id}
            </span>
            {getStatusBadge()}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
          {/* Books */}
          <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-100 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
              Book Title(s)
            </span>
            <ul className="space-y-1">
              {loan.bookNames.map((book, idx) => (
                <li key={idx} className="font-medium text-zinc-900 text-sm flex items-start gap-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>{book}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Photo */}
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-1.5">
              Photo of Books
            </span>
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 max-h-56 flex items-center justify-center group">
              <img
                src={loan.photoUrl}
                alt="Borrowed books"
                className="w-full h-48 object-cover object-center"
              />
              <a
                href={loan.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2.5 right-2.5 bg-zinc-900/80 hover:bg-zinc-900 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Full Image
              </a>
            </div>
          </div>

          {/* Borrower & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block">
                Borrower Details
              </span>
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>{loan.borrowerName}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <a href={`tel:${loan.phoneNumber}`} className="hover:underline font-mono">
                  {loan.phoneNumber}
                </a>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <a href={`mailto:${loan.email}`} className="hover:underline truncate">
                  {loan.email}
                </a>
              </div>
              {loan.address && (
                <div className="flex items-start gap-2 text-zinc-500">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{loan.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block">
                Lending Schedule
              </span>
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Borrowed: <strong className="text-zinc-800">{loan.borrowDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Due Date: <strong className={loan.isOverdue ? 'text-zinc-950 font-bold' : 'text-zinc-800'}>{loan.committedReturnDate}</strong></span>
              </div>
              {loan.returnDate && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Returned: <strong className="text-zinc-800">{loan.returnDate}</strong></span>
                </div>
              )}
              {loan.notes && (
                <div className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                  &ldquo;{loan.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Quick contact shortcuts */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mr-1">
              Contact:
            </span>
            <a
              href={`tel:${loan.phoneNumber}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md transition-colors"
            >
              <Phone className="w-3 h-3 text-zinc-500" /> Call
            </a>
            <a
              href={`mailto:${loan.email}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md transition-colors"
            >
              <Mail className="w-3 h-3 text-zinc-500" /> Email
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </a>
          </div>

          {/* Rejection / Return / Extend Dialogs */}
          {showRejectInput && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <span className="font-medium text-zinc-900">Reason for Rejection</span>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Book currently unavailable"
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {showReturnInput && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <span className="font-medium text-zinc-900">Mark as Returned</span>
              <div>
                <label className="text-[11px] text-zinc-600 block">Book Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full text-xs mt-1 p-1.5 rounded-lg border border-zinc-200 bg-white"
                >
                  <option value="Pristine / Like New">Pristine / Like New</option>
                  <option value="Good condition">Good condition</option>
                  <option value="Minor wear & tear">Minor wear & tear</option>
                  <option value="Spine or page damage">Spine or page damage</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowReturnInput(false)}
                  className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  disabled={submitting}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          )}

          {showExtendInput && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <span className="font-medium text-zinc-900">Extend Due Date</span>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={loan.committedReturnDate}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtendInput(false)}
                  className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={submitting}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded"
                >
                  Save Extension
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 font-medium"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {loan.status === 'pending' && !showRejectInput && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve Request
                </button>
              </>
            )}

            {loan.status === 'active' && !showReturnInput && !showExtendInput && (
              <>
                <button
                  onClick={() => setShowExtendInput(true)}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium rounded-lg transition-colors"
                >
                  Extend Date
                </button>
                <button
                  onClick={() => setShowReturnInput(true)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
