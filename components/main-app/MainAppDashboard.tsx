import React from 'react';
import { WeeklyCalendarWidget } from './WeeklyCalendarWidget';
import { NeedsAttentionStrip } from './NeedsAttentionStrip';
import { useMainApp } from '@/context/MainAppContext';
import { DashboardFloat } from './DashboardIntro';

export const MainAppDashboard = () => {
  const { showCalendarWidget } = useMainApp();

  return (
    <>
      <DashboardFloat delayMs={160} kind="heading">
        <NeedsAttentionStrip />
      </DashboardFloat>
      {showCalendarWidget && (
        <DashboardFloat delayMs={260} tilt={0.25}>
          <WeeklyCalendarWidget />
        </DashboardFloat>
      )}
    </>
  );
};
