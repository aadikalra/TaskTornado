'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addWeeks,
  format,
  isToday as isDateToday,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { motion } from 'framer-motion';
import { useHomeworkContext, type Homework } from '@/context/HomeworkContext';
import { useTestContext, type Test } from '@/context/TestContext';
import { useClassContext } from '@/context/ClassContext';
import { getEventsForDate, schoolYear2026_2027 } from '@/data/schoolEvents';
import { getClassIcon } from '@/lib/icon-map';
import { HugeIcon } from '@/lib/huge-icon-map';
import { cn } from '@/lib/utils';

type DayItems = {
  homeworks: Homework[];
  tests: Test[];
  events: Array<{ id: string; title: string }>;
};

type CalendarItem =
  | { kind: 'homework'; item: Homework }
  | { kind: 'test'; item: Test }
  | { kind: 'event'; item: { id: string; title: string } };

export const WeeklyCalendarWidget = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedMobileDay, setSelectedMobileDay] = useState(() => {
    const mondayIndex = (new Date().getDay() + 6) % 7;
    return Math.min(mondayIndex, 4);
  });
  const manuallySelectedDay = useRef(false);

  const { homeworks = [], toggleHomework = () => {} } = useHomeworkContext() || {};
  const { tests = [] } = useTestContext() || {};
  const { classes = [] } = useClassContext() || {};

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(currentWeekStart, index)),
    [currentWeekStart],
  );

  const itemsByDate = useMemo(() => {
    const map: Record<string, DayItems> = {};

    weekDays.forEach(day => {
      map[format(day, 'yyyy-MM-dd')] = { homeworks: [], tests: [], events: [] };
    });

    homeworks.forEach(hw => {
      if (!hw.dueDate) return;
      const date = new Date(hw.dueDate);
      if (Number.isNaN(date.getTime())) return;
      map[format(date, 'yyyy-MM-dd')]?.homeworks.push(hw);
    });

    tests.forEach(test => {
      if (!test.testDate) return;
      const date = new Date(test.testDate);
      if (Number.isNaN(date.getTime())) return;
      map[format(date, 'yyyy-MM-dd')]?.tests.push(test);
    });

    weekDays.forEach(day => {
      const date = format(day, 'yyyy-MM-dd');
      map[date].events = getEventsForDate(day, schoolYear2026_2027).map(event => ({
        id: event.id,
        title: event.title,
      }));
    });

    return map;
  }, [homeworks, tests, weekDays]);

  useEffect(() => {
    if (manuallySelectedDay.current) return;

    const todayIndex = weekDays.findIndex(day => isDateToday(day));
    if (todayIndex >= 0) {
      setSelectedMobileDay(todayIndex);
      return;
    }

    const firstActiveDay = weekDays.findIndex(day => {
      const items = itemsByDate[format(day, 'yyyy-MM-dd')];
      return items && items.homeworks.length + items.tests.length + items.events.length > 0;
    });
    setSelectedMobileDay(firstActiveDay >= 0 ? firstActiveDay : 0);
  }, [currentWeekStart, itemsByDate, weekDays]);

  const selectDay = (index: number) => {
    manuallySelectedDay.current = true;
    setSelectedMobileDay(index);
  };

  const prevWeek = () => {
    manuallySelectedDay.current = false;
    setCurrentWeekStart(previous => subWeeks(previous, 1));
  };

  const nextWeek = () => {
    manuallySelectedDay.current = false;
    setCurrentWeekStart(previous => addWeeks(previous, 1));
  };

  const getCalendarItems = (dayItems: DayItems): CalendarItem[] => [
    ...dayItems.homeworks.map(item => ({ kind: 'homework' as const, item })),
    ...dayItems.tests.map(item => ({ kind: 'test' as const, item })),
    ...dayItems.events.map(item => ({ kind: 'event' as const, item })),
  ];

  const renderCalendarItems = (dayItems: DayItems) => {
    const allItems = getCalendarItems(dayItems);
    const visibleItems = allItems.slice(0, 4);

    if (allItems.length === 0) {
      return (
        <div className={cn(
          'flex min-h-14 flex-1 items-center justify-center text-xs font-medium text-sky-700/45 dark:text-sky-400/45',
        )}>
          Nothing due—enjoy the breathing room.
        </div>
      );
    }

    return (
      <>
        {visibleItems.map(entry => {
          if (entry.kind === 'homework') {
            return (
              <motion.button
                type="button"
                key={`hw-${entry.item.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleHomework(entry.item.id)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-xl font-semibold text-left transition-colors',
                  'px-3 py-2.5 text-[13px]',
                  entry.item.completed
                    ? 'bg-sky-50/50 dark:bg-zinc-900/40 text-sky-400/60 dark:text-sky-500/50 line-through opacity-70'
                    : 'bg-sky-100/80 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-200/80 dark:hover:bg-sky-500/25',
                )}
              >
                <HugeIcon name="Book03" size={14} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{entry.item.title}</span>
              </motion.button>
            );
          }

          if (entry.kind === 'test') {
            const classInfo = classes.find(item => item.id === entry.item.classId);
            const ClassIcon = classInfo
              ? getClassIcon(classInfo.icon)
              : () => <HugeIcon name="Book03" size={14} className="h-3.5 w-3.5 shrink-0" />;

            return (
              <motion.div
                key={`test-${entry.item.id}`}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'flex items-center gap-2 rounded-xl font-semibold bg-rose-100/80 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300',
                  'px-3 py-2.5 text-[13px]',
                )}
              >
                <div className="h-3.5 w-3.5 shrink-0 flex items-center justify-center">
                  <ClassIcon />
                </div>
                <span className="truncate">{entry.item.title}</span>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={`event-${entry.item.id}`}
              whileHover={{ scale: 1.02 }}
              className={cn(
                'flex items-center gap-2 rounded-xl font-semibold bg-emerald-100/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                'px-3 py-2.5 text-[13px]',
              )}
            >
              <HugeIcon name="Calendar02" size={14} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{entry.item.title}</span>
            </motion.div>
          );
        })}

        {allItems.length > visibleItems.length && (
          <Link
            href="/calendar"
            className="flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-sky-600 dark:text-sky-400"
          >
            +{allItems.length - visibleItems.length} more
            <HugeIcon name="ArrowRight01" size={12} className="h-3 w-3" />
          </Link>
        )}
      </>
    );
  };

  const renderTableItems = (dayItems: DayItems) => {
    const allItems = getCalendarItems(dayItems);
    const visibleItems = allItems.slice(0, 3);

    if (allItems.length === 0) {
      return (
        <div className="flex min-h-14 items-center justify-center text-xs font-medium text-sky-700/30 dark:text-sky-400/30">
          No items
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {visibleItems.map(entry => {
          if (entry.kind === 'homework') {
            return (
              <motion.button
                type="button"
                key={`table-hw-${entry.item.id}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleHomework(entry.item.id)}
                title={entry.item.title}
                className={cn(
                  'flex w-full min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors',
                  entry.item.completed
                    ? 'bg-sky-50/50 text-sky-400/55 line-through opacity-70 dark:bg-zinc-900/40 dark:text-sky-500/45'
                    : 'bg-sky-100/75 text-sky-700 hover:bg-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25',
                )}
              >
                <HugeIcon name="Book03" size={14} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{entry.item.title}</span>
              </motion.button>
            );
          }

          if (entry.kind === 'test') {
            const classInfo = classes.find(item => item.id === entry.item.classId);
            const ClassIcon = classInfo
              ? getClassIcon(classInfo.icon)
              : () => <HugeIcon name="Book03" size={14} className="h-3.5 w-3.5 shrink-0" />;

            return (
              <div
                key={`table-test-${entry.item.id}`}
                title={entry.item.title}
                className="flex min-w-0 items-center gap-2 rounded-xl bg-rose-100/75 px-2.5 py-2 text-sm font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
              >
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  <ClassIcon />
                </div>
                <span className="truncate">{entry.item.title}</span>
              </div>
            );
          }

          return (
            <div
              key={`table-event-${entry.item.id}`}
              title={entry.item.title}
              className="flex min-w-0 items-center gap-2 rounded-xl bg-emerald-100/75 px-2.5 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <HugeIcon name="Calendar02" size={14} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{entry.item.title}</span>
            </div>
          );
        })}

        {allItems.length > visibleItems.length && (
          <Link
            href="/calendar"
            className="block px-1 pt-0.5 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            +{allItems.length - visibleItems.length} more
          </Link>
        )}
      </div>
    );
  };

  const selectedDay = weekDays[selectedMobileDay] || weekDays[0];
  const selectedDate = format(selectedDay, 'yyyy-MM-dd');
  const selectedItems = itemsByDate[selectedDate] || { homeworks: [], tests: [], events: [] };

  return (
    <div
      className="relative group w-full mb-4 sm:mb-6 bg-[#f5f9fc] dark:bg-sky-500/[0.03] border border-sky-100 dark:border-sky-500/10 rounded-[22px] sm:rounded-[28px] shadow-2xs hover:shadow-md hover:shadow-sky-500/[0.04] transition-all duration-500 overflow-hidden"
    >
      {/* Compact phone calendar: choose a day instead of stacking five full panels. */}
      <div className="p-3 sm:p-4 md:hidden">
        <div className="flex items-center justify-between px-1 pb-3">
          <button
            type="button"
            onClick={prevWeek}
            className="h-9 w-9 rounded-xl bg-white/70 dark:bg-white/5 border border-sky-100 dark:border-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400"
            aria-label="Previous week"
          >
            <HugeIcon name="ArrowLeft01" size={16} />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium text-sky-500/60">School week</p>
            <p className="text-sm font-bold text-sky-900 dark:text-sky-100">
              {format(weekDays[0], 'MMM d')}–{format(weekDays[4], 'MMM d')}
            </p>
          </div>
          <button
            type="button"
            onClick={nextWeek}
            className="h-9 w-9 rounded-xl bg-white/70 dark:bg-white/5 border border-sky-100 dark:border-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400"
            aria-label="Next week"
          >
            <HugeIcon name="ArrowRight01" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5" role="tablist" aria-label="Choose a school day">
          {weekDays.map((day, index) => {
            const isSelected = selectedMobileDay === index;
            const dayItems = itemsByDate[format(day, 'yyyy-MM-dd')];
            const count = getCalendarItems(dayItems).length;

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isSelected}
                key={day.toISOString()}
                onClick={() => selectDay(index)}
                className={cn(
                  'relative min-w-0 rounded-2xl py-2 flex flex-col items-center transition-all border',
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : 'bg-white/55 dark:bg-white/[0.04] text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-500/10',
                )}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wide">
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm font-black leading-5">{format(day, 'd')}</span>
                {count > 0 && (
                  <span className={cn(
                    'absolute -bottom-1 h-2 min-w-2 px-0.5 rounded-full text-[7px] leading-2 font-black',
                    isSelected ? 'bg-[#ebf6b5] text-sky-900' : 'bg-sky-200 text-sky-800',
                  )}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl bg-white/55 dark:bg-white/[0.035] border border-sky-100 dark:border-sky-500/10 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="text-base font-extrabold text-sky-900 dark:text-sky-100">
                {isDateToday(selectedDay) ? 'Today' : format(selectedDay, 'EEEE')}
              </h2>
              <p className="text-[11px] font-semibold text-sky-500/60">
                {format(selectedDay, 'MMMM d')}
              </p>
            </div>
            <Link
              href="/calendar"
              className="h-8 px-3 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1"
            >
              Full calendar
              <HugeIcon name="ArrowRight01" size={11} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {renderCalendarItems(selectedItems)}
          </div>
        </div>
      </div>

      <div className="relative hidden md:block">
        <div className="group/previous absolute inset-y-0 left-0 z-20 flex w-12 items-center justify-start pl-2">
          <button
            type="button"
            onClick={prevWeek}
            className="flex h-9 w-9 -translate-x-2 items-center justify-center rounded-xl border border-sky-100 bg-white/95 text-sky-600 opacity-0 shadow-md transition-all duration-200 group-hover/previous:translate-x-0 group-hover/previous:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 dark:border-sky-500/15 dark:bg-zinc-900/95 dark:text-sky-300"
            aria-label="Previous week"
          >
            <HugeIcon name="ArrowLeft01" size={15} />
          </button>
        </div>

        <div className="group/next absolute inset-y-0 right-0 z-20 flex w-12 items-center justify-end pr-2">
          <button
            type="button"
            onClick={nextWeek}
            className="flex h-9 w-9 translate-x-2 items-center justify-center rounded-xl border border-sky-100 bg-white/95 text-sky-600 opacity-0 shadow-md transition-all duration-200 group-hover/next:translate-x-0 group-hover/next:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 dark:border-sky-500/15 dark:bg-zinc-900/95 dark:text-sky-300"
            aria-label="Next week"
          >
            <HugeIcon name="ArrowRight01" size={15} />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-5 divide-x divide-sky-100/90 dark:divide-sky-500/10">
            {weekDays.map(day => {
              const date = format(day, 'yyyy-MM-dd');
              const dayItems = itemsByDate[date] || { homeworks: [], tests: [], events: [] };
              const count = getCalendarItems(dayItems).length;
              const isToday = isDateToday(day);

              return (
                <section key={date} className="min-w-0">
                  <div className={cn(
                    'flex h-10 items-center justify-between gap-2 border-b border-sky-100/90 px-3 dark:border-sky-500/10',
                    isToday
                      ? 'bg-sky-100/65 dark:bg-sky-500/12'
                      : 'bg-sky-500/[0.04] dark:bg-white/[0.025]',
                  )}>
                    <p className={cn(
                      'min-w-0 truncate text-sm font-bold uppercase tracking-tight sm:text-base',
                      isToday ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-sky-100',
                    )}>
                      {format(day, 'EEE d')}
                    </p>
                    {count > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 px-1 text-[9px] font-bold tabular-nums text-sky-600 dark:text-sky-300">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                  <div className="min-h-16 p-2.5">
                    {renderTableItems(dayItems)}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
