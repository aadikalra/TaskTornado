'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import MainApp from '@/components/MainApp';
import { ToastProvider } from '@/context/ToastContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { useClassContext } from '@/context/ClassContext';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { classes, homeworks, loading: classLoading } = useClassContext();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || classLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-blue-400" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <GamificationProvider homeworks={homeworks} classes={classes}>
        <MainApp />
      </GamificationProvider>
    </ToastProvider>
  );
}
