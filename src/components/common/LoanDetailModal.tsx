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
  let whatsappMsg = `Hello ${loan.borrowerName}, this is The Sanctuary Coffee Shop regarding your book loan ("${booksText}"). `;
  if (loan.isOverdue) {
    whatsappMsg += `Your return date was ${loan.committedReturnDate}. Please drop by when you can to return or extend it. Thank you! ☕`;
  } else if (loan.isDueToday) {
    whatsappMsg += `Just a friendly reminder that it is due for return today. Looking forward to seeing you at the shop! ☕`;
  } else {
    whatsappMsg += `We hope you are enjoying your read! It is scheduled for return by ${loan.committedReturnDate}.`;
  }
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await api.approveLoan(loan.id);
      addToast({
        type: 'success',
        title: 'Loan Approved',
        message: `Books for ${loan.borrowerName} are officially on loan!`,
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
      addToast({ type: 'warning', title: 'Note required', message: 'Please provide a reason for rejecting' });
      return;
    }
    setSubmitting(true);
    try {
      await api.rejectLoan(loan.id, rejectReason);
      addToast({
        type: 'info',
        title: 'Request Rejected',
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
        message: `Successfully marked "${booksText}" as returned!`,
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
      addToast({ type: 'warning', title: 'Date required', message: 'Please choose a new return date' });
      return;
    }
    setSubmitting(true);
    try {
      await api.extendLoan(loan.id, newDueDate);
      addToast({
        type: 'success',
        title: 'Loan Extended',
        message: `Committed return date updated to ${newDueDate}`,
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
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending Staff Approval
        </span>
      );
    }
    if (loan.isOverdue) {
      return (
        <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Overdue ({Math.abs(loan.daysLeft || 0)} days)
        </span>
      );
    }
    if (loan.isDueToday) {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Due Today
        </span>
      );
    }
    if (loan.status === 'active') {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Active Loan ({loan.daysLeft} days remaining)
        </span>
      );
    }
    if (loan.status === 'returned') {
      return (
        <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-stone-300">
          <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
          Returned to Shop
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold border border-rose-200">
        Rejected
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-dark/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-sanctuary-200 my-8">
        {/* Header */}
        <div className="bg-sanctuary-50 px-6 py-4 border-b border-sanctuary-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-sanctuary-800 bg-sanctuary-200/60 px-2.5 py-1 rounded-lg">
              {loan.id}
            </span>
            {getStatusBadge()}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sanctuary-200/60 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Books being borrowed */}
          <div className="bg-sanctuary-50/50 p-4 rounded-2xl border border-sanctuary-100">
            <div className="flex items-center gap-2 text-sanctuary-900 font-semibold mb-2">
              <BookOpen className="w-4 h-4 text-sanctuary-600" />
              <span>Book(s) Borrowed ({loan.bookNames.length})</span>
            </div>
            <ul className="space-y-1.5">
              {loan.bookNames.map((book, idx) => (
                <li key={idx} className="font-serif font-bold text-coffee-dark text-lg flex items-start gap-2">
                  <span className="text-sanctuary-400 mt-1">•</span>
                  <span>{book}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Photo of books */}
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-sanctuary-700 mb-2">
              Photo of Books at Checkout
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-sanctuary-200 bg-stone-100 max-h-72 flex items-center justify-center group">
              <img
                src={loan.photoUrl}
                alt="Borrowed books"
                className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <a
                href={loan.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Full Size
              </a>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-xs uppercase font-semibold tracking-wider text-sanctuary-700">
                Borrower Details
              </div>
              <div className="flex items-center gap-2.5 text-sm text-coffee-dark font-medium">
                <User className="w-4 h-4 text-sanctuary-600" />
                <span>{loan.borrowerName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-coffee-dark">
                <Phone className="w-4 h-4 text-sanctuary-600" />
                <a href={`tel:${loan.phoneNumber}`} className="text-sanctuary-700 hover:underline font-mono">
                  {loan.phoneNumber}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-coffee-dark">
                <Mail className="w-4 h-4 text-sanctuary-600" />
                <a href={`mailto:${loan.email}`} className="text-sanctuary-700 hover:underline truncate">
                  {loan.email}
                </a>
              </div>
              {loan.address && (
                <div className="flex items-start gap-2.5 text-sm text-stone-600">
                  <MapPin className="w-4 h-4 text-sanctuary-600 shrink-0 mt-0.5" />
                  <span>{loan.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase font-semibold tracking-wider text-sanctuary-700">
                Lending Dates
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="w-4 h-4 text-sanctuary-600" />
                <span>
                  <strong className="text-stone-700">Borrowed:</strong> {loan.borrowDate}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="w-4 h-4 text-sanctuary-600" />
                <span>
                  <strong className="text-stone-700">Committed Due Date:</strong>{' '}
                  <span className={loan.isOverdue ? 'text-rose-700 font-bold' : loan.isDueToday ? 'text-amber-800 font-bold' : 'text-coffee-dark'}>
                    {loan.committedReturnDate}
                  </span>
                </span>
              </div>
              {loan.returnDate && (
                <div className="flex items-center gap-2.5 text-sm text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong>Returned on:</strong> {loan.returnDate}
                  </span>
                </div>
              )}
              {loan.notes && (
                <div className="text-xs text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  &ldquo;{loan.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Quick contact shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sanctuary-100">
            <span className="text-xs text-stone-500 font-medium">Quick Contact:</span>
            <a
              href={`tel:${loan.phoneNumber}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-sanctuary-700" /> Call
            </a>
            <a
              href={`mailto:${loan.email}?subject=The%20Sanctuary%20Book%20Loan%20-${encodeURIComponent(loan.bookNames[0])}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sanctuary-700" /> Email
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Reminder
            </a>
          </div>

          {/* Rejection / Return / Extend Dialogs */}
          {showRejectInput && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <h5 className="font-semibold text-rose-950 text-sm">State Reason for Rejecting</h5>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Book is currently reserved for book club"
                className="w-full text-sm p-2.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-rose-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {showReturnInput && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <h5 className="font-semibold text-emerald-950 text-sm">Mark Book as Returned</h5>
              <div>
                <label className="text-xs text-emerald-900 font-medium">Book Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full text-sm mt-1 p-2 rounded-xl border border-emerald-300 bg-white"
                >
                  <option value="Pristine / Like New">Pristine / Like New</option>
                  <option value="Good condition">Good condition</option>
                  <option value="Minor wear & tear">Minor wear & tear</option>
                  <option value="Spine or page damage">Spine or page damage</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-emerald-900 font-medium">Notes (optional)</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g., Returned on counter by borrower"
                  className="w-full text-sm mt-1 p-2 rounded-xl border border-emerald-300 bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReturnInput(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-emerald-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          )}

          {showExtendInput && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <h5 className="font-semibold text-amber-950 text-sm">Extend Committed Return Date</h5>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={loan.committedReturnDate}
                className="w-full text-sm p-2.5 rounded-xl border border-amber-300 bg-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtendInput(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-amber-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Save Extension
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-sanctuary-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-medium"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If pending: Approve / Reject buttons */}
            {loan.status === 'pending' && !showRejectInput && (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 font-medium text-sm rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-warm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Borrow Request
                </button>
              </>
            )}

            {/* If active or overdue: Return / Extend */}
            {loan.status === 'active' && !showReturnInput && !showExtendInput && (
              <>
                <button
                  onClick={() => setShowExtendInput(true)}
                  className="px-3 py-2 border border-sanctuary-300 hover:bg-sanctuary-50 text-coffee-dark font-medium text-sm rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-sanctuary-600" /> Extend
                </button>
                <button
                  onClick={() => setShowReturnInput(true)}
                  className="px-5 py-2 bg-sanctuary-800 hover:bg-sanctuary-900 text-white font-medium text-sm rounded-xl shadow-warm transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Mark as Returned
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
