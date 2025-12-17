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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, GripVertical, School, Sun, Flag, Snowflake, FlagTriangleRight, Bird, CalendarDays, Clock, AlertTriangle, AlertCircle, Menu, Home, GraduationCap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useClassContext, type Homework, type Test } from '@/context/ClassContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LinkCard } from '@/components/LinkCard';
import { schoolYear2025_2026, getEventsForDate, type SchoolEvent } from '@/data/schoolEvents';
import CalendarTestItem from '@/components/CalendarTestItem';
import { getClassIcon } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
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
    // For mouse drag events
    if ('dataTransfer' in e) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
    }

    setDragState({
      isDragging: true,
      itemId,
      itemType,
      sourceDate,
      currentHoverDate: null
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    setDragState(prev => ({
      ...prev,
      currentHoverDate: date
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();

    console.log('DROP EVENT:', {
      targetDate: targetDate.toISOString(),
      targetDateDay: targetDate.getDate(),
      targetDateLocal: targetDate.toLocaleDateString(),
      dragState: dragState
    });

    if (dragState.itemId && dragState.itemType) {
      // Normalize the target date to start of day
      const normalizedDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

      console.log('📅 NORMALIZED DATE:', {
        normalizedDate: normalizedDate.toISOString(),
        normalizedDay: normalizedDate.getDate(),
        itemType: dragState.itemType
      });

      // Both homework and tests are 1 day behind - add 1 day consistently
      normalizedDate.setDate(normalizedDate.getDate());

      console.log('📅 FINAL DATE (after +1):', {
        finalDate: normalizedDate.toISOString(),
        finalDay: normalizedDate.getDate(),
        itemType: dragState.itemType
      });

      if (dragState.itemType === 'homework') {
        console.log('📚 HOMEWORK: using date +1:', normalizedDate.toISOString());
        updateHomeworkDueDate(dragState.itemId, normalizedDate);
      } else if (dragState.itemType === 'test') {
        console.log('📝 TEST: using date +1:', normalizedDate.toISOString());
        updateTestDueDate(dragState.itemId, normalizedDate);
      }
    }

    setDragState({
      isDragging: false,
      itemId: null,
      itemType: null,
      sourceDate: null,
      currentHoverDate: null
    });
  }, [dragState.itemId, dragState.itemType, updateHomeworkDueDate, updateTestDueDate]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      itemId: null,
      itemType: null,
      sourceDate: null,
      currentHoverDate: null
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
}
// Mobile swipe handling
const useSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }

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
export default function CalendarPage() {
  const { homeworks, classes, tests, updateHomeworkDueDate, updateTestDueDate, deleteTest } = useClassContext();
  const { getContainerClass } = useWideLayout();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  // Route intro popup
  const { showIntro, dismissIntro } = useRouteIntro('calendar');

  // Set up mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Month navigation handlers
  const nextMonth = useCallback(() => {
    setCurrentMonth(addMonths(currentMonth, 1));
  }, [currentMonth]);
  const prevMonth = useCallback(() => {
    setCurrentMonth(subMonths(currentMonth, 1));
  }, [currentMonth]);
  const resetToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  // Swipe handlers
  useSwipe(nextMonth, prevMonth);

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop(updateHomeworkDueDate, updateTestDueDate);
  // Get the start and end of the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get all days in the month
  // Define the type for calendar day items
  interface CalendarDay {
    day: number;
    date: Date;
    homeworks: Homework[];
    tests: Test[];
    events: SchoolEvent[];
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Debug: Log all tests and their dates
  console.log('All tests:', tests.map(test => ({
    id: test.id,
    title: test.title,
    testDate: test.testDate,
    parsedDate: new Date(test.testDate).toISOString()
  })));
  const firstDayOfMonth = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Generate calendar days with empty slots for the start of the month
  const days: CalendarDay[] = [];
  const firstDayOfWeek = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // For Sunday-first format, use the day directly
  const sundayFirstOffset = firstDayOfWeek;

  // Add days from previous month to complete the first week
  if (sundayFirstOffset > 0) {
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0); // Last day of previous month
    for (let i = sundayFirstOffset - 1; i >= 0; i--) {
      const prevDate = new Date(prevMonthEnd);
      prevDate.setDate(prevMonthEnd.getDate() - i);
      const prevDayHomeworks = homeworks.filter(hw => {
        const hwDate = new Date(hw.dueDate);
        // Normalize both dates to start of day for comparison
        const normalizedHwDate = new Date(hwDate.getFullYear(), hwDate.getMonth(), hwDate.getDate());
        const normalizedPrevDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());

        return normalizedHwDate.getTime() === normalizedPrevDate.getTime();
      });
      const prevDayTests = tests.filter(test => {
        try {
          const testDate = new Date(test.testDate);
          if (isNaN(testDate.getTime())) {
            return false;
          }

          const normalizedTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
          const normalizedPrevDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());

          return normalizedTestDate.getTime() === normalizedPrevDate.getTime();
        } catch (error) {
          return false;
        }
      });
      days.push({
        day: prevDate.getDate(),
        date: prevDate,
        homeworks: prevDayHomeworks,
        tests: prevDayTests,
        events: getEventsForDate(prevDate, schoolYear2025_2026),
        isCurrentMonth: false,
        isToday: isDateToday(prevDate),
      });
    }
  }

  // Add days for the current month
  daysInMonth.forEach(day => {
    const dayHomeworks = homeworks.filter(hw => {
      const hwDate = new Date(hw.dueDate);
      // Normalize both dates to start of day for comparison
      const normalizedHwDate = new Date(hwDate.getFullYear(), hwDate.getMonth(), hwDate.getDate());
      const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

      const matches = normalizedHwDate.getTime() === normalizedDay.getTime();

      console.log('HOMEWORK FILTERING:', {
        day: day.getDate(),
        hwId: hw.id,
        hwTitle: hw.title,
        hwDueDate: hw.dueDate,
        hwDateParsed: hwDate.toISOString(),
        normalizedHwDate: normalizedHwDate.toISOString().split('T')[0],
        normalizedDay: normalizedDay.toISOString().split('T')[0],
        normalizedHwDay: normalizedHwDate.getDate(),
        normalizedDayValue: normalizedDay.getDate(),
        matches: matches
      });

      return normalizedHwDate.getTime() === normalizedDay.getTime();
    });

    const dayTests = tests.filter(test => {
      try {
        const testDate = new Date(test.testDate);
        // Check if the date is valid
        if (isNaN(testDate.getTime())) {
          console.log('❌ Invalid test date:', test.testDate, 'for test:', test.title);
          return false;
        }

        // Normalize both dates to start of day for comparison
        const normalizedTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
        const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

        const matches = normalizedTestDate.getTime() === normalizedDay.getTime();

        // console.log('TEST FILTERING:', {
        //   day: day.getDate(),
        //   testId: test.id,
        //   testTitle: test.title,
        //   testDate: test.testDate,
        //   testDateParsed: testDate.toISOString(),
        //   normalizedTestDate: normalizedTestDate.toISOString().split('T')[0],
        //   normalizedDay: normalizedDay.toISOString().split('T')[0],
        //   normalizedTestDay: normalizedTestDate.getDate(),
        //   normalizedDayValue: normalizedDay.getDate(),
        //   matches: matches
        // });

        return matches;
      } catch (error) {
        console.error('❌ Error parsing test date:', test.testDate, 'for test:', test.title, error);
        return false;
      }
    });

    days.push({
      day: day.getDate(),
      date: day,
      homeworks: dayHomeworks,
      tests: dayTests,
      events: getEventsForDate(day, schoolYear2025_2026),
      isCurrentMonth: true,
      isToday: isDateToday(day),
    });
  });

  // Add days from next month to complete the last week
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const lastDayOfWeek = lastDayOfMonth.getDay();
  // For Sunday-first format, calculate days needed to fill the last week
  const daysInLastWeek = 6 - lastDayOfWeek;

  for (let i = 1; i <= daysInLastWeek; i++) {
    const nextDate = new Date(monthEnd);
    nextDate.setDate(monthEnd.getDate() + i);
    const nextDayHomeworks = homeworks.filter(hw => {
      const hwDate = new Date(hw.dueDate);
      // Normalize both dates to start of day for comparison
      const normalizedHwDate = new Date(hwDate.getFullYear(), hwDate.getMonth(), hwDate.getDate());
      const normalizedNextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());

      return normalizedHwDate.getTime() === normalizedNextDate.getTime();
    });

    const nextDayTests = tests.filter(test => {
      try {
        const testDate = new Date(test.testDate);
        if (isNaN(testDate.getTime())) {
          return false;
        }

        const normalizedTestDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
        const normalizedNextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());

        return normalizedTestDate.getTime() === normalizedNextDate.getTime();
      } catch (error) {
        return false;
      }
    });

    days.push({
      day: nextDate.getDate(),
      date: nextDate,
      homeworks: nextDayHomeworks,
      tests: nextDayTests,
      events: getEventsForDate(nextDate, schoolYear2025_2026),
      isCurrentMonth: false,
      isToday: isDateToday(nextDate),
    });
  }

  // Get due date status for homework items
  const getDueDateStatus = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 7) return 'this-week';
    return 'upcoming';
  };
  // Get due date icon based on status
  const getDueDateIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-1" />;
      case 'today':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mr-1" />;
      case 'tomorrow':
      case 'this-week':
        return <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />;
      default:
        return <CalendarIcon className="h-3.5 w-3.5 text-gray-500 mr-1" />;
    }
  };
  // Format due date for display
  const formatDueDate = (dueDate: Date, isTest: boolean = false) => {
    const status = getDueDateStatus(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isSameDay(dueDate, today)) return isTest ? 'Today' : 'Due today';

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(dueDate, tomorrow)) return isTest ? 'Tomorrow' : 'Due tomorrow';

    if (status === 'overdue') {
      if (isTest) {
        return `Completed`;
      }
      return `Overdue by ${Math.abs(Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))} days`;
    }

    return isTest
      ? format(dueDate, 'MMM d')
      : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass('max-w-6xl') + ' py-16'}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {format(monthStart, 'MMM d')} - {format(monthEnd, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToToday}
                className="gap-2"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 gap-1 sm:gap-2 md:gap-4">
              {days.map((calendarDay, index) => (
                <motion.div
                  key={`${calendarDay.date.toISOString()}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.01 }}
                  className={`
                    relative p-1 sm:p-2 md:p-3 border rounded-lg min-h-[60px] sm:min-h-[80px] md:min-h-[100px] transition-colors
                    ${calendarDay.isCurrentMonth
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'
                    }
                    ${calendarDay.isToday
                      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                      : ''
                    }
                    ${dragState.currentHoverDate && isSameDay(calendarDay.date, dragState.currentHoverDate)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : ''
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <span className={`
                      text-xs sm:text-sm font-medium
                      ${calendarDay.isCurrentMonth
                        ? calendarDay.isToday
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-600'
                      }
                    `}>
                      {calendarDay.day}
                    </span>
                    {calendarDay.isToday && (
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-900 dark:bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Events */}
                  <TooltipProvider>
                    <div className="space-y-0.5 sm:space-y-1">
                      {/* Homework */}
                      {calendarDay.homeworks.slice(0, 3).map((hw) => {
                        const classItem = classes.find(c => c.id === hw.classId);
                        return (
                          <Tooltip key={hw.id}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 truncate cursor-pointer">
                                <BookOpen className="h-2.5 sm:h-3 w-2.5 sm:w-3 shrink-0" />
                                <span className="truncate hidden xs:inline sm:inline">{hw.title}</span>
                                <span className="truncate xs:hidden sm:hidden">{hw.title.slice(0, 8)}...</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="w-64 p-2">
                              <div className="space-y-1">
                                <h4 className="font-medium">{hw.title}</h4>
                                {classItem && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <BookOpen className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                    <span className="truncate">{classItem.name}</span>
                                  </div>
                                )}
                                {hw.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hw.description}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}

                      {/* Tests */}
                      {calendarDay.tests.slice(0, 4).map((test) => {
                        const classItem = classes.find(c => c.id === test.classId);
                        const ClassIcon = classItem ? getClassIcon(classItem.icon) : BookOpen;
                        return (
                          <Tooltip key={test.id}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-red-100 dark:bg-red-900/30 rounded text-[10px] sm:text-xs text-red-700 dark:text-red-300 truncate cursor-pointer">
                                <ClassIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3 shrink-0" />
                                <span className="truncate hidden xs:inline sm:inline">{test.title}</span>
                                <span className="truncate xs:hidden sm:hidden">{test.title.slice(0, 8)}...</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="w-72 p-3">
                              <div className="space-y-2">
                                <h4 className="font-medium text-base">{test.title}</h4>
                                {classItem && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <ClassIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                    <span className="truncate">{classItem.name}</span>
                                  </div>
                                )}
                                <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  {test.testType && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium mr-2">Type:</span>
                                      <span className="capitalize">{test.testType}</span>
                                    </div>
                                  )}
                                  {test.testTime && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                      <span>{format(new Date(test.testTime), 'h:mm a')}</span>
                                    </div>
                                  )}
                                  {test.location && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium mr-2">Location:</span>
                                      <span>{test.location}</span>
                                    </div>
                                  )}
                                  {test.duration && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium mr-2">Duration:</span>
                                      <span>{test.duration} minutes</span>
                                    </div>
                                  )}
                                  {test.weight !== null && test.weight !== undefined && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium mr-2">Weight:</span>
                                      <span>{test.weight}%</span>
                                    </div>
                                  )}
                                  {test.notes && (
                                    <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{test.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}

                      {/* School Events */}
                      {calendarDay.events.slice(0, 2).map((event) => (
                        <Tooltip key={event.id}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-green-100 dark:bg-green-900/30 rounded text-[10px] sm:text-xs text-green-700 dark:text-green-300 truncate cursor-pointer">
                              <CalendarDays className="h-2.5 sm:h-3 w-2.5 sm:w-3 shrink-0" />
                              <span className="truncate hidden xs:inline sm:inline">{event.title}</span>
                              <span className="truncate xs:hidden sm:hidden">{event.title.slice(0, 8)}...</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              {event.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}

                      {/* Show more indicator */}
                      {(() => {
                        const totalItems = calendarDay.homeworks.length + calendarDay.tests.length + calendarDay.events.length;
                        const displayedItems = Math.min(calendarDay.homeworks.length, 3) + Math.min(calendarDay.tests.length, 4) + Math.min(calendarDay.events.length, 2);
                        const remaining = totalItems - displayedItems;

                        if (remaining > 0) {
                          return (
                            <button
                              onClick={() => setExpandedDay(calendarDay.date)}
                              className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-center w-full py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
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
              ))}
            </div>
          </div>
        </motion.div>

        {/* Expanded Day Modal */}
        {expandedDay && (() => {
          const expandedDayData = days.find(d => isSameDay(d.date, expandedDay));
          if (!expandedDayData) return null;

          return (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setExpandedDay(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                        {format(expandedDay, 'MMMM d, yyyy')}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {expandedDayData.homeworks.length + expandedDayData.tests.length + expandedDayData.events.length} items
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedDay(null)}
                      className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Homework Section */}
                  {expandedDayData.homeworks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Homework ({expandedDayData.homeworks.length})
                      </h3>
                      <div className="space-y-2">
                        {expandedDayData.homeworks.map((hw) => {
                          const classItem = classes.find(c => c.id === hw.classId);
                          return (
                            <div
                              key={hw.id}
                              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <h4 className="font-medium text-gray-900 dark:text-white">{hw.title}</h4>
                              {classItem && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                                  {classItem.name}
                                </div>
                              )}
                              {hw.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{hw.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tests Section */}
                  {expandedDayData.tests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-red-500" />
                        Tests & Exams ({expandedDayData.tests.length})
                      </h3>
                      <div className="space-y-2">
                        {expandedDayData.tests.map((test) => {
                          const classItem = classes.find(c => c.id === test.classId);
                          const ClassIcon = classItem ? getClassIcon(classItem.icon) : BookOpen;
                          return (
                            <div
                              key={test.id}
                              className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                            >
                              <h4 className="font-medium text-gray-900 dark:text-white">{test.title}</h4>
                              {classItem && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <ClassIcon className="h-3.5 w-3.5 mr-1.5" />
                                  {classItem.name}
                                </div>
                              )}
                              <div className="mt-3 space-y-1.5">
                                {test.testType && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium mr-2">Type:</span>
                                    <span className="capitalize">{test.testType}</span>
                                  </div>
                                )}
                                {test.testTime && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                    <span>{format(new Date(test.testTime), 'h:mm a')}</span>
                                  </div>
                                )}
                                {test.location && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium mr-2">Location:</span>
                                    <span>{test.location}</span>
                                  </div>
                                )}
                                {test.duration && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium mr-2">Duration:</span>
                                    <span>{test.duration} minutes</span>
                                  </div>
                                )}
                                {test.weight !== null && test.weight !== undefined && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium mr-2">Weight:</span>
                                    <span>{test.weight}%</span>
                                  </div>
                                )}
                                {test.notes && (
                                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{test.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* School Events Section */}
                  {expandedDayData.events.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-green-500" />
                        School Events ({expandedDayData.events.length})
                      </h3>
                      <div className="space-y-2">
                        {expandedDayData.events.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{event.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {expandedDayData.homeworks.length === 0 &&
                    expandedDayData.tests.length === 0 &&
                    expandedDayData.events.length === 0 && (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No items for this day</p>
                      </div>
                    )}
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v2.0.3
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Route Intro Popup */}
      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="Welcome to Calendar!"
        description="Visualize your schedule and stay organized with your interactive calendar"
        icon={<CalendarIcon className="h-6 w-6" />}
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