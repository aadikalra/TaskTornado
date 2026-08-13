'use client';

import * as React from 'react';
import {
    format,
    addWeeks,
    subWeeks,
    startOfWeek,
    addDays,
    isToday as isDateToday,
} from 'date-fns';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext, type Homework } from '@/context/HomeworkContext';
import { useTestContext, type Test } from '@/context/TestContext';
import { cn } from '@/lib/utils';
import { getEventsForDate, schoolYear2026_2027 } from '@/data/schoolEvents';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parseCalendarDate } from '@/lib/dateUtils';

export const MobileWeekCalendar = () => {
    const [viewDate, setViewDate] = React.useState(new Date());
    const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  const { tests } = useTestContext();

    const weekStart = startOfWeek(viewDate);
    const weekDays = React.useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    }, [weekStart]);

    const prevWeek = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(subWeeks(viewDate, 1));
    };

    const nextWeek = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(addWeeks(viewDate, 1));
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

    return (
        <div className="w-full bg-[#f5f9fc] dark:bg-gray-900 px-4 py-3.5 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm flex flex-col relative overflow-hidden transition-all">
            {/* Header row — month title + nav */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1">
                    {format(viewDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={prevWeek}
                        className="p-1.5 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <HugeIcon name="ArrowLeft01" size={13} className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                        onClick={nextWeek}
                        className="p-1.5 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 rounded-full transition-colors"
                    >
                        <HugeIcon name="ArrowRight01" size={13} className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </button>
                </div>
            </div>

            <TooltipProvider>
                <div className="grid grid-cols-7 w-full">
                    {/* Day labels (S M T W T F S) */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-blue-700/40 dark:text-blue-400/30 text-center mb-1">
                            {label}
                        </div>
                    ))}
                    
                    {/* Days and indicators */}
                    {weekDays.map((date, idx) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayHomeworks = homeworkByDate[dateStr] || [];
                        const dayTests = testsByDate[dateStr] || [];
                        const dayEvents = getEventsForDate(date, schoolYear2026_2027);
                        const isToday = isDateToday(date);
                        const hasItems = dayHomeworks.length > 0 || dayTests.length > 0 || dayEvents.length > 0;

                        return (
                            <Tooltip key={idx} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div className="relative flex flex-col items-center justify-center pt-1 pb-1">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-xl text-[13px] font-bold transition-all",
                                            isToday 
                                                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105 z-10" 
                                                : "text-blue-900 dark:text-blue-100"
                                        )}>
                                            {format(date, 'd')}
                                        </div>
                                        <div className="h-1.5 mt-1 flex justify-center gap-0.5">
                                            {dayTests.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/60" : "bg-red-500")} />
                                            )}
                                            {dayHomeworks.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/60" : "bg-blue-500")} />
                                            )}
                                            {dayEvents.length > 0 && (
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-white/60" : "bg-emerald-500")} />
                                            )}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                {hasItems && (
                                    <TooltipContent side="top" className="p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl min-w-[200px]">
                                        <div className="space-y-2">
                                            <div className="pb-1 border-b border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {format(date, 'EEEE, MMM do')}
                                                </span>
                                            </div>
                                            {dayTests.map(t => (
                                                <div key={t.id} className="text-xs font-semibold text-red-600 truncate flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                    {t.title}
                                                </div>
                                            ))}
                                            {dayHomeworks.map(h => (
                                                <div key={h.id} className="text-xs font-semibold text-blue-600 truncate flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    {h.title}
                                                </div>
                                            ))}
                                            {dayEvents.map(e => (
                                                <div key={e.id} className="text-xs font-semibold text-emerald-600 truncate flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                    {e.title}
                                                </div>
                                            ))}
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
