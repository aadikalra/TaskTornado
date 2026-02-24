'use client';

import * as React from 'react';
import { format, isToday, isTomorrow, differenceInCalendarDays } from 'date-fns';
import { useClassContext, type Homework, type Test } from '@/context/ClassContext';
import { BookOpen, GraduationCap, CalendarDays } from 'lucide-react';
import { schoolYear2025_2026 } from '@/data/schoolEvents';

type UpcomingItem = {
    id: string;
    title: string;
    className: string;
    date: Date;
    type: 'homework' | 'test' | 'event';
};

export const ComingUp = () => {
    const { homeworks, tests, classes } = useClassContext();

    const upcomingItems = React.useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const items: UpcomingItem[] = [];

        // Add incomplete homework
        homeworks.forEach((hw: Homework) => {
            if (hw.completed) return;
            try {
                const date = new Date(hw.dueDate);
                if (!isNaN(date.getTime()) && date >= today) {
                    const classItem = classes.find(c => c.id === hw.classId);
                    items.push({
                        id: `hw-${hw.id}`,
                        title: hw.title,
                        className: classItem?.name || 'Unknown',
                        date,
                        type: 'homework',
                    });
                }
            } catch { }
        });

        // Add upcoming tests
        tests.forEach((test: Test) => {
            if (test.status !== 'upcoming') return;
            try {
                const date = new Date(test.testDate);
                if (!isNaN(date.getTime()) && date >= today) {
                    const classItem = classes.find(c => c.id === test.classId);
                    items.push({
                        id: `test-${test.id}`,
                        title: test.title,
                        className: classItem?.name || 'Unknown',
                        date,
                        type: 'test',
                    });
                }
            } catch { }
        });

        // Add school events
        schoolYear2025_2026.forEach(event => {
            const date = new Date(event.startDate);
            if (date >= today) {
                items.push({
                    id: `event-${event.id}`,
                    title: event.title,
                    className: 'School Event',
                    date,
                    type: 'event',
                });
            }
        });

        // Sort by date, take first 8
        items.sort((a, b) => a.date.getTime() - b.date.getTime());
        return items.slice(0, 8);
    }, [homeworks, tests, classes]);

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        const days = differenceInCalendarDays(date, new Date());
        if (days < 7) {
            return format(date, 'EEEE');
        }
        return format(date, 'MMM d');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'test':
                return <GraduationCap className="w-3.5 h-3.5" />;
            case 'event':
                return <CalendarDays className="w-3.5 h-3.5" />;
            default:
                return <BookOpen className="w-3.5 h-3.5" />;
        }
    };

    const getAccentColor = (type: string) => {
        switch (type) {
            case 'test':
                return 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-800/50';
            case 'event':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50';
            default:
                return 'text-blue-600 bg-blue-600/10 border-blue-200 dark:border-blue-800/50';
        }
    };

    const getDateColor = (date: Date) => {
        if (isToday(date)) return 'text-red-500 font-bold';
        if (isTomorrow(date)) return 'text-amber-500 font-semibold';
        return 'text-blue-700/50 dark:text-blue-400/50 font-medium';
    };

    return (
        <div className="w-full h-full bg-[#f5f9fc] dark:bg-gray-900 p-5 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                    Coming Up
                </h2>
                <span className="text-[10px] font-bold text-blue-700/40 dark:text-blue-400/40 uppercase tracking-wider">
                    {upcomingItems.length} items
                </span>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-gray-700">
                {upcomingItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-blue-700/40 dark:text-blue-400/40">Nothing coming up 🎉</p>
                    </div>
                ) : (
                    upcomingItems.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-700/5 dark:hover:bg-blue-400/5 transition-colors group"
                        >
                            {/* Icon */}
                            <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${getAccentColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>

                            {/* Title + Class */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate leading-tight">
                                    {item.title}
                                </p>
                                <p className="text-[11px] text-blue-700/50 dark:text-blue-400/50 truncate">
                                    {item.className}
                                </p>
                            </div>

                            {/* Date */}
                            <span className={`text-[11px] shrink-0 ${getDateColor(item.date)}`}>
                                {getDateLabel(item.date)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
