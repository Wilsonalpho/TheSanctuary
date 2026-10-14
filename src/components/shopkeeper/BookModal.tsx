import React, { useState, useEffect, useRef } from 'react';
import { BookItem } from '../../types/loan';
import { api } from '../../utils/api';
import { useSanctuary } from '../../context/SanctuaryContext';
import { X, Camera, Image as ImageIcon, BookOpen, User, Tag, FileText, Check } from 'lucide-react';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: BookItem | null;
}

const COMMON_CATEGORIES = [
  'Fiction',
  'Japanese Fiction',
  'Contemporary Fiction',
  'Literary Fiction',
  'Magical Realism',
  'Speculative Fiction',
  'Historical Fiction',
  'Romance & Philosophy',
  'Mystery & Thriller',
  'Non-Fiction',
  'Essays & Coffee'
];

export const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, bookToEdit }) => {
  const { addToast, refreshBooks } = useSanctuary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [customCategory, setCustomCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState('');

  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      if (COMMON_CATEGORIES.includes(bookToEdit.category)) {
        setCategory(bookToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(bookToEdit.category);
      }
      setAvailable(bookToEdit.available);
      setDescription(bookToEdit.description || '');
      setPreview(bookToEdit.image || null);
      setImageUrl(bookToEdit.image || '');
      setImageFile(null);
      setImageBase64(null);
    } else {
      setTitle('');
      setAuthor('');
      setCategory('Fiction');
      setCustomCategory('');
      setAvailable(true);
      setDescription('');
      setPreview(null);
      setImageUrl('');
      setImageFile(null);
      setImageBase64(null);
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({ type: 'warning', title: 'Title required', message: 'Please enter book title.' });
      return;
    }
    if (!author.trim()) {
      addToast({ type: 'warning', title: 'Author required', message: 'Please enter author name.' });
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'General') : category;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      formData.append('category', finalCategory);
      formData.append('available', String(available));
      if (description) formData.append('description', description.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageBase64) {
        formData.append('imageBase64', imageBase64);
      } else if (imageUrl) {
        formData.append('image', imageUrl);
      }

      if (bookToEdit) {
        await api.updateBook(bookToEdit.id, formData);
        addToast({
          type: 'success',
          title: 'Book Updated',
          message: `"${title}" has been updated in the catalog.`,
        });
      } else {
        await api.createBook(formData);
        addToast({
          type: 'success',
          title: 'Book Added',
          message: `"${title}" added to the shop catalog.`,
        });
      }

      await refreshBooks();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto text-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-zinc-200 my-6">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-900" />
            <h3 className="font-semibold text-sm text-zinc-900">
              {bookToEdit ? 'Edit Book Record' : 'Add New Book to Catalog'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Book Image */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 block">
              Book Cover Image
            </label>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex gap-3 items-start">
              {preview ? (
                <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100 group">
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 bg-white rounded text-zinc-800 text-[10px]"
                      title="Replace"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-32 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 flex flex-col items-center justify-center p-2 text-center cursor-pointer shrink-0 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-zinc-400 mb-1" />
                  <span className="text-[10px] text-zinc-400">Add Cover</span>
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-3 h-3 text-zinc-500" />
                    Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-md text-[11px] font-medium transition-colors"
                  >
                    Upload File
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) setPreview(e.target.value);
                    }}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
                  />
                </div>
                <p className="text-[10px] text-zinc-400">
                  Upload cover photo from camera, local file, or image URL.
                </p>
              </div>
            </div>
          </div>

          {/* Title & Author */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                Book Title <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Days at the Morisaki Bookshop"
                  required
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                Author Name <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Satoshi Yagisawa"
                  required
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-zinc-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Category</span>
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Other">+ Custom Category...</option>
            </select>

            {category === 'Other' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40 mt-1.5 animate-fade-in"
              />
            )}
          </div>

          {/* Availability Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-700 block mb-1">
              Availability
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={available === true}
                  onChange={() => setAvailable(true)}
                  className="accent-zinc-900"
                />
                <span className="text-xs text-zinc-800">Available on Shelf</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={available === false}
                  onChange={() => setAvailable(false)}
                  className="accent-zinc-900"
                />
                <span className="text-xs text-zinc-800">Currently Borrowed / Reserved</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-medium text-zinc-700 block mb-1">
              Synopsis / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short blurb or shelf location (e.g. Shelf B, 2nd row)"
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/40 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : bookToEdit ? 'Save Changes' : 'Add Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
