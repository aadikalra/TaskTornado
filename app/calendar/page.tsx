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
import { useClassContext, type Homework, type Test } from '@/context/ClassContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LinkCard } from '@/components/LinkCard';
import { schoolYear2025_2026, getEventsForDate, type SchoolEvent } from '@/data/schoolEvents';
import CalendarTestItem from '@/components/CalendarTestItem';
import { getClassIcon } from '@/lib/icon-map';
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

    console.log('🎯 DROP EVENT:', {
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 
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
  const firstDayOfWeek = monthStart.getDay();
  // For Monday-first format, adjust the calculation
  const mondayFirstOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
 
  // Add days from previous month to complete the first week
  if (mondayFirstOffset > 0) {
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0); // Last day of previous month
    for (let i = mondayFirstOffset - 1; i >= 0; i--) {
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

      console.log('🎯 HOMEWORK FILTERING:', {
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

        console.log('🎯 TEST FILTERING:', {
          day: day.getDate(),
          testId: test.id,
          testTitle: test.title,
          testDate: test.testDate,
          testDateParsed: testDate.toISOString(),
          normalizedTestDate: normalizedTestDate.toISOString().split('T')[0],
          normalizedDay: normalizedDay.toISOString().split('T')[0],
          normalizedTestDay: normalizedTestDate.getDate(),
          normalizedDayValue: normalizedDay.getDate(),
          matches: matches
        });

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
  // For Monday-first format, adjust the calculation
  const mondayLastDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  const daysInLastWeek = mondayLastDay === 6 ? 0 : 6 - mondayLastDay;
 
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
  const formatDueDate = (dueDate: Date) => {
    const status = getDueDateStatus(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
   
    if (isSameDay(dueDate, today)) return 'Due today';
   
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(dueDate, tomorrow)) return 'Due tomorrow';
   
    if (status === 'overdue') {
      return `Overdue by ${Math.abs(Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))} days`;
    }
   
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <div className="w-10"></div> {/* Spacer for flex alignment */}
        </div>
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Viewing {format(monthStart, 'MMM d')} - {format(monthEnd, 'MMM d, yyyy')}
            </p>
          </div>
         
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={prevMonth}
                className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation rounded-l-lg"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={resetToToday}
                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors touch-manipulation border-x border-gray-200 dark:border-gray-700"
              >
                Today
              </button>
              
              <button
                onClick={nextMonth}
                className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation rounded-r-lg"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
           
            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all touch-manipulation"
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
       
        <div className="relative">
          {/* Mobile month switcher */}
          {isMobile && (
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all touch-manipulation"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>

              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={prevMonth}
                  className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation rounded-l-lg"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={resetToToday}
                  className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors touch-manipulation border-x border-gray-200 dark:border-gray-700"
                >
                  Today
                </button>

                <button
                  onClick={nextMonth}
                  className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation rounded-r-lg"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div id="calendar-grid" className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 touch-manipulation">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-700 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
             
              {days.map(({ day, date, homeworks, tests, events, isCurrentMonth, isToday }) => (
                <div
                  key={date.toString()}
                  className={`relative min-h-16 sm:min-h-24 p-1 sm:p-2 border transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800'
                  } ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
                  } ${
                    dragState.currentHoverDate && isSameDay(dragState.currentHoverDate, date)
                      ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-100 dark:border-gray-600'
                  }`}
                  onDragOver={(e) => handleDragOver(e, date)}
                  onDrop={(e) => handleDrop(e, date)}
                  onTouchStart={isTouchDevice() ? (e: React.TouchEvent) => {
                    // Prevent default to avoid scrolling while dragging
                    if (e.cancelable) e.preventDefault();
                    handleDragStart(e, '', 'homework', date);
                  } : undefined}
                  onTouchEnd={isTouchDevice() ? () => {
                    if (dragState.isDragging && dragState.itemId && dragState.currentHoverDate) {
                      // Normalize the target date to start of day
                      const normalizedDate = new Date(dragState.currentHoverDate.getFullYear(), dragState.currentHoverDate.getMonth(), dragState.currentHoverDate.getDate());

                      console.log('📅 TOUCH NORMALIZED DATE:', {
                        normalizedDate: normalizedDate.toISOString(),
                        normalizedDay: normalizedDate.getDate(),
                        itemType: dragState.itemType
                      });

                      // Both homework and tests are 1 day behind - add 1 day consistently
                      normalizedDate.setDate(normalizedDate.getDate());

                      console.log('📅 TOUCH FINAL DATE (after +1):', {
                        finalDate: normalizedDate.toISOString(),
                        finalDay: normalizedDate.getDate(),
                        itemType: dragState.itemType
                      });

                      if (dragState.itemType === 'homework') {
                        console.log('📚 TOUCH HOMEWORK: using date +1:', normalizedDate.toISOString());
                        updateHomeworkDueDate(dragState.itemId, normalizedDate);
                      } else if (dragState.itemType === 'test') {
                        console.log('📝 TOUCH TEST: using date +1:', normalizedDate.toISOString());
                        updateTestDueDate(dragState.itemId, normalizedDate);
                      }
                    }
                    handleDragEnd();
                  } : undefined}
                >
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm font-medium ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : !isCurrentMonth
                          ? 'text-gray-400'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {day}
                    </span>
                    {isSameDay(date, new Date()) && (
                      <span className="hidden sm:inline-flex text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                        Today
                      </span>
                    )}
                  </div>
                 
                  <div className="mt-1 space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-20 overflow-y-auto touch-pan-y">
                    <TooltipProvider>
                      {events.length > 0 && (
                        <div className="space-y-1 mb-1">
                          {events.map((event) => (
                            <Tooltip key={`${event.id}-tooltip`}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`text-xs p-1 rounded truncate ${event.type === 'holiday' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : event.type === 'break' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : event.type === 'deadline' ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}
                                >
                                  <div className="flex items-center">
                                    {(() => {
                                      // Special icons for specific events
                                      if (event.title.includes('Thanksgiving')) {
                                        return <Bird className="w-3 h-3 mr-1 flex-shrink-0" />; // Using Bird icon for Thanksgiving
                                      } else if (event.title.includes('Winter Break')) {
                                        return <Snowflake className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.title.includes("President's")) {
                                        return <FlagTriangleRight className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.title.includes('Spring Break')) {
                                        return <Sun className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.title.includes('Graduation')) {
                                        return <GraduationCap className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.type === 'holiday') {
                                        return <Sun className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.type === 'break') {
                                        return <CalendarDays className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else if (event.type === 'deadline') {
                                        return <Flag className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      } else {
                                        return <School className="w-3 h-3 mr-1 flex-shrink-0" />;
                                      }
                                    })()}
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs p-2">
                                <div className="space-y-1">
                                  <div className="font-medium">{event.title}</div>
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    {event.endDate && !isSameDay(new Date(event.startDate), new Date(event.endDate))
                                      ? `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                                      : format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                      {homeworks
                        .slice(0, 3)
                        .map((hw) => {
                        const classItem = classes.find(c => c.id === hw.classId);
                        const isOverdue = new Date(hw.dueDate) < new Date() && !hw.completed;
                        const isDueToday = isDateToday(new Date(hw.dueDate));
                        const status = getDueDateStatus(new Date(hw.dueDate));
                        const statusIcon = getDueDateIcon(status);

                        return (
                          <Tooltip key={hw.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`text-xs p-1 mb-1 rounded truncate cursor-move ${hw.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 line-through' : isOverdue ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' : isDueToday ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'}`}
                                draggable
                                onDragStart={(e) => {
                                  // Normalize the source date to start of day
                                  const normalizedSourceDate = new Date(new Date(hw.dueDate).getFullYear(), new Date(hw.dueDate).getMonth(), new Date(hw.dueDate).getDate());
                                  handleDragStart(e, hw.id, 'homework', normalizedSourceDate);
                                }}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="flex items-center">
                                  <GripVertical className="w-3 h-3 mr-1 opacity-50 flex-shrink-0" />
                                  <span className="truncate">
                                    {classItem?.name ? `${classItem.name}: ` : ''}{hw.title}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="w-64 p-2">
                              <div className="space-y-1">
                                <h4 className="font-medium">{hw.title}</h4>
                                {classItem && (
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <BookOpen className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{classItem.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  {statusIcon}
                                  <span>{formatDueDate(new Date(hw.dueDate))}</span>
                                </div>
                                {hw.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hw.description}</p>
                                )}
                                {hw.links && hw.links.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {hw.links.map((link, idx: number) => (
                                      <LinkCard
                                        key={idx}
                                        url={typeof link === 'string' ? link : link.url}
                                        title={typeof link === 'string' ? link : link.title || 'Link'}
                                        className="border-0 px-0 py-0 hover:bg-transparent"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}

                      {/* Tests Display */}
                      {tests
                        .slice(0, 3)
                        .map((test) => {
                        const classItem = classes.find(c => c.id === test.classId);
                        // Use BookOpen as a fallback icon
                        const ClassIcon = classItem ? getClassIcon(classItem.icon) : BookOpen;

                        return (
                          <CalendarTestItem
                            key={test.id}
                            test={test}
                            classInfo={classItem}
                            classIcon={ClassIcon}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                          />
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}