'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, Link2, Users, Home, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function GuardianNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut, full_name } = useAuth() || {};

    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close on route change
    useEffect(() => {
        setProfileOpen(false);
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNavClick = (href: string) => {
        setMobileOpen(false);
        setProfileOpen(false);
        router.push(href);
    };

    const isActive = (href: string) => pathname === href;

    const NAV_ITEMS = [
        { label: 'Dashboard', href: '/guardian/dashboard', icon: Home },
        { label: 'Link Child', href: '/guardian/link', icon: Link2 },
    ];

    const initials = (() => {
        const names = full_name?.trim().split(/\s+/);
        if (!names || !names[0]) return 'G';
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
                    <button onClick={() => handleNavClick('/guardian/dashboard')} className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                            <img src="/TaskTornado.svg" alt="TaskTornado Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg] dark:hidden" />
                            <img src="/TaskTornadoDark.svg" alt="TaskTornado Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg] hidden dark:block" />
                        </div>
                        <span className="text-[#275085] dark:text-blue-200 font-bold text-base sm:text-lg tracking-tight">TaskTornado</span>
                    </button>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Center pill */}
                        <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => handleNavClick(item.href)}
                                        className={`relative flex items-center gap-2 px-4 py-2 text-[13px] font-semibold transition-all duration-300 rounded-full ${isActive(item.href)
                                            ? 'text-[#275085]'
                                            : 'text-white hover:text-white/80'
                                            }`}
                                    >
                                        {isActive(item.href) && (
                                            <motion.div
                                                layoutId="guardian-nav-pill"
                                                className="absolute inset-0 bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                                                style={{ borderRadius: 9999 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className="w-3.5 h-3.5" />
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Profile pill */}
                        <div className="flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
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
                                                    <p className="text-[13px] font-bold text-white truncate">{full_name?.split(' ')[0] || 'Guardian'}</p>
                                                    <p className="text-[10px] font-medium text-white/50 truncate">{user?.email}</p>
                                                    <span className="inline-block mt-1.5 text-[9px] font-bold text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Guardian</span>
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

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30 text-white active:scale-95 transition-transform"
                    >
                        {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
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
                            className="relative z-10 mx-4 mt-20 p-2 bg-[#275085]/95 backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-[0_24px_80px_rgba(39,80,133,0.5)]"
                        >
                            <div className="p-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 px-2">Guardian</p>
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
        </>
    );
}
