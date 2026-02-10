'use client';

import { motion } from 'framer-motion';
import { Heart, ShieldAlert, Phone, MessageCircle } from 'lucide-react';

// ─── Animated floating topic pills — pushed far out to the edges ─────────────────
const TOPICS = [
    { label: 'Test anxiety', x: '-18%', y: '10%', delay: 0 },
    { label: 'Time management', x: '92%', y: '5%', delay: 0.8 },
    { label: 'Burnout', x: '-15%', y: '55%', delay: 1.6 },
    { label: 'Motivation', x: '95%', y: '50%', delay: 0.4 },
    { label: 'Procrastination', x: '88%', y: '88%', delay: 1.2 },
    { label: 'Peer pressure', x: '-12%', y: '90%', delay: 2.0 },
];

export default function WellbeingSection() {
    return (
        <section className="relative py-24 md:py-32 bg-gray-50 dark:bg-zinc-900 overflow-hidden">

            {/* ── Ambient background glow ─────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.05] rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8">

                {/* ── Header — large editorial style ──────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/30 rounded-full mb-6">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400">The Support</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-5">
                        Grades matter.<br />
                        <span className="text-gray-400 dark:text-zinc-500">Your health matters more.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        School is stressful. We built a safe space to help you manage the pressure.
                    </p>
                </motion.div>

                {/* ── Center conversation card with floating topics ────── */}
                <div className="relative max-w-md mx-auto mb-16 md:mb-20">

                    {/* Floating topic pills — pushed far from center */}
                    <div className="hidden md:block">
                        {TOPICS.map((topic, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + topic.delay * 0.15, duration: 0.5 }}
                                className="absolute"
                                style={{ left: topic.x, top: topic.y }}
                            >
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' }}
                                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-[11px] font-medium text-gray-500 dark:text-zinc-400 whitespace-nowrap shadow-sm"
                                >
                                    {topic.label}
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* The conversation card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-5 shadow-sm"
                    >
                        <div className="space-y-4">
                            {/* User message */}
                            <div className="flex justify-end">
                                <div className="bg-[#165df9] rounded-[18px] rounded-tr-sm px-4 py-2.5 text-[13px] text-white font-medium max-w-[85%] shadow-lg shadow-[#165df9]/20">
                                    @therapist I can&apos;t stop stressing about my chemistry final
                                </div>
                            </div>

                            {/* Aurora response */}
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Heart className="w-3 h-3 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                        I hear you — that&apos;s a lot of pressure. Let&apos;s try something: name the <span className="text-gray-900 dark:text-white font-medium">one specific topic</span> that feels most overwhelming right now.
                                    </p>
                                    <p className="text-[13px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                        We&apos;ll tackle it together, step by step. You don&apos;t have to figure it all out at once 💙
                                    </p>
                                </div>
                            </div>

                            {/* User follow-up */}
                            <div className="flex justify-end">
                                <div className="bg-[#165df9] rounded-[18px] rounded-tr-sm px-4 py-2.5 text-[13px] text-white font-medium max-w-[85%] shadow-lg shadow-[#165df9]/20">
                                    Balancing equations... I just don&apos;t get it
                                </div>
                            </div>

                            {/* Aurora second response */}
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Heart className="w-3 h-3 text-white" />
                                </div>
                                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Perfect — now we have something concrete. Would you like me to walk you through it Socratically, or generate a quick <span className="font-mono text-[11px] text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">@quiz</span> to find exactly where you&apos;re getting stuck?
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Two info blocks — side by side ──────────────────── */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-3xl mx-auto mb-5">

                    {/* Reality Check */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-amber-50/80 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 rounded-[20px] p-5"
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Reality Check</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            This is for coaching and coping strategies, not crisis management. Think of it as a supportive friend, not a professional therapist.
                        </p>
                    </motion.div>

                    {/* What it helps with */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[20px] p-5"
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Built for students</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {['Exam stress', 'Focus tips', 'Time pressure', 'Motivation', 'Study burnout'].map((tag, i) => (
                                <span key={i} className="px-2.5 py-1 text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Crisis banner ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto bg-red-50 dark:bg-red-950/10 border border-red-200/60 dark:border-red-800/30 rounded-[16px] px-5 py-4 flex items-start md:items-center gap-3"
                >
                    <Phone className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5 md:mt-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="font-semibold text-gray-900 dark:text-gray-300">If you&apos;re in crisis:</span>{' '}
                        Text HOME to <span className="font-mono font-bold text-gray-900 dark:text-white">741741</span> or call <span className="font-mono font-bold text-gray-900 dark:text-white">988</span> for the Suicide & Crisis Lifeline.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
