'use client';

import { ToastProvider } from '@/context/ToastContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { ClassProvider, useClassContext } from '@/context/ClassContext';
import { HomeworkProvider, useHomeworkContext } from '@/context/HomeworkContext';
import { TestProvider } from '@/context/TestContext';
import { Class, Homework, Test } from '@/context/ClassContext';
import MainApp from '@/components/MainApp';
import { MainAppProvider } from '@/context/MainAppContext';

interface DashboardClientProps {
  initialClasses: Class[];
  initialHomeworks: Homework[];
  initialTests: Test[];
}

function GamificationProviderWrapper() {
  const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  return (
    <GamificationProvider homeworks={homeworks} classes={classes}>
      <MainAppProvider>
        <MainApp />
      </MainAppProvider>
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
      <ClassProvider initialClasses={initialClasses}>
        <HomeworkProvider initialHomeworks={initialHomeworks}>
          <TestProvider initialTests={initialTests}>
            <GamificationProviderWrapper />
          </TestProvider>
        </HomeworkProvider>
      </ClassProvider>
    </ToastProvider>
  );
}