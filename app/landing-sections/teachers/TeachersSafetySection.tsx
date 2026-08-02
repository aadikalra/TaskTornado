'use client';

import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';
import Image from 'next/image';

const SAFE_LIST = [
    'No ads — ever',
    'No student data sold to third parties',
    'Clear limits: not therapy or emergency support',
    'No social feeds or distractions',
    'AI study tools paused during our provider update',
    'No budget approval needed — it\'s free',
    'No credit card required for students',
];

const RISK_LIST = [
    { text: 'Social feeds that distract from learning', source: 'Most free apps' },
    { text: 'Targeted ads based on student data', source: 'Common in EdTech' },
    { text: 'Full answers that enable cheating', source: 'ChatGPT, Chegg' },
    { text: 'Require school budget approval', source: 'Paid platforms' },
];

export default function TeachersSafetySection() {
    return (
        <section className="py-20 md:py-28 bg-sky-50 dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* 2-col layout: Image left, content right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

                    {/* Left — Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[440px] lg:h-[440px] pointer-events-none">
                            <Image
                                src="/teachers-safety.png"
                                alt="Safety and privacy illustration"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </motion.div>

                    {/* Right — Header + Cards */}
                    <div>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#4a9cdb]/5 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-6">
                                Trust & Privacy
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.1] mb-4">
                                Safe by design,<br />
                                private by default.
                            </h2>
                            <p className="text-base md:text-lg text-[#275085]/60 dark:text-[#4a9cdb]/60 max-w-lg leading-relaxed font-medium">
                                Your students deserve tools that respect their privacy.<br />Here&apos;s what sets us apart.
                            </p>
                        </motion.div>

                        {/* Stacked cards */}
                        <div className="space-y-4">
                            {/* TaskTornado card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="bg-white dark:bg-zinc-800/50 border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-[20px] p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-400/10">
                                        <Shield className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                    </div>
                                    <span className="text-sm font-bold text-[#275085] dark:text-[#4a9cdb]">TaskTornado</span>
                                </div>

                                <div className="space-y-2.5">
                                    {SAFE_LIST.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.15 + i * 0.04 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-4.5 h-4.5 rounded-full bg-sky-500 dark:bg-sky-400 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-[#275085]/80 dark:text-[#4a9cdb]/80 font-medium">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Alternatives card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="bg-white dark:bg-zinc-800/50 border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-[20px] p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 rounded-lg bg-[#275085]/8 dark:bg-[#4a9cdb]/8">
                                        <X className="w-4 h-4 text-[#275085]/35 dark:text-[#4a9cdb]/35" />
                                    </div>
                                    <span className="text-sm font-bold text-[#275085] dark:text-[#4a9cdb]">Common alternatives</span>
                                </div>

                                <div className="space-y-2.5">
                                    {RISK_LIST.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.25 + i * 0.05 }}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="w-4.5 h-4.5 rounded-full bg-[#275085]/8 dark:bg-[#4a9cdb]/8 flex items-center justify-center shrink-0 mt-0.5">
                                                <X className="w-2.5 h-2.5 text-[#275085]/35 dark:text-[#4a9cdb]/35" strokeWidth={3} />
                                            </div>
                                            <div>
                                                <span className="text-sm text-[#275085]/70 dark:text-[#4a9cdb]/70 font-medium">{item.text}</span>
                                                <span className="text-[10px] text-[#275085]/40 dark:text-[#4a9cdb]/40 ml-2">{item.source}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#275085]/6 dark:border-[#4a9cdb]/8">
                                    <p className="text-[11px] text-[#275085]/45 dark:text-[#4a9cdb]/45 leading-snug font-medium">
                                        You shouldn&apos;t have to read a 40-page privacy policy to recommend a study tool.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Shield badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="pt-2"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full">
                                    <Shield className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                                    <span className="text-xs font-bold text-[#275085] dark:text-[#4a9cdb]">Classroom-safe. Always.</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
