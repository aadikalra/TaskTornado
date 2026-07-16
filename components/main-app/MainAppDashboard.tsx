'use client';

import React from 'react';
import { useUpcomingItems } from '@/components/ComingUp';
import { MiniCalendar } from '@/components/MiniCalendar';
import { MobileWeekCalendar } from '@/components/MobileWeekCalendar';
import { ComingUp } from '@/components/ComingUp';
import { EmailWidget } from '@/components/EmailWidget';

export const MainAppDashboard = () => {
  const upcomingItems = useUpcomingItems();
  const hasUpcoming = upcomingItems.length > 0;

  return (
    <div className={`grid grid-cols-1 ${hasUpcoming ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 lg:gap-4 mb-8 h-auto lg:h-[320px]`}>
      <div className="hidden md:block h-[320px]">
        <MiniCalendar />
      </div>
      <div className="block md:hidden">
        <MobileWeekCalendar />
      </div>
      {hasUpcoming && (
        <div className="min-h-[320px] lg:min-h-0 lg:h-[320px]">
          <ComingUp />
        </div>
      )}
      <div className="hidden lg:block h-[320px]">
        <EmailWidget />
      </div>
    </div>
  );
};
