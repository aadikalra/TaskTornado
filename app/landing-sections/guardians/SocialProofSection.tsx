'use client';

import { motion } from 'framer-motion';
import { Heart, Code, Users } from 'lucide-react';

const STATS = [
    { value: '12+', label: 'Built-in tools', icon: Code, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
    { value: '100%', label: 'Free, forever', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
    { value: '0', label: 'Ads or trackers', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
];

export default function SocialProofSection() {
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
                        The Story
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        Built by students<br />
                        <span className="text-gray-400 dark:text-zinc-500">who get it.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        TaskTornado wasn&apos;t built in a boardroom. It was built by students who were tired of juggling 6 different apps just to stay organized.
                    </p>
                </motion.div>

                {/* ── Founder quote card ───────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="max-w-2xl mx-auto mb-14"
                >
                    <div className="relative bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-7 md:p-9 shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                        {/* Ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#275085]/[0.04] rounded-full blur-[80px] pointer-events-none" />

                        {/* Quote mark */}
                        <div className="relative z-10">
                            <div className="text-5xl font-serif text-[#275085]/20 dark:text-[#4a9cdb]/20 leading-none mb-3">&ldquo;</div>
                            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                                I was using Google Calendar for deadlines, Quizlet for flashcards, ChatGPT for help, and Notion for notes. Nothing talked to each other. I built TaskTornado so students could have <span className="font-bold text-gray-900 dark:text-white">one app that does it all</span> — and I made it free because students shouldn&apos;t have to pay for the tools they need to succeed.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#275085]/10 dark:bg-[#275085]/20 flex items-center justify-center">
                                    <img src="/TaskTornado.svg" alt="" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Aadi Kalra</p>
                                    <p className="text-[11px] text-gray-400 dark:text-zinc-500">Founder & Student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stats row ────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-lg mx-auto">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="text-center"
                        >
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
