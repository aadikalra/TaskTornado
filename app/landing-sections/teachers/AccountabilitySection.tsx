'use client';

import { motion } from 'framer-motion';
import { Check, X, Flame, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

// ─── Before/After data ───────────────────────────────────────────────────────────
const BEFORE_ITEMS = [
    { student: 'Alex M.', status: 'Missing', days: '3 days late' },
    { student: 'Jordan K.', status: 'Missing', days: '2 days late' },
    { student: 'Priya S.', status: 'Missing', days: '1 day late' },
    { student: 'Marcus L.', status: 'Missing', days: '5 days late' },
    { student: 'Sophie T.', status: 'Not started', days: 'Due today' },
];

const AFTER_STATS = {
    completed: 13,
    total: 15,
    streak: 7,
    trend: 'up',
};

const AFTER_STUDENTS = [
    { name: 'Alex M.', done: true, streak: 5 },
    { name: 'Jordan K.', done: true, streak: 7 },
    { name: 'Priya S.', done: true, streak: 3 },
    { name: 'Marcus L.', done: false, dueIn: 'Tomorrow' },
    { name: 'Sophie T.', done: true, streak: 12 },
];

export default function AccountabilitySection() {
    const pct = Math.round((AFTER_STATS.completed / AFTER_STATS.total) * 100);

    return (
        <section className="py-20 md:py-28 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/8 dark:bg-amber-500/10 rounded-full mb-4">
                        The Accountability
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        They actually do<br />
                        <span className="text-gray-400 dark:text-zinc-500">the homework.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Streak tracking, deadline reminders, and a satisfying dashboard that makes your students <em>want</em> to stay on top of their work.
                    </p>
                </motion.div>

                {/* Before / After comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">

                    {/* ── BEFORE ──────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
                                <X className="w-3 h-3 text-red-500" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-red-500">Without TaskTornado</span>
                        </div>

                        <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[20px] p-5 md:p-6 shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Missing assignments</p>
                                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-[10px] font-bold text-red-500 rounded-full">
                                    5 missing
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {BEFORE_ITEMS.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -6 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 + i * 0.06 }}
                                        className="flex items-center justify-between px-3 py-2 bg-red-50/50 dark:bg-red-950/10 rounded-[12px] border border-red-100/50 dark:border-red-900/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-red-300 dark:border-red-700 shrink-0" />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.student}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-red-400" />
                                            <span className="text-[10px] font-medium text-red-500">{item.days}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center mt-4 italic">
                                You spend 20 minutes chasing students after class
                            </p>
                        </div>
                    </motion.div>

                    {/* ── AFTER ───────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">With TaskTornado</span>
                        </div>

                        <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[20px] p-5 md:p-6 shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                            {/* Stats bar */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{pct}% complete</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/20 rounded-full">
                                        <Flame className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{AFTER_STATS.streak}d</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500">↑</span>
                                </div>
                            </div>

                            {/* Student list */}
                            <div className="space-y-2.5">
                                {AFTER_STUDENTS.map((student, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -6 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.06 }}
                                        className={`flex items-center justify-between px-3 py-2 rounded-[12px] border ${student.done
                                                ? 'bg-gray-50 dark:bg-zinc-800/60 border-gray-100 dark:border-zinc-700/50'
                                                : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${student.done
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-amber-300 dark:border-amber-700'
                                                }`}>
                                                {student.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                            </div>
                                            <span className={`text-xs font-medium ${student.done ? 'text-gray-700 dark:text-gray-300' : 'text-amber-700 dark:text-amber-300'
                                                }`}>{student.name}</span>
                                        </div>
                                        {student.done ? (
                                            <div className="flex items-center gap-1">
                                                <Flame className="w-2.5 h-2.5 text-amber-400" />
                                                <span className="text-[10px] font-bold text-amber-500">{student.streak}d</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                                                <span className="text-[10px] font-medium text-amber-500">{student.dueIn}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center mt-4 italic">
                                Students track themselves. You teach.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom stats */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="max-w-md mx-auto mt-12 grid grid-cols-3 gap-4 text-center"
                >
                    {[
                        { value: 'Streaks', label: 'Gamify consistency' },
                        { value: 'Alerts', label: 'Before things are late' },
                        { value: 'Automatic', label: 'No chasing students' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
