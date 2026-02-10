'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const COMPETITORS = [
    { name: 'Chegg', price: '$16.95/mo', color: 'text-orange-400' },
    { name: 'ChatGPT Plus', price: '$20/mo', color: 'text-green-400' },
    { name: 'Notion', price: '$10/mo', color: 'text-gray-400' },
    { name: 'Quizlet Plus', price: '$7.99/mo', color: 'text-blue-400' },
];

const INCLUDED = [
    'AI tutor that teaches, not just answers',
    'Smart homework dashboard',
    'Flashcards & quizzes',
    'Grade calculator & trends',
    'Study timer & streak tracking',
    'Writing assistant & translation',
    'Study groups & discussions',
    'Mental health & crisis support',
];

export default function CostSection() {
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
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-4">
                        The Cost
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        Free. <span className="text-gray-400 dark:text-zinc-500">Actually free.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        No trial that expires. No &quot;premium tier.&quot; No credit card. Your child gets the full experience from day one.
                    </p>
                </motion.div>

                {/* ── Giant $0 hero + competitor strikethroughs ──────── */}
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.2 }}
                        className="relative bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[28px] p-8 md:p-10 shadow-xl shadow-gray-200/50 dark:shadow-black/20 text-center"
                    >
                        {/* Ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#275085]/[0.06] rounded-full blur-[80px] pointer-events-none" />

                        {/* Price */}
                        <div className="relative z-10 mb-8">
                            <motion.p
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, type: 'spring', bounce: 0.3 }}
                                className="text-8xl md:text-9xl font-black text-[#275085] dark:text-[#4a9cdb] leading-none mb-2"
                            >
                                $0
                            </motion.p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">per month, forever</p>
                        </div>

                        {/* Competitor comparison */}
                        <div className="relative z-10 mb-8 pb-8 border-b border-gray-100 dark:border-zinc-700/50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-4">Meanwhile, others charge</p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {COMPETITORS.map((comp, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 6 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/60 rounded-full border border-gray-100 dark:border-zinc-700/50"
                                    >
                                        <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">{comp.name}</span>
                                        <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 line-through decoration-red-400">{comp.price}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* What's included */}
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-4">Everything included</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md mx-auto">
                                {INCLUDED.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -6 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.04 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                                        <span className="text-[12px] text-gray-600 dark:text-gray-300 font-medium">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── CTA ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/signup"
                        className="
                            group inline-flex items-center gap-2 px-7 py-3
                            bg-[#275085] hover:bg-[#1f3f6b]
                            text-white font-semibold text-sm
                            rounded-full transition-all duration-200
                            shadow-lg shadow-[#275085]/20 hover:shadow-xl hover:shadow-[#275085]/30
                        "
                    >
                        Share it with your child
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-3">
                        No credit card. No commitment. They can start in 30 seconds.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
