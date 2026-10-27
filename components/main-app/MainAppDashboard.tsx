import React from 'react';
import { WeeklyCalendarWidget } from './WeeklyCalendarWidget';
import { useMainApp } from '@/context/MainAppContext';
import { DashboardFloat } from './DashboardIntro';

export const MainAppDashboard = () => {
  const { showCalendarWidget } = useMainApp();

  return (
    <>
      {showCalendarWidget && (
        <DashboardFloat delayMs={260} tilt={0.25}>
          <WeeklyCalendarWidget />
        </DashboardFloat>
      )}
    </>
  );
};
