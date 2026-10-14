import React from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSanctuary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-3.5 h-3.5 text-zinc-500" />;

        if (toast.type === 'success') {
          icon = <Check className="w-3.5 h-3.5 text-zinc-900" />;
        } else if (toast.type === 'warning' || toast.type === 'danger') {
          icon = <AlertCircle className="w-3.5 h-3.5 text-zinc-900" />;
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3 rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-lg flex items-start gap-2.5 transition-all duration-200"
          >
            <div className="shrink-0 mt-0.5 p-1 rounded-md bg-zinc-100 text-zinc-800">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-zinc-900 leading-tight">{toast.title}</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5 break-words leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
