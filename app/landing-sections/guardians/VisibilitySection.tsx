'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { X, Check } from 'lucide-react';


export default function VisibilitySection() {
    return (
        <section className="py-12 md:py-20 bg-[#FCFDF5] dark:bg-zinc-950 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* ── Card Container ───────────────────────────────────── */}
                <div className="bg-[#F1F6D1] dark:bg-zinc-900 rounded-[40px] md:rounded-[64px] py-16 md:py-24 px-8 md:px-16">

                    {/* ── Header ──────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                            The Infographic
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] mb-4">
                            From homework battles<br />
                            to dinner-time peace.
                        </h2>
                        <p className="text-base md:text-lg text-[#275085]/60 dark:text-[#4a9cdb]/60 font-medium max-w-2xl mx-auto leading-relaxed">
                            See what changes when your child has a system that actually works.
                        </p>
                    </motion.div>

                    {/* ── Two Column Comparison ────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-16 md:mb-20">

                        {/* Left: Without */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white dark:bg-zinc-800 rounded-[24px] p-6 md:p-8 border border-[#275085]/5 dark:border-zinc-700 flex flex-col items-center text-center"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/15 mb-6">
                                <X className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-[0.1em]">
                                    Without TaskTornado
                                </span>
                            </div>

                            {/* Illustration */}
                            <div className="w-full max-w-[400px] mb-6">
                                <Image
                                    src="/homework-battles-after.png"
                                    alt="Without TaskTornado — chaotic homework scene"
                                    width={900}
                                    height={700}
                                    className="w-full h-auto object-contain"
                                    priority
                                />
                            </div>

                            {/* Summary */}
                            <h3 className="text-xl md:text-2xl font-bold text-red-500/80 dark:text-red-400 leading-tight">
                                Constant nagging<br />&amp; lost time.
                            </h3>
                        </motion.div>

                        {/* Right: With */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-zinc-800 rounded-[24px] p-6 md:p-8 border border-[#275085]/5 dark:border-zinc-700 flex flex-col items-center text-center"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 mb-6">
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">
                                    With TaskTornado
                                </span>
                            </div>

                            {/* Illustration */}
                            <div className="w-full max-w-[400px] mb-6">
                                <Image
                                    src="/homework-battles-before.png"
                                    alt="With TaskTornado — organized and peaceful"
                                    width={900}
                                    height={700}
                                    className="w-full h-auto object-contain"
                                    priority
                                />
                            </div>

                            {/* Summary */}
                            <h3 className="text-xl md:text-2xl font-bold text-emerald-600/80 dark:text-emerald-400 leading-tight">
                                Peace of mind<br />&amp; progress.
                            </h3>
                        </motion.div>
                    </div>

                    {/* ── Bottom Subtitle ──────────────────────────────── */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center text-base md:text-lg text-[#275085]/60 dark:text-[#4a9cdb]/60 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Parents get visibility, not another job.
                    </motion.p>

                </div>
            </div>
        </section>
    );
}