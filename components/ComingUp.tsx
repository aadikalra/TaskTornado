'use client';

import * as React from 'react';
import { format, isToday, isTomorrow, differenceInCalendarDays } from 'date-fns';
import { useClassContext, type Homework, type Test } from '@/context/ClassContext';
import { schoolYear2025_2026 } from '@/data/schoolEvents';
import { HugeIcon } from '@/lib/huge-icon-map';

type UpcomingItem = {
    id: string;
    title: string;
    className: string;
    date: Date;
    type: 'homework' | 'test' | 'event';
    classColor: string;      // pastel bg
    classAccent: string;      // header/text color
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
                        classColor: '#93C5FD',   // pastel blue for homework
                        classAccent: '#2563EB',   // blue-600 for homework
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
                        classColor: '#F9A8A8',   // pastel red for all tests
                        classAccent: '#DC2626',   // red-600 for all tests
                    });
                }
            } catch { }
        });

        // Add school events (no class, use emerald)
        schoolYear2025_2026.forEach(event => {
            const date = new Date(event.startDate);
            if (date >= today) {
                items.push({
                    id: `event-${event.id}`,
                    title: event.title,
                    className: 'School Event',
                    date,
                    type: 'event',
                    classColor: '#A7F3D0',   // pastel emerald
                    classAccent: '#059669',   // emerald-600
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
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
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
                );
            case 'event':
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 2V6M8 2V6" />
                        <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" />
                        <path d="M3 10H21" />
                    </svg>
                );
            default:
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
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
                );
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
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                        <div className="w-10 h-10 rounded-full bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                            <HugeIcon name="CheckList" size={20} className="text-blue-500" />
                        </div>
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-tight uppercase">Nothing coming up</p>
                        <p className="text-[10px] text-blue-600/60 dark:text-blue-400/50 max-w-[120px] mx-auto leading-tight">All caught up! Time to relax or get ahead.</p>
                    </div>
                ) : (
                    upcomingItems.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-blue-700/5 dark:hover:bg-blue-400/5 transition-colors group"
                        >
                            {/* Icon — colored by class */}
                            <div
                                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                                style={{ backgroundColor: `${item.classColor}40`, color: item.classAccent }}
                            >
                                {getIcon(item.type)}
                            </div>

                            {/* Title + Class */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate leading-tight">
                                    {item.title}
                                </p>
                                <p className="text-[11px] truncate" style={{ color: item.classAccent }}>
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
