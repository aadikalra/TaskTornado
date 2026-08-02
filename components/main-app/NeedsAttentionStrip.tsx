'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useClassContext } from '@/context/ClassContext';
import { HugeIcon } from '@/lib/huge-icon-map';

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
        return status !== 'taken' && status !== 'completed' && new Date(`${test.testDate}T00:00:00`) >= today;
      })
      .sort((left, right) => new Date(left.testDate).getTime() - new Date(right.testDate).getTime())[0];

    const items: Array<{
      key: string;
      href: string;
      icon: string;
      label: string;
      title: string;
      detail: string;
      tone: string;
      labelTone: string;
      surface: string;
    }> = [];

    if (overdue.length > 0) {
      items.push({
        key: 'overdue',
        href: '/homework',
        icon: 'AlertCircle',
        label: 'Overdue',
        title: `${overdue.length} assignment${overdue.length === 1 ? '' : 's'}`,
        detail: 'Needs attention',
        tone: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
        labelTone: 'text-rose-600 dark:text-rose-300',
        surface: 'bg-rose-500/[0.065] dark:bg-rose-500/[0.075]',
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
        tone: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
        labelTone: 'text-amber-600 dark:text-amber-300',
        surface: 'bg-amber-500/[0.065] dark:bg-amber-500/[0.075]',
      });
    }

    if (nextTest) {
      const className = classes.find(classItem => classItem.id === nextTest.classId)?.name;
      const date = new Date(`${nextTest.testDate}T00:00:00`);
      items.push({
        key: 'test',
        href: '/tests',
        icon: 'Quiz04',
        label: 'Next test',
        title: nextTest.title,
        detail: `${className ? `${className} · ` : ''}${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        tone: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
        labelTone: 'text-sky-700 dark:text-sky-300',
        surface: 'bg-sky-500/[0.065] dark:bg-sky-500/[0.075]',
      });
    }

    return items;
  }, [classes, homeworks, tests]);

  return (
    <section aria-label="Needs attention" className="mb-3 sm:mb-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
            <HugeIcon name="Zap" size={14} />
          </span>
          <h2 className="text-sm font-semibold text-sky-950 dark:text-sky-100">Your day</h2>
        </div>
        {focusItems.length > 0 && (
          <span className="text-xs font-medium text-sky-700/40 dark:text-sky-300/35">
            {focusItems.length} thing{focusItems.length === 1 ? '' : 's'} to watch
          </span>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {focusItems.length === 0 ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] bg-emerald-500/[0.07] px-4 py-3 text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-300">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12">
              <HugeIcon name="CheckmarkCircle02" size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold">Nothing urgent</span>
              <span className="block text-xs font-normal opacity-65">Your day is clear.</span>
            </span>
          </div>
        ) : (
          focusItems.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className={`group flex min-w-[245px] flex-1 items-center gap-3 rounded-[20px] px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-950/[0.04] sm:min-w-0 ${item.surface}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                <HugeIcon name={item.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-xs font-medium ${item.labelTone}`}>
                  {item.label}
                </span>
                <span className="block truncate text-sm font-semibold text-sky-950 dark:text-sky-100">{item.title}</span>
                <span className="block truncate text-xs font-normal text-sky-700/45 dark:text-sky-300/40">{item.detail}</span>
              </span>
              <HugeIcon name="ArrowRight01" size={13} className="shrink-0 text-sky-700/25 transition-transform group-hover:translate-x-0.5 dark:text-sky-300/25" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
};
