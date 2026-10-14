import React from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { X, Bell, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSanctuary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bg = 'bg-white border-sanctuary-200 text-coffee-dark';
        let icon = <Bell className="w-5 h-5 text-sanctuary-600" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-950';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-300 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
        } else if (toast.type === 'danger') {
          bg = 'bg-rose-50 border-rose-200 text-rose-950';
          icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-warm-lg flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
              <p className="text-xs mt-1 text-opacity-80 break-words leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
