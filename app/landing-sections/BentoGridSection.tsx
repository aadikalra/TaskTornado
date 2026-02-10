'use client';

import { motion } from 'framer-motion';
import { Brain, UserRound, Image as ImageIcon, BookOpen, Users, MessageSquare, Languages, ArrowRightLeft, Calculator, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { AuroraDemo } from '@/components/AuroraDemo';
import { GroupChatDemo } from '@/components/GroupChatDemo';

// ─── Animation helpers ──────────────────────────────────────────────────────────
const cardVariant = (delay: number) => ({
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] } },
});

// ─── Individual Bento Tiles ─────────────────────────────────────────────────────

/** LARGE — Aurora AI Assistant (spans 2 cols, 2 rows) */
function AuroraTile() {
    return (
        <motion.div
            variants={cardVariant(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="
        md:col-span-2 md:row-span-2
        group relative overflow-hidden
        rounded-[28px]
        min-h-[420px] md:min-h-[460px]
      "
        >
            {/* Override AuroraDemo's fixed max-w and h so it fills the bento tile */}
            <div className="w-full h-full [&>div]:max-w-none [&>div]:h-full [&>div]:rounded-[28px]">
                <AuroraDemo />
            </div>
        </motion.div>
    );
}

/** MEDIUM — Commands & Capabilities (1 col, 2 rows) */
function CommandsTile() {
    const commands = [
        { cmd: '@data', ex: 'Workload overview & priorities' },
        { cmd: '@control', ex: 'Mark math as done' },
        { cmd: '@flashcards', ex: 'Create deck for Bio Ch.3' },
        { cmd: '@quiz', ex: 'Generate a practice quiz' },
        { cmd: '@resources', ex: 'Find calculus problems' },
        { cmd: '@therapist', ex: 'Stress support & venting' },
        { cmd: '@grade', ex: 'Evaluate my draft' },
    ];

    return (
        <motion.div
            variants={cardVariant(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="
        md:row-span-2
        group relative overflow-hidden
        bg-white dark:bg-zinc-900
        border border-gray-200 dark:border-zinc-800
        rounded-[28px] p-6 md:p-8
        flex flex-col justify-between
        min-h-[300px] md:min-h-[360px]
      "
        >
            <div>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 rounded-full mb-3">
                    Workflow
                </span>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
                    Control everything with @commands
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    Type @ in Aurora to manage homework, generate flashcards, take quizzes, and more.
                </p>
                {/* Model modes badge */}
                <div className="flex items-center gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/30 rounded-full">Quick</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200/60 dark:border-purple-800/30 rounded-full">Deep</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/30 rounded-full">Cloud</span>
                </div>
            </div>

            <div className="space-y-1.5">
                {commands.map((c, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50 rounded-xl px-3.5 py-2 group/cmd hover:border-[#275085]/30 dark:hover:border-[#4a7ba7]/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/15 rounded shrink-0">
                                {c.cmd}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono truncate">{c.ex}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

/** MEDIUM — Collaboration (spans 2 cols, 1 row) */
function CollaborationTile() {
    return (
        <motion.div
            variants={cardVariant(0.15)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="
        md:col-span-2
        group relative overflow-hidden
        bg-white dark:bg-zinc-900
        border border-gray-200 dark:border-zinc-800
        rounded-[28px] p-6 md:p-8
        min-h-[180px]
      "
        >
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* left: text */}
                <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4">
                        Collaboration
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                        Study together, succeed together
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                        Create dedicated channels for each class. Share notes, discuss assignments, and collaborate in real-time — no phone numbers required.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { icon: <Users className="w-3 h-3" />, label: 'Group chats' },
                            { icon: <MessageSquare className="w-3 h-3" />, label: 'Real-time' },
                            { icon: <BookOpen className="w-3 h-3" />, label: 'Share resources' },
                        ].map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 rounded-full">
                                {f.icon}{f.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* right: live demo chat */}
                <div className="w-full md:w-72 shrink-0">
                    <GroupChatDemo className="h-[280px]" />
                </div>
            </div>
        </motion.div>
    );
}

/** SMALL — Grade Calculator (1 col, 1 row) */
function GradesTile() {
    return (
        <motion.div
            variants={cardVariant(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="
        group relative overflow-hidden
        bg-emerald-50/50 dark:bg-emerald-950/20
        border border-emerald-200/60 dark:border-emerald-800/30
        rounded-[28px] p-6 md:p-8
        flex flex-col justify-between
        min-h-[180px]
      "
        >
            <div>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                    Grades
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                    Know exactly where you stand
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Paste your grades from PowerSchool and get an instant weighted average with category breakdowns.
                </p>
            </div>

            {/* mini grade mockup */}
            <div className="mt-5 flex items-end gap-4">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">94.7%</span>
                    <span className="text-[10px] font-medium text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">Weighted</span>
                </div>
                <div className="flex-1 flex items-end gap-1 h-12">
                    {[68, 85, 72, 90, 95, 88, 92].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                            className="flex-1 bg-emerald-400/40 dark:bg-emerald-500/30 rounded-t-sm"
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-zinc-400">
                    <Calculator className="w-3 h-3" />
                    <span>Weighted calculator</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-zinc-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Category breakdown</span>
                </div>
            </div>
        </motion.div>
    );
}

/** SMALL — Translate (1 col, 1 row) */
function TranslateTile() {
    return (
        <motion.div
            variants={cardVariant(0.25)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="
        group relative overflow-hidden
        bg-violet-50/50 dark:bg-violet-950/20
        border border-violet-200/60 dark:border-violet-800/30
        rounded-[28px] p-5
        flex flex-col justify-between
        h-full
      "
        >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                    Translate
                </span>
                <div className="flex items-center gap-1 text-[9px] font-medium text-gray-400 dark:text-zinc-500">
                    <Languages className="w-2.5 h-2.5" />
                    <span>55+ langs</span>
                </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-3">
                AI-powered translation with pronunciation
            </h3>

            {/* Compact stacked translate mockup */}
            <div className="space-y-1.5">
                <div className="bg-white/70 dark:bg-zinc-800/50 border border-violet-100 dark:border-violet-800/30 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs">🇺🇸</span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">Good morning, how are you?</span>
                </div>
                <div className="flex justify-center">
                    <ArrowRightLeft className="w-3 h-3 text-violet-300 dark:text-violet-600" />
                </div>
                <div className="bg-white/70 dark:bg-zinc-800/50 border border-violet-100 dark:border-violet-800/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">🇪🇸</span>
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">Buenos días, ¿cómo estás?</span>
                    </div>
                    <p className="text-[9px] text-violet-500/70 dark:text-violet-400/60 italic mt-0.5 pl-5">bwe·nos dee·as, ko·mo es·tas</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Bento Grid Composition ─────────────────────────────────────────────────────

export default function BentoGridSection() {
    return (
        <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-4">
                        Everything you need
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                        Built for the way you learn
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        AI tutoring, smart commands, group study, grade tracking, and translation — all in one place.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {/* ROW 1+2 — Tutor(2×2) + Commands(1×2) */}
                    <AuroraTile />
                    <CommandsTile />

                    {/* ROW 3 — Grades(1×1) + Collaboration(2×1) */}
                    <GradesTile />
                    <CollaborationTile />

                    {/* ROW 4 (wraps) — Translate takes remaining space */}
                    {/* On mobile these stack; on desktop Translate sits in the remaining col */}
                </div>

                {/* Second row of tiles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-4 md:mt-5">
                    {/* Accent stat tile - Redesigned to reduce white space and height */}
                    <motion.div
                        variants={cardVariant(0.3)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="
              md:col-span-2
              bg-gray-50 dark:bg-zinc-900
              border border-gray-200 dark:border-zinc-800
              rounded-[28px] p-5 md:p-6
              flex flex-col md:flex-row gap-6
            "
                    >
                        <div className="flex-1 flex flex-col justify-center">
                            <span className="inline-block w-fit px-2. py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 rounded-full mb-2">
                                And more…
                            </span>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                Writing assist, flashcards, games, and more
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                                {[
                                    { icon: Sparkles, label: 'AI Writing' },
                                    { icon: BookOpen, label: 'Smart Saves' },
                                    { icon: Brain, label: 'Flashcards' },
                                    { icon: Heart, label: 'Games' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <item.icon className="w-2.5 h-2.5 text-gray-400 dark:text-zinc-500" />
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* stat counter - more compact */}
                        <div className="flex flex-row md:flex-col items-center justify-center px-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-zinc-800 pt-4 md:pt-0 gap-3 md:gap-0">
                            <span className="text-4xl md:text-5xl font-black text-[#275085] dark:text-[#4a7ba7] tabular-nums tracking-tighter">12+</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">tools built in</span>
                        </div>
                    </motion.div>

                    {/* Translate tile - Now on the right */}
                    <div className="md:col-span-1">
                        <TranslateTile />
                    </div>
                </div>
            </div>
        </section>
    );
}
