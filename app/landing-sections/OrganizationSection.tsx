'use client';

import { motion } from 'framer-motion';
import { CalendarDays, Bell, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';

interface OrganizationSectionProps {
    homeworkItems: any[];
    onItemToggle: (id: string) => void;
}

export default function OrganizationSection({ homeworkItems, onItemToggle }: OrganizationSectionProps) {
    return (
        <section id="organization" className="py-20 md:py-28 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Header — editorial centered ──────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-4">
                        The Foundation
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        Never miss a deadline<br />
                        <span className="text-gray-400 dark:text-zinc-500">again.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Throw away the paper planner. TaskTornado centralizes your school life in one powerful dashboard.
                    </p>
                </motion.div>

                {/* ── Feature cards — 3-column strip ───────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">
                    {[
                        {
                            icon: CalendarDays,
                            color: 'text-blue-500 dark:text-blue-400',
                            bg: 'bg-blue-50 dark:bg-blue-950/20',
                            border: 'border-blue-200/60 dark:border-blue-800/30',
                            title: 'Smart Calendar',
                            desc: 'Syncs assignments across all your classes automatically.'
                        },
                        {
                            icon: Bell,
                            color: 'text-amber-500 dark:text-amber-400',
                            bg: 'bg-amber-50 dark:bg-amber-950/20',
                            border: 'border-amber-200/60 dark:border-amber-800/30',
                            title: 'Intelligent Alerts',
                            desc: 'Get notified before you fall behind — not after.'
                        },
                        {
                            icon: TrendingUp,
                            color: 'text-emerald-500 dark:text-emerald-400',
                            bg: 'bg-emerald-50 dark:bg-emerald-950/20',
                            border: 'border-emerald-200/60 dark:border-emerald-800/30',
                            title: 'Progress Tracking',
                            desc: 'Visual insights into grades and completion rates.'
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className={`${feature.bg} border ${feature.border} rounded-[20px] p-5`}
                        >
                            <div className="flex items-center gap-2.5 mb-3">
                                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Live homework demo card ──────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-5 md:p-6 max-w-md mx-auto"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#275085] dark:text-[#4a7ba7]" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Today&apos;s Homework</h3>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                            {homeworkItems.length} tasks
                        </span>
                    </div>
                    <PlayfulHomeworkList items={homeworkItems} onItemToggle={onItemToggle} />
                </motion.div>

            </div>
        </section>
    );
}
