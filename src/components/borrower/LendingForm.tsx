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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  Coffee,
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

  // Initial return date default (+14 days from today)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setCommittedReturnDate(d.toISOString().split('T')[0]);

    // Fetch popular catalog
    api.getCatalog().then(setCatalog).catch(() => {});
  }, []);

  // Quick preset helper
  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setCommittedReturnDate(d.toISOString().split('T')[0]);
  };

  // Add / remove book title input
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
    const fullTitle = `${title} - ${author}`;
    // If the first input is empty, fill it. Else append.
    if (bookList.length === 1 && !bookList[0].trim()) {
      setBookList([fullTitle]);
    } else if (!bookList.includes(fullTitle)) {
      setBookList([...bookList, fullTitle]);
    }
    setShowCatalog(false);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean books list
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
      addToast({ type: 'warning', title: 'Return date required', message: 'Please pick a committed return date.' });
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
      } else if (photoBase64) {
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

  // Calculate min return date (tomorrow)
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Book Names Section */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-bold tracking-wider text-sanctuary-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sanctuary-600" />
            <span>Book Title(s)</span>
            <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="text-xs font-semibold text-sanctuary-700 hover:text-sanctuary-900 flex items-center gap-1 bg-sanctuary-50 px-2.5 py-1 rounded-lg border border-sanctuary-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sanctuary-500" />
            Browse Cafe Shelf
          </button>
        </div>

        {/* Shelf Picker Dropdown */}
        {showCatalog && (
          <div className="p-4 bg-sanctuary-50/70 border border-sanctuary-200 rounded-2xl animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
              <span>Popular Books on Our Lounge Shelves:</span>
              <button
                type="button"
                onClick={() => setShowCatalog(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {catalog.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handlePickFromCatalog(book.title, book.author)}
                  className="text-left p-2 rounded-xl bg-white hover:bg-sanctuary-100/60 border border-sanctuary-200 transition-all flex items-start gap-2"
                >
                  <Coffee className="w-3.5 h-3.5 text-sanctuary-500 shrink-0 mt-0.5" />
                  <div className="text-xs leading-tight">
                    <p className="font-semibold text-coffee-dark truncate">{book.title}</p>
                    <p className="text-[11px] text-stone-500">{book.author}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Inputs for Books */}
        <div className="space-y-2.5">
          {bookList.map((book, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={book}
                  onChange={(e) => handleUpdateBook(idx, e.target.value)}
                  placeholder={`Book ${idx + 1} Title & Author (e.g., The Midnight Library)`}
                  required={idx === 0}
                  className="w-full text-sm font-medium py-3 px-4 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 focus:border-sanctuary-500 bg-sanctuary-50/30 transition-all placeholder:text-stone-400"
                />
              </div>
              {bookList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBook(idx)}
                  className="p-3 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                  title="Remove book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddBookInput}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sanctuary-700 hover:text-sanctuary-900 bg-sanctuary-100/70 hover:bg-sanctuary-200/70 px-3.5 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Another Book
        </button>
      </div>

      {/* 2. Photo Upload Section */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sanctuary-200 shadow-sm">
        <PhotoUpload
          onPhotoSelected={(file, b64) => {
            setPhotoFile(file);
            setPhotoBase64(b64);
          }}
          required
        />
      </div>

      {/* 3. Borrower Contact Information */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
        <label className="text-xs uppercase font-bold tracking-wider text-sanctuary-800 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sanctuary-600" />
          <span>Borrower Information</span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="e.g., Emily Watson"
              required
              className="w-full text-sm pl-10 pr-4 py-3 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full text-sm pl-10 pr-4 py-3 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30 font-mono"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Used for return reminders</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emily@example.com"
                required
                className="w-full text-sm pl-10 pr-4 py-3 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">For your loan receipt & record</p>
          </div>
        </div>

        {/* Collapsible Address (Optional as needed) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAddressField(!showAddressField)}
            className="text-xs text-sanctuary-700 hover:text-sanctuary-900 font-semibold flex items-center gap-1 transition-colors"
          >
            {showAddressField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAddressField ? 'Hide Physical Address' : '+ Add Physical Address (Optional)'}
          </button>

          {showAddressField && (
            <div className="mt-3 animate-fade-in">
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street address, City"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Committed Return Date */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
        <label className="text-xs uppercase font-bold tracking-wider text-sanctuary-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-sanctuary-600" />
          <span>Committed Return Date</span>
          <span className="text-rose-500">*</span>
        </label>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 font-medium mr-1">Quick Select:</span>
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
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-sanctuary-800 text-white shadow-sm'
                    : 'bg-sanctuary-100/70 text-sanctuary-900 hover:bg-sanctuary-200/70'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Date picker */}
        <div className="relative">
          <input
            type="date"
            value={committedReturnDate}
            min={tomorrowStr}
            onChange={(e) => setCommittedReturnDate(e.target.value)}
            required
            className="w-full text-sm font-semibold p-3.5 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30 font-mono"
          />
        </div>
        <p className="text-[11px] text-stone-500">
          Our standard lending period is 14 days. Please return the book to the counter drop-box when finished.
        </p>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Note for Barista (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Sitting at Table 4 with laptop"
            className="w-full text-sm px-4 py-2.5 rounded-2xl border border-sanctuary-200 focus:outline-none focus:ring-2 focus:ring-sanctuary-500 bg-sanctuary-50/30"
          />
        </div>
      </div>

      {/* 5. Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-sanctuary-800 to-sanctuary-900 hover:from-sanctuary-900 hover:to-coffee-dark text-white font-serif font-bold text-lg rounded-3xl shadow-warm hover:shadow-warm-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Coffee className="w-5 h-5 text-sanctuary-300 animate-spin" />
            <span>Sending to Barista...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5 text-sanctuary-300" />
            <span>Submit Borrow Request</span>
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Barista receives instant real-time notification on the counter tablet.</span>
        </p>
      </div>
    </form>
  );
};
