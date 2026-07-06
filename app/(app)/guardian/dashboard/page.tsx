'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, Loader2, BookOpen, ClipboardCheck, FlaskConical,
    CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Link2,
    Settings, ChevronRight, Lock, Shield, BarChart3, Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import GuardianAIChatWidget from '@/components/GuardianAIChatWidget';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';

type ChildData = {
    student: { id: string; name: string; email: string | null };
    classes: any[];
    homework: any[];
    tests: any[];
    summary: {
        totalHomework: number;
        completedHomework: number;
        completionRate: number;
        overdueHomework: number;
        upcomingHomework: number;
        totalTests: number;
        upcomingTests: number;
    };
};

export default function GuardianDashboardPage() {
    const { authenticated } = useRequireAuth();
    const { isGuardian, full_name } = useAuth();
    const router = useRouter();

    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];

    const [children, setChildren] = useState<{ id: string; name: string | null; email: string | null; linkedAt: string }[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [childData, setChildData] = useState<ChildData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [error, setError] = useState('');

    // Fetch linked children directly from the API (not from context, which may be stale)
    useEffect(() => {
        if (!limits.guardianDashboard) return; // Don't fetch if locked
        const fetchChildren = async () => {
            try {
                const res = await fetch('/api/guardian/children');
                const data = await res.json();

                if (res.ok && data.children?.length > 0) {
                    setChildren(data.children);
                    setSelectedStudentId(data.children[0].id);
                } else {
                    setChildren([]);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to fetch children:', err);
                setChildren([]);
                setIsLoading(false);
            }
        };

        fetchChildren();
    }, []);

    // Fetch child data when selected student changes
    const fetchChildData = useCallback(async (studentId: string) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/guardian/child/${studentId}/data`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to load data');
                return;
            }

            setChildData(data);
        } catch (err) {
            setError('Failed to connect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedStudentId) {
            fetchChildData(selectedStudentId);
        }
    }, [selectedStudentId, fetchChildData]);

    if (!authenticated) return null;

    // ─── Family-only gate ──────────────────────────────────────────────
    if (!limits.guardianDashboard) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20 border border-sky-200/30 dark:border-sky-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-sky-400 dark:text-sky-300" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-sky-900 dark:text-white">
                            Guardian Dashboard is a Family feature
                        </h1>
                        <p className="text-sm text-sky-600/60 dark:text-sky-400/50 leading-relaxed max-w-sm mx-auto">
                            Monitor your child&apos;s academic progress, get AI-powered insights,
                            and receive weekly email reports.
                        </p>
                    </div>

                    <div className="space-y-3 text-left max-w-xs mx-auto">
                        {[
                            { icon: BarChart3, label: 'Full analytics on your child\'s progress' },
                            { icon: Users, label: 'Support for up to 4 children' },
                            { icon: Mail, label: 'Automatic weekly email reports' },
                            { icon: Shield, label: 'AI-powered insights (30 msgs/day)' },
                        ].map(({ icon: Icon, label }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3 py-2"
                            >
                                <div className="w-8 h-8 rounded-xl bg-sky-500/8 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                </div>
                                <span className="text-sm text-sky-800 dark:text-sky-200">{label}</span>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/pricing')}
                        style={{ background: '#0ea5e9' }}
                        className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Upgrade to Family
                    </button>

                    <p className="text-xs text-sky-600/30 dark:text-sky-400/20">
                        The Guardian Dashboard requires the Family plan.
                    </p>
                </motion.div>
            </div>
        );
    }

    // No linked children — redirect to link page
    if (!isLoading && children.length === 0) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-sm"
                >
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-sky-500/[0.08] flex items-center justify-center">
                        <Link2 className="w-8 h-8 text-sky-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-3">No Child Linked Yet</h2>
                    <p className="text-sm text-sky-800/40 dark:text-sky-300/40 mb-6">
                        Link to your child&apos;s account to start monitoring their progress.
                    </p>
                    <button
                        onClick={() => router.push('/guardian/link')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-bold text-sm rounded-2xl hover:bg-sky-600 transition-colors active:scale-[0.98]"
                    >
                        <Link2 className="w-4 h-4" />
                        Link an Account
                    </button>
                </motion.div>
            </div>
        );
    }

    const selectedStudent = children.find((s) => s.id === selectedStudentId);
    const studentName = childData?.student?.name || selectedStudent?.name || 'Student';
    const firstName = studentName.split(' ')[0];

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">
            {/* Background orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                {/* Header */}
                <header className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between gap-4 flex-wrap"
                    >
                        <div>
                            <p className="text-xs font-bold text-sky-600/30 dark:text-sky-400/30 uppercase tracking-[0.15em] mb-1">
                                Guardian Dashboard
                            </p>
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.08]">
                                {firstName}&apos;s Progress
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            {/* Child Switcher */}
                            {children.length > 1 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setSwitcherOpen(!switcherOpen)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-zinc-900/50 border border-sky-100 dark:border-gray-700 rounded-2xl text-sm font-bold text-sky-800 dark:text-sky-200 hover:bg-sky-500/[0.04] transition-colors"
                                    >
                                        <Users className="w-4 h-4 text-sky-500" />
                                        {firstName}
                                        <ChevronDown className={`w-3.5 h-3.5 text-sky-400/50 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {switcherOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-sky-100 dark:border-gray-700 rounded-2xl shadow-lg shadow-sky-500/5 z-50 p-1.5"
                                            >
                                                {children.map((student) => (
                                                    <button
                                                        key={student.id}
                                                        onClick={() => {
                                                            setSelectedStudentId(student.id);
                                                            setSwitcherOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${student.id === selectedStudentId
                                                            ? 'bg-sky-500/[0.06] text-sky-700 dark:text-sky-300'
                                                            : 'text-sky-800/60 dark:text-sky-300/60 hover:bg-sky-500/[0.04]'
                                                            }`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-sky-500/[0.08] flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-sky-500">
                                                                {(student.name || 'S').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate">{student.name || 'Student'}</p>
                                                            <p className="text-[10px] text-sky-600/30 dark:text-sky-400/30 truncate">{student.email}</p>
                                                        </div>
                                                        {student.id === selectedStudentId && (
                                                            <CheckCircle2 className="w-4 h-4 text-sky-500 ml-auto flex-shrink-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <button
                                onClick={() => router.push('/guardian/link')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-sky-500 hover:text-sky-600 bg-sky-500/[0.06] hover:bg-sky-500/[0.1] border border-sky-200/40 dark:border-sky-500/15 rounded-2xl transition-colors"
                            >
                                <Link2 className="w-4 h-4" />
                                Add Child
                            </button>

                            <button
                                onClick={() => router.push('/settings')}
                                className="p-2.5 text-sky-400/40 hover:text-sky-500 transition-colors rounded-xl hover:bg-sky-500/[0.04]"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </header>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-sky-500/40 animate-spin" />
                    </div>
                )}

                {/* Error state */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <AlertTriangle className="w-10 h-10 text-amber-500/60 mb-4" />
                        <p className="text-sm text-sky-800/50 dark:text-sky-300/50 font-medium mb-4">{error}</p>
                        <button
                            onClick={() => selectedStudentId && fetchChildData(selectedStudentId)}
                            className="px-4 py-2 text-sm font-bold text-sky-500 bg-sky-500/[0.06] rounded-xl hover:bg-sky-500/[0.1] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Dashboard Content */}
                {childData && !isLoading && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8"
                    >
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard
                                label="Completion"
                                value={`${childData.summary.completionRate}%`}
                                icon={<TrendingUp className="w-4 h-4" />}
                                color="emerald"
                            />
                            <StatCard
                                label="Completed"
                                value={`${childData.summary.completedHomework}/${childData.summary.totalHomework}`}
                                icon={<CheckCircle2 className="w-4 h-4" />}
                                color="sky"
                            />
                            <StatCard
                                label="Overdue"
                                value={String(childData.summary.overdueHomework)}
                                icon={<AlertTriangle className="w-4 h-4" />}
                                color={childData.summary.overdueHomework > 0 ? 'red' : 'sky'}
                            />
                            <StatCard
                                label="Upcoming Tests"
                                value={String(childData.summary.upcomingTests)}
                                icon={<FlaskConical className="w-4 h-4" />}
                                color="violet"
                            />
                        </div>

                        {/* Classes */}
                        <section>
                            <h2 className="text-xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Classes
                            </h2>
                            {childData.classes.length === 0 ? (
                                <EmptyState message="No classes yet" />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {childData.classes.map((cls: any) => {
                                        const classHomework = childData.homework.filter((h: any) => h.class_id === cls.id);
                                        const pending = classHomework.filter((h: any) => !h.completed).length;
                                        const classTests = childData.tests.filter((t: any) => t.class_id === cls.id);
                                        const upcomingTests = classTests.filter((t: any) =>
                                            new Date(t.test_date) >= new Date() && t.status !== 'completed'
                                        ).length;

                                        return (
                                            <div
                                                key={cls.id}
                                                className="group p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-sky-100/60 dark:border-gray-800 hover:border-sky-200/80 dark:hover:border-gray-700 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-[15px] font-bold text-sky-900 dark:text-sky-100 truncate">
                                                            {cls.name}
                                                        </h3>
                                                        {cls.teacher && (
                                                            <p className="text-[11px] text-sky-600/30 dark:text-sky-400/30 font-medium truncate mt-0.5">
                                                                {cls.teacher}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                                                        style={{ backgroundColor: cls.color || '#38bdf8' }}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] font-semibold">
                                                    {pending > 0 ? (
                                                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {pending} due
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            All done
                                                        </span>
                                                    )}
                                                    {upcomingTests > 0 && (
                                                        <span className="text-violet-600 dark:text-violet-400 flex items-center gap-1">
                                                            <FlaskConical className="w-3 h-3" />
                                                            {upcomingTests} test{upcomingTests > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Homework */}
                        <section>
                            <h2 className="text-xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-4 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5" />
                                Homework
                            </h2>
                            {childData.homework.length === 0 ? (
                                <EmptyState message="No homework assignments" />
                            ) : (
                                <div className="space-y-2">
                                    {childData.homework
                                        .sort((a: any, b: any) => {
                                            // Incomplete first, then by due date
                                            if (a.completed !== b.completed) return a.completed ? 1 : -1;
                                            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                                        })
                                        .slice(0, 15)
                                        .map((hw: any) => {
                                            const isOverdue = !hw.completed && new Date(hw.due_date) < new Date();
                                            const className = childData.classes.find((c: any) => c.id === hw.class_id);

                                            return (
                                                <div
                                                    key={hw.id}
                                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${hw.completed
                                                        ? 'bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-emerald-100/50 dark:border-emerald-500/10'
                                                        : isOverdue
                                                            ? 'bg-red-50/50 dark:bg-red-500/[0.04] border-red-100/50 dark:border-red-500/10'
                                                            : 'bg-white/60 dark:bg-zinc-900/30 border-sky-100/50 dark:border-gray-800'
                                                        }`}
                                                >
                                                    {/* Status indicator */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hw.completed
                                                        ? 'bg-emerald-500/15'
                                                        : isOverdue
                                                            ? 'bg-red-500/15'
                                                            : 'bg-sky-500/[0.08]'
                                                        }`}>
                                                        {hw.completed ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : isOverdue ? (
                                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                        ) : (
                                                            <Clock className="w-3.5 h-3.5 text-sky-500/50" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[14px] font-semibold truncate ${hw.completed
                                                            ? 'text-emerald-800/60 dark:text-emerald-300/60 line-through'
                                                            : 'text-sky-900 dark:text-sky-100'
                                                            }`}>
                                                            {hw.title}
                                                        </p>
                                                        <p className="text-[11px] text-sky-600/30 dark:text-sky-400/30 font-medium">
                                                            {className?.name || 'Unknown class'}
                                                        </p>
                                                    </div>

                                                    {/* Due date */}
                                                    <span className={`text-[11px] font-bold flex-shrink-0 ${hw.completed
                                                        ? 'text-emerald-500/50'
                                                        : isOverdue
                                                            ? 'text-red-500'
                                                            : 'text-sky-600/40 dark:text-sky-400/40'
                                                        }`}>
                                                        {hw.completed
                                                            ? 'Done ✓'
                                                            : isOverdue
                                                                ? 'Overdue'
                                                                : formatDate(hw.due_date)
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                    {childData.homework.length > 15 && (
                                        <p className="text-center text-xs text-sky-600/30 dark:text-sky-400/30 font-medium pt-2">
                                            Showing 15 of {childData.homework.length} assignments
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Tests */}
                        <section>
                            <h2 className="text-xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-4 flex items-center gap-2">
                                <FlaskConical className="w-5 h-5" />
                                Tests
                            </h2>
                            {childData.tests.length === 0 ? (
                                <EmptyState message="No tests scheduled" />
                            ) : (
                                <div className="space-y-2">
                                    {childData.tests
                                        .sort((a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
                                        .slice(0, 10)
                                        .map((test: any) => {
                                            const isPast = new Date(test.test_date) < new Date();
                                            const className = childData.classes.find((c: any) => c.id === test.class_id);

                                            return (
                                                <div
                                                    key={test.id}
                                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${isPast
                                                        ? 'bg-sky-50/30 dark:bg-sky-500/[0.02] border-sky-100/30 dark:border-gray-800/50'
                                                        : 'bg-white/60 dark:bg-zinc-900/30 border-sky-100/50 dark:border-gray-800'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-sky-500/[0.06]' : 'bg-violet-500/10'
                                                        }`}>
                                                        <FlaskConical className={`w-3.5 h-3.5 ${isPast ? 'text-sky-400/40' : 'text-violet-500'}`} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[14px] font-semibold truncate ${isPast
                                                            ? 'text-sky-800/40 dark:text-sky-300/40'
                                                            : 'text-sky-900 dark:text-sky-100'
                                                            }`}>
                                                            {test.title}
                                                        </p>
                                                        <p className="text-[11px] text-sky-600/30 dark:text-sky-400/30 font-medium">
                                                            {className?.name || 'Unknown class'}
                                                            {test.test_type && ` · ${test.test_type}`}
                                                        </p>
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        <span className={`text-[11px] font-bold ${isPast
                                                            ? 'text-sky-600/30 dark:text-sky-400/30'
                                                            : 'text-violet-600 dark:text-violet-400'
                                                            }`}>
                                                            {formatDate(test.test_date)}
                                                        </span>
                                                        {test.score !== null && test.max_score !== null && (
                                                            <p className="text-[10px] text-sky-600/30 dark:text-sky-400/30 font-medium">
                                                                {test.score}/{test.max_score}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </section>

                        {/* Footer */}
                        <div className="pt-8 border-t border-sky-100/50 dark:border-gray-800">
                            <p className="text-[11px] text-sky-600/20 dark:text-sky-400/20 font-medium">
                                Read-only view · Data updates in real time · {firstName}&apos;s privacy is protected
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* AI Chat Widget */}
            {selectedStudentId && !isLoading && !error && (
                <GuardianAIChatWidget
                    studentId={selectedStudentId}
                    studentName={childData?.student?.name || selectedStudent?.name || 'Student'}
                />
            )}
        </div>
    );
}

// ── Helper Components ──────────────────────────────────────────────

function StatCard({ label, value, icon, color }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: 'sky' | 'emerald' | 'red' | 'violet';
}) {
    const colors = {
        sky: 'bg-sky-500/[0.06] dark:bg-sky-500/[0.08] text-sky-500',
        emerald: 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] text-emerald-500',
        red: 'bg-red-500/[0.06] dark:bg-red-500/[0.08] text-red-500',
        violet: 'bg-violet-500/[0.06] dark:bg-violet-500/[0.08] text-violet-500',
    };

    const bgColors = {
        sky: 'border-sky-100/60 dark:border-sky-500/10',
        emerald: 'border-emerald-100/60 dark:border-emerald-500/10',
        red: 'border-red-100/60 dark:border-red-500/10',
        violet: 'border-violet-100/60 dark:border-violet-500/10',
    };

    return (
        <div className={`p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/30 border ${bgColors[color]} transition-colors`}>
            <div className={`w-8 h-8 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-sky-900 dark:text-sky-100 tracking-tight">{value}</p>
            <p className="text-[11px] text-sky-600/30 dark:text-sky-400/30 font-semibold mt-0.5">{label}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-10 text-center rounded-2xl bg-white/40 dark:bg-zinc-900/20 border border-sky-100/40 dark:border-gray-800">
            <p className="text-sm text-sky-600/25 dark:text-sky-400/25 font-medium">{message}</p>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 6) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
