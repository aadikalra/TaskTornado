'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, DollarSign, GraduationCap, Layers } from 'lucide-react';

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
            { feature: 'Assignment Tracking', us: 'Due dates, priorities, and completion tracking', them: 'Manual entry, no intelligence', themPartial: true },
            { feature: 'Flashcards & Quizzes', us: 'AI-generated from any topic instantly', them: null },
            { feature: '@Commands', us: '7 built-in commands for every workflow', them: null },
            { feature: 'Calendar Sync', us: 'Assignments and tests appear in your calendar', them: null },
            { feature: 'Grade Calculator', us: 'Weighted grades from scores you enter', them: null },
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
            { feature: 'Assignment Tracking', us: 'Due dates, priorities, and completion tracking', them: 'Plain checkbox lists', themPartial: true },
            { feature: 'Flashcards & Quizzes', us: 'AI-generated from any topic instantly', them: null },
            { feature: '@Commands', us: '7 built-in commands for every workflow', them: null },
            { feature: 'Calendar Sync', us: 'Assignments and tests appear in your calendar', them: 'Only syncs with Google Calendar', themPartial: true },
            { feature: 'Grade Calculator', us: 'Weighted grades from scores you enter', them: null },
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
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                        The Comparison
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight mb-4 leading-relaxed">
                        Why not just use{' '}
                        <span className="inline-flex overflow-hidden align-baseline">
                            <span key={comparisonSet}>{data.label}</span>
                        </span>
                        ?
                    </h2>
                    <p className="text-base md:text-lg text-[#275085]/85 dark:text-[#8cc8f5] font-medium max-w-2xl mx-auto leading-relaxed">
                        We love those tools too. But they weren&apos;t built for students.
                    </p>
                </div>

                {/* ── Switcher ────────────────────────────────────────────── */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center bg-[#F1F6D1]/60 dark:bg-zinc-800/70 rounded-full p-1 border border-[#275085]/8 dark:border-[#4a9cdb]/15">
                        {Object.entries(COMPARISONS).map(([key, val]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onComparisonSetChange(key as 'chatgpt-notion' | 'gemini-google')}
                                className={`
                                    relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 z-10
                                    ${comparisonSet === key
                                        ? 'bg-[#fff8fa] dark:bg-zinc-900 shadow-sm text-[#275085] dark:text-[#8cc8f5]'
                                        : 'text-[#275085]/80 dark:text-slate-300 hover:text-[#275085] dark:hover:text-white'
                                    }
                                `}
                            >
                                <span className="relative z-10">{val.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Comparison Table ─────────────────────────────────────── */}
                <div className="overflow-hidden">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] border-b-2 border-[#275085]/10 dark:border-[#4a9cdb]/10">
                        <div className="px-5 py-4 md:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/80 dark:text-[#8cc8f5]">Feature</span>
                        </div>
                        <div className="px-4 py-4 md:px-5">
                            <div className="flex items-center gap-1.5">
                                <img src="/logo-light.webp" alt="" width={16} height={16} loading="lazy" className="w-4 h-4 dark:hidden" />
                                <img src="/logo-dark.webp" alt="" width={16} height={16} loading="lazy" className="w-4 h-4 hidden dark:block" />
                                <span className="text-xs font-bold text-[#275085] dark:text-[#8cc8f5]">TaskTornado</span>
                            </div>
                        </div>
                        <div className="px-4 py-4 md:px-5">
                            <span className="text-xs font-bold text-[#275085]/80 dark:text-slate-300">{data.label}</span>
                        </div>
                    </div>

                    {/* Rows */}
                    <div key={comparisonSet}>
                        {visibleFeatures.map((row, i) => (
                            <div
                                key={`${comparisonSet}-${row.feature}`}
                                className={`
                                    grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr]
                                    ${i !== visibleFeatures.length - 1 ? 'border-b border-[#275085]/5 dark:border-[#4a9cdb]/5' : ''}
                                `}
                            >
                                {/* Feature name */}
                                <div className="px-5 py-3.5 md:px-6 flex items-center">
                                    <span className="text-sm font-medium text-[#275085] dark:text-[#8cc8f5]">{row.feature}</span>
                                </div>

                                {/* TaskTornado */}
                                <div className="px-4 py-3.5 md:px-5 flex items-start gap-2">
                                    <div className="w-4 h-4 rounded-full bg-[#689f38] flex items-center justify-center shrink-0 mt-0.5">
                                        <Check aria-hidden="true" className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-xs text-[#275085]/85 dark:text-[#a6d4f7] leading-relaxed">{row.us}</span>
                                </div>

                                {/* Competitor */}
                                <div className="px-4 py-3.5 md:px-5 flex items-start gap-2">
                                    {row.them ? (
                                        <>
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${row.themPartial ? 'bg-amber-600' : 'bg-[#275085]/15 dark:bg-[#4a9cdb]/20'}`}>
                                                {row.themPartial
                                                    ? <span className="text-[8px] font-bold text-white" aria-hidden="true">~</span>
                                                    : <X aria-hidden="true" className="w-2.5 h-2.5 text-[#275085]/70 dark:text-slate-300" strokeWidth={3} />
                                                }
                                            </div>
                                            <span className="text-xs text-[#275085]/80 dark:text-slate-300 leading-relaxed">{row.them}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-4 h-4 rounded-full bg-[#275085]/10 dark:bg-[#4a9cdb]/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <X aria-hidden="true" className="w-2.5 h-2.5 text-[#275085]/70 dark:text-slate-300" strokeWidth={3} />
                                            </div>
                                            <span className="text-xs text-[#275085]/85 dark:text-slate-300 leading-relaxed">Not available</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show more / less */}
                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-3.5 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8 flex items-center justify-center gap-1.5 text-xs font-bold text-[#275085]/80 dark:text-[#8cc8f5] hover:text-[#275085] dark:hover:text-white transition-colors"
                        >
                            <ChevronDown aria-hidden="true" className={`w-3.5 h-3.5 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
                            {showAll ? 'Show less' : `Show ${data.features.length - 6} more features`}
                        </button>
                    )}
                </div>

                {/* ── Score strip ──────────────────────────────────────────── */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2 text-sm text-[#275085]/85 dark:text-[#8cc8f5]">
                        <div className="w-5 h-5 rounded-full bg-[#689f38] flex items-center justify-center">
                            <Check aria-hidden="true" className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span>TaskTornado leads in <span className="font-bold text-[#275085] dark:text-[#b4dbf9]">{usWins} of {data.features.length}</span> categories</span>
                    </div>
                </div>

                {/* ── Bottom summary ──────────────────────────────────────── */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-[#275085] dark:text-[#8cc8f5] mb-3">
                        The best of both worlds, built for students
                    </h3>
                    <p className="text-sm text-[#275085]/85 dark:text-[#a6d4f7] max-w-2xl mx-auto leading-relaxed mb-8">
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
                </div>
            </div>
        </section>
    );
}

// Re-export the data shape for LandingClient
export { COMPARISONS as comparisonData };
