import React from 'react';
import { WeeklyCalendarWidget } from './WeeklyCalendarWidget';
import { NeedsAttentionStrip } from './NeedsAttentionStrip';
import { useMainApp } from '@/context/MainAppContext';

export const MainAppDashboard = () => {
  const { showCalendarWidget } = useMainApp();

  return (
    <>
      <NeedsAttentionStrip />
      {showCalendarWidget && <WeeklyCalendarWidget />}
    </>
  );
};
