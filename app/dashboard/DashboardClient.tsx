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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">
      <div className="relative flex items-center justify-center">
        {/* Subtle background pulse */}
        <div className="absolute w-16 h-16 bg-[#275085]/20 rounded-full animate-ping opacity-75" />
        
        {/* Static track ring */}
        <div className="w-12 h-12 rounded-full border-[3px] border-gray-200 dark:border-gray-700" />
        
        {/* Spinning gradient arc */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-[3px] border-t-[#275085] border-r-[#4a7ba7] border-b-transparent border-l-transparent animate-spin" />
      </div>
      
      <span className="mt-6 text-xs font-medium text-gray-400 animate-pulse">
        Loading
      </span>
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
      <ClassProvider
        initialClasses={initialClasses}
        initialHomeworks={initialHomeworks}
        initialTests={initialTests}
      >
        <GamificationProviderWrapper />
      </ClassProvider>
    </ToastProvider>
  );
}