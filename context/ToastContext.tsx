'use client';

import * as React from 'react';
import { Toast, ToastContainer } from '@/components/Toast';
import { v4 as uuidv4 } from 'uuid';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uuidv4();
    const newToast: Toast = {
      id,
      duration: 4000, // Default 4 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = React.useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message, duration: 3000 });
  }, [addToast]);

  const error = React.useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 5000 });
  }, [addToast]);

  const warning = React.useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message, duration: 4000 });
  }, [addToast]);

  const info = React.useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message, duration: 4000 });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};
