'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, Sparkles, DollarSign, GraduationCap, Layers } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────────

interface FeatureRow {
    feature: string;
    us: string;
    them: string | null;
    themPartial?: boolean;
}

interface ComparisonSet {
    label: string;
    tool1: { name: string; abbr: string; };
    tool2: { name: string; abbr: string; };
    features: FeatureRow[];
}

const COMPARISONS: Record<string, ComparisonSet> = {
    'chatgpt-notion': {
        label: 'ChatGPT + Notion',
        tool1: { name: 'ChatGPT', abbr: 'C' },
        tool2: { name: 'Notion', abbr: 'N' },
        features: [
            { feature: 'Price', us: 'Free. Forever. No catch.', them: '$30+/mo for ChatGPT Plus + Notion', themPartial: false },
            { feature: 'Setup Time', us: 'Ready in under 2 minutes', them: 'Hours configuring Notion templates', themPartial: true },
            { feature: 'AI Tutor', us: 'Socratic tutor that teaches, not tells', them: 'Gives you the answer outright', themPartial: true },
            { feature: 'Assignment Tracking', us: 'Auto-prioritized with smart alerts', them: 'Manual entry, no intelligence', themPartial: true },
            { feature: 'Flashcards & Quizzes', us: 'AI-generated from any topic instantly', them: null },
            { feature: '@Commands', us: '7 built-in commands for every workflow', them: null },
            { feature: 'Calendar Sync', us: 'Classes auto-populate your schedule', them: null },
            { feature: 'Grade Calculator', us: 'Weighted averages from PowerSchool', them: null },
            { feature: 'Study Groups', us: 'Built-in group chats per class', them: null },
            { feature: 'Stress Support', us: 'Private AI therapist for school anxiety', them: null },
            { feature: 'Discussion Boards', us: 'Ask peers for help in seconds', them: null },
            { feature: 'Learning Games', us: 'Gamified study breaks built in', them: null },
        ]
    },
    'gemini-google': {
        label: 'Gemini + Google Tasks',
        tool1: { name: 'Gemini', abbr: 'G' },
        tool2: { name: 'Google Tasks', abbr: 'GT' },
        features: [
            { feature: 'Price', us: 'Free. Forever. No catch.', them: '$20/mo for Gemini Advanced', themPartial: false },
            { feature: 'Built for Students', us: 'Every feature designed for school', them: 'General-purpose productivity', themPartial: true },
            { feature: 'AI Tutor', us: 'Socratic tutor that teaches, not tells', them: 'General AI — you prompt, you hope', themPartial: true },
            { feature: 'Assignment Tracking', us: 'Auto-prioritized with smart alerts', them: 'Plain checkbox lists', themPartial: true },
            { feature: 'Flashcards & Quizzes', us: 'AI-generated from any topic instantly', them: null },
            { feature: '@Commands', us: '7 built-in commands for every workflow', them: null },
            { feature: 'Calendar Sync', us: 'Classes auto-populate your schedule', them: 'Only syncs with Google Calendar', themPartial: true },
            { feature: 'Grade Calculator', us: 'Weighted averages from PowerSchool', them: null },
            { feature: 'Study Groups', us: 'Built-in group chats per class', them: null },
            { feature: 'Stress Support', us: 'Private AI therapist for school anxiety', them: null },
            { feature: 'Discussion Boards', us: 'Ask peers for help in seconds', them: null },
            { feature: 'Learning Games', us: 'Gamified study breaks built in', them: null },
        ]
    }
};

// ─── Component ───────────────────────────────────────────────────────────────────

interface ComparisonSectionProps {
    comparisonSet: 'chatgpt-notion' | 'gemini-google';
    onComparisonSetChange: (set: 'chatgpt-notion' | 'gemini-google') => void;
}

export default function ComparisonSection({ comparisonSet, onComparisonSetChange }: ComparisonSectionProps) {
    const data = COMPARISONS[comparisonSet];
    const [showAll, setShowAll] = useState(false);

    const visibleFeatures = showAll ? data.features : data.features.slice(0, 6);
    const hasMore = data.features.length > 6;

    const usWins = data.features.filter(f => !f.them || !f.themPartial).length;

    return (
        <section className="bg-[#f5f9fc] dark:bg-gray-950 py-20 md:py-28">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                        The Comparison
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight mb-4 leading-relaxed">
                        Why not just use{' '}
                        <span className="inline-flex overflow-hidden align-baseline">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={comparisonSet}
                                    initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: -24, opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                                >
                                    {data.label}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        ?
                    </h2>
                    <p className="text-base md:text-lg text-[#275085]/60 dark:text-[#4a9cdb]/60 font-medium max-w-2xl mx-auto leading-relaxed">
                        We love those tools too. But they weren&apos;t built for students.
                    </p>
                </motion.div>

                {/* ── Switcher ────────────────────────────────────────────── */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center bg-[#F1F6D1]/60 dark:bg-zinc-800/50 rounded-full p-1 border border-[#275085]/8 dark:border-[#4a9cdb]/10">
                        {Object.entries(COMPARISONS).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => onComparisonSetChange(key as 'chatgpt-notion' | 'gemini-google')}
                                className={`
                                    relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 z-10
                                    ${comparisonSet === key
                                        ? 'text-[#275085] dark:text-[#4a9cdb]'
                                        : 'text-[#275085]/40 dark:text-[#4a9cdb]/40 hover:text-[#275085]/70 dark:hover:text-[#4a9cdb]/70'
                                    }
                                `}
                            >
                                {comparisonSet === key && (
                                    <motion.div
                                        layoutId="comparison-switcher-pill"
                                        className="absolute inset-0 bg-[#fff8fa] dark:bg-zinc-800 rounded-full shadow-sm"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{val.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Comparison Table ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="overflow-hidden"
                >
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] border-b-2 border-[#275085]/10 dark:border-[#4a9cdb]/10">
                        <div className="px-5 py-4 md:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/40 dark:text-[#4a9cdb]/40">Feature</span>
                        </div>
                        <div className="px-4 py-4 md:px-5">
                            <div className="flex items-center gap-1.5">
                                <img src="/TaskTornado.svg" alt="TaskTornado" className="w-4 h-4 dark:hidden" />
                                <img src="/TaskTornadoDark.svg" alt="TaskTornado" className="w-4 h-4 hidden dark:block" />
                                <span className="text-xs font-bold text-[#275085] dark:text-[#4a9cdb]">TaskTornado</span>
                            </div>
                        </div>
                        <div className="px-4 py-4 md:px-5">
                            <span className="text-xs font-bold text-[#275085]/50 dark:text-[#4a9cdb]/50">{data.label}</span>
                        </div>
                    </div>

                    {/* Rows */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={comparisonSet}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {visibleFeatures.map((row, i) => (
                                <motion.div
                                    key={`${comparisonSet}-${row.feature}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`
                                        grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr]
                                        ${i !== visibleFeatures.length - 1 ? 'border-b border-[#275085]/5 dark:border-[#4a9cdb]/5' : ''}
                                    `}
                                >
                                    {/* Feature name */}
                                    <div className="px-5 py-3.5 md:px-6 flex items-center">
                                        <span className="text-sm font-medium text-[#275085] dark:text-[#4a9cdb]">{row.feature}</span>
                                    </div>

                                    {/* TaskTornado */}
                                    <div className="px-4 py-3.5 md:px-5 flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full bg-[#8bc34a] flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-xs text-[#275085]/65 dark:text-[#4a9cdb]/65 leading-relaxed">{row.us}</span>
                                    </div>

                                    {/* Competitor */}
                                    <div className="px-4 py-3.5 md:px-5 flex items-start gap-2">
                                        {row.them ? (
                                            <>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${row.themPartial ? 'bg-amber-400' : 'bg-[#275085]/12 dark:bg-[#4a9cdb]/12'}`}>
                                                    {row.themPartial
                                                        ? <span className="text-[8px] font-bold text-white">~</span>
                                                        : <X className="w-2.5 h-2.5 text-[#275085]/35 dark:text-[#4a9cdb]/35" strokeWidth={3} />
                                                    }
                                                </div>
                                                <span className="text-xs text-[#275085]/40 dark:text-[#4a9cdb]/40 leading-relaxed">{row.them}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 rounded-full bg-[#275085]/8 dark:bg-[#4a9cdb]/8 flex items-center justify-center shrink-0 mt-0.5">
                                                    <X className="w-2.5 h-2.5 text-[#275085]/25 dark:text-[#4a9cdb]/25" strokeWidth={3} />
                                                </div>
                                                <span className="text-xs text-[#275085]/30 dark:text-[#4a9cdb]/30 leading-relaxed">Not available</span>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Show more / less */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-3.5 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8 flex items-center justify-center gap-1.5 text-xs font-bold text-[#275085]/50 dark:text-[#4a9cdb]/50 hover:text-[#275085] dark:hover:text-[#4a9cdb] transition-colors"
                        >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
                            {showAll ? 'Show less' : `Show ${data.features.length - 6} more features`}
                        </button>
                    )}
                </motion.div>

                {/* ── Score strip ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
                >
                    <div className="flex items-center gap-2 text-sm text-[#275085]/60 dark:text-[#4a9cdb]/60">
                        <div className="w-5 h-5 rounded-full bg-[#8bc34a] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span>TaskTornado leads in <span className="font-bold text-[#275085] dark:text-[#4a9cdb]">{usWins} of {data.features.length}</span> categories</span>
                    </div>
                </motion.div>

                {/* ── Bottom summary ──────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="mt-12 text-center"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-[#275085] dark:text-[#4a9cdb] mb-3">
                        The best of both worlds, built for students
                    </h3>
                    <p className="text-sm text-[#275085]/55 dark:text-[#4a9cdb]/55 max-w-2xl mx-auto leading-relaxed mb-8">
                        We combined {data.tool1.name}&apos;s AI power with {data.tool2.name}&apos;s organization, then added student-specific features like deadline tracking, flashcard systems, and stress support. All in one place, all completely free.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { icon: <DollarSign className="w-3.5 h-3.5" />, text: 'No subscription fees' },
                            { icon: <GraduationCap className="w-3.5 h-3.5" />, text: 'Student-focused design' },
                            { icon: <Layers className="w-3.5 h-3.5" />, text: 'Everything in one place' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 py-2 bg-[#ebf6b5]/60 dark:bg-[#275085]/15 rounded-full text-sm font-medium text-[#275085] dark:text-[#4a9cdb]"
                            >
                                <span>{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// Re-export the data shape for LandingClient
export { COMPARISONS as comparisonData };
