'use client';

import { motion } from 'framer-motion';
import { Brain, BookOpen, LayoutGrid, ExternalLink, Chrome, X } from 'lucide-react';

// ─── "What they do now" browser tabs mockup ──────────────────────────────────────
const CHAOTIC_TABS = [
    { label: 'reddit.com/r/homework', color: 'bg-orange-500' },
    { label: 'YouTube - How to…', color: 'bg-red-500' },
    { label: 'Google: "what is…"', color: 'bg-blue-500' },
    { label: 'Chegg - Answer', color: 'bg-amber-500' },
    { label: 'Quizlet flashcards', color: 'bg-indigo-500' },
    { label: 'Khan Academy', color: 'bg-green-500' },
    { label: 'Wikipedia - …', color: 'bg-gray-500' },
    { label: 'Discord #homework', color: 'bg-violet-500' },
];

// ─── TaskTornado unified tools ───────────────────────────────────────────────────
const TT_TOOLS = [
    {
        icon: Brain,
        label: 'Aurora AI Tutor',
        desc: 'Explains concepts step-by-step. No copy-paste answers.',
        accent: 'text-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-950/20',
        border: 'border-violet-200/50 dark:border-violet-800/30',
    },
    {
        icon: BookOpen,
        label: 'Smart Flashcards',
        desc: 'Auto-generated from notes. Spaced repetition built in.',
        accent: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-200/50 dark:border-amber-800/30',
    },
    {
        icon: LayoutGrid,
        label: 'Practice Quizzes',
        desc: 'AI-powered quizzes that adapt to weak spots.',
        accent: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        border: 'border-indigo-200/50 dark:border-indigo-800/30',
    },
];

export default function AcademicToolkitSection() {
    return (
        <section className="py-20 md:py-28 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 bg-violet-500/8 dark:bg-violet-500/10 rounded-full mb-4">
                        The Academics
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        Built-in tutoring,<br />
                        <span className="text-gray-400 dark:text-zinc-500">not another tab.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        They&apos;re not cheating — they&apos;re searching for help in all the wrong places. TaskTornado keeps learning focused and in one app.
                    </p>
                </motion.div>

                {/* ── Side-by-side comparison ──────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">

                    {/* LEFT — "What they do now" */}
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
                            <span className="text-xs font-bold uppercase tracking-widest text-red-500">What they do now</span>
                        </div>

                        {/* Fake browser chrome */}
                        <div className="bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[20px] overflow-hidden shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                            {/* Tab bar */}
                            <div className="bg-gray-200/80 dark:bg-zinc-800 px-3 py-2 flex items-center gap-1 overflow-hidden">
                                <div className="flex gap-1.5 mr-3 shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                                <div className="flex gap-0.5 overflow-hidden">
                                    {CHAOTIC_TABS.slice(0, 5).map((tab, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-zinc-700/60 rounded-t-md min-w-0 shrink"
                                        >
                                            <Chrome className="w-2 h-2 text-gray-400 shrink-0" />
                                            <span className="text-[8px] text-gray-500 dark:text-zinc-400 truncate">{tab.label}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center px-2 py-1 bg-white/40 dark:bg-zinc-700/40 rounded-t-md">
                                        <span className="text-[8px] text-gray-400">+3</span>
                                    </div>
                                </div>
                            </div>

                            {/* "Page content" — chaotic */}
                            <div className="p-5 md:p-6 space-y-3 min-h-[200px]">
                                {CHAOTIC_TABS.map((tab, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -6 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-zinc-700/30 rounded-lg border border-gray-100/80 dark:border-zinc-700/30"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${tab.color} shrink-0`} />
                                        <span className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{tab.label}</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-gray-300 ml-auto shrink-0" />
                                    </motion.div>
                                ))}
                                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center pt-2 italic">
                                    8 tabs open · 45 minutes wasted · no learning happened
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT — "What TaskTornado does" */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">What TaskTornado does</span>
                        </div>

                        {/* Clean app card */}
                        <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[20px] overflow-hidden shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                            {/* App header */}
                            <div className="bg-[#275085]/5 dark:bg-[#275085]/10 px-5 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-700/50">
                                <img src="/TaskTornado.svg" alt="" className="w-5 h-5" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">TaskTornado</span>
                                <span className="ml-auto text-[9px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">1 app, all tools</span>
                            </div>

                            {/* Tools */}
                            <div className="p-5 md:p-6 space-y-3.5 min-h-[200px]">
                                {TT_TOOLS.map((tool, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className={`flex items-start gap-3 px-4 py-3.5 ${tool.bg} border ${tool.border} rounded-[16px]`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${tool.bg} shrink-0 mt-0.5`}>
                                            <tool.icon className={`w-4 h-4 ${tool.accent}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none mb-1">{tool.label}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">{tool.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* AI conversation preview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-4 px-4 py-3 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-200/30 dark:border-violet-800/20 rounded-[14px]"
                                >
                                    <div className="flex items-start gap-2">
                                        <Brain className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[11px] text-violet-600 dark:text-violet-400 italic leading-snug">
                                                &quot;Let me walk you through the quadratic formula step by step. First, let&apos;s identify a, b, and c…&quot;
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Bottom tagline ──────────────────────────────────── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-sm text-gray-400 dark:text-zinc-500 max-w-md mx-auto"
                >
                    Aurora AI teaches concepts — it never gives raw answers. Your child learns <span className="font-semibold text-gray-600 dark:text-gray-300">how</span> to solve, not just <span className="font-semibold text-gray-600 dark:text-gray-300">what</span> the answer is.
                </motion.p>
            </div>
        </section>
    );
}
