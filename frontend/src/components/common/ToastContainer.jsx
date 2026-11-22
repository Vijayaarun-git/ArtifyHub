import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { CheckIcon, CloseIcon } from './Icons';

export default function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-fade-in ${
              isError
                ? 'bg-rose-950/90 text-white border-rose-800/80 shadow-rose-950/20'
                : 'bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isError ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}
              >
                {isError ? '!' : <CheckIcon className="w-3 h-3" />}
              </span>
              <p className="text-sm font-medium leading-snug truncate">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(removeToast(toast.id))}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              aria-label="Dismiss notification"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
