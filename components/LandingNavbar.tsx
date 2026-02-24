'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { X, ChevronRight, Sparkles, ArrowRight, GraduationCap, BookOpen, Languages, FileText, Newspaper, Menu } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Translate', href: '/translate', icon: Languages, color: 'text-sky-500' },
    { label: 'Grades', href: '/grade-calculator', icon: GraduationCap, color: 'text-emerald-500' },
    { label: 'Tutorials', href: '/tutorials', icon: BookOpen, color: 'text-violet-500' },
    { label: 'Blog', href: '/blog', icon: Newspaper, color: 'text-rose-500' },
];

export default function LandingNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const menuRef = useRef<HTMLDivElement>(null);

    // Track scroll for background opacity change
    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 20);
    });

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu on outside click
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMobileMenuOpen(false);
            }
        };
        const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handler);
        };
    }, [mobileMenuOpen]);

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-5 pt-3 sm:pt-4 pointer-events-none"
            >
                <div
                    className={`
                        pointer-events-auto flex items-center w-full max-w-4xl
                        rounded-2xl px-3 sm:px-4 py-2
                        transition-all duration-500 ease-out
                        ${scrolled
                            ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-gray-200/50 dark:border-white/[0.08]'
                            : 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-transparent'
                        }
                    `}
                >
                    {/* ── Logo ── */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2.5 shrink-0 group mr-2"
                    >
                        <div className="relative">
                            <img
                                src="/TaskTornado.svg"
                                alt="TaskTornado"
                                className="w-8 h-8 dark:hidden transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]"
                            />
                            <img
                                src="/TaskTornadoDark.svg"
                                alt="TaskTornado"
                                className="w-8 h-8 hidden dark:block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]"
                            />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight bg-gradient-to-r from-[#275085] to-[#4a7dca] dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent hidden sm:inline">
                            TaskTornado
                        </span>
                    </button>

                    {/* ── Center Navigation ── */}
                    <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                        {NAV_LINKS.map((item) => {
                            const isActive = item.href === '/blog'
                                ? pathname.startsWith('/blog')
                                : pathname === item.href;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => router.push(item.href)}
                                    className={`
                                        relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-medium 
                                        transition-all duration-200 active:scale-95
                                        ${isActive
                                            ? 'bg-gray-100/80 dark:bg-white/[0.08] text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'opacity-60'}`} />
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-pill"
                                            className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${item.color.replace('text-', 'bg-')}`}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        className={`
                            md:hidden flex items-center justify-center w-9 h-9 rounded-xl ml-auto mr-1
                            transition-all duration-200 active:scale-90
                            ${mobileMenuOpen
                                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-white/[0.06]'
                            }
                        `}
                    >
                        {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                    </button>

                    {/* ── Auth buttons ── */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => router.push('/login')}
                            className="px-4 py-1.5 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/[0.06] transition-all duration-200 active:scale-95 hidden sm:block"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => router.push('/signup')}
                            className="group relative px-4 py-1.5 rounded-xl text-[13px] font-bold text-white overflow-hidden transition-all duration-300 active:scale-95 shadow-[0_2px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)]"
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-opacity duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Get started
                            </span>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* ── Mobile Menu ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu panel */}
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="fixed top-[68px] left-3 right-3 z-50 mx-auto max-w-md"
                        >
                            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                                {/* Nav links */}
                                <div className="p-2">
                                    {NAV_LINKS.map((item, i) => {
                                        const isActive = item.href === '/blog'
                                            ? pathname.startsWith('/blog')
                                            : pathname === item.href;

                                        return (
                                            <motion.button
                                                key={item.label}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                                                onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
                                                className={`
                                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 active:scale-[0.98]
                                                    ${isActive
                                                        ? 'bg-gray-100/80 dark:bg-white/[0.08]'
                                                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                                    }
                                                `}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color.replace('text-', 'bg-')}/10`}>
                                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                                </div>
                                                <span className={`text-[14px] font-semibold flex-1 text-left ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {item.label}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Separator */}
                                <div className="mx-4 h-px bg-gray-100 dark:bg-white/[0.06]" />

                                {/* Auth section */}
                                <div className="p-3 flex gap-2">
                                    <button
                                        onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-white/[0.06] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Log in
                                    </button>
                                    <button
                                        onClick={() => { router.push('/signup'); setMobileMenuOpen(false); }}
                                        className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Get started
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
