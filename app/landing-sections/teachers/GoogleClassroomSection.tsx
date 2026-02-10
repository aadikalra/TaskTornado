'use client';

import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, Check } from 'lucide-react';

// ─── Fake synced classes ─────────────────────────────────────────────────────────
const SYNCED_CLASSES = [
    { name: 'AP Biology', color: 'bg-emerald-500', assignments: 4 },
    { name: 'Algebra II', color: 'bg-blue-500', assignments: 6 },
    { name: 'World History', color: 'bg-amber-500', assignments: 3 },
    { name: 'English Lit', color: 'bg-rose-500', assignments: 5 },
];

const SYNC_STEPS = [
    'Classes imported',
    'Assignments synced',
    'Deadlines set',
    'Students ready',
];

export default function GoogleClassroomSection() {
    return (
        <section id="google-classroom" className="py-20 md:py-28 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full mb-4">
                        Zero Extra Work
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        It already talks to<br />
                        <span className="text-gray-400 dark:text-zinc-500">Google Classroom.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Your students connect their Google Classroom account once. Classes, assignments, and deadlines flow in automatically. You don&apos;t lift a finger.
                    </p>
                </motion.div>

                {/* Sync visual */}
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="relative bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20"
                    >
                        {/* Ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-400/[0.05] rounded-full blur-[80px] pointer-events-none" />

                        {/* ── Top: Two logos with sync arrow ──────────────── */}
                        <div className="relative z-10 flex items-center justify-center gap-4 md:gap-6 mb-8">
                            {/* Google Classroom */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0F9D58]/10 dark:bg-[#0F9D58]/15 flex items-center justify-center border border-[#0F9D58]/20 dark:border-[#0F9D58]/30">
                                    <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#0F9D58" opacity="0.2" />
                                        <path d="M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2.5a2 2 0 110 4 2 2 0 010-4zm0 8.5c-1.87 0-3.5-.93-4.5-2.35.04-1.48 3-2.3 4.5-2.3s4.46.82 4.5 2.3c-1 1.42-2.63 2.35-4.5 2.35z" fill="#0F9D58" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Google Classroom</span>
                            </motion.div>

                            {/* Sync arrow */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.35, type: 'spring', bounce: 0.3 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                    className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-center"
                                >
                                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                                </motion.div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500">Auto-sync</span>
                            </motion.div>

                            {/* TaskTornado */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#275085]/10 dark:bg-[#275085]/15 flex items-center justify-center border border-[#275085]/20 dark:border-[#275085]/30">
                                    <img src="/TaskTornado.svg" alt="" className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">TaskTornado</span>
                            </motion.div>
                        </div>

                        {/* ── Synced classes ─────────────────────────────────── */}
                        <div className="relative z-10 mb-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Synced classes</p>
                            <div className="grid grid-cols-2 gap-2.5">
                                {SYNCED_CLASSES.map((cls, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.08 }}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 rounded-[14px] border border-gray-100 dark:border-zinc-700/50"
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full ${cls.color} shrink-0`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{cls.name}</p>
                                            <p className="text-[9px] text-gray-400 dark:text-zinc-500">{cls.assignments} assignments</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* ── Sync steps ──────────────────────────────────────── */}
                        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
                            {SYNC_STEPS.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{step}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-gray-400 dark:text-zinc-500 mt-8 max-w-md mx-auto"
                >
                    Students connect their own account in 30 seconds. You just tell them about TaskTornado — we handle the rest.
                </motion.p>
            </div>
        </section>
    );
}
