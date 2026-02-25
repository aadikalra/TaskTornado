'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Search, Sparkle, Calendar, Home, LogOut, Bell, Settings, BookOpen, Grid2x2, Pin, PenTool, Languages, Calculator, Users, MessageSquare, Timer, Gamepad2, HelpCircle,  FileText } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useAI } from '@/context/AIContext';
import { AIAssistant } from '@/components/AIAssistant';
import { StudyTimer } from '@/components/StudyTimer';
import { NotificationPanel, useNotifications } from '@/components/NotificationPanel';

const NAV_ITEMS = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Flashcards', href: '/flashcards', icon: BookOpen },
    { label: 'Quizzes', href: '/quiz', icon: Grid2x2 },
    { label: 'Writing', href: '/writing-assist', icon: PenTool },
];

const TOOL_ITEMS = [
    { label: 'Translate', href: '/translate', icon: Languages, requiresAuth: true },
    { label: 'Grades', href: '/grade-calculator', icon: Calculator, requiresAuth: true },
    { label: 'Web Saves', href: '/web-saves', icon: Pin, requiresAuth: true },
    { label: 'Groups', href: '/groups', icon: Users, requiresAuth: true },
    { label: 'Discuss', href: '/discussions', icon: MessageSquare, requiresAuth: true },
    { label: 'Games', href: '/games', icon: Gamepad2, requiresAuth: true },
    { label: 'Tutorials', href: '/tutorials', icon: HelpCircle, requiresAuth: false },
    { label: 'Changelog', href: '/changelog', icon: FileText, requiresAuth: false },
];

export default function AppNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut, full_name } = useAuth() || {};
    const { openSearch } = useSearch();
    const { isAIAssistantOpen, setAIAssistantOpen } = useAI();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);
    const [timerInfo, setTimerInfo] = useState<{ isMinimized: boolean; isRunning: boolean; timeLeft: number; totalTime: number; formattedTime: string; progress: number } | null>(null);
    const [timerRestoreSignal, setTimerRestoreSignal] = useState(0);

    const toolsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close panels on route change
    useEffect(() => {
        setMobileOpen(false);
        setToolsOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
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
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNavClick = (href: string) => {
        setMobileOpen(false);
        setToolsOpen(false);
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
                        <span className="text-[#275085] dark:text-blue-200 font-bold text-base sm:text-lg tracking-tight">TaskTornado</span>
                    </button>

                    {/* ════════════════════════════════════════════
                        DESKTOP — Center pill with nav links
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
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
                            <Sparkle className="w-4 h-4" />
                        </button>

                        {/* Search */}
                        <button
                            onClick={openSearch}
                            className="relative px-3 py-2 text-white/70 hover:text-white transition-colors rounded-full"
                            title="Search (⌘K)"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ════════════════════════════════════════════
                        DESKTOP — Right side actions
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* All Tools dropdown */}
                        <div ref={toolsRef} className="relative">
                            <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                                <button
                                    onClick={() => { setToolsOpen(!toolsOpen); setProfileOpen(false); setNotificationsOpen(false); }}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-full transition-all active:scale-95 ${toolsOpen
                                        ? 'bg-white/15 text-white'
                                        : 'text-white hover:text-white/80'
                                        }`}
                                >
                                    <Grid2x2 className="w-3.5 h-3.5" />
                                    Tools
                                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {toolsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-full right-0 mt-2 z-[100] w-[280px]"
                                    >
                                        <div className="bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-2">
                                            <div className="grid grid-cols-4 gap-1">
                                                {TOOL_ITEMS.map((tool, idx) => {
                                                    const Icon = tool.icon;
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
                                                            <Icon className="w-4 h-4" />
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
                                                    <Timer className="w-4 h-4" />
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

                        {/* Notifications + Profile pill */}
                        <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                            {/* Notifications */}
                            <button
                                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); setToolsOpen(false); }}
                                className={`relative px-3 py-2 rounded-full transition-colors ${notificationsOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
                            >
                                <NotificationBellIcon />
                            </button>

                            {/* Profile */}
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => { setProfileOpen(!profileOpen); setToolsOpen(false); setNotificationsOpen(false); }}
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
                                            className="absolute top-full right-0 mt-2 z-[100] w-[200px]"
                                        >
                                            <div className="bg-[#275085]/95 backdrop-blur-xl rounded-[16px] border border-[#275085]/30 shadow-[0_24px_80px_rgba(39,80,133,0.5)] p-1.5">
                                                <div className="px-3 py-2 border-b border-white/10 mb-1">
                                                    <p className="text-[13px] font-bold text-white truncate">{full_name?.split(' ')[0] || 'Student'}</p>
                                                    <p className="text-[10px] font-medium text-white/50 truncate">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleNavClick('/settings')}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span className="text-[12px] font-semibold">Settings</span>
                                                </button>
                                                <button
                                                    onClick={() => { signOut?.(); router.push('/'); }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4" />
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
                                    const Icon = item.icon;
                                    const active = isActive(item.href);
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
                                            <Icon className="w-4.5 h-4.5" />
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
                                    <Search className="w-4.5 h-4.5" />
                                    Search
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.24 }}
                                    onClick={() => { setMobileOpen(false); setAIAssistantOpen(!isAIAssistantOpen); }}
                                    className={`w-full flex items-center gap-3 text-left px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all ${isAIAssistantOpen ? 'bg-white/15 text-amber-300' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Sparkle className="w-4.5 h-4.5" />
                                    Aurora AI
                                </motion.button>
                            </div>

                            <div className="h-px bg-white/10 mx-3" />

                            {/* Tools grid */}
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3 px-1">All Tools</p>
                                <div className="grid grid-cols-4 gap-1">
                                    {TOOL_ITEMS.map((tool, idx) => {
                                        const Icon = tool.icon;
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
                                                <Icon className="w-4.5 h-4.5" />
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
            <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </>
    );
}

// ─── Notification Bell with Badge ──────────────────────────────────────────────
function NotificationBellIcon() {
    const { notifications } = useNotifications();
    const count = notifications.length;
    return (
        <div className="relative">
            <Bell className="w-4 h-4" />
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-[3px] text-[8px] font-bold text-white bg-red-500 rounded-full leading-none shadow-sm">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </div>
    );
}
