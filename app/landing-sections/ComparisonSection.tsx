'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, Sparkles, DollarSign, GraduationCap, Layers } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────────

interface FeatureRow {
    feature: string;
    us: string;               // short description for TaskTornado
    them: string | null;       // null = they don't have it at all
    themPartial?: boolean;     // true = they kind of have it
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
            { feature: 'Assignment Tracking', us: 'Smart deadline alerts & progress tracking', them: 'Requires manual setup in Notion', themPartial: true },
            { feature: 'AI Study Help', us: 'Built-in Socratic tutor with @commands', them: 'ChatGPT is excellent at Q&A', themPartial: true },
            { feature: 'Calendar Integration', us: 'Auto-syncs with your classes', them: null },
            { feature: 'Flashcard System', us: 'AI-generated decks from any topic', them: null },
            { feature: 'Command Workflow', us: '@data, @quiz, @flashcards, and more', them: null },
            { feature: 'Student-Focused', us: 'Built specifically for students', them: null },
            { feature: 'Pricing', us: 'Completely free, forever', them: '$20/mo ChatGPT Plus + $10/mo Notion' },
            { feature: 'Setup Time', us: 'Under 2 minutes', them: 'Hours of Notion template setup', themPartial: true },
            { feature: 'Discussion Boards', us: 'Ask peers for help instantly', them: null },
            { feature: 'Group Chats', us: 'Integrated group study chats', them: null },
            { feature: 'Web Saves', us: 'Save & organize links', them: 'Notion has a web clipper', themPartial: true },
            { feature: 'Educational Games', us: 'Stress-relief games built in', them: null },
        ]
    },
    'gemini-google': {
        label: 'Gemini + Google Tasks',
        tool1: { name: 'Gemini', abbr: 'G' },
        tool2: { name: 'Google Tasks', abbr: 'GT' },
        features: [
            { feature: 'Assignment Tracking', us: 'Smart deadline alerts & progress tracking', them: 'Basic task lists', themPartial: true },
            { feature: 'AI Study Help', us: 'Built-in Socratic tutor with @commands', them: 'Gemini is a good AI assistant', themPartial: true },
            { feature: 'Calendar Integration', us: 'Auto-syncs with your classes', them: 'Google Calendar sync only', themPartial: true },
            { feature: 'Flashcard System', us: 'AI-generated decks from any topic', them: null },
            { feature: 'Command Workflow', us: '@data, @quiz, @flashcards, and more', them: null },
            { feature: 'Student-Focused', us: 'Built specifically for students', them: null },
            { feature: 'Pricing', us: 'Completely free, forever', them: '$20/mo for Gemini Advanced' },
            { feature: 'Setup Time', us: 'Under 2 minutes', them: '5-10 minutes', themPartial: true },
            { feature: 'Discussion Boards', us: 'Ask peers for help instantly', them: null },
            { feature: 'Group Chats', us: 'Integrated group study chats', them: null },
            { feature: 'Web Saves', us: 'Save & organize links', them: null },
            { feature: 'Educational Games', us: 'Stress-relief games built in', them: null },
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
        <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-4">
                        The Comparison
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
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
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We love those tools too. But they weren&apos;t built for students.
                    </p>
                </motion.div>

                {/* ── Switcher ────────────────────────────────────────────── */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full p-1 border border-gray-200 dark:border-zinc-800">
                        {Object.entries(COMPARISONS).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => onComparisonSetChange(key as 'chatgpt-notion' | 'gemini-google')}
                                className={`
                                    relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 z-10
                                    ${comparisonSet === key
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                                    }
                                `}
                            >
                                {comparisonSet === key && (
                                    <motion.div
                                        layoutId="comparison-switcher-pill"
                                        className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full shadow-sm"
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
                    className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[24px] overflow-hidden"
                >
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] border-b border-gray-200 dark:border-zinc-800">
                        <div className="px-5 py-4 md:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Feature</span>
                        </div>
                        <div className="px-4 py-4 md:px-5 border-l border-gray-200 dark:border-zinc-800 bg-[#275085]/[0.04] dark:bg-[#275085]/[0.06]">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#275085] dark:text-[#4a7ba7]" />
                                <span className="text-xs font-bold text-[#275085] dark:text-[#4a7ba7]">TaskTornado</span>
                            </div>
                        </div>
                        <div className="px-4 py-4 md:px-5 border-l border-gray-200 dark:border-zinc-800">
                            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">{data.label}</span>
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
                                        ${i !== visibleFeatures.length - 1 ? 'border-b border-gray-100 dark:border-zinc-800/60' : ''}
                                    `}
                                >
                                    {/* Feature name */}
                                    <div className="px-5 py-3.5 md:px-6 flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{row.feature}</span>
                                    </div>

                                    {/* TaskTornado (always ✓) */}
                                    <div className="px-4 py-3.5 md:px-5 border-l border-gray-200 dark:border-zinc-800 bg-[#275085]/[0.02] dark:bg-[#275085]/[0.03] flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{row.us}</span>
                                    </div>

                                    {/* Competitor */}
                                    <div className="px-4 py-3.5 md:px-5 border-l border-gray-200 dark:border-zinc-800 flex items-start gap-2">
                                        {row.them ? (
                                            <>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${row.themPartial ? 'bg-amber-400' : 'bg-gray-300 dark:bg-zinc-600'}`}>
                                                    {row.themPartial
                                                        ? <span className="text-[8px] font-bold text-white">~</span>
                                                        : <X className="w-2.5 h-2.5 text-gray-500 dark:text-zinc-400" strokeWidth={3} />
                                                    }
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">{row.them}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                                                    <X className="w-2.5 h-2.5 text-gray-400 dark:text-zinc-500" strokeWidth={3} />
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">Not available</span>
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
                            className="w-full py-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
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
                    className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span>TaskTornado leads in <span className="font-bold text-gray-900 dark:text-white">{usWins} of {data.features.length}</span> categories</span>
                    </div>
                </motion.div>

                {/* ── Bottom CTA card ──────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="mt-10 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[24px] p-8 md:p-10"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                        The best of both worlds, built for students
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 text-center max-w-2xl mx-auto leading-relaxed mb-6">
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
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-zinc-300"
                            >
                                <span className="text-emerald-500">{item.icon}</span>
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
