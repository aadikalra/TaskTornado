'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { HugeIcon } from '@/lib/huge-icon-map';
import {
  getEventsForDate,
  schoolYear2026_2027,
  type SchoolEvent,
} from '@/data/schoolEvents';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const eventStyle: Record<SchoolEvent['type'], string> = {
  event: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  holiday: 'bg-red-100/80 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  break: 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  deadline: 'bg-pink-100/80 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
};

export function TvCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [followsToday, setFollowsToday] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const nextNow = new Date();
      if (followsToday) setVisibleMonth(startOfMonth(nextNow));
    };

    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, [followsToday]);

  const goToPreviousMonth = useCallback(() => {
    setFollowsToday(false);
    setVisibleMonth((month) => subMonths(month, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setFollowsToday(false);
    setVisibleMonth((month) => addMonths(month, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setVisibleMonth(startOfMonth(today));
    setFollowsToday(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPreviousMonth();
      if (event.key === 'ArrowRight') goToNextMonth();
      if (event.key.toLowerCase() === 't') goToToday();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextMonth, goToPreviousMonth, goToToday]);

  const days = useMemo(() => {
    const firstDay = startOfWeek(startOfMonth(visibleMonth));
    const lastDay = endOfWeek(endOfMonth(visibleMonth));

    return eachDayOfInterval({ start: firstDay, end: lastDay }).map((date) => ({
      date,
      events: getEventsForDate(date, schoolYear2026_2027),
    }));
  }, [visibleMonth]);

  const weekCount = days.length / 7;

  return (
    <main
      aria-label={`${format(visibleMonth, 'MMMM yyyy')} school calendar`}
      className="grid h-dvh min-h-[420px] w-screen grid-cols-7 overflow-hidden bg-[#f5f9fc] p-[clamp(6px,0.8vw,16px)] text-sky-800 dark:bg-zinc-900 dark:text-sky-200"
      style={{ gridTemplateRows: `auto repeat(${weekCount}, minmax(0, 1fr))` }}
    >
      <div className="col-span-7 mb-[clamp(4px,0.6vh,9px)] grid grid-cols-7 gap-[clamp(4px,0.55vw,10px)]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-[clamp(3px,0.5vh,8px)] text-center text-[clamp(0.58rem,0.75vw,0.88rem)] font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300"
          >
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      <section className="contents">
        {days.map(({ date, events }, index) => {
          const inVisibleMonth = isSameMonth(date, visibleMonth);
          const today = isToday(date);

          return (
            <article
              key={date.toISOString()}
              className={`min-w-0 overflow-hidden rounded-2xl p-[clamp(6px,0.7vw,12px)] ${
                index % 7 !== 6 ? 'mr-[clamp(4px,0.55vw,10px)]' : ''
              } ${index < days.length - 7 ? 'mb-[clamp(4px,0.55vw,10px)]' : ''} ${
                inVisibleMonth ? 'bg-white dark:bg-zinc-950/80' : 'bg-white/40 dark:bg-zinc-950/30'
              } ${today ? 'ring-2 ring-sky-400 bg-sky-50 shadow-lg shadow-sky-500/10 dark:ring-sky-500 dark:bg-sky-950/30' : ''}`}
            >
              <div className="mb-[clamp(4px,0.65vh,8px)] flex items-start justify-between gap-1">
                <time
                  dateTime={format(date, 'yyyy-MM-dd')}
                  className={`text-[clamp(0.68rem,0.9vw,1rem)] font-bold tabular-nums ${
                    today ? 'text-sky-600 dark:text-sky-400' : inVisibleMonth ? 'text-sky-800 dark:text-sky-200' : 'text-sky-400/50 dark:text-sky-600/50'
                  }`}
                >
                  {date.getDate() === 1 ? format(date, 'MMM d') : date.getDate()}
                </time>
                {today && (
                  <span className="text-[clamp(0.48rem,0.56vw,0.64rem)] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-[clamp(2px,0.35vh,5px)]">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    title={event.description ? `${event.title} — ${event.description}` : event.title}
                    className={`flex min-h-[clamp(18px,2.4vh,28px)] items-center gap-1.5 truncate rounded-lg px-[clamp(4px,0.5vw,9px)] text-[clamp(0.52rem,0.66vw,0.76rem)] font-medium leading-tight ${eventStyle[event.type]}`}
                  >
                    <HugeIcon name="Calendar02" size={11} className="shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
                {events.length > 3 && (
                  <p className="px-1 text-[clamp(0.5rem,0.62vw,0.7rem)] font-bold text-slate-400 dark:text-zinc-500">
                    +{events.length - 3} more
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
