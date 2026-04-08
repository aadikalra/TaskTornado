'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Home, BookOpen, Grid2x2, Pin, Languages, Calculator, Users, MessageSquare, Gamepad2, HelpCircle, FileText, MoreHorizontal, X as XIcon, Check, GripVertical, Timer, Settings, LogOut } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useAI } from '@/context/AIContext';
import { AIAssistant } from '@/components/AIAssistant';
import { StudyTimer } from '@/components/StudyTimer';


/* ── Always-pinned core items (cannot be removed) ────────────────────────── */
const CORE_ITEMS = [
    { label: 'Home', href: '/dashboard', icon: Home, iconName: 'Home02' },
    { label: 'Calendar', href: '/calendar', icon: Calendar, iconName: 'Calendar02' },
];

/* ── All customizable items (can be pinned to nav OR live in Tools dropdown) */
const ALL_EXTRA_ITEMS = [
    { label: 'Flashcards', href: '/flashcards', iconName: 'Cards01' },
    { label: 'Quizzes', href: '/quiz', iconName: 'Quiz04' },
    { label: 'Writing', href: '/writing-assist', iconName: 'AiContentGenerator02' },
    { label: 'Translate', href: '/translate', iconName: 'Translate' },
    { label: 'Grades', href: '/grade-calculator', iconName: 'ChartAnalysis' },
    { label: 'Web Saves', href: '/web-saves', iconName: 'Bookmark03' },
    { label: 'Groups', href: '/groups', iconName: 'UserGroup03' },
    { label: 'Discuss', href: '/discussions', iconName: 'Chat' },
    { label: 'Games', href: '/games', iconName: 'Gameboy' },
    { label: 'Blog', href: '/blog', iconName: 'Blogger' },
    { label: 'Tutorials', href: '/tutorials', iconName: 'HelpCircle' },
    { label: 'Changelog', href: '/changelog', iconName: 'GoogleDoc' },
];

const DEFAULT_PINNED = ['Flashcards', 'Quizzes', 'Writing'];
const MAX_PINNED = 5;

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};
const setCookie = (name: string, value: string, days: number = 365) => {
    const d = new Date(); d.setTime(d.getTime() + days * 86400000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
};

export default function AppNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut, full_name } = useAuth() || {};
    const { openSearch } = useSearch();
    const { isAIAssistantOpen, setAIAssistantOpen } = useAI();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);
    const [timerInfo, setTimerInfo] = useState<{ isMinimized: boolean; isRunning: boolean; timeLeft: number; totalTime: number; formattedTime: string; progress: number } | null>(null);
    const [timerRestoreSignal, setTimerRestoreSignal] = useState(0);
    const [tabletMoreOpen, setTabletMoreOpen] = useState(false);
    const [editNavOpen, setEditNavOpen] = useState(false);
    const [pinnedLabels, setPinnedLabels] = useState<string[]>(DEFAULT_PINNED);

    const toolsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const tabletMoreRef = useRef<HTMLDivElement>(null);
    const editNavRef = useRef<HTMLDivElement>(null);

    // Load pinned labels from cookie on mount
    useEffect(() => {
        const saved = getCookie('pinnedNavLabels');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) setPinnedLabels(parsed);
            } catch { /* use default */ }
        }
    }, []);

    const savePinnedLabels = useCallback((labels: string[]) => {
        setPinnedLabels(labels);
        setCookie('pinnedNavLabels', JSON.stringify(labels));
    }, []);

    const togglePinned = useCallback((label: string) => {
        setPinnedLabels(prev => {
            const next = prev.includes(label)
                ? prev.filter(l => l !== label)
                : prev.length < MAX_PINNED ? [...prev, label] : prev;
            setCookie('pinnedNavLabels', JSON.stringify(next));
            return next;
        });
    }, []);

    // Derived lists
    const NAV_ITEMS = useMemo(() => [
        ...CORE_ITEMS,
        ...ALL_EXTRA_ITEMS.filter(i => pinnedLabels.includes(i.label)),
    ], [pinnedLabels]);

    const TOOL_ITEMS = useMemo(() =>
        ALL_EXTRA_ITEMS.filter(i => !pinnedLabels.includes(i.label)),
        [pinnedLabels]);

    // Tablet splits from the dynamic NAV_ITEMS
    const TABLET_NAV_PRIMARY = useMemo(() => NAV_ITEMS.slice(0, 3), [NAV_ITEMS]);
    const TABLET_NAV_OVERFLOW = useMemo(() => NAV_ITEMS.slice(3), [NAV_ITEMS]);

    // Close panels on route change
    useEffect(() => {
        setMobileOpen(false);
        setToolsOpen(false);
        setProfileOpen(false);

        setTabletMoreOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
            if (tabletMoreRef.current && !tabletMoreRef.current.contains(e.target as Node)) setTabletMoreOpen(false);
            if (editNavRef.current && !editNavRef.current.contains(e.target as Node)) setEditNavOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNavClick = (href: string) => {
        setMobileOpen(false);
        setToolsOpen(false);
        setTabletMoreOpen(false);
        router.push(href);
    };

    const isActive = (href: string) => {
        if (href === '/blog') return pathname.startsWith('/blog');
        if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
        return pathname === href;
    };

    // User initials
    const initials = (() => {
        const names = full_name?.trim().split(/\s+/);
        if (!names || !names[0]) return 'U';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    })();

    return (
        <>
            {/* Gradient fade behind navbar */}
            <div className="fixed top-0 left-0 right-0 h-24 z-40 pointer-events-none bg-gradient-to-b from-[#fffaf4] via-[#fffaf4]/80 to-transparent dark:from-gray-950 dark:via-gray-950/80" />
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 pointer-events-none">
                <div className="pointer-events-auto flex items-center justify-between w-full max-w-7xl mx-auto">
                    {/* Logo */}
                    <button onClick={() => handleNavClick('/dashboard')} className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                            <img src="/TaskTornado.svg" alt="TaskTornado Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg] dark:hidden" />
                            <img src="/TaskTornadoDark.svg" alt="TaskTornado Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg] hidden dark:block" />
                        </div>
                        <span className="text-[#275085] dark:text-blue-200 font-bold text-base sm:text-lg tracking-tight md:hidden lg:inline">TaskTornado</span>
                    </button>

                    {/* ════════════════════════════════════════════
                        DESKTOP (lg+) — Full center pill
                       ════════════════════════════════════════════ */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.href)}
                                className={`relative px-4 py-2 text-[13px] font-semibold transition-all duration-300 rounded-full ${isActive(item.href)
                                    ? 'text-[#275085]'
                                    : 'text-white hover:text-white/80'
                                    }`}
                            >
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="app-nav-pill"
                                        className="absolute inset-0 bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                                        style={{ borderRadius: 9999 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-px h-5 bg-white/20 mx-1" />

                        {/* Aurora */}
                        <button
                            onClick={() => setAIAssistantOpen(!isAIAssistantOpen)}
                            className={`relative px-3 py-2 rounded-full transition-colors ${isAIAssistantOpen ? 'text-amber-300' : 'text-white/70 hover:text-white'}`}
                            title="Aurora AI"
                        >
                            <HugeIcon name="AiMagic" size={16} className="w-4 h-4" />
                        </button>

                        {/* Search */}
                        <button
                            onClick={openSearch}
                            className="relative px-3 py-2 text-white/70 hover:text-white transition-colors rounded-full"
                            title="Search (⌘K)"
                        >
                            <HugeIcon name="Search01" size={16} className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ════════════════════════════════════════════
                        TABLET (md–lg) — Compact center pill
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex lg:hidden absolute left-1/2 -translate-x-1/2 items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                        {TABLET_NAV_PRIMARY.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.href)}
                                className={`relative px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 rounded-full ${isActive(item.href)
                                    ? 'text-[#275085]'
                                    : 'text-white hover:text-white/80'
                                    }`}
                            >
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="app-nav-pill-tablet"
                                        className="absolute inset-0 bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                                        style={{ borderRadius: 9999 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ))}

                        {/* More dropdown for overflow nav items */}
                        <div ref={tabletMoreRef} className="relative">
                            <button
                                onClick={() => setTabletMoreOpen(prev => !prev)}
                                className={`relative px-2.5 py-1.5 rounded-full transition-all duration-300 ${tabletMoreOpen ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'}`}
                                aria-label="More pages"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {tabletMoreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-full right-0 mt-2 z-[100]"
                                    >
                                        <div className="flex flex-col min-w-[130px] p-1.5 bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_8px_24px_rgba(39,80,133,0.35)]">
                                            {TABLET_NAV_OVERFLOW.map((item) => {
                                                const IconComponent = 'icon' in item ? (item.icon as React.ComponentType<{ className?: string }>) : null;
                                                return (
                                                    <button
                                                        key={item.label}
                                                        onClick={() => handleNavClick(item.href)}
                                                        className={`w-full flex items-center gap-2 text-left px-3 py-2 text-[12px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${isActive(item.href)
                                                            ? 'bg-white/15 text-white'
                                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {IconComponent ? (
                                                            <IconComponent className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <HugeIcon name={item.iconName} size={14} className="w-3.5 h-3.5" />
                                                        )}
                                                        {item.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-white/20 mx-0.5" />

                        {/* Aurora */}
                        <button
                            onClick={() => setAIAssistantOpen(!isAIAssistantOpen)}
                            className={`relative px-2 py-1.5 rounded-full transition-colors ${isAIAssistantOpen ? 'text-amber-300' : 'text-white/70 hover:text-white'}`}
                            title="Aurora AI"
                        >
                            <HugeIcon name="AiMagic" size={14} className="w-3.5 h-3.5" />
                        </button>

                        {/* Search */}
                        <button
                            onClick={openSearch}
                            className="relative px-2 py-1.5 text-white/70 hover:text-white transition-colors rounded-full"
                            title="Search (⌘K)"
                        >
                            <HugeIcon name="Search01" size={14} className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* ════════════════════════════════════════════
                        DESKTOP (lg+) — Right side actions
                       ════════════════════════════════════════════ */}
                    <div className="hidden lg:flex items-center gap-2">
                        {/* All Tools dropdown */}
                        <div ref={toolsRef} className="relative">
                            <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                                <button
                                    onClick={() => { setToolsOpen(!toolsOpen); setProfileOpen(false); }}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-full transition-all active:scale-95 ${toolsOpen
                                        ? 'bg-white/15 text-white'
                                        : 'text-white hover:text-white/80'
                                        }`}
                                >
                                    <HugeIcon name="LayoutGrid" size={14} className="w-3.5 h-3.5" />
                                    Tools
                                    <HugeIcon name="ArrowDown01" size={12} className={`w-3 h-3 opacity-50 transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {toolsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-full right-0 mt-1 z-[100] w-[280px]"
                                    >
                                        <div className="bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-2">
                                            <div className="grid grid-cols-4 gap-1">
                                                {TOOL_ITEMS.map((tool, idx) => {
                                                    const active = isActive(tool.href);
                                                    return (
                                                        <motion.button
                                                            key={tool.label}
                                                            initial={{ opacity: 0, y: 4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.02 }}
                                                            onClick={() => handleNavClick(tool.href)}
                                                            className={`flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl transition-all active:scale-95 ${active
                                                                ? 'bg-white/15 text-white'
                                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            <HugeIcon name={tool.iconName} size={16} className="w-4 h-4" />
                                                            <span className="text-[9px] font-semibold leading-tight">{tool.label}</span>
                                                        </motion.button>
                                                    );
                                                })}
                                                {/* Timer (special — not a route) */}
                                                <motion.button
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: TOOL_ITEMS.length * 0.02 }}
                                                    onClick={() => { setIsStudyTimerOpen(true); setToolsOpen(false); }}
                                                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl transition-all active:scale-95 ${isStudyTimerOpen
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <HugeIcon name="Timer01" size={16} className="w-4 h-4" />
                                                    <span className="text-[9px] font-semibold leading-tight">Timer</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mini Timer Pill — appears next to Tools when timer is minimized */}
                        <AnimatePresence>
                            {timerInfo?.isMinimized && timerInfo?.isRunning && (
                                <motion.div
                                    key="mini-timer-pill"
                                    initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -8 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                    <button
                                        onClick={() => { setIsStudyTimerOpen(true); setTimerRestoreSignal(s => s + 1); }}
                                        className="flex items-center gap-2 px-3.5 py-2 bg-[#275085]/90 backdrop-blur-md rounded-full border border-[#275085]/30 shadow-[0_4px_24px_rgba(39,80,133,0.3)] hover:bg-[#275085] transition-all active:scale-95"
                                    >
                                        <Timer className="w-3.5 h-3.5 text-white/70" />
                                        <span className="text-[13px] font-bold text-white tabular-nums">
                                            {timerInfo.formattedTime}
                                        </span>
                                        <div className="w-6 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-linear"
                                                style={{ width: `${timerInfo.progress}%` }}
                                            />
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Profile pill */}
                        <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">

                            {/* Profile */}
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => { setProfileOpen(!profileOpen); setToolsOpen(false); setEditNavOpen(false); }}
                                    className="relative px-3 py-1.5 text-[13px] font-bold text-[#275085] rounded-full bg-white/90 border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-white transition-all active:scale-95"
                                >
                                    {initials}
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="absolute top-full right-0 mt-3 z-[100] w-[200px]"
                                        >
                                            <div className="bg-[#275085]/95 backdrop-blur-xl rounded-[16px] border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-1.5">
                                                <div className="px-3 py-2 border-b border-white/10 mb-1">
                                                    <p className="text-[13px] font-bold text-white truncate">{full_name?.split(' ')[0] || 'Student'}</p>
                                                    <p className="text-[10px] font-medium text-white/50 truncate">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setProfileOpen(false); setTimeout(() => setEditNavOpen(true), 10); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="Pen02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Edit Nav</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavClick('/settings')}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="Settings02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Settings</span>
                                                </button>
                                                <button
                                                    onClick={() => { signOut?.(); router.push('/'); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="LogoutCircle02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Log out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Edit Nav panel (anchored to profile) */}
                                <AnimatePresence>
                                    {editNavOpen && (
                                        <motion.div
                                            ref={editNavRef}
                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="absolute top-full right-0 mt-3 z-[110] w-[280px]"
                                        >
                                            <div className="bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Customize Tabs</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium text-white/30">{pinnedLabels.length}/{MAX_PINNED}</span>
                                                        <button onClick={() => setEditNavOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Currently pinned */}
                                                {pinnedLabels.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1.5 px-1">Pinned</p>
                                                        <div className="flex flex-col gap-0.5">
                                                            {pinnedLabels.map(label => {
                                                                const item = ALL_EXTRA_ITEMS.find(i => i.label === label);
                                                                if (!item) return null;
                                                                return (
                                                                    <button
                                                                        key={label}
                                                                        onClick={() => togglePinned(label)}
                                                                        className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-all group text-left"
                                                                    >
                                                                        <HugeIcon name={item.iconName} size={14} className="w-3.5 h-3.5 text-white/60" />
                                                                        <span className="text-[12px] font-semibold flex-1">{label}</span>
                                                                        <X className="w-3 h-3 text-white/30 group-hover:text-red-300 transition-colors" />
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Available to add */}
                                                {ALL_EXTRA_ITEMS.filter(i => !pinnedLabels.includes(i.label)).length > 0 && (
                                                    <div>
                                                        <div className="h-px bg-white/10 my-2" />
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1.5 px-1">Available</p>
                                                        <div className="flex flex-col gap-0.5 max-h-[160px] overflow-y-auto">
                                                            {ALL_EXTRA_ITEMS.filter(i => !pinnedLabels.includes(i.label)).map(item => {
                                                                const atMax = pinnedLabels.length >= MAX_PINNED;
                                                                return (
                                                                    <button
                                                                        key={item.label}
                                                                        onClick={() => !atMax && togglePinned(item.label)}
                                                                        className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl transition-all group text-left ${atMax ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:bg-white/10 hover:text-white/80'}`}
                                                                    >
                                                                        <HugeIcon name={item.iconName} size={14} className="w-3.5 h-3.5 text-white/40" />
                                                                        <span className="text-[12px] font-semibold flex-1">{item.label}</span>
                                                                        {atMax ? null : <HugeIcon name="PlusSign" size={12} className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reset to defaults */}
                                                <div className="h-px bg-white/10 mt-2 mb-1.5" />
                                                <button
                                                    onClick={() => savePinnedLabels(DEFAULT_PINNED)}
                                                    className="w-full text-center text-[10px] font-semibold text-white/30 hover:text-white/60 transition-colors py-1.5 rounded-lg hover:bg-white/5"
                                                >
                                                    Reset to defaults
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════
                        TABLET (md–lg) — Compact right side actions
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex lg:hidden items-center gap-1.5">
                        {/* Tools (icon-only) */}
                        <div ref={toolsRef} className="relative">
                            <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                                <button
                                    onClick={() => { setToolsOpen(!toolsOpen); setProfileOpen(false); }}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded-full transition-all active:scale-95 ${toolsOpen
                                        ? 'bg-white/15 text-white'
                                        : 'text-white hover:text-white/80'
                                        }`}
                                >
                                    <HugeIcon name="LayoutGrid" size={14} className="w-3.5 h-3.5" />
                                    <HugeIcon name="ArrowDown01" size={12} className={`w-3 h-3 opacity-50 transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {toolsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-full right-0 mt-1 z-[100] w-[260px]"
                                    >
                                        <div className="bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-2">
                                            <div className="grid grid-cols-4 gap-1">
                                                {TOOL_ITEMS.map((tool, idx) => {
                                                    const active = isActive(tool.href);
                                                    return (
                                                        <motion.button
                                                            key={tool.label}
                                                            initial={{ opacity: 0, y: 4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.02 }}
                                                            onClick={() => handleNavClick(tool.href)}
                                                            className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all active:scale-95 ${active
                                                                ? 'bg-white/15 text-white'
                                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            <HugeIcon name={tool.iconName} size={16} className="w-4 h-4" />
                                                            <span className="text-[9px] font-semibold leading-tight">{tool.label}</span>
                                                        </motion.button>
                                                    );
                                                })}
                                                <motion.button
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: TOOL_ITEMS.length * 0.02 }}
                                                    onClick={() => { setIsStudyTimerOpen(true); setToolsOpen(false); }}
                                                    className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all active:scale-95 ${isStudyTimerOpen
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <HugeIcon name="Timer01" size={16} className="w-4 h-4" />
                                                    <span className="text-[9px] font-semibold leading-tight">Timer</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mini Timer Pill (tablet) */}
                        <AnimatePresence>
                            {timerInfo?.isMinimized && timerInfo?.isRunning && (
                                <motion.div
                                    key="mini-timer-pill-tablet"
                                    initial={{ opacity: 0, scale: 0.9, x: -8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -8 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                    <button
                                        onClick={() => { setIsStudyTimerOpen(true); setTimerRestoreSignal(s => s + 1); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#275085]/90 backdrop-blur-md rounded-full border border-[#275085]/30 shadow-[0_4px_24px_rgba(39,80,133,0.3)] hover:bg-[#275085] transition-all active:scale-95"
                                    >
                                        <Timer className="w-3 h-3 text-white/70" />
                                        <span className="text-[12px] font-bold text-white tabular-nums">
                                            {timerInfo.formattedTime}
                                        </span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Profile pill (compact) */}
                        <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">

                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => { setProfileOpen(!profileOpen); setToolsOpen(false); setEditNavOpen(false); }}
                                    className="relative px-2.5 py-1 text-[12px] font-bold text-[#275085] rounded-full bg-white/90 border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-white transition-all active:scale-95"
                                >
                                    {initials}
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="absolute top-full right-0 mt-3 z-[100] w-[200px]"
                                        >
                                            <div className="bg-[#275085]/95 backdrop-blur-xl rounded-[16px] border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-1.5">
                                                <div className="px-3 py-2 border-b border-white/10 mb-1">
                                                    <p className="text-[13px] font-bold text-white truncate">{full_name?.split(' ')[0] || 'Student'}</p>
                                                    <p className="text-[10px] font-medium text-white/50 truncate">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setProfileOpen(false); setTimeout(() => setEditNavOpen(true), 10); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="Pen02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Edit Nav</span>
                                                </button>
                                                <button
                                                    onClick={() => handleNavClick('/settings')}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="Settings02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Settings</span>
                                                </button>
                                                <button
                                                    onClick={() => { signOut?.(); router.push('/'); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors text-left"
                                                >
                                                    <HugeIcon name="LogoutCircle02" size={16} className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Log out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════
                        MOBILE — Hamburger button
                       ════════════════════════════════════════════ */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30 text-white active:scale-95 transition-transform"
                    >
                        {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </nav>

            {/* ── "Get Plus" pill — centered below desktop nav ── */}
            <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleNavClick('/pricing')}
                className="hidden lg:flex fixed top-[68px] left-1/2 -translate-x-1/2 z-50 items-center gap-1.5 px-3 py-1 bg-white/60 hover:bg-white/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] backdrop-blur-xl border border-white/50 dark:border-white/15 rounded-full shadow-[0_2px_12px_rgba(39,80,133,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-200 group cursor-pointer"
            >
                <HugeIcon name="AiMagic" size={12} className="w-3 h-3 text-[#275085]/70 dark:text-blue-300/70 group-hover:text-[#275085] dark:group-hover:text-blue-300 transition-colors" />
                <span className="text-[11px] font-semibold text-[#275085]/70 dark:text-blue-200/70 group-hover:text-[#275085] dark:group-hover:text-blue-200 tracking-tight transition-colors">
                    Get Plus
                </span>
            </motion.button>

            {/* ════════════════════════════════════════════════════════
                MOBILE MENU — full-screen overlay
               ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        <div className="absolute inset-0 bg-[#275085]/60 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
                            className="relative z-10 mx-4 mt-20 p-2 bg-[#275085]/95 backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-[0_24px_80px_rgba(39,80,133,0.5)] max-h-[70vh] overflow-y-auto"
                        >
                            {/* Core nav links */}
                            <div className="p-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 px-2">Navigation</p>
                                {NAV_ITEMS.map((item, idx) => {
                                    const active = isActive(item.href);
                                    const IconComponent = 'icon' in item ? (item.icon as React.ComponentType<{ className?: string }>) : null;
                                    return (
                                        <motion.button
                                            key={item.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.08 + idx * 0.04 }}
                                            onClick={() => handleNavClick(item.href)}
                                            className={`w-full flex items-center gap-3 text-left px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] ${active
                                                ? 'bg-white/15 text-white'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {IconComponent ? (
                                                <IconComponent className="w-4.5 h-4.5" />
                                            ) : (
                                                <HugeIcon name={item.iconName} size={18} className="w-4.5 h-4.5" />
                                            )}
                                            {item.label}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="h-px bg-white/10 mx-3" />

                            {/* Quick actions */}
                            <div className="p-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 px-2">Quick Actions</p>
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={() => { setMobileOpen(false); openSearch(); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-[15px] font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-2xl transition-all"
                                >
                                    <HugeIcon name="Search01" size={18} className="w-4.5 h-4.5" />
                                    Search
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.24 }}
                                    onClick={() => { setMobileOpen(false); setAIAssistantOpen(!isAIAssistantOpen); }}
                                    className={`w-full flex items-center gap-3 text-left px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all ${isAIAssistantOpen ? 'bg-white/15 text-amber-300' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <HugeIcon name="AiMagic" size={18} className="w-4.5 h-4.5" />
                                    Aurora AI
                                </motion.button>
                            </div>

                            <div className="h-px bg-white/10 mx-3" />

                            {/* Tools grid */}
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3 px-1">All Tools</p>
                                <div className="grid grid-cols-4 gap-1">
                                    {TOOL_ITEMS.map((tool, idx) => {
                                        const active = isActive(tool.href);
                                        return (
                                            <motion.button
                                                key={tool.label}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.03 }}
                                                onClick={() => handleNavClick(tool.href)}
                                                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl transition-all active:scale-95 ${active
                                                    ? 'bg-white/15 text-white'
                                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <HugeIcon name={tool.iconName} size={18} className="w-4.5 h-4.5" />
                                                <span className="text-[9px] font-semibold leading-tight">{tool.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                    <motion.button
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + TOOL_ITEMS.length * 0.03 }}
                                        onClick={() => { setMobileOpen(false); setIsStudyTimerOpen(true); }}
                                        className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl transition-all active:scale-95 text-white/60 hover:bg-white/10 hover:text-white"
                                    >
                                        <Timer className="w-4.5 h-4.5" />
                                        <span className="text-[9px] font-semibold leading-tight">Timer</span>
                                    </motion.button>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 mx-3" />

                            {/* Profile section */}
                            <div className="p-3 flex gap-2">
                                <button
                                    onClick={() => handleNavClick('/settings')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-bold text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => { signOut?.(); router.push('/'); setMobileOpen(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-bold text-red-300 hover:text-red-200 rounded-full hover:bg-red-500/10 transition-all active:scale-95"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating components */}
            <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setAIAssistantOpen(false)} />
            <StudyTimer trigger={<div />} isOpen={isStudyTimerOpen} onOpenChange={setIsStudyTimerOpen} onMinimizedInfo={setTimerInfo} restoreSignal={timerRestoreSignal} />

        </>
    );
}

