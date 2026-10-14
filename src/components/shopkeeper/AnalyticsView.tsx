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
  RotateCcw
} from 'lucide-react';
import { useSanctuary } from '../../context/SanctuaryContext';

export const AnalyticsView: React.FC = () => {
  const { loans } = useSanctuary();
  const currentYear = new Date().getFullYear().toString();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics(selectedYear, selectedMonth || undefined)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error(err));
  }, [selectedYear, selectedMonth]);

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
    { num: '1', label: 'Jan' },
    { num: '2', label: 'Feb' },
    { num: '3', label: 'Mar' },
    { num: '4', label: 'Apr' },
    { num: '5', label: 'May' },
    { num: '6', label: 'Jun' },
    { num: '7', label: 'Jul' },
    { num: '8', label: 'Aug' },
    { num: '9', label: 'Sep' },
    { num: '10', label: 'Oct' },
    { num: '11', label: 'Nov' },
    { num: '12', label: 'Dec' },
  ];

  const maxMonthlyVal = data?.monthlyData ? Math.max(...data.monthlyData.map(m => m.totalLoans), 1) : 1;

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-zinc-700" />
          <div>
            <h3 className="font-semibold text-sm text-zinc-900">
              Loan Analytics
            </h3>
            <p className="text-[11px] text-zinc-400">
              Circulation history and lending volume
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200/60 text-xs">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200/60 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer"
            >
              {monthsList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Total Loans</span>
            <span className="font-mono text-xl font-bold text-zinc-900 mt-1 block">
              {data.totalRecorded}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">On-Time Rate</span>
            <span className="font-mono text-xl font-bold text-zinc-900 mt-1 block">
              88%
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Avg. Duration</span>
            <span className="font-mono text-xl font-bold text-zinc-900 mt-1 block">
              11.4 Days
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Active Borrows</span>
            <span className="font-mono text-xl font-bold text-zinc-900 mt-1 block">
              {data.statusCounts.active + data.statusCounts.dueToday + data.statusCounts.overdue}
            </span>
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-zinc-900 text-xs flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            <span>Monthly Lending Volume ({selectedYear})</span>
          </h4>
        </div>

        <div className="pt-2">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-end h-40 border-b border-zinc-100 pb-2">
            {data?.monthlyData.map((m) => {
              const heightPercent = Math.max(Math.round((m.totalLoans / maxMonthlyVal) * 100), 4);
              const isCurrentMonth = m.monthNum === 10;

              return (
                <div key={m.month} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {m.totalLoans}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[20px] rounded-t transition-all ${
                      isCurrentMonth
                        ? 'bg-zinc-900'
                        : 'bg-zinc-200 group-hover:bg-zinc-400'
                    }`}
                  />
                  <span className={`text-[9px] mt-1.5 ${isCurrentMonth ? 'font-bold text-zinc-900' : 'text-zinc-400'}`}>
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Books & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Most Borrowed */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="font-medium text-zinc-900 text-xs">
              Popular Books
            </h4>
          </div>

          <div className="space-y-2">
            {data?.popularBooks && data.popularBooks.length > 0 ? (
              data.popularBooks.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-zinc-800 truncate max-w-[200px]">
                      {b.title}
                    </span>
                    <span className="font-mono text-zinc-500 font-medium">
                      {b.count}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-900 h-1.5 rounded-full"
                      style={{ width: `${Math.min(b.count * 30, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-zinc-400 py-3 text-center">No data</p>
            )}
          </div>
        </div>

        {/* Status Ratio */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="font-medium text-zinc-900 text-xs">
              Status Breakdown
            </h4>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-medium flex items-center gap-1.5 text-zinc-700">
                <CheckCircle className="w-3 h-3 text-zinc-500" /> Active Loans
              </span>
              <span className="font-mono font-medium text-xs text-zinc-900">{data?.statusCounts.active || 0}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-medium flex items-center gap-1.5 text-zinc-700">
                <Calendar className="w-3 h-3 text-zinc-500" /> Due Today
              </span>
              <span className="font-mono font-medium text-xs text-zinc-900">{data?.statusCounts.dueToday || 0}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-medium flex items-center gap-1.5 text-zinc-700">
                <AlertTriangle className="w-3 h-3 text-zinc-500" /> Overdue
              </span>
              <span className="font-mono font-medium text-xs text-zinc-900">{data?.statusCounts.overdue || 0}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-[11px] font-medium flex items-center gap-1.5 text-zinc-700">
                <RotateCcw className="w-3 h-3 text-zinc-500" /> Returned
              </span>
              <span className="font-mono font-medium text-xs text-zinc-900">{data?.statusCounts.returned || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
