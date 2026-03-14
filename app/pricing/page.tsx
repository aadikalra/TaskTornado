'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, X, Sparkles, Crown, Users, School, Zap, Brain, Cloud,
    BookOpen, Languages, PenTool, GraduationCap, MessageSquare,
    Globe, Bookmark, ClipboardList, Shield, ChevronDown, ArrowRight,
    Timer, Gamepad2, Calculator, Search, Bell, CalendarDays, HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getFullVersionString } from '@/config/version';

// ─── Types ──────────────────────────────────────────────────────────────────────
type BillingCycle = 'monthly' | 'annual';

interface PlanFeature {
    label: string;
    free: string | boolean;
    pro: string | boolean;
    family: string | boolean;
    icon: React.ReactNode;
    category: string;
}

// ─── Feature Data ───────────────────────────────────────────────────────────────
const FEATURES: PlanFeature[] = [
    // ── Core ──
    { category: 'Core', label: 'Homework entries', free: '20 active', pro: 'Unlimited', family: 'Unlimited', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Test tracking', free: '5 active', pro: 'Unlimited', family: 'Unlimited', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Flashcard storage', free: '20 cards', pro: 'Unlimited', family: 'Unlimited', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Grade calculator', free: true, pro: true, family: true, icon: <Calculator className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Study timer', free: true, pro: 'With analytics', family: 'With analytics', icon: <Timer className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Games', free: true, pro: true, family: true, icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { category: 'Core', label: 'Search', free: true, pro: true, family: true, icon: <Search className="w-3.5 h-3.5" /> },

    // ── AI ──
    { category: 'AI & Intelligence', label: 'Aurora AI — Quick', free: '12/day', pro: '50/day', family: '100/day', icon: <Zap className="w-3.5 h-3.5" /> },
    { category: 'AI & Intelligence', label: 'Aurora AI — Deep', free: false, pro: '30/day', family: '50/day', icon: <Brain className="w-3.5 h-3.5" /> },
    { category: 'AI & Intelligence', label: 'Aurora AI — Cloud', free: false, pro: false, family: '20/day', icon: <Cloud className="w-3.5 h-3.5" /> },
    { category: 'AI & Intelligence', label: 'All 7 @commands', free: true, pro: true, family: true, icon: <Zap className="w-3.5 h-3.5" /> },
    { category: 'AI & Intelligence', label: 'Quiz generation (@quiz)', free: '1/week', pro: '5/day', family: 'Unlimited', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { category: 'AI & Intelligence', label: 'Flashcard generation (@flashcards)', free: '1/week', pro: '5/day', family: 'Unlimited', icon: <Sparkles className="w-3.5 h-3.5" /> },

    // ── Translation ──
    { category: 'Translation', label: 'Translations per day', free: '5/day', pro: '30/day', family: 'Unlimited', icon: <Languages className="w-3.5 h-3.5" /> },
    { category: 'Translation', label: 'Max text length', free: '1,000 chars', pro: '5,000 chars', family: '10,000 chars', icon: <Languages className="w-3.5 h-3.5" /> },
    { category: 'Translation', label: 'Pronunciation guide', free: true, pro: true, family: true, icon: <Languages className="w-3.5 h-3.5" /> },
    { category: 'Translation', label: 'Context explanation', free: 'Translation only', pro: 'Full explanation', family: 'Full explanation', icon: <Languages className="w-3.5 h-3.5" /> },

    // ── Community ──
    { category: 'Community', label: 'Browse boards', free: true, pro: true, family: true, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Join boards', free: '2 boards', pro: 'Unlimited', family: 'Unlimited', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Create boards', free: false, pro: true, family: true, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Post threads', free: '2 posts/day', pro: 'Unlimited', family: 'Unlimited', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Reply to threads', free: '5 replies/day', pro: 'Unlimited', family: 'Unlimited', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Share resources', free: false, pro: true, family: true, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Upvote', free: true, pro: true, family: true, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Join groups', free: '1 group', pro: 'Unlimited', family: 'Unlimited', icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Create groups', free: false, pro: true, family: true, icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Group chat messages', free: '10 msgs/day', pro: 'Unlimited', family: 'Unlimited', icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Group member cap', free: '5 members', pro: '25 members', family: '50 members', icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'File sharing in groups', free: false, pro: true, family: true, icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Saved links', free: '5 total', pro: 'Unlimited', family: 'Unlimited', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Organization', free: 'Flat list only', pro: 'Folders by subject', family: 'Folders by subject', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { category: 'Community', label: 'Auto-favicon/preview', free: true, pro: true, family: true, icon: <Bookmark className="w-3.5 h-3.5" /> },

    // ── Premium ──
    { category: 'Premium', label: 'Google Classroom sync', free: false, pro: true, family: true, icon: <Globe className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Rich text editor', free: false, pro: false, family: true, icon: <PenTool className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'AI Copilot (autocomplete)', free: false, pro: false, family: true, icon: <PenTool className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'AI Commands (edit/generate)', free: false, pro: false, family: true, icon: <PenTool className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Guardian Dashboard', free: false, pro: false, family: true, icon: <Shield className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Guardian AI Chat', free: false, pro: false, family: '30/day', icon: <Shield className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Multi-child accounts', free: false, pro: false, family: 'Up to 4', icon: <Users className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Weekly email reports', free: false, pro: false, family: true, icon: <Shield className="w-3.5 h-3.5" /> },
    { category: 'Premium', label: 'Ads', free: 'Subtle banner', pro: false, family: false, icon: <X className="w-3.5 h-3.5" /> },
];

// Get unique categories
const CATEGORIES = [...new Set(FEATURES.map(f => f.category))];

// ─── FAQ Data ───────────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: 'Can I try Pro features before subscribing?',
        a: 'The free tier gives you access to all core features with generous limits. You\'ll naturally discover Pro features as you use the app — when you try to access a locked feature, you\'ll see exactly what it does before upgrading.',
    },
    {
        q: 'What are the AI models (Quick, Deep, Cloud)?',
        a: 'Quick is fast and great for simple questions. Deep gives more detailed, nuanced answers. Cloud is our most powerful model for complex analysis. Free users get Quick, Pro unlocks Deep, and Family unlocks Cloud.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes! You can cancel your subscription at any time. You\'ll keep your plan benefits until the end of your billing period. All your data stays safe.',
    },
    {
        q: 'What\'s the difference between Pro and Family?',
        a: 'Pro is for individual students who want unlimited features. Family adds Guardian Dashboard (parent monitoring), Writing Assist with AI Copilot, Cloud AI model, and up to 4 child accounts.',
    },
    {
        q: 'Do you offer student discounts?',
        a: 'Our free tier is already designed for students! For school-wide access, ask your school about our district licensing starting at $2/student/year.',
    },
    {
        q: 'What happens to my data if I downgrade?',
        a: 'Your data is never deleted. If you downgrade and exceed a limit (e.g., 20 homework entries), you\'ll keep existing entries but won\'t be able to add new ones until you\'re within the limit.',
    },
];

// ─── Helper ─────────────────────────────────────────────────────────────────────
function FeatureValue({ value }: { value: string | boolean }) {
    if (value === true) {
        return (
            <div className="w-4 h-4 rounded-full bg-[#8bc34a] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
        );
    }
    if (value === false) {
        return (
            <div className="w-4 h-4 rounded-full bg-[#275085]/8 dark:bg-[#4a9cdb]/8 flex items-center justify-center shrink-0">
                <X className="w-2.5 h-2.5 text-[#275085]/25 dark:text-[#4a9cdb]/25" strokeWidth={3} />
            </div>
        );
    }
    return <span className="text-xs text-[#275085]/65 dark:text-[#4a9cdb]/65 leading-relaxed font-medium">{value}</span>;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function PricingPage() {
    const [billing, setBilling] = useState<BillingCycle>('annual');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showFullComparison, setShowFullComparison] = useState(false);

    const prices = {
        monthly: { pro: 6.99, family: 12.99 },
        annual: { pro: 4.99, family: 9.17 },
    };

    const annualPrices = { pro: 59.99, family: 109.99 };

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">

            {/* ── Ambient glows ─────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
                <div className="absolute top-2/3 left-0 w-[250px] h-[250px] bg-violet-200/10 dark:bg-violet-500/[0.03] rounded-full blur-[100px]" />
            </div>

            {/* ── Content ──────────────────────── */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mx-auto mb-14"
                >
                    <h1 className="text-4xl lg:text-[56px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-4">
                        Plans that grow with you.
                    </h1>
                    <p className="text-base sm:text-lg text-sky-600/60 dark:text-sky-300/60 font-medium max-w-md mx-auto">
                        Start free, upgrade when you need more power.
                    </p>
                </motion.div>

                {/* ── Billing Toggle ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-center gap-3 mb-12"
                >
                    <div className="flex items-center gap-1 p-1 bg-[#f5f9fc] dark:bg-zinc-800/60 rounded-full border border-sky-100/60 dark:border-sky-800/30">
                        {(['monthly', 'annual'] as BillingCycle[]).map(cycle => (
                            <button
                                key={cycle}
                                onClick={() => setBilling(cycle)}
                                className={`relative px-4 py-2 text-[13px] font-bold rounded-full transition-colors duration-200 z-10 ${billing === cycle
                                    ? 'text-sky-700 dark:text-sky-300'
                                    : 'text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400'
                                    }`}
                            >
                                {billing === cycle && (
                                    <motion.div
                                        layoutId="billing-switcher-pill"
                                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{cycle === 'monthly' ? 'Monthly' : 'Annual'}</span>
                            </button>
                        ))}
                    </div>
                    {billing === 'annual' && (
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full"
                        >
                            Save ~29%
                        </motion.span>
                    )}
                </motion.div>

                {/* ── Plan Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-20">

                    {/* Free Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800/80 rounded-[28px] border border-sky-100/60 dark:border-sky-800/20 p-7 flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                            </div>
                            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-1">Free</h3>
                            <p className="text-xs text-sky-600/50 dark:text-sky-400/40">Perfect for getting started</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-sky-900 dark:text-white tabular-nums">$0</span>
                                <span className="text-sm text-sky-600/50 dark:text-sky-400/40">/forever</span>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1 mb-6">
                            {[
                                '20 homework entries',
                                '12 Quick AI questions/day',
                                '5 translations/day',
                                '20 flashcards',
                                'Grade calculator',
                                'Study timer',
                                '1 study group',
                                '5 web bookmarks',
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 text-sky-500 dark:text-sky-400" />
                                    </div>
                                    <span className="text-[13px] text-sky-800/80 dark:text-sky-200/70">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/signup"
                            className="w-full flex items-center justify-center gap-2 h-11 text-[13px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/60 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/60 dark:border-sky-700/30 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Get started free
                        </Link>
                    </motion.div>

                    {/* Pro Card — Popular */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-zinc-800 rounded-[28px] border-2 border-sky-400/40 dark:border-sky-500/30 p-7 flex flex-col relative shadow-xl shadow-sky-500/[0.06] dark:shadow-sky-500/[0.03]"
                    >
                        {/* Popular badge */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 text-white text-[11px] font-bold rounded-full shadow-lg shadow-sky-500/30">
                                <Sparkles className="w-3 h-3" />
                                Most Popular
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="w-10 h-10 bg-sky-500/10 dark:bg-sky-500/15 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                            </div>
                            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-1">Pro</h3>
                            <p className="text-xs text-sky-600/50 dark:text-sky-400/40">For serious students</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-sky-900 dark:text-white tabular-nums">
                                    ${billing === 'annual' ? prices.annual.pro.toFixed(2) : prices.monthly.pro.toFixed(2)}
                                </span>
                                <span className="text-sm text-sky-600/50 dark:text-sky-400/40">/month</span>
                            </div>
                            {billing === 'annual' && (
                                <p className="text-[11px] text-sky-500/60 dark:text-sky-400/40 mt-1">
                                    ${annualPrices.pro}/year · billed annually
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 flex-1 mb-6">
                            {[
                                'Everything in Free',
                                'Unlimited homework & tests',
                                '50 Quick + 30 Deep AI/day',
                                '30 translations/day + context',
                                'Unlimited flashcards & quizzes',
                                'Google Classroom sync',
                                'Unlimited study groups',
                                'Unlimited web bookmarks + folders',
                                'Create boards & groups',
                                'No ads',
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-sky-500/15 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 text-sky-500 dark:text-sky-400" />
                                    </div>
                                    <span className={`text-[13px] ${i === 0 ? 'font-semibold text-sky-600 dark:text-sky-300' : 'text-sky-800/80 dark:text-sky-200/70'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 h-11 text-[13px] font-bold text-white bg-sky-500 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]">
                            Upgrade to Pro
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>

                    {/* Family Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#f5f9fc] dark:bg-zinc-800/80 rounded-[28px] border border-[#d4e88e]/60 dark:border-[#d4e88e]/20 p-7 flex flex-col relative"
                    >
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#d4e88e]/40">
                                <Crown className="w-5 h-5 text-sky-700 dark:text-[#d4e88e]" />
                            </div>
                            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-1">Family</h3>
                            <p className="text-xs text-sky-600/50 dark:text-sky-400/40">For parents & families</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-sky-900 dark:text-white tabular-nums">
                                    ${billing === 'annual' ? prices.annual.family.toFixed(2) : prices.monthly.family.toFixed(2)}
                                </span>
                                <span className="text-sm text-sky-600/50 dark:text-sky-400/40">/month</span>
                            </div>
                            {billing === 'annual' && (
                                <p className="text-[11px] text-sky-500/60 dark:text-sky-400/40 mt-1">
                                    ${annualPrices.family}/year · billed annually
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 flex-1 mb-6">
                            {[
                                'Everything in Pro',
                                '100 Quick + 50 Deep + 20 Cloud AI/day',
                                'Writing Assist + AI Copilot',
                                'Guardian Dashboard',
                                'Guardian AI Chat (30/day)',
                                'Unlimited translations (10K chars)',
                                'Up to 4 child accounts',
                                'Weekly progress email reports',
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 flex items-center justify-center shrink-0 border border-[#d4e88e]/30">
                                        <Check className="w-2.5 h-2.5 text-sky-700 dark:text-[#d4e88e]" />
                                    </div>
                                    <span className={`text-[13px] ${i === 0 ? 'font-semibold text-sky-600 dark:text-sky-300' : 'text-sky-800/80 dark:text-sky-200/70'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 h-11 text-[13px] font-bold text-sky-700 dark:text-sky-800 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-2xl transition-all active:scale-[0.98]">
                            Start Family Plan
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                </div>

                {/* ── School CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="max-w-5xl mx-auto mb-20"
                >
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800/60 rounded-[24px] border border-sky-100/60 dark:border-sky-800/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                <School className="w-6 h-6 text-violet-500 dark:text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-0.5">School & District Plans</h3>
                                <p className="text-sm text-sky-600/50 dark:text-sky-400/40">
                                    Starting at $2/student/year · SSO, FERPA, COPPA compliance
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/teachers"
                            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-violet-200/60 dark:border-violet-600/30 rounded-2xl transition-all active:scale-[0.98] shrink-0"
                        >
                            Contact Sales
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>

                {/* ── Full Feature Comparison ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-4xl mx-auto mb-20"
                >
                    <div className="text-center mb-12">
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                            The Comparison
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight mb-4 leading-relaxed">
                            Compare every feature
                        </h2>
                        <p className="text-base md:text-lg text-[#275085]/60 dark:text-[#4a9cdb]/60 font-medium max-w-2xl mx-auto leading-relaxed">
                            See exactly what you get with each plan
                        </p>
                    </div>

                    <div className="overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b-2 border-[#275085]/10 dark:border-[#4a9cdb]/10 sticky top-0 bg-[#fffaf4]/95 dark:bg-gray-950/95 backdrop-blur-sm z-10">
                            <div className="px-5 py-4 md:px-6 flex items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/40 dark:text-[#4a9cdb]/40">Feature</span>
                            </div>
                            <div className="px-4 py-4 md:px-5 flex justify-center items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/40 dark:text-[#4a9cdb]/40">Free</span>
                            </div>
                            <div className="px-4 py-4 md:px-5 flex justify-center items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a9cdb]">Pro</span>
                            </div>
                            <div className="px-4 py-4 md:px-5 flex justify-center items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#275085]/40 dark:text-[#4a9cdb]/40">Family</span>
                            </div>
                        </div>

                        {/* Feature Rows */}
                        {CATEGORIES.map((category, catIdx) => {
                            const catFeatures = FEATURES.filter(f => f.category === category);
                            const isHidden = !showFullComparison && catIdx >= 2;

                            if (isHidden) return null;

                            return (
                                <div key={category}>
                                    {/* Category Header */}
                                    <div className="px-5 pt-5 pb-2 md:px-6 bg-sky-50/40 dark:bg-sky-500/[0.03] border-b border-[#275085]/10 dark:border-[#4a9cdb]/10">
                                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                            {category}
                                        </span>
                                    </div>

                                    {/* Features in category */}
                                    {catFeatures.map((feature, i) => (
                                        <div
                                            key={i}
                                            className={`
                                                grid grid-cols-[1.5fr_1fr_1fr_1fr] 
                                                hover:bg-[#275085]/[0.02] dark:hover:bg-[#4a9cdb]/[0.02] transition-colors
                                                ${i !== catFeatures.length - 1 || catIdx !== CATEGORIES.length - 1 ? 'border-b border-[#275085]/5 dark:border-[#4a9cdb]/5' : ''}
                                            `}
                                        >
                                            <div className="px-5 py-3.5 md:px-6 flex items-center gap-2.5">
                                                <span className="text-[#275085]/40 dark:text-[#4a9cdb]/40">{feature.icon}</span>
                                                <span className="text-sm font-medium text-[#275085] dark:text-[#4a9cdb]">{feature.label}</span>
                                            </div>
                                            <div className="px-4 py-3.5 md:px-5 flex items-center justify-center">
                                                <FeatureValue value={feature.free} />
                                            </div>
                                            <div className="px-4 py-3.5 md:px-5 flex items-center justify-center">
                                                <FeatureValue value={feature.pro} />
                                            </div>
                                            <div className="px-4 py-3.5 md:px-5 flex items-center justify-center">
                                                <FeatureValue value={feature.family} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* Show More / Less */}
                    {CATEGORIES.length > 2 && (
                        <div className="flex justify-center mt-0">
                            <button
                                onClick={() => setShowFullComparison(!showFullComparison)}
                                className="w-full py-3.5 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8 flex items-center justify-center gap-1.5 text-xs font-bold text-[#275085]/50 dark:text-[#4a9cdb]/50 hover:text-[#275085] dark:hover:text-[#4a9cdb] transition-colors bg-[#fffaf4] dark:bg-gray-950"
                            >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFullComparison ? 'rotate-180' : ''}`} />
                                {showFullComparison ? 'Show less' : `Show all ${FEATURES.length} features`}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* ── FAQ ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="max-w-2xl mx-auto mb-20"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                            Frequently asked
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-[#f5f9fc] dark:bg-zinc-800/60 rounded-2xl border border-sky-100/60 dark:border-sky-800/20 overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sky-50/40 dark:hover:bg-zinc-700/20 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-sky-900 dark:text-white pr-4">{faq.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-sky-500/50 dark:text-sky-400/40 shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-5 pb-4 text-sm text-sky-700/70 dark:text-sky-300/60 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Footer ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-8 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/legal/terms" className="text-xs text-sky-600/40 dark:text-sky-400/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                                Terms
                            </Link>
                            <Link href="/legal/privacy" className="text-xs text-sky-600/40 dark:text-sky-400/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
