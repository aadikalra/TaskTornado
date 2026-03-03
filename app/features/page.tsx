'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Brain, Zap, BookOpen, Heart, Sparkles,
    CheckCircle2, Calendar, BarChart3, Languages,
    PenLine, Bookmark, Users, MessageSquare, Gamepad2, GraduationCap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════════════════ */
function FeaturesHero() {
    return (
        <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 bg-[#f8fbfd] dark:bg-[#0a0a0a] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
            </div>
            <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 bg-sky-600/5 dark:bg-sky-400/5 border border-sky-600/10 dark:border-sky-400/10 rounded-full mb-5">
                        Everything Included · Free Forever
                    </span>
                    <h1 className="text-4xl md:text-6xl font-semibold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
                        Built for the way you learn.
                    </h1>
                    <p className="text-base md:text-lg text-sky-900/60 dark:text-sky-400/60 max-w-2xl mx-auto leading-relaxed font-medium">
                        12+ tools designed to help students organize, study, and succeed — all in one place, all completely free.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   1. HOMEWORK TRACKING — Left image, right content
   ═══════════════════════════════════════════════════════════════════════════════ */
function HomeworkSection() {
    return (
        <section className="py-16 md:py-24 bg-[#FCFDF5] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-[#F1F6D1] dark:bg-zinc-900 rounded-[32px] p-8 md:p-10 w-full max-w-md">
                            <div className="space-y-3">
                                {[
                                    { task: 'Read Chapter 7 — Biology', done: true },
                                    { task: 'Math Worksheet pg. 42', done: true },
                                    { task: 'Spanish Essay Draft', done: false },
                                    { task: 'History DBQ Outline', done: false },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-[#275085]/5 dark:border-zinc-700"
                                    >
                                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${item.done ? 'text-green-500' : 'text-[#275085]/20 dark:text-zinc-600'}`} />
                                        <span className={`text-sm font-medium ${item.done ? 'text-[#275085]/40 dark:text-zinc-500 line-through' : 'text-[#275085] dark:text-white'}`}>
                                            {item.task}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                            Homework
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] mb-5">
                            Never miss a deadline again.
                        </h2>
                        <p className="text-base text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed mb-6 max-w-lg">
                            Add assignments with due dates, priorities, and tags. Pin what matters, archive what&apos;s done, and see exactly what&apos;s left at a glance.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Due dates', 'Priorities', 'Pinning', 'Tags', 'Archiving'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-[#275085] dark:text-[#4a9cdb] bg-[#ebf6b5]/60 dark:bg-[#275085]/20 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   2. SMART CALENDAR — Centered with image
   ═══════════════════════════════════════════════════════════════════════════════ */
function CalendarSection() {
    return (
        <section className="py-16 md:py-24 bg-[#fffaf4] dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 bg-amber-600/5 dark:bg-amber-400/5 border border-amber-600/10 dark:border-amber-400/10 rounded-full mb-4">
                        Calendar
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-amber-500 dark:text-amber-400 tracking-tight leading-[1.15] mb-4">
                        Your week, at a glance.
                    </h2>
                    <p className="text-base md:text-lg text-amber-900/60 dark:text-amber-400/60 font-medium max-w-lg mx-auto leading-relaxed">
                        Assignments, tests, and events sync automatically across all your classes. See the big picture on a single screen.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                >
                    <div className="bg-white/70 dark:bg-zinc-900 border border-amber-100 dark:border-zinc-800 rounded-[32px] p-6 md:p-10 max-w-2xl w-full shadow-lg shadow-amber-100/50 dark:shadow-black/20">
                        <Image src="/calendarCard.png" alt="Smart Calendar" width={600} height={400} className="w-full h-auto object-contain rounded-2xl" />
                    </div>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {['Auto-sync', 'Test dates', 'Daily view', 'Weekly view', 'Reminders'].map((pill) => (
                        <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 rounded-full">{pill}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   3. AURORA AI — Right image, left content
   ═══════════════════════════════════════════════════════════════════════════════ */
function AuroraSection() {
    return (
        <section className="bg-rose-50 dark:bg-gray-950 py-16 md:py-24 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600 dark:text-rose-400 bg-rose-600/5 dark:bg-rose-400/5 border border-rose-600/10 dark:border-rose-400/10 rounded-full mb-4">
                            Meet Aurora
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-rose-500 dark:text-rose-400 tracking-tight leading-[1.15] mb-5">
                            Your AI study partner that actually gets school.
                        </h2>
                        <p className="text-base text-rose-900/60 dark:text-rose-400/60 leading-relaxed mb-8 max-w-lg">
                            Aurora teaches, organizes, quizzes, and supports you — all from one conversation. Socratic-style, so you actually learn.
                        </p>

                        <div className="space-y-3">
                            {[
                                { icon: Brain, label: 'Socratic Method', desc: 'Guides you step-by-step, never gives answers' },
                                { icon: Zap, label: '7 @Commands', desc: 'One shortcut for every workflow' },
                                { icon: BookOpen, label: 'Instant Flashcards', desc: 'AI-generated from any topic' },
                                { icon: Heart, label: 'Stress Support', desc: 'A safe space when school gets heavy' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.06 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-400/10 flex items-center justify-center shrink-0">
                                        <item.icon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{item.label}</span>
                                        <span className="text-xs text-rose-900/40 dark:text-rose-400/40 ml-2">{item.desc}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <Image src="/aurora-wellbeing.png" alt="Aurora AI" width={480} height={480} className="w-full max-w-[420px] h-auto object-contain drop-shadow-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   4. GRADE CALCULATOR — Right content, left image
   ═══════════════════════════════════════════════════════════════════════════════ */
function GradesSection() {
    return (
        <section className="py-16 md:py-24 bg-[#f5fdf5] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-white/70 dark:bg-zinc-900 border border-green-100 dark:border-zinc-800 rounded-[32px] p-8 w-full max-w-sm shadow-lg shadow-green-100/50 dark:shadow-black/20">
                            <Image src="/grade-calculator.png" alt="Grade Calculator" width={300} height={240} className="w-full h-auto object-contain" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-green-600 dark:text-green-400 bg-green-600/5 dark:bg-green-400/5 border border-green-600/10 dark:border-green-400/10 rounded-full mb-4">
                            Grades
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-green-600 dark:text-green-400 tracking-tight leading-[1.15] mb-5">
                            Know exactly where you stand.
                        </h2>
                        <p className="text-base text-green-900/60 dark:text-green-400/60 leading-relaxed mb-6 max-w-lg">
                            Weighted grade breakdowns by category. See what you need on your next assignment to hit your target GPA. No more guessing.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Weighted averages', 'What-if calculator', 'By category', 'Target grades'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100/60 dark:bg-green-500/10 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   5. FLASHCARDS & QUIZZES — Centered with cards
   ═══════════════════════════════════════════════════════════════════════════════ */
function FlashcardsSection() {
    return (
        <section className="py-16 md:py-24 bg-[#f5f0ff] dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-400 bg-violet-600/5 dark:bg-violet-400/5 border border-violet-600/10 dark:border-violet-400/10 rounded-full mb-4">
                        Study Tools
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-violet-500 dark:text-violet-400 tracking-tight leading-[1.15] mb-4">
                        Flashcards & quizzes, instantly.
                    </h2>
                    <p className="text-base md:text-lg text-violet-900/60 dark:text-violet-400/60 font-medium max-w-lg mx-auto leading-relaxed">
                        Create decks by hand or let AI generate them from any topic. Quiz yourself with instant feedback and spaced repetition.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/70 dark:bg-zinc-900 border border-violet-100 dark:border-zinc-800 rounded-[28px] p-8"
                    >
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/15 rounded-2xl flex items-center justify-center mb-5">
                            <Image src="/flashcards.png" alt="Flashcards" width={24} height={24} className="object-contain" />
                        </div>
                        <h3 className="text-xl font-bold text-violet-600 dark:text-violet-400 mb-2">Flashcards</h3>
                        <p className="text-sm text-violet-900/50 dark:text-violet-400/40 leading-relaxed">
                            Create unlimited decks organized by class. Flip through them in study mode or let AI generate them from your notes with a single @command.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 dark:bg-zinc-900 border border-violet-100 dark:border-zinc-800 rounded-[28px] p-8"
                    >
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/15 rounded-2xl flex items-center justify-center mb-5">
                            <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-violet-600 dark:text-violet-400 mb-2">AI Quizzes</h3>
                        <p className="text-sm text-violet-900/50 dark:text-violet-400/40 leading-relaxed">
                            Generate practice quizzes on any topic instantly. Multiple choice, true/false, and short answer — with explanations for every answer.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {['AI-generated', 'By class', 'Spaced repetition', 'Instant feedback', '@quiz command'].map((pill) => (
                        <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-500/10 rounded-full">{pill}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   6. TRANSLATION — Left content, right image
   ═══════════════════════════════════════════════════════════════════════════════ */
function TranslateSection() {
    return (
        <section className="py-16 md:py-24 bg-[#f0f9ff] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 bg-sky-600/5 dark:bg-sky-400/5 border border-sky-600/10 dark:border-sky-400/10 rounded-full mb-4">
                            Translation
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.15] mb-5">
                            55+ languages, zero switching.
                        </h2>
                        <p className="text-base text-sky-900/60 dark:text-sky-400/60 leading-relaxed mb-6 max-w-lg">
                            Translate text instantly without leaving TaskTornado. Perfect for language classes, foreign vocab, or understanding source material.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['55+ languages', 'Instant', 'In-app', 'Auto-detect'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100/60 dark:bg-sky-500/10 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-white/70 dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-[32px] p-8 w-full max-w-sm shadow-lg shadow-sky-100/50 dark:shadow-black/20">
                            <Image src="/translation-graphic.png" alt="Translation" width={300} height={240} className="w-full h-auto object-contain" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   7. WRITING ASSIST — Right content, left illustration
   ═══════════════════════════════════════════════════════════════════════════════ */
function WritingSection() {
    return (
        <section className="py-16 md:py-24 bg-[#fef9f0] dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-orange-50/70 dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 rounded-[32px] p-8 w-full max-w-sm shadow-lg shadow-orange-100/50 dark:shadow-black/20">
                            <Image src="/penPaper.png" alt="Writing Assist" width={200} height={200} className="w-2/3 mx-auto h-auto object-contain drop-shadow-lg" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-orange-600 dark:text-orange-400 bg-orange-600/5 dark:bg-orange-400/5 border border-orange-600/10 dark:border-orange-400/10 rounded-full mb-4">
                            Writing
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-orange-500 dark:text-orange-400 tracking-tight leading-[1.15] mb-5">
                            Write better, faster.
                        </h2>
                        <p className="text-base text-orange-900/60 dark:text-orange-400/60 leading-relaxed mb-6 max-w-lg">
                            AI-powered writing tools that help with essays, reports, and creative writing. Get grammar checks, rephrasing suggestions, and structure feedback — without doing the work for you.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Grammar', 'Rephrasing', 'Structure', 'Tone check', 'Socratic feedback'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-500/10 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   8. SMART WEB SAVES — Centered
   ═══════════════════════════════════════════════════════════════════════════════ */
function WebSavesSection() {
    return (
        <section className="py-16 md:py-24 bg-[#f0fdf4] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 bg-teal-600/5 dark:bg-teal-400/5 border border-teal-600/10 dark:border-teal-400/10 rounded-full mb-4">
                            Links
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-teal-500 dark:text-teal-400 tracking-tight leading-[1.15] mb-5">
                            Save it, find it, use it.
                        </h2>
                        <p className="text-base text-teal-900/60 dark:text-teal-400/60 leading-relaxed mb-6 max-w-lg">
                            Save links for research, assignments, or later reading. Organized by class with autocomplete for popular educational sites like Khan Academy, Desmos, and more.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['By class', 'Autocomplete', 'Quick save', '100+ sites'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-500/10 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-white/70 dark:bg-zinc-900 border border-teal-100 dark:border-zinc-800 rounded-[32px] p-8 w-full max-w-sm shadow-lg shadow-teal-100/50 dark:shadow-black/20">
                            <Image src="/lightbulb.png" alt="Smart Saves" width={200} height={200} className="w-2/3 mx-auto h-auto object-contain drop-shadow-lg" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   9. STUDY GROUPS — Wide card like Collaboration tile
   ═══════════════════════════════════════════════════════════════════════════════ */
function StudyGroupsSection() {
    return (
        <section className="py-16 md:py-24 bg-[#fffaf4] dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 bg-sky-600/5 dark:bg-sky-400/5 border border-sky-600/10 dark:border-sky-400/10 rounded-full mb-4">
                        Collaboration
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.15] mb-4">
                        Better together.
                    </h2>
                    <p className="text-base md:text-lg text-sky-900/60 dark:text-sky-400/60 font-medium max-w-lg mx-auto leading-relaxed">
                        Create dedicated channels for each class. Share notes, discuss assignments, and learn from each other.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[28px] p-8"
                    >
                        <div className="w-12 h-12 bg-sky-100 dark:bg-sky-500/15 rounded-2xl flex items-center justify-center mb-5">
                            <Users className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 mb-2">Study Groups</h3>
                        <p className="text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed mb-4">
                            Real-time group chats organized by class. Share resources, ask questions, and collaborate on projects.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Real-time', 'By class', 'Share files'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[28px] p-8"
                    >
                        <div className="w-12 h-12 bg-sky-100 dark:bg-sky-500/15 rounded-2xl flex items-center justify-center mb-5">
                            <MessageSquare className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 mb-2">Discussion Boards</h3>
                        <p className="text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed mb-4">
                            Public forums for academic topics. Post questions, share insights, upvote helpful answers, and learn from the community.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Public', 'Topic-based', 'Community'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="mt-5 max-w-4xl mx-auto"
                >
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 leading-tight mb-2">Study together, anywhere</h3>
                            <p className="text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed">
                                Whether it&rsquo;s a late-night study session or a quick question before class, your study group is always just a tap away.
                            </p>
                        </div>
                        <div className="w-full md:w-[240px] shrink-0">
                            <Image src="/study-together.png" alt="Study together" width={480} height={300} className="w-full h-auto object-contain drop-shadow-sm" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   10. PROGRESS TRACKING — Right image, left content
   ═══════════════════════════════════════════════════════════════════════════════ */
function ProgressSection() {
    return (
        <section className="py-16 md:py-24 bg-[#f0f4ff] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-600/10 dark:border-indigo-400/10 rounded-full mb-4">
                            Progress
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-indigo-500 dark:text-indigo-400 tracking-tight leading-[1.15] mb-5">
                            See how far you&apos;ve come.
                        </h2>
                        <p className="text-base text-indigo-900/60 dark:text-indigo-400/60 leading-relaxed mb-6 max-w-lg">
                            Visualize your academic growth with deep insights into grades, completion rates, and study streaks. Celebrate the wins, spot the gaps.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Completion rates', 'Streaks', 'Grade trends', 'Visual insights'].map((pill) => (
                                <span key={pill} className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-500/10 rounded-full">{pill}</span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="bg-white/70 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-[32px] p-8 w-full max-w-sm shadow-lg shadow-indigo-100/50 dark:shadow-black/20">
                            <Image src="/progressCard.png" alt="Progress Tracking" width={300} height={240} className="w-full h-auto object-contain" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   11. STUDY BREAK GAMES — Centered with 3 cards
   ═══════════════════════════════════════════════════════════════════════════════ */
function GamesSection() {
    return (
        <section className="py-16 md:py-24 bg-[#faf5ff] dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-600/5 dark:bg-fuchsia-400/5 border border-fuchsia-600/10 dark:border-fuchsia-400/10 rounded-full mb-4">
                        Study Breaks
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-fuchsia-500 dark:text-fuchsia-400 tracking-tight leading-[1.15] mb-4">
                        Earn your play time.
                    </h2>
                    <p className="text-base md:text-lg text-fuchsia-900/60 dark:text-fuchsia-400/60 font-medium max-w-lg mx-auto leading-relaxed">
                        Stay on top of homework and unlock brain-training games as a reward.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                    {[
                        { title: 'Task Tower', desc: 'Build the tallest tower by completing assignments. Each done homework adds a block to your tower.', color: 'bg-fuchsia-100 dark:bg-fuchsia-500/15' },
                        { title: 'Snake Classic', desc: 'The retro classic, earned by staying organized. A quick brain break between study sessions.', color: 'bg-purple-100 dark:bg-purple-500/15' },
                        { title: 'More Coming', desc: 'We\'re building new games regularly. Each one designed to reward consistent academic effort.', color: 'bg-pink-100 dark:bg-pink-500/15' },
                    ].map((game, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/70 dark:bg-zinc-900 border border-fuchsia-100 dark:border-zinc-800 rounded-[28px] p-8 text-center hover:shadow-lg hover:shadow-fuchsia-100/50 dark:hover:shadow-black/20 transition-all"
                        >
                            <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                                <Gamepad2 className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                            </div>
                            <h3 className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-400 mb-2">{game.title}</h3>
                            <p className="text-sm text-fuchsia-900/50 dark:text-fuchsia-400/40 leading-relaxed">{game.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   12. ONBOARDING — Left content, right image
   ═══════════════════════════════════════════════════════════════════════════════ */
function OnboardingSection() {
    return (
        <section className="py-16 md:py-24 bg-[#FCFDF5] dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="bg-[#F1F6D1] dark:bg-zinc-900 rounded-[40px] md:rounded-[56px] p-8 md:p-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                                Setup
                            </span>
                            <h2 className="text-3xl md:text-4xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] mb-5">
                                30 seconds to ready.
                            </h2>
                            <p className="text-base text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed mb-6">
                                Tell us your grade, pick your classes, and go. TaskTornado configures itself to your exact schedule and course load — no setup guides, no configuration rabbit holes.
                            </p>
                            <div className="space-y-3">
                                {[
                                    'Pick your grade level',
                                    'Select your classes and language level',
                                    'Choose your electives',
                                    'Start organizing immediately',
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + i * 0.08 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-6 h-6 bg-[#275085]/10 dark:bg-[#4a9cdb]/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-[#275085] dark:text-[#4a9cdb]">{i + 1}</span>
                                        </div>
                                        <span className="text-sm font-medium text-[#275085]/80 dark:text-[#4a9cdb]/80">{step}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex justify-center"
                        >
                            <Image src="/signup-hero.png" alt="Quick setup" width={400} height={400} className="w-full max-w-[360px] h-auto object-contain drop-shadow-xl" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
    return (
        <section className="py-20 md:py-28 bg-[#f8fbfd] dark:bg-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-semibold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.15] mb-4 max-w-2xl mx-auto">
                        Ready to try all of this?
                    </h2>
                    <p className="text-base md:text-lg text-sky-900/60 dark:text-sky-400/60 max-w-lg mx-auto leading-relaxed font-medium mb-8">
                        Sign up in 30 seconds. Free forever, no credit card needed. Every feature from day one.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2.5 bg-[#275085] dark:bg-sky-500 text-white px-8 py-4 rounded-full text-base font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-[#275085]/20"
                    >
                        Get Started Free
                        <Sparkles className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE COMPOSITION
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function FeaturesPage() {
    return (
        <>
            <FeaturesHero />
            <HomeworkSection />
            <CalendarSection />
            <AuroraSection />
            <GradesSection />
            <FlashcardsSection />
            <TranslateSection />
            <WritingSection />
            <WebSavesSection />
            <StudyGroupsSection />
            <ProgressSection />
            <GamesSection />
            <OnboardingSection />
            <FinalCTA />
        </>
    );
}
