'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Helper functions
export const toast = {
  success: (title: string, message?: string) =>
    useToast.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToast.getState().addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useToast.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToast.getState().addToast({ type: 'info', title, message }),
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-l-mm-mint bg-mm-mint/10',
  error: 'border-l-mm-red bg-mm-red/10',
  warning: 'border-l-mm-orange bg-mm-orange/10',
  info: 'border-l-mm-blue bg-mm-blue/10',
};

const iconColors = {
  success: 'text-mm-mint',
  error: 'text-mm-red',
  warning: 'text-mm-orange',
  info: 'text-mm-blue',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const Icon = icons[toast.type];

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border-l-4 bg-white border-2 border-mm-black shadow-bold max-w-sm',
        colors[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-mm-black">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-mm-gray-600 font-body mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-full hover:bg-mm-gray-100 transition-colors"
      >
        <X className="w-4 h-4 text-mm-gray-500" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
