import React, { useState, useEffect } from 'react';
import { PhotoUpload } from './PhotoUpload';
import { api } from '../../utils/api';
import { Loan, CatalogBook } from '../../types/loan';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
  Library,
  Check
} from 'lucide-react';

interface LendingFormProps {
  onSuccess: (loan: Loan) => void;
}

export const LendingForm: React.FC<LendingFormProps> = ({ onSuccess }) => {
  const { addToast } = useSanctuary();

  // Form State
  const [bookList, setBookList] = useState<string[]>(['']);
  const [borrowerName, setBorrowerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [committedReturnDate, setCommittedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddressField, setShowAddressField] = useState(false);

  // Photo State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  // Catalog recommendations
  const [catalog, setCatalog] = useState<CatalogBook[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setCommittedReturnDate(d.toISOString().split('T')[0]);

    api.getCatalog().then(setCatalog).catch(() => {});
  }, []);

  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setCommittedReturnDate(d.toISOString().split('T')[0]);
  };

  const handleAddBookInput = () => {
    setBookList([...bookList, '']);
  };

  const handleUpdateBook = (index: number, val: string) => {
    const updated = [...bookList];
    updated[index] = val;
    setBookList(updated);
  };

  const handleRemoveBook = (index: number) => {
    if (bookList.length <= 1) {
      setBookList(['']);
      return;
    }
    setBookList(bookList.filter((_, i) => i !== index));
  };

  const handlePickFromCatalog = (title: string, author: string) => {
    const fullTitle = `${title} — ${author}`;
    if (bookList.length === 1 && !bookList[0].trim()) {
      setBookList([fullTitle]);
    } else if (!bookList.includes(fullTitle)) {
      setBookList([...bookList, fullTitle]);
    }
    setShowCatalog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validBooks = bookList.map(b => b.trim()).filter(Boolean);
    if (validBooks.length === 0) {
      addToast({ type: 'warning', title: 'Book required', message: 'Please enter at least one book title.' });
      return;
    }
    if (!borrowerName.trim()) {
      addToast({ type: 'warning', title: 'Name required', message: 'Please enter your full name.' });
      return;
    }
    if (!phoneNumber.trim()) {
      addToast({ type: 'warning', title: 'Phone required', message: 'Please enter your phone number.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      addToast({ type: 'warning', title: 'Valid email required', message: 'Please enter a valid email address.' });
      return;
    }
    if (!committedReturnDate) {
      addToast({ type: 'warning', title: 'Return date required', message: 'Please select a committed return date.' });
      return;
    }
    if (!photoFile && !photoBase64) {
      addToast({
        type: 'warning',
        title: 'Photo required',
        message: 'Please take or upload a photo of the book(s) being borrowed.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('bookNames', JSON.stringify(validBooks));
      formData.append('borrowerName', borrowerName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('email', email);
      if (address) formData.append('address', address);
      formData.append('committedReturnDate', committedReturnDate);
      if (notes) formData.append('notes', notes);

      if (photoFile) {
        formData.append('photo', photoFile);
      }
      if (photoBase64) {
        formData.append('photoBase64', photoBase64);
      }

      const createdLoan = await api.submitLoan(formData);
      onSuccess(createdLoan);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      addToast({ type: 'danger', title: 'Submission failed', message });
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* 1. Book Names */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Book Title(s)</span>
            <span className="text-zinc-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200 transition-colors"
          >
            <Library className="w-3 h-3 text-zinc-500" />
            Browse Shelf
          </button>
        </div>

        {/* Shelf Picker */}
        {showCatalog && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Quick select from cafe shelves:</span>
              <button
                type="button"
                onClick={() => setShowCatalog(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {catalog.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handlePickFromCatalog(book.title, book.author)}
                  className="text-left p-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200/60 transition-colors flex items-center gap-2"
                >
                  {book.image && (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-7 h-9 rounded object-cover border border-zinc-200 shrink-0"
                    />
                  )}
                  <div className="text-[11px] leading-tight truncate flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{book.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{book.author}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Inputs */}
        <div className="space-y-2">
          {bookList.map((book, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={book}
                onChange={(e) => handleUpdateBook(idx, e.target.value)}
                placeholder={`Book ${idx + 1} Title & Author`}
                required={idx === 0}
                className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50/40 placeholder:text-zinc-400 transition-colors"
              />
              {bookList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBook(idx)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Remove book"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddBookInput}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1 rounded-md transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Another Book
        </button>
      </div>

      {/* 2. Photo Upload */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
        <PhotoUpload
          onPhotoSelected={(file, b64) => {
            setPhotoFile(file);
            setPhotoBase64(b64);
          }}
          required
        />
      </div>

      {/* 3. Borrower Contact Information */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
        <label className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-400" />
          <span>Borrower Information</span>
        </label>

        <div>
          <label className="block text-[11px] font-medium text-zinc-700 mb-1">
            Full Name <span className="text-zinc-400">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
              Phone Number <span className="text-zinc-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
              Email Address <span className="text-zinc-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Address */}
        <div>
          <button
            type="button"
            onClick={() => setShowAddressField(!showAddressField)}
            className="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 transition-colors"
          >
            {showAddressField ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showAddressField ? 'Hide Physical Address' : '+ Add Address (Optional)'}
          </button>

          {showAddressField && (
            <div className="mt-2 animate-fade-in">
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, Apt, City"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Committed Return Date */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
        <label className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Committed Return Date</span>
          <span className="text-zinc-400">*</span>
        </label>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: '7 Days', days: 7 },
            { label: '14 Days (Standard)', days: 14 },
            { label: '21 Days', days: 21 },
            { label: '30 Days', days: 30 },
          ].map((preset) => {
            const presetDate = new Date();
            presetDate.setDate(presetDate.getDate() + preset.days);
            const dateStr = presetDate.toISOString().split('T')[0];
            const isSelected = committedReturnDate === dateStr;

            return (
              <button
                key={preset.days}
                type="button"
                onClick={() => setPresetDays(preset.days)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Date picker */}
        <div>
          <input
            type="date"
            value={committedReturnDate}
            min={tomorrowStr}
            onChange={(e) => setCommittedReturnDate(e.target.value)}
            required
            className="w-full text-xs font-medium p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40 font-mono"
          />
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-700 mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Reading at Table 4"
            className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
          />
        </div>
      </div>

      {/* 5. Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <span>Sending request...</span>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Submit Borrow Request</span>
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
          <Check className="w-3 h-3 text-zinc-500" />
          <span>Shop staff receives instant notification on the counter dashboard.</span>
        </p>
      </div>
    </form>
  );
};
