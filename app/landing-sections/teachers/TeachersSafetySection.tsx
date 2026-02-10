'use client';

import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';

const SAFE_LIST = [
    'No ads — ever',
    'No student data sold to third parties',
    'Built-in crisis support & mental health resources',
    'No social feeds or distractions',
    'AI teaches concepts, never gives raw answers',
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
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full mb-4">
                        Trust & Privacy
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        Built for classrooms,<br />
                        <span className="text-gray-400 dark:text-zinc-500">not boardrooms.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        You shouldn&apos;t have to worry about what an app is doing with your students&apos; data. Here&apos;s our commitment.
                    </p>
                </motion.div>

                {/* Two column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">

                    {/* TaskTornado */}
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
                            {SAFE_LIST.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Other tools */}
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
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Common alternatives</span>
                        </div>

                        <div className="space-y-3">
                            {RISK_LIST.map((item, i) => (
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
                                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-2">{item.source}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-700/50">
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-snug">
                                You shouldn&apos;t have to read a 40-page privacy policy to recommend a study tool.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Shield badge */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-full">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Classroom-safe. Always.</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
