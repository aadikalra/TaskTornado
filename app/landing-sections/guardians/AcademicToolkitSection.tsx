'use client';

import { motion } from 'framer-motion';
import {
    Brain, BookOpen, LayoutGrid, X, ArrowLeft, ArrowRight, RotateCw,
    Search, Star, User, MoreVertical, Plus, Bookmark,
    CalendarCheck, PenTool, Languages, Calculator, Users,
    MessageSquare, Timer, Gamepad2
} from 'lucide-react';
import Image from 'next/image';

// ─── TaskTornado unified tools ───────────────────────────────────────────────────
// Pulled from DockNav to ensure every feature is represented
const TT_FEATURES = [
    { icon: Brain, label: 'Aurora AI' },
    { icon: CalendarCheck, label: 'Calendar' },
    { icon: BookOpen, label: 'Flashcards' },
    { icon: LayoutGrid, label: 'Quizzes' },
    { icon: PenTool, label: 'Writing' },
    { icon: Languages, label: 'Translate' },
    { icon: Calculator, label: 'Grades' },
    { icon: Users, label: 'Groups' },
    { icon: MessageSquare, label: 'Discuss' },
    { icon: Timer, label: 'Study Timer' },
    { icon: Bookmark, label: 'Web Saves' },
    { icon: Gamepad2, label: 'Games' },
];

export default function AcademicToolkitSection() {
    return (
        <section className="py-20 md:py-28 bg-[#fffdf5] dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 dark:border-amber-400/10 rounded-full mb-6">
                        Academic Toolkit
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-amber-500 dark:text-amber-400 tracking-tight leading-[1.15] mb-4">
                        Built-in tutoring,<br />
                        not another tab.
                    </h2>
                    <p className="text-base md:text-lg text-amber-500/70 dark:text-amber-400/70 max-w-2xl mx-auto leading-relaxed font-medium">
                        They&apos;re not cheating — they&apos;re searching for help in all the wrong places. TaskTornado keeps learning focused and in one app.
                    </p>
                </motion.div>

                {/* ── Illustration ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center mb-16 md:mb-24"
                >
                    <Image
                        src="/tutoring-illustration.png"
                        alt="Built-in tutoring"
                        width={800}
                        height={400}
                        className="w-full max-w-3xl object-contain"
                        priority
                    />
                </motion.div>

                {/* ── Grid: "What they do now" vs "What TaskTornado does" ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                    {/* LEFT — "What they do now" */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg md:text-xl font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-6">
                            WHAT THEY DO NOW
                        </h3>

                        {/* Chrome Mockup from image */}
                        <div className="bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                            {/* Title bar / Tabs block */}
                            <div className="bg-[#DFE1E5] dark:bg-zinc-800 pt-2 px-2 flex items-end gap-1 overflow-hidden">
                                <div className="flex gap-1.5 px-3 py-2 shrink-0 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                </div>
                                <div className="flex gap-0.5 mt-1 overflow-hidden flex-1 relative top-[1px]">
                                    <div className="flex items-center gap-2 bg-[#F1F3F4] dark:bg-zinc-700/60 text-gray-500 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-t-lg border-t border-x border-[#d1d3d5] dark:border-zinc-700/30 min-w-0">
                                        <div className="w-3 h-3 rounded-full bg-[#ff4500] shrink-0" />
                                        <span className="truncate w-12 md:w-auto">New tab</span>
                                        <X className="w-3 h-3 ml-1 md:ml-2 shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 text-xs px-3 py-1.5 rounded-t-lg border-t border-x border-transparent dark:border-transparent z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] min-w-0">
                                        <div className="w-3 h-3 bg-red-600 rounded-[3px] flex items-center justify-center shrink-0">
                                            <div className="w-0 h-0 border-t-[2px] border-t-transparent border-l-[3px] border-l-white border-b-[2px] border-b-transparent ml-[1px]"></div>
                                        </div>
                                        <span className="truncate w-12 md:w-auto font-medium">YouTube</span>
                                        <X className="w-3 h-3 ml-1 md:ml-2 text-gray-400 shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#F1F3F4] dark:bg-zinc-700/60 text-gray-500 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-t-lg border-t border-x border-[#d1d3d5] dark:border-zinc-700/30 min-w-0">
                                        <div className="w-3 h-3 bg-[#275085] rounded-sm flex items-center justify-center shrink-0">
                                            <span className="text-[7px] text-white font-bold">T</span>
                                        </div>
                                        <span className="truncate w-12 md:w-auto">Task Tab</span>
                                        <X className="w-3 h-3 ml-1 md:ml-2 shrink-0" />
                                    </div>
                                    <div className="flex items-center justify-center px-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Bar */}
                            <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 flex items-center gap-3 border-b border-[#E5E5E5] dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 shrink-0">
                                    <ArrowLeft className="w-4 h-4" />
                                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600" />
                                    <RotateCw className="w-4 h-4" />
                                </div>
                                <div className="bg-[#F1F3F4] dark:bg-zinc-800 rounded-full flex-1 flex items-center px-3 py-1.5 min-w-0">
                                    <Search className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 shrink-0" />
                                    <div className="flex-1 mx-2 h-4 w-full"></div>
                                    <Star className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 shrink-0">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <MoreVertical className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Bookmarks Bar */}
                            <div className="bg-white dark:bg-zinc-900 px-4 py-1.5 border-b border-[#E5E5E5] dark:border-zinc-800 flex items-center gap-4 text-[11px] text-gray-600 dark:text-zinc-300 font-medium overflow-hidden whitespace-nowrap">
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-[#FF4500]" />
                                    reddit
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3 h-3 bg-red-600 rounded-[3px] flex items-center justify-center">
                                        <div className="w-0 h-0 border-t-[2px] border-t-transparent border-l-[3px] border-l-white border-b-[2px] border-b-transparent ml-[1px]"></div>
                                    </div>
                                    YouTube
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3 h-3 bg-orange-500 rounded-[3px] flex items-center justify-center text-white text-[8px] font-bold">C</div>
                                    Chegg
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-500 shrink-0">
                                    <Bookmark className="w-3 h-3 fill-current" />
                                    Browser&apos;s ti...
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                                    MEKi.ems
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                                    Pceplopxe
                                </div>
                            </div>

                            {/* Browser body area — chaotic list of distractions */}
                            <div className="bg-white dark:bg-zinc-900 min-h-[220px] rounded-b-xl p-6">
                                <div className="space-y-3">
                                    {[
                                        { label: 'reddit.com/r/homework - Is this even possible?', color: 'bg-orange-500' },
                                        { label: 'YouTube - How to solve quadratic... (15:04)', color: 'bg-red-500' },
                                        { label: 'Google: "why is math so hard"', color: 'bg-blue-500' },
                                        { label: 'Chegg - Quadratic Formula Answer', color: 'bg-amber-500' },
                                        { label: 'Quizlet flashcards - Set: Algebra 1', color: 'bg-indigo-500' },
                                    ].map((site, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/30 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${site.color} shrink-0`} />
                                            <span className="text-[11px] text-gray-500 dark:text-zinc-400 truncate font-medium">{site.label}</span>
                                        </div>
                                    ))}
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center pt-2 italic">
                                        8 tabs open · 45 minutes wasted · no learning happened
                                    </p>
                                </div>
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
                        <h3 className="text-lg md:text-xl font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-6">
                            WHAT TASKTORNADO DOES
                        </h3>

                        {/* TaskTornado Card — clean monochromatic */}
                        <div className="bg-white dark:bg-zinc-800/50 border border-amber-500/10 dark:border-zinc-700/50 rounded-[24px] overflow-hidden shadow-sm">
                            {/* App header */}
                            <div className="bg-amber-500/5 dark:bg-amber-500/10 px-5 py-2.5 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-700/50">
                                <img src="/2.svg" alt="" className="w-4 h-4" />
                                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">TaskTornado</span>
                                <span className="ml-auto text-[8px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Unified Platform</span>
                            </div>

                            {/* Features Grid — optimized for high-density & polish */}
                            <div className="p-4 md:p-5">
                                <div className="grid grid-cols-2 gap-2">
                                    {TT_FEATURES.map((feat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.05 + i * 0.03 }}
                                            className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100/80 dark:border-zinc-700/30 group hover:border-amber-500/20 transition-all cursor-default"
                                        >
                                            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center transition-colors group-hover:bg-amber-500/15">
                                                <feat.icon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">{feat.label}</span>
                                        </motion.div>
                                    ))}
                                </div>



                                <p className="text-center text-[9px] text-gray-400 dark:text-zinc-600 mt-4 font-medium uppercase tracking-[0.05em]">
                                    One App • Infinite Potential
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
