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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-gradient-to-r from-[#275085] to-[#4a7ba7] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm animate-pulse">
        Loading...
      </p>
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