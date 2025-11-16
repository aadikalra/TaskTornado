// app/dashboard/DashboardClient.tsx

'use client';

import MainApp from '@/components/MainApp';
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