'use client';

import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';

const SAFETY_CHECKS = [
    { text: 'No advertisements — ever', safe: true },
    { text: 'No student data sold to third parties', safe: true },
    { text: 'Built-in crisis support & mental health resources', safe: true },
    { text: 'No social media feeds or doom-scrolling', safe: true },
    { text: 'AI tutor teaches — never gives raw answers', safe: true },
    { text: 'No credit card required', safe: true },
];

const UNSAFE_OTHERS = [
    { text: 'Social feeds that distract', app: 'Most apps' },
    { text: 'Targeted ads based on age & behavior', app: 'Free tools' },
    { text: 'Sell student data to brokers', app: 'Some EdTech' },
    { text: 'No safeguards on AI answers', app: 'ChatGPT' },
];

export default function SafetySection() {
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
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full mb-4">
                        The Safety
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        A safe space,<br />
                        <span className="text-gray-400 dark:text-zinc-500">built for students.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        No ads. No data selling. No distractions. Just tools designed with your child&apos;s safety as the foundation.
                    </p>
                </motion.div>

                {/* ── Two-column: Safe vs Unsafe ─────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">

                    {/* LEFT — TaskTornado safety checklist */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-7 shadow-lg shadow-gray-200/30 dark:shadow-black/20"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                <Shield className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">TaskTornado</span>
                        </div>

                        <div className="space-y-3">
                            {SAFETY_CHECKS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.06 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT — What other apps do */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-7 shadow-lg shadow-gray-200/30 dark:shadow-black/20"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/20">
                                <X className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Other tools</span>
                        </div>

                        <div className="space-y-3">
                            {UNSAFE_OTHERS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.25 + i * 0.06 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-2">{item.app}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Subtle separator */}
                        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-700/50">
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-snug">
                                Most &quot;free&quot; education tools monetize student data or show ads. TaskTornado does neither.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ── Shield badge ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-full">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Student-first. Always.</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
