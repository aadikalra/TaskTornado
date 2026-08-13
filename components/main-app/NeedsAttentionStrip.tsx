'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useClassContext } from '@/context/ClassContext';
import { HugeIcon } from '@/lib/huge-icon-map';
import { parseCalendarDate } from '@/lib/dateUtils';

export const NeedsAttentionStrip = () => {
  const { homeworks = [] } = useHomeworkContext() || {};
  const { tests = [] } = useTestContext() || {};
  const { classes = [] } = useClassContext() || {};

  const focusItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdue = homeworks.filter(homework => {
      if (homework.completed || !homework.dueDate) return false;
      return new Date(homework.dueDate) < today;
    });
    const dueToday = homeworks.filter(homework => {
      if (homework.completed || !homework.dueDate) return false;
      const dueDate = new Date(homework.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
    const nextTest = [...tests]
      .filter(test => {
        const status = test.status?.toLowerCase();
        return status !== 'taken' && status !== 'completed' && parseCalendarDate(test.testDate) >= today;
      })
      .sort((left, right) => parseCalendarDate(left.testDate).getTime() - parseCalendarDate(right.testDate).getTime())[0];

    const items: Array<{
      key: string;
      href: string;
      icon: string;
      label: string;
      title: string;
      detail: string;
      tone: string;
    }> = [];

    if (overdue.length > 0) {
      items.push({
        key: 'overdue',
        href: '/homework',
        icon: 'AlertCircle',
        label: 'Overdue',
        title: `${overdue.length} assignment${overdue.length === 1 ? '' : 's'}`,
        detail: 'Needs attention',
        tone: 'text-rose-600 dark:text-rose-300',
      });
    }

    if (dueToday.length > 0) {
      items.push({
        key: 'today',
        href: '/homework',
        icon: 'Calendar02',
        label: 'Due today',
        title: `${dueToday.length} assignment${dueToday.length === 1 ? '' : 's'}`,
        detail: 'View today’s work',
        tone: 'text-amber-600 dark:text-amber-300',
      });
    }

    if (nextTest) {
      const className = classes.find(classItem => classItem.id === nextTest.classId)?.name;
      const date = parseCalendarDate(nextTest.testDate);
      items.push({
        key: 'test',
        href: '/tests',
        icon: 'Quiz04',
        label: 'Next test',
        title: nextTest.title,
        detail: `${className ? `${className} · ` : ''}${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        tone: 'text-sky-700 dark:text-sky-300',
      });
    }

    return items;
  }, [classes, homeworks, tests]);

  return (
    <section aria-label="Needs attention" className="mb-3 sm:mb-4">
      <div className="flex items-baseline justify-between border-b border-sky-100 px-1 pb-2 dark:border-sky-500/10">
        <h2 className="text-sm font-bold uppercase tracking-tight text-sky-900 sm:text-base dark:text-sky-100">
          Your day
        </h2>
        {focusItems.length > 0 && (
          <span className="text-xs font-medium text-sky-700/40 dark:text-sky-300/35">
            {focusItems.length} thing{focusItems.length === 1 ? '' : 's'} to watch
          </span>
        )}
      </div>

      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {focusItems.length === 0 ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1 py-3 text-emerald-700 dark:text-emerald-300">
            <HugeIcon name="CheckmarkCircle02" size={16} className="shrink-0" />
            <span className="text-sm font-medium">Nothing urgent</span>
            <span className="text-xs font-normal opacity-55">Your day is clear.</span>
          </div>
        ) : (
          focusItems.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex min-w-[220px] flex-1 items-center gap-2.5 border-l border-sky-100 px-3 py-3 first:border-l-0 first:pl-1 last:pr-1 transition-colors hover:bg-sky-500/[0.025] sm:min-w-0 dark:border-sky-500/10 dark:hover:bg-white/[0.02]"
            >
              <span className={`flex h-8 w-5 shrink-0 items-center justify-center ${item.tone}`}>
                <HugeIcon name={item.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${item.tone}`}>
                    {item.label}
                  </span>
                  <span className="truncate text-xs font-normal text-sky-700/45 dark:text-sky-300/40">
                    {item.detail}
                  </span>
                </span>
                <span className="block truncate text-sm font-medium text-sky-950 dark:text-sky-100">{item.title}</span>
              </span>
              <HugeIcon name="ArrowRight01" size={12} className="shrink-0 text-sky-700/20 transition-transform group-hover:translate-x-0.5 dark:text-sky-300/20" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
};
