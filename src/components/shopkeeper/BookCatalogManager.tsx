import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { BookItem } from '../../types/loan';
import { api } from '../../utils/api';
import { BookModal } from './BookModal';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
  Clock,
  LayoutGrid,
  List,
  Library
} from 'lucide-react';

export const BookCatalogManager: React.FC = () => {
  const { books, refreshBooks, addToast } = useSanctuary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category))).filter(Boolean)];

  // Filter books
  const filteredBooks = books.filter((book) => {
    if (selectedCategory !== 'all' && book.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchCat = book.category.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCat) return false;
    }
    return true;
  });

  const availableCount = books.filter((b) => b.available).length;
  const onLoanCount = books.filter((b) => !b.available).length;

  const handleOpenAdd = () => {
    setBookToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: BookItem) => {
    setBookToEdit(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteBook(id);
      addToast({
        type: 'info',
        title: 'Book Removed',
        message: `"${title}" has been deleted from catalog.`,
      });
      await refreshBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      addToast({ type: 'danger', title: 'Error', message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (book: BookItem) => {
    try {
      const formData = new FormData();
      formData.append('available', String(!book.available));
      await api.updateBook(book.id, formData);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `"${book.title}" marked as ${!book.available ? 'Available' : 'On Loan'}.`,
      });
      await refreshBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      addToast({ type: 'danger', title: 'Error', message });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
            <Library className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-zinc-900">
                Book Database & Catalog
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                {books.length} Total
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Manage inventory, add new books, update covers and availability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stats Pills */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
              {availableCount} Available
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">
              {onLoanCount} Borrowed
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, category..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1.5 rounded-lg border border-zinc-200/60 text-xs">
            <Tag className="w-3 h-3 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md border transition-colors ${
              viewMode === 'grid'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md border transition-colors ${
              viewMode === 'table'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
            title="Table view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Books Content */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-10 text-center space-y-2">
          <BookOpen className="w-6 h-6 text-zinc-300 mx-auto" />
          <h4 className="font-semibold text-zinc-800 text-sm">No books found</h4>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try clearing your search query or category filter.'
              : 'Add your first book to populate the cafe library.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors mt-2"
          >
            <Plus className="w-3 h-3" />
            Add First Book
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between group"
            >
              {/* Cover Image */}
              <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Availability Tag */}
                <div className="absolute top-2 left-2">
                  <span
                    onClick={() => handleToggleAvailability(book)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium backdrop-blur-md cursor-pointer transition-colors ${
                      book.available
                        ? 'bg-zinc-900/85 text-white'
                        : 'bg-zinc-700/85 text-zinc-200'
                    }`}
                    title="Click to toggle availability"
                  >
                    {book.available ? 'Available' : 'On Loan'}
                  </span>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-semibold text-zinc-400 truncate block">
                    {book.category}
                  </span>
                  <h4 className="font-medium text-zinc-900 text-xs leading-snug line-clamp-2" title={book.title}>
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">{book.author}</p>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-400">{book.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(book)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                      title="Edit book"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      disabled={deletingId === book.id}
                      className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors disabled:opacity-50"
                      title="Delete book"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 border-b border-zinc-200/80 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Cover</th>
                <th className="py-2.5 px-3.5">Book Title</th>
                <th className="py-2.5 px-3.5">Author</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-8 h-10 rounded object-cover border border-zinc-200"
                    />
                  </td>
                  <td className="py-2 px-3.5 font-medium text-zinc-900 max-w-xs truncate">
                    {book.title}
                  </td>
                  <td className="py-2 px-3.5 text-zinc-600 whitespace-nowrap">
                    {book.author}
                  </td>
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAvailability(book)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        book.available
                          ? 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
                          : 'bg-zinc-900 text-white border-transparent'
                      }`}
                      title="Click to toggle status"
                    >
                      {book.available ? 'Available' : 'On Loan'}
                    </button>
                  </td>
                  <td className="py-2 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                        title="Edit book"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        disabled={deletingId === book.id}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                        title="Delete book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Add/Edit Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookToEdit={bookToEdit}
      />
    </div>
  );
};
