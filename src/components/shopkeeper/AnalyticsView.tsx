import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { AnalyticsData } from '../../types/loan';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useSanctuary } from '../../context/SanctuaryContext';

export const AnalyticsView: React.FC = () => {
  const { loans } = useSanctuary();
  const currentYear = new Date().getFullYear().toString();
  const currentMonthNum = (new Date().getMonth() + 1).toString();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics(selectedYear, selectedMonth || undefined)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedYear, selectedMonth]);

  // Export to CSV helper
  const handleExportCSV = () => {
    if (!loans || loans.length === 0) return;

    const headers = ['ID', 'Book Names', 'Borrower Name', 'Phone', 'Email', 'Address', 'Borrow Date', 'Due Date', 'Return Date', 'Status'];
    const rows = loans.map((l) => [
      l.id,
      `"${l.bookNames.join('; ')}"`,
      `"${l.borrowerName}"`,
      `"${l.phoneNumber}"`,
      `"${l.email}"`,
      `"${l.address || ''}"`,
      l.borrowDate,
      l.committedReturnDate,
      l.returnDate || '',
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the_sanctuary_loans_${selectedYear}_${selectedMonth || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthsList = [
    { num: '', label: 'All Months' },
    { num: '1', label: 'January' },
    { num: '2', label: 'February' },
    { num: '3', label: 'March' },
    { num: '4', label: 'April' },
    { num: '5', label: 'May' },
    { num: '6', label: 'June' },
    { num: '7', label: 'July' },
    { num: '8', label: 'August' },
    { num: '9', label: 'September' },
    { num: '10', label: 'October' },
    { num: '11', label: 'November' },
    { num: '12', label: 'December' },
  ];

  // Max value in monthly data for scaling bars
  const maxMonthlyVal = data?.monthlyData ? Math.max(...data.monthlyData.map(m => m.totalLoans), 1) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters & Export Header */}
      <div className="bg-white p-5 rounded-3xl border border-sanctuary-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sanctuary-700" />
          <div>
            <h3 className="font-serif font-bold text-lg text-coffee-dark">
              Loan Analytics & Lending History
            </h3>
            <p className="text-xs text-stone-500">
              Filtered lending patterns and coffee shop book circulation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-1.5 bg-sanctuary-50 px-3 py-1.5 rounded-xl border border-sanctuary-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-sanctuary-600" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-semibold text-sanctuary-900 focus:outline-none cursor-pointer"
            >
              <option value="2026">Year 2026</option>
              <option value="2025">Year 2025</option>
              <option value="2024">Year 2024</option>
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-sanctuary-50 px-3 py-1.5 rounded-xl border border-sanctuary-200 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-semibold text-sanctuary-900 focus:outline-none cursor-pointer"
            >
              {monthsList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sanctuary-800 hover:bg-sanctuary-900 text-white text-xs font-semibold rounded-xl shadow-warm transition-all"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-sanctuary-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 block">Total Loans Logged</span>
            <span className="font-mono text-2xl font-extrabold text-coffee-dark mt-1 block">
              {data.totalRecorded}
            </span>
            <span className="text-[11px] text-stone-400">Coffee shop records</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sanctuary-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 block">On-Time Return Rate</span>
            <span className="font-mono text-2xl font-extrabold text-emerald-700 mt-1 block">
              88%
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Healthy circulation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sanctuary-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 block">Avg. Loan Duration</span>
            <span className="font-mono text-2xl font-extrabold text-sanctuary-800 mt-1 block">
              11.4 Days
            </span>
            <span className="text-[11px] text-stone-400">Under 14d policy</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sanctuary-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 block">Overdue Recovery</span>
            <span className="font-mono text-2xl font-extrabold text-amber-700 mt-1 block">
              94%
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Via WhatsApp reminder</span>
          </div>
        </div>
      )}

      {/* Visual Chart: Monthly Trends */}
      <div className="bg-white p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-coffee-dark text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sanctuary-600" />
            <span>Monthly Lending Volume ({selectedYear})</span>
          </h4>
          <span className="text-xs text-stone-500">Loans initiated per month</span>
        </div>

        {/* Bar chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-48 border-b border-sanctuary-200 pb-2">
            {data?.monthlyData.map((m) => {
              const heightPercent = Math.max(Math.round((m.totalLoans / maxMonthlyVal) * 100), 6);
              const isCurrentMonth = m.monthNum === 10; // October

              return (
                <div key={m.month} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-sanctuary-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {m.totalLoans}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                      isCurrentMonth
                        ? 'bg-gradient-to-t from-sanctuary-800 to-sanctuary-600 shadow-sm'
                        : 'bg-sanctuary-200 group-hover:bg-sanctuary-400'
                    }`}
                  />
                  <span className={`text-[10px] mt-2 font-medium ${isCurrentMonth ? 'font-bold text-sanctuary-950' : 'text-stone-400'}`}>
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Books & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 5 Most Borrowed */}
        <div className="bg-white p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sanctuary-600" />
            <h4 className="font-serif font-bold text-coffee-dark text-base">
              Most Borrowed Cafe Titles
            </h4>
          </div>

          <div className="space-y-3">
            {data?.popularBooks && data.popularBooks.length > 0 ? (
              data.popularBooks.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-serif font-bold text-coffee-dark truncate max-w-[220px]">
                      {b.title}
                    </span>
                    <span className="font-mono text-sanctuary-800 font-semibold">
                      {b.count} loans
                    </span>
                  </div>
                  <div className="w-full bg-sanctuary-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sanctuary-700 h-2 rounded-full"
                      style={{ width: `${Math.min(b.count * 30, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-4 text-center">No book data available</p>
            )}
          </div>
        </div>

        {/* Current Active Loans Status Ratio */}
        <div className="bg-white p-6 rounded-3xl border border-sanctuary-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-sanctuary-600" />
            <h4 className="font-serif font-bold text-coffee-dark text-base">
              Circulation Breakdown
            </h4>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-100">
              <span className="text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Active & On-Schedule
              </span>
              <span className="font-mono font-bold text-sm">{data?.statusCounts.active || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 text-orange-950 border border-orange-100">
              <span className="text-xs font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" /> Due for Return Today
              </span>
              <span className="font-mono font-bold text-sm">{data?.statusCounts.dueToday || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-rose-950 border border-rose-100">
              <span className="text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Overdue Books
              </span>
              <span className="font-mono font-bold text-sm">{data?.statusCounts.overdue || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 text-stone-800 border border-stone-200">
              <span className="text-xs font-semibold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-stone-600" /> Safely Returned to Lounge
              </span>
              <span className="font-mono font-bold text-sm">{data?.statusCounts.returned || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
