import React from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  Clock,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  RotateCcw,
  BookMarked
} from 'lucide-react';

interface StatsCardsProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ currentFilter, onSelectFilter }) => {
  const { stats } = useSanctuary();

  const cards = [
    {
      id: 'pending',
      label: 'Pending Approval',
      count: stats?.pendingCount || 0,
      icon: Clock,
      color: 'amber',
      bgClass: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      activeClass: 'ring-2 ring-amber-500 bg-amber-100',
      badgeClass: 'bg-amber-200 text-amber-900',
      alert: (stats?.pendingCount || 0) > 0,
    },
    {
      id: 'active',
      label: 'Active Loans',
      count: stats?.activeCount || 0,
      icon: BookOpen,
      color: 'emerald',
      bgClass: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950',
      activeClass: 'ring-2 ring-emerald-500 bg-emerald-100',
      badgeClass: 'bg-emerald-200 text-emerald-900',
      alert: false,
    },
    {
      id: 'due_today',
      label: 'Due Today',
      count: stats?.dueTodayCount || 0,
      icon: CalendarCheck,
      color: 'orange',
      bgClass: 'bg-orange-50 hover:bg-orange-100/80 border-orange-200 text-orange-950',
      activeClass: 'ring-2 ring-orange-500 bg-orange-100',
      badgeClass: 'bg-orange-200 text-orange-900',
      alert: (stats?.dueTodayCount || 0) > 0,
    },
    {
      id: 'overdue',
      label: 'Overdue Books',
      count: stats?.overdueCount || 0,
      icon: AlertTriangle,
      color: 'rose',
      bgClass: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-950',
      activeClass: 'ring-2 ring-rose-500 bg-rose-100',
      badgeClass: 'bg-rose-200 text-rose-900',
      alert: (stats?.overdueCount || 0) > 0,
    },
    {
      id: 'returned',
      label: 'Total Returned',
      count: stats?.returnedCount || 0,
      icon: RotateCcw,
      color: 'stone',
      bgClass: 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-900',
      activeClass: 'ring-2 ring-stone-500 bg-stone-100',
      badgeClass: 'bg-stone-200 text-stone-800',
      alert: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = currentFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between shadow-sm cursor-pointer relative overflow-hidden ${
              card.bgClass
            } ${isSelected ? card.activeClass : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-tight text-stone-600 truncate">
                {card.label}
              </span>
              <Icon className="w-4 h-4 text-stone-500 shrink-0" />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
                {card.count}
              </span>
              {card.alert && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
