'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useAI } from '@/context/AIContext';
import {
    Bell,
    BookOpen,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
    X,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type NotificationType = 'urgent' | 'warning' | 'info' | 'success';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon: React.ReactNode;
    timestamp: Date;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// ─── Hook: generate smart notifications from data ──────────────────────────────
export function useNotifications() {
    const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  const { tests } = useTestContext();
    const { setAIAssistantOpen, setAIInput } = useAI();
    const [dismissed, setDismissed] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('dismissed-notifications');
                return saved ? new Set(JSON.parse(saved)) : new Set<string>();
            } catch { return new Set<string>(); }
        }
        return new Set<string>();
    });

    // Persist dismissed IDs
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('dismissed-notifications', JSON.stringify([...dismissed]));
        }
    }, [dismissed]);

    // Clear stale dismiss entries daily
    useEffect(() => {
        const lastClear = localStorage.getItem('dismissed-notifications-cleared');
        const today = new Date().toDateString();
        if (lastClear !== today) {
            setDismissed(new Set());
            localStorage.setItem('dismissed-notifications-cleared', today);
        }
    }, []);

    const getClassName = (classId: string) => {
        return classes.find(c => c.id === classId)?.name || 'Unknown';
    };

    const notifications = useMemo<AppNotification[]>(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const in2Days = new Date(today);
        in2Days.setDate(in2Days.getDate() + 2);
        const in3Days = new Date(today);
        in3Days.setDate(in3Days.getDate() + 3);
        const in7Days = new Date(today);
        in7Days.setDate(in7Days.getDate() + 7);

        const items: AppNotification[] = [];

        // ── Homework Notifications ───────────────────────────────────────────────
        const activeHomeworks = homeworks.filter(hw => !hw.completed);

        for (const hw of activeHomeworks) {
            const due = new Date(hw.dueDate);
            const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            const className = getClassName(hw.classId);

            // Overdue
            if (dueDay < today) {
                items.push({
                    id: `hw-overdue-${hw.id}`,
                    type: 'urgent',
                    title: 'Overdue homework',
                    message: `"${hw.title}" for ${className} was due ${formatRelative(dueDay, today)}.`,
                    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                    timestamp: due,
                });
            }
            // Due today
            else if (dueDay.getTime() === today.getTime()) {
                items.push({
                    id: `hw-today-${hw.id}`,
                    type: 'urgent',
                    title: 'Due today',
                    message: `"${hw.title}" for ${className} is due today!`,
                    icon: <Clock className="w-4 h-4 text-orange-500" />,
                    timestamp: due,
                });
            }
            // Due tomorrow
            else if (dueDay.getTime() === tomorrow.getTime()) {
                items.push({
                    id: `hw-tomorrow-${hw.id}`,
                    type: 'warning',
                    title: 'Due tomorrow',
                    message: `"${hw.title}" for ${className} is due tomorrow.`,
                    icon: <BookOpen className="w-4 h-4 text-amber-500" />,
                    timestamp: due,
                });
            }
            // Due in 2-3 days
            else if (dueDay >= in2Days && dueDay <= in3Days) {
                items.push({
                    id: `hw-soon-${hw.id}`,
                    type: 'info',
                    title: 'Coming up',
                    message: `"${hw.title}" for ${className} is due in ${Math.ceil((dueDay.getTime() - today.getTime()) / 86400000)} days.`,
                    icon: <BookOpen className="w-4 h-4 text-blue-500" />,
                    timestamp: due,
                });
            }
        }

        // ── Test Notifications ───────────────────────────────────────────────────
        const activeTests = tests.filter(t => t.status !== 'taken' && t.status !== 'completed' && t.status !== 'cancelled');

        for (const test of activeTests) {
            const testDay = new Date(test.testDate);
            const testDayOnly = new Date(testDay.getFullYear(), testDay.getMonth(), testDay.getDate());
            const className = getClassName(test.classId);
            const daysUntil = Math.ceil((testDayOnly.getTime() - today.getTime()) / 86400000);

            // Test today
            if (testDayOnly.getTime() === today.getTime()) {
                items.push({
                    id: `test-today-${test.id}`,
                    type: 'urgent',
                    title: 'Test today!',
                    message: `${test.testType.charAt(0).toUpperCase() + test.testType.slice(1)}: "${test.title}" for ${className}${test.testTime ? ` at ${formatTime(test.testTime)}` : ''}.`,
                    icon: <FileText className="w-4 h-4 text-red-500" />,
                    timestamp: testDay,
                });
            }
            // Test tomorrow
            else if (testDayOnly.getTime() === tomorrow.getTime()) {
                items.push({
                    id: `test-tomorrow-${test.id}`,
                    type: 'warning',
                    title: 'Test tomorrow',
                    message: `"${test.title}" for ${className} is tomorrow.`,
                    icon: <FileText className="w-4 h-4 text-amber-500" />,
                    timestamp: testDay,
                    action: {
                        label: 'Start a quiz',
                        onClick: () => {
                            setAIInput(`@quiz Help me study for my ${className} test on "${test.title}"`);
                            setAIAssistantOpen(true);
                        },
                    },
                });
            }
            // Test in 2-3 days
            else if (daysUntil >= 2 && daysUntil <= 3) {
                items.push({
                    id: `test-soon-${test.id}`,
                    type: 'warning',
                    title: `Test in ${daysUntil} days`,
                    message: `"${test.title}" for ${className} — start reviewing now.`,
                    icon: <FileText className="w-4 h-4 text-amber-500" />,
                    timestamp: testDay,
                    action: {
                        label: 'Study with Aurora',
                        onClick: () => {
                            setAIInput(`@data Help me prepare for my ${className} test on "${test.title}" which is in ${daysUntil} days`);
                            setAIAssistantOpen(true);
                        },
                    },
                });
            }
            // Test in 4-7 days
            else if (daysUntil >= 4 && daysUntil <= 7) {
                items.push({
                    id: `test-week-${test.id}`,
                    type: 'info',
                    title: `Test this week`,
                    message: `"${test.title}" for ${className} is in ${daysUntil} days.`,
                    icon: <FileText className="w-4 h-4 text-blue-500" />,
                    timestamp: testDay,
                });
            }
        }

        // ── Productivity Nudges ──────────────────────────────────────────────────
        const overdueCount = activeHomeworks.filter(hw => {
            const d = new Date(hw.dueDate);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()) < today;
        }).length;

        if (overdueCount >= 3) {
            items.push({
                id: 'nudge-overdue-pile',
                type: 'warning',
                title: 'Homework piling up',
                message: `You have ${overdueCount} overdue assignments. Let Aurora help you prioritize.`,
                icon: <Sparkles className="w-4 h-4 text-purple-500" />,
                timestamp: now,
                action: {
                    label: 'Get a plan',
                    onClick: () => {
                        setAIInput('@data I have multiple overdue assignments. Help me create a realistic plan to catch up.');
                        setAIAssistantOpen(true);
                    },
                },
            });
        }

        // Sort: urgent first, then by date
        items.sort((a, b) => {
            const typePriority: Record<NotificationType, number> = { urgent: 0, warning: 1, info: 2, success: 3 };
            const pDiff = typePriority[a.type] - typePriority[b.type];
            if (pDiff !== 0) return pDiff;
            return a.timestamp.getTime() - b.timestamp.getTime();
        });

        return items;
    }, [homeworks, tests, classes, setAIAssistantOpen, setAIInput]);

    const activeNotifications = notifications.filter(n => !dismissed.has(n.id));

    const dismissNotification = (id: string) => {
        setDismissed(prev => new Set([...prev, id]));
    };

    const dismissAll = () => {
        setDismissed(new Set(notifications.map(n => n.id)));
    };

    return { notifications: activeNotifications, allNotifications: notifications, dismissNotification, dismissAll };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatRelative(date: Date, today: Date): string {
    const diff = Math.ceil((today.getTime() - date.getTime()) / 86400000);
    if (diff === 1) return 'yesterday';
    if (diff < 7) return `${diff} days ago`;
    return `${Math.floor(diff / 7)} week${diff >= 14 ? 's' : ''} ago`;
}

function formatTime(timeStr: string): string {
    try {
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        return timeStr;
    }
}

// ─── Component: Notification Panel ────────────────────────────────────────────
interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { notifications, dismissNotification, dismissAll } = useNotifications();
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
        return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
    }, [isOpen, onClose]);

    const typeStyles: Record<NotificationType, { iconBg: string; accent: string }> = {
        urgent: { iconBg: 'bg-red-500/15', accent: 'text-red-300' },
        warning: { iconBg: 'bg-amber-500/15', accent: 'text-amber-300' },
        info: { iconBg: 'bg-sky-500/15', accent: 'text-sky-300' },
        success: { iconBg: 'bg-emerald-500/15', accent: 'text-emerald-300' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="fixed top-[62px] right-4 sm:right-6 z-[60] w-[340px] max-w-[calc(100vw-32px)]"
                >
                    <div className="bg-[#275085]/95 backdrop-blur-xl rounded-[16px] border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-1.5">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-1">
                            <div className="flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5 text-white/50" />
                                <span className="text-[12px] font-bold text-white">
                                    Notifications
                                </span>
                                {notifications.length > 0 && (
                                    <span className="text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full tabular-nums">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-0.5">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={dismissAll}
                                        className="text-[10px] font-semibold text-white/40 hover:text-white/70 px-2 py-1 rounded-full hover:bg-white/10 transition-all"
                                    >
                                        Clear all
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full text-white/30 hover:text-white/60 hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[360px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <p className="text-[13px] font-bold text-white">
                                        All caught up
                                    </p>
                                    <p className="text-[11px] text-white/40 mt-0.5">
                                        No upcoming deadlines right now.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n, i) => {
                                    const styles = typeStyles[n.type];
                                    return (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 25 }}
                                            className="relative group rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.06]"
                                        >
                                            {/* Dismiss button */}
                                            <button
                                                onClick={() => dismissNotification(n.id)}
                                                className="absolute top-2.5 right-2.5 p-1 rounded-full text-white/15 hover:text-white/50 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>

                                            <div className="flex items-start gap-2.5 pr-5">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                                    styles.iconBg
                                                )}>
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-[12px] font-bold leading-tight", styles.accent)}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    {n.action && (
                                                        <button
                                                            onClick={() => {
                                                                n.action!.onClick();
                                                                onClose();
                                                            }}
                                                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-white/70 bg-white/10 hover:bg-white/15 hover:text-white px-2.5 py-1 rounded-full transition-colors active:scale-95"
                                                        >
                                                            <Sparkles className="w-2.5 h-2.5" />
                                                            {n.action.label}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
