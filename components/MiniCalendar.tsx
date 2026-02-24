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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useClassContext, type Homework, type Test } from '@/context/ClassContext';
import { cn } from '@/lib/utils';

import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen, GraduationCap, CalendarDays as CalendarDaysIcon } from 'lucide-react';
import { schoolYear2025_2026, getEventsForDate } from '@/data/schoolEvents';

export const MiniCalendar = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const { homeworks, tests, classes } = useClassContext();

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
            {/* Header row — month title + nav */}
            <div className="flex items-center justify-between mb-3">
                <Link href="/calendar" className="flex items-center gap-2 group/link">
                    <h2 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                </Link>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 hover:bg-blue-700/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 hover:bg-blue-700/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    </button>
                </div>
            </div>

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
                        const dayEvents = getEventsForDate(calDay.date, schoolYear2025_2026);
                        const isToday = isDateToday(calDay.date);

                        const hasItems = dayHomeworks.length > 0 || dayTests.length > 0 || dayEvents.length > 0;

                        return (
                            <Tooltip key={idx} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "relative flex items-center justify-center text-xs transition-all rounded-lg cursor-default font-semibold",
                                            calDay.isCurrentMonth
                                                ? "text-blue-900 dark:text-blue-100"
                                                : "text-blue-900/25 dark:text-blue-400/25 font-normal",
                                            isToday && "bg-blue-700 dark:bg-blue-500 text-white dark:text-white font-bold shadow-md scale-105 z-10",
                                            !isToday && calDay.isCurrentMonth && "hover:bg-blue-700/10 dark:hover:bg-blue-400/10"
                                        )}
                                    >
                                        <span className="relative z-0">{calDay.day}</span>
                                        <div className="absolute bottom-0.5 flex gap-0.5">
                                            {dayTests.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/50" : "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]")} />
                                            )}
                                            {dayHomeworks.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/50" : "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.4)]")} />
                                            )}
                                            {dayEvents.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/50" : "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]")} />
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
                                                        <GraduationCap className="w-3 h-3" />
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
                                                        <CalendarDaysIcon className="w-3 h-3" />
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
                                                        <BookOpen className="w-3 h-3" />
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
        </div>
    );
};
