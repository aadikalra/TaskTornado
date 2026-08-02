import React from 'react';
import { WeeklyCalendarWidget } from './WeeklyCalendarWidget';
import { NeedsAttentionStrip } from './NeedsAttentionStrip';

export const MainAppDashboard = () => {
  return (
    <>
      <NeedsAttentionStrip />
      <WeeklyCalendarWidget />
    </>
  );
};
