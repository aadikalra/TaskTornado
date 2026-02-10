'use client';

import { motion } from 'framer-motion';
import { Check, Clock, TrendingUp, Flame, AlertTriangle } from 'lucide-react';

// ─── Fake student data for the live demo ─────────────────────────────────────────
const TASKS = [
    { text: 'Chapter 8 Problems', subject: 'Math', done: true, due: 'Yesterday' },
    { text: 'WWII Essay Draft', subject: 'History', done: true, due: 'Today' },
    { text: 'Lab Report', subject: 'Biology', done: false, due: 'Tomorrow' },
    { text: 'Spanish Vocab Quiz', subject: 'Spanish', done: false, due: 'In 2 days' },
];

const GRADE_TREND = [
    { month: 'Sep', gpa: 3.2 },
    { month: 'Oct', gpa: 3.4 },
    { month: 'Nov', gpa: 3.3 },
    { month: 'Dec', gpa: 3.6 },
    { month: 'Jan', gpa: 3.8 },
];

export default function VisibilitySection() {
    const completedCount = TASKS.filter(t => t.done).length;
    const totalCount = TASKS.length;
    const completionPct = Math.round((completedCount / totalCount) * 100);

    // SVG line chart points
    const chartWidth = 200;
    const chartHeight = 60;
    const points = GRADE_TREND.map((d, i) => {
        const x = (i / (GRADE_TREND.length - 1)) * chartWidth;
        const y = chartHeight - ((d.gpa - 3.0) / 1.0) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <section className="py-20 md:py-28 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-4">
                        The Visibility
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        See what they see.<br />
                        <span className="text-gray-400 dark:text-zinc-500">Without hovering.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        No more &quot;Did you finish your homework?&quot; — their progress is right here.
                    </p>
                </motion.div>

                {/* ── Dashboard preview — the visual proof ─────────── */}
                <div className="relative max-w-2xl mx-auto">

                    {/* ── Floating stat chips (desktop) ────────────────── */}
                    <div className="hidden md:block">
                        {/* Streak chip — top left */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="absolute -left-16 top-8 z-20"
                        >
                            <motion.div
                                animate={{ y: [-3, 3, -3] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 rounded-full shadow-sm"
                            >
                                <Flame className="w-4 h-4 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-none">7 days</p>
                                    <p className="text-[9px] text-amber-500/70 uppercase tracking-wider font-medium">Streak</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Upcoming alert chip — top right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="absolute -right-16 top-16 z-20"
                        >
                            <motion.div
                                animate={{ y: [-4, 4, -4] }}
                                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/30 rounded-full shadow-sm"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-[11px] font-bold text-rose-500">Bio test in 3 days</span>
                            </motion.div>
                        </motion.div>

                        {/* GPA trend chip — bottom right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="absolute -right-10 bottom-8 z-20"
                        >
                            <motion.div
                                animate={{ y: [-3, 3, -3] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 rounded-full shadow-sm"
                            >
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-bold text-emerald-500">GPA trending up</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* ── Main dashboard card ──────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="relative z-10 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-5 md:p-7 shadow-xl shadow-gray-200/50 dark:shadow-black/20"
                    >
                        {/* Header bar */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Your student&apos;s week</p>
                                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">Updated just now</p>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{completionPct}% complete</span>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-[16px] border border-gray-100 dark:border-zinc-700/50 p-3 text-center">
                                <p className="text-xl font-bold text-[#275085] dark:text-[#4a9cdb] leading-none mb-1">{completedCount}/{totalCount}</p>
                                <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">Tasks</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-[16px] border border-gray-100 dark:border-zinc-700/50 p-3 text-center">
                                <p className="text-xl font-bold text-amber-500 dark:text-amber-400 leading-none mb-1">7</p>
                                <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">Day Streak</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-[16px] border border-gray-100 dark:border-zinc-700/50 p-3 text-center">
                                {/* Mini GPA trend chart */}
                                <div className="flex items-end justify-center mb-1">
                                    <svg width={chartWidth / 3} height={chartHeight / 3} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                                        <polyline
                                            points={points}
                                            fill="none"
                                            stroke="rgb(16, 185, 129)"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">GPA Trend</p>
                            </div>
                        </div>

                        {/* Task list */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2">This week&apos;s assignments</p>
                            {TASKS.map((task, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 rounded-[14px] border border-gray-100 dark:border-zinc-700/50"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-gray-300 dark:border-zinc-600'
                                            }`}>
                                            {task.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <span className={`text-xs font-semibold ${task.done
                                                    ? 'text-gray-400 dark:text-zinc-500 line-through'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {task.text}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-2">{task.subject}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-gray-400 dark:text-zinc-500" />
                                        <span className={`text-[10px] font-medium ${task.due === 'Tomorrow' ? 'text-amber-500' : 'text-gray-400 dark:text-zinc-500'
                                            }`}>{task.due}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#275085]/[0.06] rounded-full blur-[80px] pointer-events-none" />
                </div>

                {/* ── Bottom proof points ─────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="max-w-lg mx-auto mt-12 grid grid-cols-3 gap-4 text-center"
                >
                    {[
                        { value: 'Real-time', label: 'Progress updates' },
                        { value: 'Automatic', label: 'Deadline tracking' },
                        { value: 'Zero', label: 'Setup for parents' },
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
