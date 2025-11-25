'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30';
      case 'error':
        return 'bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30';
      case 'warning':
        return 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30';
      case 'info':
      default:
        return 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: -10 }}
      animate={{ opacity: isVisible ? 1 : 0, x: 0, y: isVisible ? 0 : -10 }}
      exit={{ opacity: 0, x: -20, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border backdrop-blur-sm max-w-md shadow-sm',
        getBgColor()
      )}
    >
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
