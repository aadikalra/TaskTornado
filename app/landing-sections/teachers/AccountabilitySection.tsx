'use client';

import { motion } from 'framer-motion';
import { Check, X, Flame, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import Image from 'next/image';

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
        <section className="py-20 md:py-28 bg-[#faf8ff] dark:bg-gray-950 overflow-hidden">
            <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8 md:mb-10"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6b29a5] dark:text-[#8a42cf] bg-[#6b29a5]/5 dark:bg-[#8a42cf]/5 border border-[#6b29a5]/10 dark:border-[#8a42cf]/10 rounded-full mb-6">
                        The Accountability
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-[#873fc6] dark:text-[#8a42cf] tracking-tight leading-[1.1] mb-4">
                        Homework gets <span className="text-[#873fc6] dark:text-[#8a42cf]/50">done.</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#6b29a5]/70 dark:text-[#8a42cf]/70 max-w-xl mx-auto leading-relaxed font-medium">
                        Streaks, smart reminders, and a dashboard so satisfying — your students will actually <em>want</em> to stay ahead.
                    </p>
                </motion.div>

                {/* Before / After comparison */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-6 lg:gap-8 max-w-7xl 2xl:max-w-screen-2xl mx-auto items-center -mt-6 md:-mt-10">

                    {/* ── BEFORE ──────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#6b29a5]/8 dark:bg-[#8a42cf]/10">
                                <X className="w-4 h-4 text-[#6b29a5]/40 dark:text-[#8a42cf]/40" />
                            </div>
                            <span className="text-sm font-bold text-[#6b29a5] dark:text-[#8a42cf]">Without TaskTornado</span>
                        </div>

                        <div className="bg-[#fffaf4] dark:bg-zinc-800/50 border border-[#6b29a5]/10 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-bold text-[#6b29a5] dark:text-[#8a42cf]">Missing assignments</p>
                                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-[10px] font-bold text-red-500 rounded-full">
                                    5 missing
                                </span>
                            </div>

                            <div className="space-y-3">
                                {BEFORE_ITEMS.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.15 + i * 0.06 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full bg-[#6b29a5]/10 dark:bg-[#8a42cf]/12 flex items-center justify-center shrink-0">
                                                <X className="w-2.5 h-2.5 text-[#6b29a5]/35 dark:text-[#8a42cf]/35" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-[#6b29a5]/80 dark:text-[#8a42cf]/80 font-medium">{item.student}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-[#6b29a5]/30 dark:text-[#8a42cf]/30" />
                                            <span className="text-[10px] font-medium text-[#6b29a5]/40 dark:text-[#8a42cf]/40">{item.days}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-[10px] text-[#6b29a5]/50 dark:text-[#8a42cf]/40 text-center mt-4 italic font-medium">
                                You spend 20 minutes chasing students after class
                            </p>
                        </div>
                    </motion.div>

                    {/* ── VS IMAGE ────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="hidden md:flex items-center justify-center relative z-10"
                    >
                        <div className="relative w-80 h-80 lg:w-[600px] lg:h-[600px] pointer-events-none">
                            <Image
                                src="/teachers-comparison-v2.png"
                                alt="Comparison"
                                fill
                                className="object-contain"
                            />
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
                            <div className="p-1.5 rounded-lg bg-[#873fc6]/10 dark:bg-[#873fc6]/15">
                                <Check className="w-4 h-4 text-[#873fc6]" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-bold text-[#6b29a5] dark:text-[#8a42cf]">With TaskTornado</span>
                        </div>

                        <div className="bg-[#fffaf4] dark:bg-zinc-800/50 border border-[#6b29a5]/10 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-8 shadow-sm">
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
                            <div className="space-y-3">
                                {AFTER_STUDENTS.map((student, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.06 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            {student.done ? (
                                                <div className="w-4 h-4 rounded-full bg-[#873fc6] flex items-center justify-center shrink-0">
                                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-amber-300 dark:border-amber-700 shrink-0" />
                                            )}
                                            <span className={`text-sm font-medium ${student.done ? 'text-[#6b29a5]/80 dark:text-[#8a42cf]/80' : 'text-amber-700 dark:text-amber-300'
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

                            <p className="text-[10px] text-[#6b29a5]/50 dark:text-[#8a42cf]/40 text-center mt-4 italic font-medium">
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
                    className="max-w-2xl mx-auto -mt-8 md:-mt-16 grid grid-cols-3 gap-4 text-center relative z-20"
                >
                    {[
                        { value: 'Streaks', label: 'Gamify consistency' },
                        { value: 'Alerts', label: 'Before things are late' },
                        { value: 'Automatic', label: 'No chasing students' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-sm font-bold text-[#6b29a5] dark:text-[#8a42cf]">{stat.value}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b29a5]/50 dark:text-[#8a42cf]/50 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
