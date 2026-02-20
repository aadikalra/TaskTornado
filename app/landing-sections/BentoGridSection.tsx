'use client';

import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { GroupChatDemo } from '@/components/GroupChatDemo';

// ─── Animation helpers ──────────────────────────────────────────────────────────
const cardVariant = (delay: number) => ({
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] } },
});

// ─── Individual Bento Tiles ─────────────────────────────────────────────────────

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
        bg-white dark:bg-zinc-800
        rounded-[24px] p-6 md:p-8
        min-h-[180px]
      "
        >
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* left: text */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[#275085] dark:text-[#4a9cdb] leading-tight mb-2">
                        Study together
                    </h3>
                    <p className="text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed mb-5">
                        Create dedicated channels for each class. Share notes and collaborate in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Group chats', 'Real-time', 'Share resources'].map((f, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold text-[#275085] dark:text-[#4a9cdb] bg-[#ebf6b5]/60 dark:bg-[#275085]/20 rounded-full">
                                {f}
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
        bg-white dark:bg-zinc-800
        rounded-[24px] p-6 md:p-8
        flex flex-col justify-between
        min-h-[180px]
      "
        >
            <div>
                <h3 className="text-xl font-bold text-[#275085] dark:text-[#4a9cdb] leading-tight mb-2">
                    Know your stand
                </h3>
                <p className="text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed">
                    Instant weighted averages and category breakdowns for every class.
                </p>
            </div>

            {/* mini grade mockup */}
            <div className="mt-5 flex items-end gap-4">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-[#275085] dark:text-[#4a9cdb] tabular-nums">94.7%</span>
                    <span className="text-[10px] font-bold text-[#275085]/50 dark:text-[#4a9cdb]/50 mt-0.5">Weighted</span>
                </div>
                <div className="flex-1 flex items-end gap-1 h-12">
                    {[68, 85, 72, 90, 95, 88, 92].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                            className="flex-1 bg-[#ebf6b5] dark:bg-[#275085]/30 rounded-t-sm"
                        />
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#275085]/60 dark:text-[#4a9cdb]/60">Weighted calculator</span>
                <span className="text-[10px] font-bold text-[#275085]/60 dark:text-[#4a9cdb]/60">Category breakdown</span>
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
        bg-white dark:bg-zinc-800
        rounded-[24px] p-5
        flex flex-col justify-between
        h-full
      "
        >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <div className="px-2.5 py-1 rounded-full bg-[#ebf6b5]/60 dark:bg-[#275085]/30">
                    <span className="text-[9px] font-bold text-[#275085] dark:text-[#4a9cdb]">55+ langs</span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-[#275085] dark:text-[#4a9cdb] leading-snug mb-3">
                Instant translation
            </h3>

            {/* Compact stacked translate mockup */}
            <div className="space-y-1.5">
                <div className="bg-[#F1F6D1]/50 dark:bg-zinc-700/30 border border-[#275085]/5 dark:border-[#4a9cdb]/10 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs">🇺🇸</span>
                    <span className="text-[10px] text-[#275085]/70 dark:text-[#4a9cdb]/70">Good Morning, how are you?</span>
                </div>
                <div className="flex justify-center">
                    <ArrowRightLeft className="w-3 h-3 text-[#275085]/30 dark:text-[#4a9cdb]/30" />
                </div>
                <div className="bg-[#F1F6D1]/50 dark:bg-zinc-700/30 border border-[#275085]/5 dark:border-[#4a9cdb]/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">🇪🇸</span>
                        <span className="text-[10px] text-[#275085] dark:text-[#4a9cdb] font-medium">Buenos días, ¿cómo estás?</span>
                    </div>
                    <p className="text-[9px] text-[#275085]/50 dark:text-[#4a9cdb]/50 italic mt-0.5 pl-5">bwe·nos dee·as, ko·mo es·tas</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Bento Grid Composition ─────────────────────────────────────────────────────

export default function BentoGridSection({ id }: { id?: string }) {
    return (
        <section id={id} className="py-12 md:py-20 bg-[#fffaf4] dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#4a9cdb]/5 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-6">
                        Everything you need
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-relaxed max-w-2xl mx-auto mb-6">
                        Built for the way you learn
                    </h2>
                    <p className="text-base md:text-lg text-[#275085]/70 dark:text-[#4a9cdb]/70 max-w-2xl mx-auto leading-relaxed font-medium">
                        Focus on what matters with curated tools built for high-performance students.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {/* ROW 1 — Collaboration(2×1) + Grades(1×1) */}
                    <CollaborationTile />
                    <GradesTile />
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
              bg-white dark:bg-zinc-800
              rounded-[24px] p-5 md:p-6
              flex flex-col md:flex-row gap-6
            "
                    >
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-[#275085] dark:text-[#4a9cdb] leading-tight mb-4">
                                Everything else you need
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
                                {[
                                    'AI Writing',
                                    'Smart Saves',
                                    'Flashcards',
                                    'Games'
                                ].map((label, i) => (
                                    <div key={i} className="flex items-center">
                                        <span className="text-[10px] font-bold text-[#275085]/60 dark:text-[#4a9cdb]/60">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* stat counter - more compact */}
                        <div className="flex flex-row md:flex-col items-center justify-center px-6 border-t md:border-t-0 md:border-l border-[#275085]/10 dark:border-[#4a9cdb]/10 pt-4 md:pt-0 gap-3 md:gap-0">
                            <span className="text-4xl md:text-5xl font-black text-[#275085] dark:text-[#4a9cdb] tabular-nums tracking-tighter">12+</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/50 dark:text-[#4a9cdb]/50">tools included</span>
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
