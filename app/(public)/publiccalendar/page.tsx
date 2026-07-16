'use client';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday as isDateToday,
} from 'date-fns';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { schoolYear2026_2027, getEventsForDate, type SchoolEvent } from '@/data/schoolEvents';
import { getFullVersionString } from '@/config/version';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mobile swipe handling
const useSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove = (e: TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { diff > 0 ? onSwipeLeft() : onSwipeRight(); }
    touchStartX.current = null;
    touchEndX.current = null;
  };
  useEffect(() => {
    const element = document.getElementById('public-calendar-grid');
    if (!element) return;
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onTouchStart, onTouchMove, onTouchEnd]);
};

interface CalendarDay {
  day: number;
  date: Date;
  events: SchoolEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function PublicCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  // Route intro popup
  const { showIntro, dismissIntro } = useRouteIntro('publiccalendar');

  // Set up mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Month navigation handlers
  const nextMonth = useCallback(() => setCurrentMonth(addMonths(currentMonth, 1)), [currentMonth]);
  const prevMonth = useCallback(() => setCurrentMonth(subMonths(currentMonth, 1)), [currentMonth]);
  const resetToToday = useCallback(() => setCurrentMonth(new Date()), []);

  // Swipe handlers
  useSwipe(nextMonth, prevMonth);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const days = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();
    const result: CalendarDay[] = [];

    // Previous month padding
    if (firstDayOfWeek > 0) {
      const prevMonthEnd = new Date(monthStart);
      prevMonthEnd.setDate(0);
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(prevMonthEnd);
        prevDate.setDate(prevMonthEnd.getDate() - i);
        result.push({
          day: prevDate.getDate(), date: prevDate,
          events: getEventsForDate(prevDate, schoolYear2026_2027),
          isCurrentMonth: false, isToday: isDateToday(prevDate),
        });
      }
    }

    // Current month
    daysInMonth.forEach(day => {
      result.push({
        day: day.getDate(), date: day,
        events: getEventsForDate(day, schoolYear2026_2027),
        isCurrentMonth: true, isToday: isDateToday(day),
      });
    });

    // Next month padding
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const daysInLastWeek = 6 - lastDayOfWeek;
    for (let i = 1; i <= daysInLastWeek; i++) {
      const nextDate = new Date(monthEnd);
      nextDate.setDate(monthEnd.getDate() + i);
      result.push({
        day: nextDate.getDate(), date: nextDate,
        events: getEventsForDate(nextDate, schoolYear2026_2027),
        isCurrentMonth: false, isToday: isDateToday(nextDate),
      });
    }
    return result;
  }, [currentMonth]);

  // Stats
  const stats = useMemo(() => {
    const eventCount = days.filter(d => d.events.length > 0 && d.isCurrentMonth).length;
    return { eventCount };
  }, [days]);

  // Upcoming school events for sidebar — scoped to the current month
  const upcomingEvents = useMemo(() => {
    const mStart = startOfMonth(currentMonth);
    const mEnd = endOfMonth(currentMonth);

    return schoolYear2026_2027
      .filter(event => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= mStart && eventDate <= mEnd;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [currentMonth]);

  const getEventTypeColor = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'holiday': return 'bg-red-100/80 dark:bg-red-500/15 text-red-700 dark:text-red-300';
      case 'break': return 'bg-amber-100/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300';
      case 'deadline': return 'bg-pink-100/80 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300';
      default: return 'bg-emerald-100/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    }
  };

  const getEventTypeBadgeColor = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'holiday': return 'bg-red-100 dark:bg-red-500/15 text-red-500';
      case 'break': return 'bg-amber-100 dark:bg-amber-500/15 text-amber-500';
      case 'deadline': return 'bg-pink-100 dark:bg-pink-500/15 text-pink-500';
      default: return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-500';
    }
  };

  const getEventTypeDetailColor = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'holiday': return 'bg-red-50 dark:bg-red-500/10 border-red-200/40 dark:border-red-800/20';
      case 'break': return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/40 dark:border-amber-800/20';
      case 'deadline': return 'bg-pink-50 dark:bg-pink-500/10 border-pink-200/40 dark:border-pink-800/20';
      default: return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/40 dark:border-emerald-800/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative selection:bg-sky-100 dark:selection:bg-sky-900/30">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* ═══════════════════════════════════════════════════════════
            HEADER — month title left, nav right
           ═══════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                {format(currentMonth, 'MMMM yyyy')}
              </h1>
              <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 font-medium">
                {format(monthStart, 'MMM d')} — {format(monthEnd, 'MMM d, yyyy')} • School Events Calendar
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5]/60 dark:hover:bg-sky-500/20 transition-all active:scale-95"
              >
                <HugeIcon name="ArrowLeft01" size={14} className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={resetToToday}
                className="inline-flex items-center h-10 px-5 bg-sky-500 dark:bg-sky-600 rounded-full text-sm font-bold text-white hover:bg-sky-600 dark:hover:bg-sky-500 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5]/60 dark:hover:bg-sky-500/20 transition-all active:scale-95"
              >
                <span className="hidden sm:inline">Next</span>
                <HugeIcon name="ArrowRight01" size={14} className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-5"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-500/15 rounded-full">
              <HugeIcon name="Calendar02" size={12} className="w-3 h-3" />
              {stats.eventCount} event days this month
            </span>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN LAYOUT — calendar + sidebar
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex gap-8">

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            <div id="public-calendar-grid" className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[24px] p-3 sm:p-5 md:p-6">

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {days.map((calendarDay, index) => {
                  const totalItems = calendarDay.events.length;

                  return (
                    <motion.div
                      key={`${calendarDay.date.toISOString()}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.02 + index * 0.005 }}
                      onClick={() => totalItems > 0 ? setExpandedDay(calendarDay.date) : null}
                      className={`
                        relative p-1.5 sm:p-2 md:p-2.5 rounded-2xl min-h-[56px] sm:min-h-[80px] md:min-h-[96px] transition-all duration-200
                        ${totalItems > 0 ? 'cursor-pointer hover:shadow-md hover:shadow-sky-500/[0.06] hover:-translate-y-0.5' : ''}
                        ${calendarDay.isCurrentMonth
                          ? 'bg-white dark:bg-zinc-900/60'
                          : 'bg-white/40 dark:bg-zinc-900/20'
                        }
                        ${calendarDay.isToday
                          ? 'ring-2 ring-sky-400 dark:ring-sky-500 bg-sky-50 dark:bg-sky-950/30 shadow-lg shadow-sky-500/10'
                          : ''
                        }
                      `}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`
                          text-[11px] sm:text-sm font-bold
                          ${calendarDay.isCurrentMonth
                            ? calendarDay.isToday
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-sky-800 dark:text-sky-200'
                            : 'text-sky-400/50 dark:text-sky-600/50'
                          }
                        `}>
                          {calendarDay.day}
                        </span>
                        {calendarDay.isToday && (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 hidden sm:block">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Event indicators */}
                      <TooltipProvider>
                        <div className="space-y-0.5">
                          {/* School event chips */}
                          {calendarDay.events.slice(0, isMobile ? 1 : 2).map((event) => (
                            <Tooltip key={event.id}>
                              <TooltipTrigger asChild>
                                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-medium truncate ${getEventTypeColor(event.type)}`}>
                                  <HugeIcon name="Calendar02" size={10} className="h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white dark:bg-zinc-900 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl shadow-xl p-3">
                                <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{event.title}</h4>
                                <p className="text-[10px] font-medium text-sky-600/70 dark:text-sky-400/70 mt-0.5 capitalize">{event.type}</p>
                                {event.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-1">{event.description}</p>}
                              </TooltipContent>
                            </Tooltip>
                          ))}

                          {/* "More" indicator */}
                          {(() => {
                            const displayed = Math.min(calendarDay.events.length, isMobile ? 1 : 2);
                            const remaining = totalItems - displayed;
                            if (remaining > 0) {
                              return (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setExpandedDay(calendarDay.date); }}
                                  className="text-[9px] sm:text-[10px] font-bold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 text-center w-full py-0.5 rounded-lg hover:bg-sky-100/50 dark:hover:bg-sky-500/10 transition-colors"
                                >
                                  +{remaining} more
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </TooltipProvider>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════
              SIDEBAR — upcoming school events
             ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="sticky top-24 space-y-5">
              {/* Upcoming */}
              <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[20px] p-5">
                <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-4 flex items-center gap-2">
                  <HugeIcon name="Clock01" size={16} className="w-4 h-4 text-sky-500" />
                  Upcoming Events
                </h3>
                <div className="space-y-2.5">
                  {upcomingEvents.length === 0 && (
                    <p className="text-xs text-sky-700/60 dark:text-sky-300/60 text-center py-4">No upcoming events 🎉</p>
                  )}
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900/60 rounded-2xl hover:shadow-md hover:shadow-sky-500/[0.04] transition-all"
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${getEventTypeBadgeColor(event.type)}`}>
                        <HugeIcon name="Calendar02" size={14} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-sky-800 dark:text-sky-200 truncate">{event.title}</p>
                        <p className="text-[10px] text-sky-600/70 dark:text-sky-400/70 capitalize">{event.type}</p>
                        <p className="text-[10px] font-medium text-sky-500 dark:text-sky-400 mt-0.5">
                          {format(new Date(event.startDate), 'MMM d')}
                          {event.endDate && ` – ${format(new Date(event.endDate), 'MMM d')}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[20px] p-5">
                <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-4">Legend</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">School Events</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Holidays</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Breaks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-pink-400 dark:bg-pink-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Deadlines</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            EXPANDED DAY MODAL
           ═══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {expandedDay && (() => {
            const expandedDayData = days.find(d => isSameDay(d.date, expandedDay));
            if (!expandedDayData) return null;

            return (
              <motion.div
                key="expanded-day-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setExpandedDay(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#fffaf4] dark:bg-zinc-900 rounded-[24px] border border-sky-200/40 dark:border-sky-800/20 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-[#fffaf4] dark:bg-zinc-900 border-b border-sky-100 dark:border-sky-900/20 px-6 py-5 z-10 rounded-t-[24px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200">
                          {format(expandedDay, 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-sm text-sky-600/70 dark:text-sky-400/70 mt-0.5 font-medium">
                          {expandedDayData.events.length} event{expandedDayData.events.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedDay(null)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all"
                      >
                        <HugeIcon name="Cancel01" size={16} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    {/* Events */}
                    {expandedDayData.events.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-3 flex items-center gap-2">
                          <HugeIcon name="Calendar02" size={16} className="h-4 w-4 text-emerald-500" />
                          School Events ({expandedDayData.events.length})
                        </h3>
                        <div className="space-y-2">
                          {expandedDayData.events.map((event) => (
                            <div key={event.id} className={`p-4 rounded-2xl border ${getEventTypeDetailColor(event.type)}`}>
                              <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{event.title}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600/50 dark:text-sky-400/40 mt-1 capitalize">{event.type}</p>
                              {event.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-2">{event.description}</p>}
                              {event.endDate && (
                                <p className="text-xs text-sky-600/70 dark:text-sky-400/70 mt-1.5 flex items-center gap-1">
                                  <HugeIcon name="Clock01" size={12} className="h-3 w-3" />
                                  {format(new Date(event.startDate), 'MMM d')} – {format(new Date(event.endDate), 'MMM d')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty */}
                    {expandedDayData.events.length === 0 && (
                      <div className="text-center py-12">
                        <HugeIcon name="Calendar02" size={48} className="h-12 w-12 text-sky-300/40 dark:text-sky-700/40 mx-auto mb-3" />
                        <p className="text-sky-700/60 dark:text-sky-400/60 text-sm">No events for this day</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-8 border-t border-sky-100 dark:border-sky-900/20"
        >
          <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
            Built for students • Public Beta {getFullVersionString()}
          </p>
        </motion.div>
      </div>

      {/* Route Intro Popup */}
      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="School Events Calendar"
        description="View upcoming school events, holidays, and important dates"
        icon={<HugeIcon name="Calendar02" size={24} className="h-6 w-6" />}
        features={[
          'View all school events, holidays, and breaks',
          'Navigate between months to plan ahead',
          'Hover over events to see more details',
          'Swipe left/right on mobile to change months',
        ]}
      />
    </div>
  );
}
