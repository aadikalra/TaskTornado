'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';
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
  const [isExiting, setIsExiting] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const duration = toast.duration || 4000;

  React.useEffect(() => {
    const startTime = Date.now();
    const animFrame = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        requestAnimationFrame(animFrame);
      }
    };
    const raf = requestAnimationFrame(animFrame);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 250);
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [duration, toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  const config = React.useMemo(() => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <Check className="h-3.5 w-3.5" />,
          iconBg: 'bg-emerald-500',
          progressColor: 'bg-emerald-400',
          accentBorder: 'border-l-emerald-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          iconBg: 'bg-red-500',
          progressColor: 'bg-red-400',
          accentBorder: 'border-l-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          iconBg: 'bg-amber-500',
          progressColor: 'bg-amber-400',
          accentBorder: 'border-l-amber-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-3.5 w-3.5" />,
          iconBg: 'bg-blue-500',
          progressColor: 'bg-blue-400',
          accentBorder: 'border-l-blue-500',
        };
    }
  }, [toast.type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        y: isExiting ? 8 : 0,
        scale: isExiting ? 0.96 : 1,
      }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 30,
      }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl',
        'border border-gray-200/60 dark:border-white/[0.08]',
        'shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
        'w-[340px]',
      )}
    >
      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className={cn(
          'shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded-lg text-white',
          config.iconBg,
        )}>
          {config.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight tracking-[-0.01em]">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 mt-0.5 p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.06] transition-all duration-150 active:scale-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-gray-100 dark:bg-white/[0.04]">
        <div
          className={cn('h-full transition-none', config.progressColor, 'opacity-60')}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-5 left-5 z-[100] flex flex-col-reverse gap-2.5">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
