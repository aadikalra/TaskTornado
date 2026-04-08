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
  formatDistanceToNow,
} from 'date-fns';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassContext, type Homework, type Test, type Class } from '@/context/ClassContext';
import { useAuth } from '@/context/AuthContext';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { schoolYear2025_2026, getEventsForDate, type SchoolEvent } from '@/data/schoolEvents';
import { getFullVersionString } from '@/config/version';
import { getClassIcon } from '@/lib/icon-map';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

// Touch device detection
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

type DragState = {
  isDragging: boolean;
  itemId: string | null;
  itemType: 'homework' | 'test' | null;
  sourceDate: Date | null;
  currentHoverDate: Date | null;
};

// Custom hook for drag and drop
function useDragAndDrop(
  updateHomeworkDueDate: (homeworkId: string, newDueDate: Date) => void,
  updateTestDueDate: (testId: string, newDueDate: Date) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    itemId: null,
    itemType: null,
    sourceDate: null,
    currentHoverDate: null
  });

  const handleDragStart = useCallback((e: React.DragEvent | React.TouchEvent, itemId: string, itemType: 'homework' | 'test', sourceDate: Date) => {
    if ('dataTransfer' in e) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
    }
    setDragState({ isDragging: true, itemId, itemType, sourceDate, currentHoverDate: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({ ...prev, currentHoverDate: date }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (dragState.itemId && dragState.itemType) {
      const normalizedDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      normalizedDate.setDate(normalizedDate.getDate());
      if (dragState.itemType === 'homework') {
        updateHomeworkDueDate(dragState.itemId, normalizedDate);
      } else if (dragState.itemType === 'test') {
        updateTestDueDate(dragState.itemId, normalizedDate);
      }
    }
    setDragState({ isDragging: false, itemId: null, itemType: null, sourceDate: null, currentHoverDate: null });
  }, [dragState.itemId, dragState.itemType, updateHomeworkDueDate, updateTestDueDate]);

  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, itemId: null, itemType: null, sourceDate: null, currentHoverDate: null });
  }, []);

  return { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
}

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
    const element = document.getElementById('calendar-grid');
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

export default function CalendarClient() {
  const { homeworks, classes, tests, updateHomeworkDueDate, updateTestDueDate, deleteTest, loading } = useClassContext();
  const { user } = useAuth();
  const { getContainerClass } = useWideLayout();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  // Process recurring homework when calendar loads
  useEffect(() => {
    if (user && !loading) {
      RecurringHomeworkService.processRecurringHomework(user.id).catch(error => {
        console.error('Error processing recurring homework for calendar:', error);
      });
    }
  }, [user, loading]);

  // Route intro popup
  const { showIntro, dismissIntro } = useRouteIntro('calendar');

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

  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop(updateHomeworkDueDate, updateTestDueDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  interface CalendarDay {
    day: number;
    date: Date;
    homeworks: Homework[];
    tests: Test[];
    events: SchoolEvent[];
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  // Optimize by pre-indexing items by date
  const { homeworkByDate, testsByDate } = useMemo(() => {
    const hwMap: Record<string, Homework[]> = {};
    const testMap: Record<string, Test[]> = {};
    homeworks.forEach((hw: Homework) => {
      try {
        const date = new Date(hw.dueDate);
        if (!isNaN(date.getTime())) {
          const dateStr = format(date, 'yyyy-MM-dd');
          if (!hwMap[dateStr]) hwMap[dateStr] = [];
          hwMap[dateStr].push(hw);
        }
      } catch (e) { }
    });
    tests.forEach((test: Test) => {
      try {
        const date = new Date(test.testDate);
        if (!isNaN(date.getTime())) {
          const dateStr = format(date, 'yyyy-MM-dd');
          if (!testMap[dateStr]) testMap[dateStr] = [];
          testMap[dateStr].push(test);
        }
      } catch (e) { }
    });
    return { homeworkByDate: hwMap, testsByDate: testMap };
  }, [homeworks, tests]);

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
        const dateStr = format(prevDate, 'yyyy-MM-dd');
        result.push({
          day: prevDate.getDate(), date: prevDate,
          homeworks: homeworkByDate[dateStr] || [], tests: testsByDate[dateStr] || [],
          events: getEventsForDate(prevDate, schoolYear2025_2026),
          isCurrentMonth: false, isToday: isDateToday(prevDate),
        });
      }
    }

    // Current month
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      result.push({
        day: day.getDate(), date: day,
        homeworks: homeworkByDate[dateStr] || [], tests: testsByDate[dateStr] || [],
        events: getEventsForDate(day, schoolYear2025_2026),
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
      const dateStr = format(nextDate, 'yyyy-MM-dd');
      result.push({
        day: nextDate.getDate(), date: nextDate,
        homeworks: homeworkByDate[dateStr] || [], tests: testsByDate[dateStr] || [],
        events: getEventsForDate(nextDate, schoolYear2025_2026),
        isCurrentMonth: false, isToday: isDateToday(nextDate),
      });
    }
    return result;
  }, [currentMonth, homeworkByDate, testsByDate]);

  // Upcoming items for sidebar
  const upcomingItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hwItems = homeworks
      .filter((hw: Homework) => {
        const d = new Date(hw.dueDate);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a: Homework, b: Homework) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
      .map((hw: Homework) => {
        const classItem = classes.find((c: Class) => c.id === hw.classId);
        return { id: hw.id, title: hw.title, date: new Date(hw.dueDate), type: 'homework' as const, className: classItem?.name || '' };
      });

    const testItems = tests
      .filter((t: Test) => {
        const d = new Date(t.testDate);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a: Test, b: Test) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
      .slice(0, 5)
      .map((t: Test) => {
        const classItem = classes.find((c: Class) => c.id === t.classId);
        return { id: t.id, title: t.title, date: new Date(t.testDate), type: 'test' as const, className: classItem?.name || '' };
      });

    return [...hwItems, ...testItems].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 8);
  }, [homeworks, tests, classes]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hwCount = homeworks.filter((hw: Homework) => { const d = new Date(hw.dueDate); d.setHours(0, 0, 0, 0); return d >= today; }).length;
    const testCount = tests.filter((t: Test) => { const d = new Date(t.testDate); d.setHours(0, 0, 0, 0); return d >= today; }).length;
    const eventCount = days.filter(d => d.events.length > 0 && d.isCurrentMonth).length;
    return { hwCount, testCount, eventCount };
  }, [homeworks, tests, days]);

  const getDueDateStatus = (dueDate: Date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 7) return 'this-week';
    return 'upcoming';
  };

  const formatDueDate = (dueDate: Date, isTest: boolean = false) => {
    const status = getDueDateStatus(dueDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (isSameDay(dueDate, today)) return isTest ? 'Today' : 'Due today';
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(dueDate, tomorrow)) return isTest ? 'Tomorrow' : 'Due tomorrow';
    if (status === 'overdue') { return isTest ? 'Completed' : `Overdue by ${Math.abs(Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))} days`; }
    return isTest ? format(dueDate, 'MMM d') : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
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

        {/* Loading indicator */}
        {loading && (
          <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300 bg-[#f5f9fc]/90 dark:bg-zinc-800/90 px-4 py-2 rounded-full border border-sky-200/60 dark:border-sky-800/30 backdrop-blur-sm z-50 shadow-lg">
            <div className="h-3 w-3 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
            Loading updates...
          </div>
        )}

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
                {format(monthStart, 'MMM d')} — {format(monthEnd, 'MMM d, yyyy')}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/50 dark:bg-sky-500/15 rounded-full">
              <HugeIcon name="Book03" size={12} className="w-3 h-3" />
              {stats.hwCount} upcoming assignments
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-500/15 rounded-full">
              <HugeIcon name="Mortarboard02" size={12} className="w-3 h-3" />
              {stats.testCount} upcoming tests
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-500/15 rounded-full">
              <HugeIcon name="Calendar02" size={12} className="w-3 h-3" />
              {stats.eventCount} event days
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
            <div id="calendar-grid" className="bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/40 dark:border-sky-800/20 rounded-[24px] p-3 sm:p-5 md:p-6">

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
                  const totalItems = calendarDay.homeworks.length + calendarDay.tests.length + calendarDay.events.length;
                  const isHoverTarget = dragState.currentHoverDate && isSameDay(calendarDay.date, dragState.currentHoverDate);

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
                        ${isHoverTarget
                          ? 'ring-2 ring-sky-400/50 bg-sky-50 dark:bg-sky-900/20'
                          : ''
                        }
                      `}
                      onDragOver={(e) => handleDragOver(e, calendarDay.date)}
                      onDrop={(e) => handleDrop(e, calendarDay.date)}
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

                      {/* Item indicators */}
                      <TooltipProvider>
                        <div className="space-y-0.5">
                          {/* Homework chips */}
                          {calendarDay.homeworks.slice(0, isMobile ? 1 : 2).map((hw) => (
                            <Tooltip key={hw.id}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-100/80 dark:bg-sky-500/15 rounded-lg text-[9px] sm:text-[10px] text-sky-700 dark:text-sky-300 font-medium truncate">
                                  <HugeIcon name="Book03" size={10} className="h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0" />
                                  <span className="truncate">{hw.title}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="w-64 p-3 bg-white dark:bg-zinc-900 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl shadow-xl">
                                <div className="space-y-1.5">
                                  <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{hw.title}</h4>
                                  {(() => { const ci = classes.find((c: Class) => c.id === hw.classId); return ci ? <p className="text-xs text-sky-600 dark:text-sky-400">{ci.name}</p> : null; })()}
                                  {hw.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-1">{hw.description}</p>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}

                          {/* Test chips */}
                          {calendarDay.tests.slice(0, isMobile ? 1 : 2).map((test) => {
                            const classItem = classes.find((c: Class) => c.id === test.classId);
                            const ClassIcon = classItem ? getClassIcon(classItem.icon) : () => <HugeIcon name="Book03" size={10} className="h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0" />;
                            return (
                              <Tooltip key={test.id}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-100/80 dark:bg-rose-500/15 rounded-lg text-[9px] sm:text-[10px] text-rose-700 dark:text-rose-300 font-medium truncate">
                                    <ClassIcon />
                                    <span className="truncate">{test.title}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="w-72 p-3 bg-white dark:bg-zinc-900 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl shadow-xl">
                                  <div className="space-y-2">
                                    <h4 className="font-bold text-sky-800 dark:text-sky-200">{test.title}</h4>
                                    {classItem && <p className="text-xs text-sky-600 dark:text-sky-400">{classItem.name}</p>}
                                    <div className="space-y-1 pt-2 border-t border-sky-100 dark:border-sky-900/20">
                                      {test.testType && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Type:</span> <span className="capitalize">{test.testType}</span></p>}
                                      {test.testTime && <p className="text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1"><HugeIcon name="Clock01" size={12} className="h-3 w-3" />{format(new Date(test.testTime), 'h:mm a')}</p>}
                                      {test.location && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Location:</span> {test.location}</p>}
                                      {test.duration && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Duration:</span> {test.duration} min</p>}
                                      {test.notes && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 pt-1 border-t border-sky-100 dark:border-sky-900/20">{test.notes}</p>}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}

                          {/* School event chips */}
                          {calendarDay.events.slice(0, isMobile ? 1 : 1).map((event) => (
                            <Tooltip key={event.id}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100/80 dark:bg-emerald-500/15 rounded-lg text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
                                  <HugeIcon name="Calendar02" size={10} className="h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white dark:bg-zinc-900 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl shadow-xl p-3">
                                <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{event.title}</h4>
                                {event.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-1">{event.description}</p>}
                              </TooltipContent>
                            </Tooltip>
                          ))}

                          {/* "More" indicator */}
                          {(() => {
                            const displayed = Math.min(calendarDay.homeworks.length, isMobile ? 1 : 2) + Math.min(calendarDay.tests.length, isMobile ? 1 : 2) + Math.min(calendarDay.events.length, isMobile ? 1 : 1);
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
              SIDEBAR — upcoming items
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
                  Coming Up
                </h3>
                <div className="space-y-2.5">
                  {upcomingItems.length === 0 && (
                    <p className="text-xs text-sky-700/60 dark:text-sky-300/60 text-center py-4">Nothing upcoming 🎉</p>
                  )}
                  {upcomingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900/60 rounded-2xl hover:shadow-md hover:shadow-sky-500/[0.04] transition-all"
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'homework'
                        ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-500'
                        : 'bg-rose-100 dark:bg-rose-500/15 text-rose-500'
                        }`}>
                        {item.type === 'homework' ? <HugeIcon name="Book03" size={14} className="w-3.5 h-3.5" /> : <HugeIcon name="Mortarboard02" size={14} className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-sky-800 dark:text-sky-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-sky-600/70 dark:text-sky-400/70">{item.className}</p>
                        <p className="text-[10px] font-medium text-sky-500 dark:text-sky-400 mt-0.5">{format(item.date, 'MMM d')}</p>
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
                    <div className="w-3 h-3 rounded-full bg-sky-400 dark:bg-sky-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Homework</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Tests & Exams</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                    <span className="text-xs font-medium text-sky-700 dark:text-sky-300">School Events</span>
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
                          {expandedDayData.homeworks.length + expandedDayData.tests.length + expandedDayData.events.length} items
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
                    {/* Homework */}
                    {expandedDayData.homeworks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-3 flex items-center gap-2">
                          <HugeIcon name="Book03" size={16} className="h-4 w-4 text-sky-500" />
                          Homework ({expandedDayData.homeworks.length})
                        </h3>
                        <div className="space-y-2">
                          {expandedDayData.homeworks.map((hw) => {
                            const classItem = classes.find((c: Class) => c.id === hw.classId);
                            return (
                              <div key={hw.id} className="p-4 bg-sky-50 dark:bg-sky-500/10 rounded-2xl border border-sky-200/40 dark:border-sky-800/20">
                                <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{hw.title}</h4>
                                {classItem && <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">{classItem.name}</p>}
                                {hw.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-2">{hw.description}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {expandedDayData.tests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-3 flex items-center gap-2">
                          <HugeIcon name="Mortarboard02" size={16} className="h-4 w-4 text-rose-500" />
                          Tests & Exams ({expandedDayData.tests.length})
                        </h3>
                        <div className="space-y-2">
                          {expandedDayData.tests.map((test) => {
                            const classItem = classes.find(c => c.id === test.classId);
                            const ClassIcon = classItem ? getClassIcon(classItem.icon) : () => <HugeIcon name="Book03" size={12} className="h-3 w-3" />;
                            return (
                              <div key={test.id} className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200/40 dark:border-rose-800/20">
                                <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{test.title}</h4>
                                {classItem && <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1"><ClassIcon />{classItem.name}</p>}
                                <div className="mt-3 space-y-1">
                                  {test.testType && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Type:</span> <span className="capitalize">{test.testType}</span></p>}
                                  {test.testTime && <p className="text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1"><HugeIcon name="Clock01" size={12} className="h-3 w-3" />{format(new Date(test.testTime), 'h:mm a')}</p>}
                                  {test.location && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Location:</span> {test.location}</p>}
                                  {test.duration && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Duration:</span> {test.duration} min</p>}
                                  {test.weight !== null && test.weight !== undefined && <p className="text-xs text-sky-700 dark:text-sky-300"><span className="font-semibold">Weight:</span> {test.weight}%</p>}
                                  {test.notes && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 pt-2 mt-2 border-t border-rose-200/40 dark:border-rose-800/20">{test.notes}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {expandedDayData.events.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-sky-800 dark:text-sky-200 mb-3 flex items-center gap-2">
                          <HugeIcon name="Calendar02" size={16} className="h-4 w-4 text-emerald-500" />
                          School Events ({expandedDayData.events.length})
                        </h3>
                        <div className="space-y-2">
                          {expandedDayData.events.map((event) => (
                            <div key={event.id} className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200/40 dark:border-emerald-800/20">
                              <h4 className="font-bold text-sky-800 dark:text-sky-200 text-sm">{event.title}</h4>
                              {event.description && <p className="text-xs text-sky-700/70 dark:text-sky-300/70 mt-2">{event.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty */}
                    {expandedDayData.homeworks.length === 0 && expandedDayData.tests.length === 0 && expandedDayData.events.length === 0 && (
                      <div className="text-center py-12">
                        <HugeIcon name="Calendar02" size={48} className="h-12 w-12 text-sky-300/40 dark:text-sky-700/40 mx-auto mb-3" />
                        <p className="text-sky-700/60 dark:text-sky-400/60 text-sm">No items for this day</p>
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
        title="Welcome to Calendar!"
        description="Visualize your schedule and stay organized with your interactive calendar"
        icon={<HugeIcon name="Calendar02" size={24} className="h-6 w-6" />}
        features={[
          'View all your homework, tests, and school events in one place',
          'Navigate between months to plan ahead',
          'Hover over items to see more details',
          'Swipe left/right on mobile to change months',
        ]}
      />
    </div>
  );
}