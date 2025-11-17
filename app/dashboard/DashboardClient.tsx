// app/dashboard/DashboardClient.tsx

'use client';

import dynamic from 'next/dynamic';
import { ToastProvider } from '@/context/ToastContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { ClassProvider, useClassContext } from '@/context/ClassContext';
import { Class, Homework, Test } from '@/context/ClassContext';

interface DashboardClientProps {
  initialClasses: Class[];
  initialHomeworks: Homework[];
  initialTests: Test[];
}

function GamificationProviderWrapper() {
    const { classes, homeworks } = useClassContext();
    return (
        <GamificationProvider homeworks={homeworks} classes={classes}>
            <MainApp />
        </GamificationProvider>
    )
}

const MainApp = dynamic(() => import('@/components/MainApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-blue-400" />
    </div>
  ),
});

export default function DashboardClient({
  initialClasses,
  initialHomeworks,
  initialTests,
}: DashboardClientProps) {
  return (
    <ToastProvider>
      {/* THIS IS THE CHANGE: Pass the initial data into your provider */}
      <ClassProvider
        initialClasses={initialClasses}
        initialHomeworks={initialHomeworks}
        initialTests={initialTests} // Pass tests as well
      >
        <GamificationProviderWrapper />
      </ClassProvider>
    </ToastProvider>
  );
}