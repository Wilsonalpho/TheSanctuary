import React from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  Clock,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  RotateCcw
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
      alert: (stats?.pendingCount || 0) > 0,
    },
    {
      id: 'active',
      label: 'Active Loans',
      count: stats?.activeCount || 0,
      icon: BookOpen,
      alert: false,
    },
    {
      id: 'due_today',
      label: 'Due Today',
      count: stats?.dueTodayCount || 0,
      icon: CalendarCheck,
      alert: (stats?.dueTodayCount || 0) > 0,
    },
    {
      id: 'overdue',
      label: 'Overdue Books',
      count: stats?.overdueCount || 0,
      icon: AlertTriangle,
      alert: (stats?.overdueCount || 0) > 0,
    },
    {
      id: 'returned',
      label: 'Total Returned',
      count: stats?.returnedCount || 0,
      icon: RotateCcw,
      alert: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = currentFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`p-3.5 rounded-xl border text-left transition-colors duration-150 flex flex-col justify-between bg-white shadow-sm cursor-pointer ${
              isSelected
                ? 'border-zinc-900 bg-zinc-50/50'
                : 'border-zinc-200/80 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 truncate">
                {card.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900">
                {card.count}
              </span>
              {card.alert && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
