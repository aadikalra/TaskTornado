'use client';

import { motion } from 'framer-motion';
import { Check, Cpu, Users, Heart, Scale, Ban, Github, Terminal } from 'lucide-react';
import Image from 'next/image';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

export default function PromiseSection({ id }: { id?: string }) {
    return (
        <section id={id} className="py-24 md:py-32 bg-[#F8FAF0] dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24"
                >
                    {/* ── Left Column: The Big $0 ────────────────────────── */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start relative">
                        <div className="relative">
                            {/* "forever" Badge */}
                            <motion.span
                                variants={itemVariants}
                                className="absolute -top-4 -right-12 bg-[#d1fae5] dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                            >
                                forever
                            </motion.span>

                            {/* The $0 */}
                            <motion.h2
                                variants={itemVariants}
                                className="text-[160px] md:text-[200px] leading-none font-black text-[#275085] dark:text-white tracking-tighter"
                            >
                                $0
                            </motion.h2>
                        </div>

                        {/* "The Promise" Badge */}
                        <motion.span
                            variants={itemVariants}
                            className="mt-4 bg-[#ebf6b5] dark:bg-emerald-900/40 text-[#2d5a27] dark:text-emerald-400 text-sm font-bold px-4 py-1.5 rounded-full"
                        >
                            The Promise
                        </motion.span>
                    </div>

                    {/* ── Right Column: Headlines & Comparison ───────────── */}
                    <div className="lg:col-span-8 flex flex-col justify-center">
                        <motion.h3
                            variants={itemVariants}
                            className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] mb-4"
                        >
                            No hidden fees.<br />
                            No bait-and-switch.
                        </motion.h3>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-[#275085]/80 dark:text-[#4a9cdb]/80 mb-12 max-w-2xl leading-relaxed"
                        >
                            We&apos;ve been burned by &ldquo;free&rdquo; apps that switch to paid models too. TaskTornado is genuinely different.
                        </motion.p>

                        {/* Comparison Cards */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-5"
                        >
                            {/* Card 1: ChatGPT Plus */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-2 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col">
                                <div className="bg-[#eaf2ff] dark:bg-sky-900/30 px-5 py-3 rounded-[20px]">
                                    <h4 className="font-semibold text-[#275085] dark:text-sky-200">ChatGPT Plus</h4>
                                </div>
                                <div className="px-5 pb-5 pt-4 flex-1 flex flex-col justify-between">
                                    <p className="text-xs text-[#275085]/60 dark:text-slate-400 mb-6 mt-1">
                                        Replaces your tutor with smart plans
                                    </p>
                                    <p className="text-3xl font-bold text-[#275085] dark:text-white">$20<span className="text-sm font-medium text-[#275085]/40 tracking-normal">/month</span></p>
                                </div>
                            </div>

                            {/* Card 2: Notion Personal */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-2 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col">
                                <div className="bg-purple-50 dark:bg-purple-900/30 px-5 py-3 rounded-[20px]">
                                    <h4 className="font-semibold text-[#275085] dark:text-purple-200">Notion Personal</h4>
                                </div>
                                <div className="px-5 pb-5 pt-4 flex-1 flex flex-col justify-between">
                                    <p className="text-xs text-[#275085]/60 dark:text-slate-400 mb-6 mt-1">
                                        Organizes your personal life
                                    </p>
                                    <p className="text-3xl font-bold text-[#275085] dark:text-white">$10<span className="text-sm font-medium text-[#275085]/40 tracking-normal">/month</span></p>
                                </div>
                            </div>

                            {/* Card 3: TaskTornado */}
                            <div className="bg-[#275085] dark:bg-blue-600 rounded-[28px] p-2 shadow-lg flex flex-col md:-translate-y-2">
                                <div className="bg-white/10 dark:bg-black/20 px-5 py-3 rounded-[20px] flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <img src="/TaskTornadoDark.svg" alt="Logo" className="w-5 h-5 block" />
                                        <h4 className="font-semibold text-white">TaskTornado</h4>
                                    </div>
                                    <div className="bg-[#ebf6b5] dark:bg-green-500 rounded-full p-0.5">
                                        <Check className="w-3 h-3 text-[#275085] dark:text-white" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="px-5 pb-5 pt-4 flex-1 flex flex-col justify-between">
                                    <p className="text-xs text-blue-100/90 mb-6 mt-1">
                                        TaskTornado is a new way to study.
                                    </p>
                                    <p className="text-3xl font-bold text-white">$0<span className="text-sm font-medium text-blue-200/80 tracking-normal">/forever</span></p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ── Bottom Section: How We Keep It Free ────────────── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="text-center mb-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                            How We Keep It Free
                        </h3>
                    </div>

                    <div className="md:-mx-12 lg:-mx-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1: Open Source */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col group h-full">
                                {/* Top Half: Icon/Header + Image */}
                                <div className="flex justify-between items-start gap-4 mb-0">
                                    <div className="flex-1">
                                        <div className="text-[#275085] dark:text-[#4a9cdb] mb-4">
                                            <Github className="w-8 h-8 stroke-[2.5]" />
                                        </div>
                                        <h4 className="font-bold text-xl text-[#275085] dark:text-[#4a9cdb]">Open-source models</h4>
                                    </div>
                                    <div className="relative w-28 h-28 shrink-0 -mt-3 -mr-3 transition-transform duration-500 ease-out">
                                        <Image
                                            src="/open-source-infra.png"
                                            alt="Infrastructure"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                {/* Bottom Half: Text content (full width) */}
                                <div className="-mt-1">
                                    <p className="text-sm text-[#275085]/65 dark:text-[#4a9cdb]/65 leading-relaxed">
                                        Open-source models like Gemma allow us to operate near zero cost.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Card 2: Fair Usage */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col group h-full">
                                {/* Top Half: Icon/Header + Image */}
                                <div className="flex justify-between items-start gap-4 mb-0">
                                    <div className="flex-1">
                                        <div className="text-[#275085] dark:text-[#4a9cdb] mb-4">
                                            <Scale className="w-8 h-8 stroke-[2.5]" />
                                        </div>
                                        <h4 className="font-bold text-xl text-[#275085] dark:text-[#4a9cdb]">Fair usage limits</h4>
                                    </div>
                                    <div className="relative w-28 h-28 shrink-0 -mt-2 -mr-2 transition-transform duration-500 ease-out">
                                        <Image
                                            src="/fairUsage.png"
                                            alt="Fair Usage"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                {/* Bottom Half: Text content (full width) */}
                                <div className="-mt-1">
                                    <p className="text-sm text-[#275085]/65 dark:text-[#4a9cdb]/65 leading-relaxed">
                                        Sensible caps ensure everyone gets equal access to our resources.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Card 3: No Pressure */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col group h-full">
                                {/* Top Half: Icon/Header + Image */}
                                <div className="flex justify-between items-start gap-4 mb-0">
                                    <div className="flex-1">
                                        <div className="text-[#275085] dark:text-[#4a9cdb] mb-4">
                                            <Ban className="w-8 h-8 stroke-[2.5]" />
                                        </div>
                                        <h4 className="font-bold text-xl text-[#275085] dark:text-[#4a9cdb]">No investor pressure</h4>
                                    </div>
                                    <div className="relative w-28 h-28 shrink-0 -mt-2 -mr-2 transition-transform duration-500 ease-out">
                                        <Image
                                            src="/noPressure.png"
                                            alt="No Pressure"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                {/* Bottom Half: Text content (full width) */}
                                <div className="-mt-1">
                                    <p className="text-sm text-[#275085]/65 dark:text-[#4a9cdb]/65 leading-relaxed">
                                        We answer to students, not shareholders looking for infinite growth.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
