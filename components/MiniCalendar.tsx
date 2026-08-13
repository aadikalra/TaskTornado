'use client';

import * as React from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday as isDateToday,
} from 'date-fns';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext, type Homework } from '@/context/HomeworkContext';
import { useTestContext, type Test } from '@/context/TestContext';
import { cn } from '@/lib/utils';

import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { schoolYear2026_2027, getEventsForDate } from '@/data/schoolEvents';
import { parseCalendarDate } from '@/lib/dateUtils';

export const MiniCalendar = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  const { tests } = useTestContext();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOfWeek = monthStart.getDay();

    const prevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const nextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Pre-index items by date
    const { homeworkByDate, testsByDate } = React.useMemo(() => {
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
                const date = parseCalendarDate(test.testDate);
                if (!isNaN(date.getTime())) {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    if (!testMap[dateStr]) testMap[dateStr] = [];
                    testMap[dateStr].push(test);
                }
            } catch (e) { }
        });

        return { homeworkByDate: hwMap, testsByDate: testMap };
    }, [homeworks, tests]);

    const calendarDays = React.useMemo(() => {
        const result = [];

        // Previous month padding
        const prevMonthEnd = new Date(monthStart);
        prevMonthEnd.setDate(0);
        const prevMonthLastDay = prevMonthEnd.getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            result.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthLastDay - i)
            });
        }

        // Current month
        daysInMonth.forEach(date => {
            result.push({
                day: date.getDate(),
                isCurrentMonth: true,
                date
            });
        });

        // Next month padding to fill the last week
        const lastDayOfWeek = monthEnd.getDay();
        const daysInLastWeek = 6 - lastDayOfWeek;
        for (let i = 1; i <= daysInLastWeek; i++) {
            const nextDate = new Date(monthEnd);
            nextDate.setDate(monthEnd.getDate() + i);
            result.push({
                day: nextDate.getDate(),
                isCurrentMonth: false,
                date: nextDate
            });
        }

        return result;
    }, [currentMonth, daysInMonth, firstDayOfWeek, monthStart, monthEnd]);

    return (
        <div className="w-full h-full bg-[#f5f9fc] dark:bg-gray-900 p-5 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm flex flex-col relative overflow-hidden group transition-all">

            <TooltipProvider>
                <div className="grid grid-cols-7 gap-y-0.5 text-center flex-1" style={{ gridTemplateRows: `auto repeat(${Math.ceil(calendarDays.length / 7)}, 1fr)` }}>
                    {/* Day headers */}
                    <div className="col-span-7 grid grid-cols-7 mb-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <div
                                key={idx}
                                className="text-[10px] font-bold text-blue-700/50 dark:text-blue-400/50 flex items-center justify-center h-6 uppercase tracking-wider"
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    {calendarDays.map((calDay, idx) => {
                        const dateStr = format(calDay.date, 'yyyy-MM-dd');
                        const dayHomeworks = homeworkByDate[dateStr] || [];
                        const dayTests = testsByDate[dateStr] || [];
                        const dayEvents = getEventsForDate(calDay.date, schoolYear2026_2027);
                        const isToday = isDateToday(calDay.date);

                        const hasItems = dayHomeworks.length > 0 || dayTests.length > 0 || dayEvents.length > 0;

                        return (
                            <Tooltip key={idx} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "relative flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-full text-[13px] transition-all rounded-xl cursor-default font-bold",
                                            calDay.isCurrentMonth
                                                ? "text-blue-900 dark:text-blue-100"
                                                : "text-blue-900/20 dark:text-blue-400/20 font-medium",
                                            isToday && "bg-blue-600 dark:bg-blue-500 text-white dark:text-white shadow-lg scale-110 z-10",
                                            !isToday && calDay.isCurrentMonth && "hover:bg-blue-600/10 dark:hover:bg-blue-400/10"
                                        )}
                                    >
                                        <span className={cn("leading-none", isToday ? "mt-0" : "mt-0.5")}>{calDay.day}</span>
                                        <div className="absolute bottom-1.5 flex justify-center gap-0.5 w-full">
                                            {dayTests.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/70" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]")} />
                                            )}
                                            {dayHomeworks.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/70" : "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]")} />
                                            )}
                                            {dayEvents.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/70" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]")} />
                                            )}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                {hasItems && (
                                    <TooltipContent side="top" className="p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl min-w-[180px]">
                                        <div className="space-y-2.5">
                                            <div className="pb-1.5 border-b border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    {format(calDay.date, 'EEEE, MMM do')}
                                                </span>
                                            </div>

                                            {dayTests.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-tight">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M16 2V6M8 2V6" />
                                                            <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" />
                                                            <path d="M3 10H21" />
                                                            <path d="M12.5183 13.4333L13.0462 14.4979C13.1182 14.6461 13.3102 14.7882 13.4722 14.8154L14.4291 14.9757C15.041 15.0786 15.185 15.5262 14.744 15.9677L14.0001 16.7178C13.8741 16.8448 13.8051 17.0898 13.8441 17.2652L14.0571 18.1937C14.2251 18.9287 13.8381 19.213 13.1932 18.8289L12.2963 18.2936C12.1343 18.1968 11.8674 18.1968 11.7024 18.2936L10.8055 18.8289C10.1636 19.213 9.77359 18.9257 9.94158 18.1937L10.1546 17.2652C10.1935 17.0898 10.1246 16.8448 9.99857 16.7178L9.25465 15.9677C8.8167 15.5262 8.95768 15.0786 9.56962 14.9757L10.5265 14.8154C10.6855 14.7882 10.8775 14.6461 10.9495 14.4979L11.4774 13.4333C11.7654 12.8556 12.2333 12.8556 12.5183 13.4333Z" />
                                                        </svg>
                                                        Tests
                                                    </div>
                                                    {dayTests.map(test => {
                                                        const classItem = classes.find(c => c.id === test.classId);
                                                        return (
                                                            <div key={test.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4.5 border-l border-red-200 dark:border-red-900/50">
                                                                <p className="font-semibold leading-tight">{test.title}</p>
                                                                <p className="text-[10px] text-gray-500 truncate">{classItem?.name}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {dayEvents.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-tight">
                                                        <HugeIcon name="CalendarMinus02" size={12} className="w-3 h-3" />
                                                        Events
                                                    </div>
                                                    {dayEvents.map(event => (
                                                        <div key={event.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4.5 border-l border-emerald-200 dark:border-emerald-900/50">
                                                            <p className="font-semibold leading-tight">{event.title}</p>
                                                            {event.description && <p className="text-[10px] text-gray-500 truncate">{event.description}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {dayHomeworks.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-tight">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M16 2V6M8 2V6" />
                                                            <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" />
                                                            <path d="M3 10H21" />
                                                            <path d="M15.5 15.5V17.5M17 16.5C17 17.3284 16.3284 18 15.5 18C14.6716 18 14 17.3284 14 16.5C14 15.6716 14.6716 15 15.5 15C16.3284 15 17 15.6716 17 16.5Z" />
                                                        </svg>
                                                        Homework
                                                    </div>
                                                    {dayHomeworks.map(hw => {
                                                        const classItem = classes.find(c => c.id === hw.classId);
                                                        return (
                                                            <div key={hw.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4.5 border-l border-blue-200 dark:border-blue-900/50">
                                                                <p className="font-semibold leading-tight">{hw.title}</p>
                                                                <p className="text-[10px] text-gray-500 truncate">{classItem?.name}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>

            {/* Footer Row */}
            <div className="-mx-5 -mb-5 px-5 py-3 mt-auto border-t border-sky-100 dark:border-gray-800/80 flex items-center justify-between">
                <Link href="/calendar" className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    Open Calendar
                </Link>
                <div className="flex items-center gap-1 bg-blue-500/[0.04] dark:bg-blue-400/5 px-2 py-0.5 rounded-full border border-sky-100/50 dark:border-gray-800/40">
                    <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-blue-700/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <HugeIcon name="ArrowLeft01" size={12} className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                    </button>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider px-1">
                        {format(currentMonth, 'MMM yyyy')}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-blue-700/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <HugeIcon name="ArrowRight01" size={12} className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};
