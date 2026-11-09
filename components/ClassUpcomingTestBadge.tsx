'use client';

import type { MouseEventHandler } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { Portal as TooltipPortal } from '@radix-ui/react-tooltip';

import type { Test } from '@/context/TestContext';
import { parseCalendarDate } from '@/lib/dateUtils';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClassUpcomingTestBadgeProps {
  test: Pick<Test, 'title' | 'testDate'>;
  subjectName: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export function ClassUpcomingTestBadge({ test, subjectName, onClick }: ClassUpcomingTestBadgeProps) {
  const testDate = parseCalendarDate(test.testDate);
  const daysUntilTest = differenceInCalendarDays(testDate, new Date());
  const relativeDateLabel = daysUntilTest === 0 ? 'Today' : daysUntilTest === 1 ? 'Tomorrow' : null;
  const fullDateLabel = format(testDate, 'EEEE, MMMM d, yyyy');
  const isSoon = daysUntilTest >= 0 && daysUntilTest <= 1;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={`Next test for ${subjectName}: ${test.title}, ${fullDateLabel}. Open test details`}
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
              isSoon
                ? 'text-amber-700 hover:text-amber-800 dark:text-amber-300/80 dark:hover:text-amber-200'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span aria-hidden="true"><HugeIcon name="Quiz04" size={15} /></span>
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="top" sideOffset={6} className="max-w-64 rounded-xl bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <p className="mb-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">Upcoming test</p>
            <p className="text-xs font-semibold break-words">{test.title}</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              {relativeDateLabel && `${relativeDateLabel} · `}<time dateTime={test.testDate}>{fullDateLabel}</time>
            </p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
