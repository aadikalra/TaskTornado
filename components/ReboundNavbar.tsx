'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, MoreHorizontal } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { setGlobalActiveView, emitViewChange } from '@/components/RoleSwitcher';

const NAV_ITEMS = [
    { label: 'Grades', href: '/grades' },
    { label: 'Word Counter', href: '/wordcount' },
    { label: 'Calendar', href: '/publiccalendar' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Blog', href: '/blog' },
    { label: 'Changelog', href: '/changelog' },
];

/** Content items shown directly in the pill */
const PRIMARY_ITEMS = NAV_ITEMS.filter(i => ['Tutorials', 'Blog', 'Changelog'].includes(i.label));
/** Tool items hidden behind the Tools/"More" dropdown */
const TOOL_ITEMS = NAV_ITEMS.filter(i => ['Grades', 'Word Counter', 'Calendar'].includes(i.label));

const ROLES = [
    { key: 'students', label: 'Students', path: '/' },
    { key: 'guardians', label: 'Guardians', path: '/guardians' },
    { key: 'teachers', label: 'Teachers', path: '/teachers' }
];

export default function ReboundNavbar() {
    const router = useRouter();
    const [roleOpen, setRoleOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [tabletMoreOpen, setTabletMoreOpen] = useState(false);
    const tabletMoreRef = useRef<HTMLDivElement>(null);
    const [desktopToolsOpen, setDesktopToolsOpen] = useState(false);
    const desktopToolsRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const [activeRole, setActiveRole] = useState(() => {
        if (pathname === '/guardians') return 'guardians';
        if (pathname === '/teachers') return 'teachers';
        return 'students';
    });

    useEffect(() => {
        if (pathname === '/guardians') setActiveRole('guardians');
        else if (pathname === '/teachers') setActiveRole('teachers');
        else if (pathname === '/') setActiveRole('students');
    }, [pathname]);

    // Close menus on route change
    useEffect(() => {
        setMobileOpen(false);
        setTabletMoreOpen(false);
        setDesktopToolsOpen(false);
        setRoleOpen(false);
    }, [pathname]);

    // Close role switcher on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-role-switcher]')) {
                setRoleOpen(false);
            }
        };
        if (roleOpen) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [roleOpen]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close tablet "More" dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (tabletMoreRef.current && !tabletMoreRef.current.contains(e.target as Node)) {
                setTabletMoreOpen(false);
            }
        };
        if (tabletMoreOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [tabletMoreOpen]);

    // Close desktop "Tools" dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (desktopToolsRef.current && !desktopToolsRef.current.contains(e.target as Node)) {
                setDesktopToolsOpen(false);
            }
        };
        if (desktopToolsOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [desktopToolsOpen]);

    const handleRoleSelect = (key: string, path: string) => {
        setActiveRole(key);
        setRoleOpen(false);
        setMobileOpen(false);
        setTabletMoreOpen(false);
        setDesktopToolsOpen(false);
        setGlobalActiveView(key);
        emitViewChange(key);
        window.history.pushState({}, '', path);
    };

    const handleNavClick = (href: string) => {
        setMobileOpen(false);
        setTabletMoreOpen(false);
        setDesktopToolsOpen(false);
        router.push(href);
    };

    const currentRole = ROLES.find(r => r.key === activeRole)!;
    const otherRoles = ROLES.filter(r => r.key !== activeRole);
    const isLandingPage = ['/', '/guardians', '/teachers'].includes(pathname);

    /* ──────────────────────────────────────────
       Shared: Role switcher block (desktop+tablet)
       ────────────────────────────────────────── */
    const renderRoleSwitcher = (compact = false) => {
        if (!isLandingPage) return null;
        return (
            <>
                <div
                    data-role-switcher
                    className="relative"
                    onMouseEnter={() => setRoleOpen(true)}
                    onMouseLeave={() => setRoleOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setRoleOpen(prev => !prev)}
                        className={`relative ${compact ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]'} font-semibold text-[#275085] rounded-full`}
                    >
                        <div
                            className="absolute inset-0 bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                        />
                        <span className="relative z-10 flex items-center gap-1">
                            {currentRole.label}
                            <ChevronDown
                                aria-hidden="true"
                                className="w-3 h-3 opacity-50"
                                style={{
                                    transform: `rotate(${roleOpen ? 180 : 0}deg)`,
                                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            />
                        </span>
                    </button>

                    {/* Dropdown with other roles */}
                    {roleOpen && (
                        <>
                            {/* Invisible bridge to cover the mt-2 gap so mouseleave doesn't fire */}
                            <div className="absolute top-full left-0 right-0 h-2" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100]">
                                <div className="flex items-center gap-1 p-1 bg-[#275085]/95 backdrop-blur-xl rounded-full border border-[#275085]/30 shadow-[0_8px_24px_rgba(39,80,133,0.35)]">
                                    {otherRoles.map((role) => (
                                        <button
                                            type="button"
                                            key={role.key}
                                            onClick={() => handleRoleSelect(role.key, role.path)}
                                            className={`${compact ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]'} font-semibold text-white hover:bg-white/15 rounded-full transition-all duration-200 active:scale-95 whitespace-nowrap`}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/20 mx-1" />
            </>
        );
    };

    return (
        <>
            <nav data-pathname={pathname} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center justify-between w-full max-w-7xl mx-auto">
                    {/* Logo */}
                    <button type="button" onClick={() => handleNavClick('/')} aria-label="TaskTornado Home" className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                            <picture className="block w-full h-full">
                                <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.webp" type="image/webp" />
                                <img
                                    src="/logo-light.webp"
                                    alt=""
                                    width={32}
                                    height={32}
                                    decoding="async"
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]"
                                />
                            </picture>
                        </div>
                        <span className="text-[#275085] dark:text-blue-200 font-bold text-base sm:text-lg tracking-tight md:hidden lg:inline">TaskTornado</span>
                    </button>

                    {/* ════════════════════════════════════════════
                        DESKTOP (lg+) — Full center pill
                       ════════════════════════════════════════════ */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                        {renderRoleSwitcher()}

                        {/* Primary nav links */}
                        {PRIMARY_ITEMS.map((item) => {
                            const isActive = item.href === '/blog' ? pathname.startsWith('/blog') : pathname === item.href;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => router.push(item.href)}
                                    className={`relative px-4 py-2 text-[13px] font-semibold transition-all duration-300 rounded-full ${isActive ? 'text-white' : 'text-white hover:text-white/80'
                                        }`}
                                >
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* Tools dropdown for desktop */}
                        <div ref={desktopToolsRef} className="relative ml-1">
                            <button
                                onClick={() => setDesktopToolsOpen(prev => !prev)}
                                className={`relative px-4 py-2 text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-300 rounded-full ${desktopToolsOpen ? 'bg-white/15 text-white' : 'text-white hover:text-white/80'}`}
                            >
                                Tools 
                                <ChevronDown className="w-3.5 h-3.5 opacity-70" style={{ transform: `rotate(${desktopToolsOpen ? 180 : 0}deg)`, transition: 'transform 0.3s' }} />
                            </button>

                            {desktopToolsOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100]">
                                    <div className="flex flex-col min-w-[140px] p-1.5 bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_8px_24px_rgba(39,80,133,0.35)]">
                                        {TOOL_ITEMS.map((item) => {
                                            const isActive = item.href === '/blog' ? pathname.startsWith('/blog') : pathname === item.href;
                                            return (
                                                <button
                                                    type="button"
                                                    key={item.label}
                                                    onClick={() => handleNavClick(item.href)}
                                                    className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${isActive
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════
                        TABLET (md–lg) — Compact center pill
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex lg:hidden absolute left-1/2 -translate-x-1/2 items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30">
                        {renderRoleSwitcher(true)}

                        {/* Primary nav links (visible on tablet) */}
                        {PRIMARY_ITEMS.map((item) => {
                            const isActive = item.href === '/blog' ? pathname.startsWith('/blog') : pathname === item.href;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => router.push(item.href)}
                                    className={`relative px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 rounded-full ${isActive ? 'text-white' : 'text-white hover:text-white/80'
                                        }`}
                                >
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* "More" dropdown for overflow items */}
                        <div ref={tabletMoreRef} className="relative">
                            <button
                                onClick={() => setTabletMoreOpen(prev => !prev)}
                                className={`relative px-2.5 py-1.5 text-[12px] font-semibold transition-all duration-300 rounded-full ${tabletMoreOpen ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'}`}
                                aria-label="More navigation items"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {tabletMoreOpen && (
                                <div className="absolute top-full right-0 mt-2 z-[100]">
                                    <div className="flex flex-col min-w-[140px] p-1.5 bg-[#275085]/95 backdrop-blur-xl rounded-2xl border border-[#275085]/30 shadow-[0_8px_24px_rgba(39,80,133,0.35)]">
                                        {TOOL_ITEMS.map((item) => {
                                            const isActive = item.href === '/blog' ? pathname.startsWith('/blog') : pathname === item.href;
                                            return (
                                                <button
                                                    type="button"
                                                    key={item.label}
                                                    onClick={() => handleNavClick(item.href)}
                                                    className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${isActive
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════
                        DESKTOP Auth Buttons (lg+)
                       ════════════════════════════════════════════ */}
                    <div className="hidden lg:flex items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30 pointer-events-auto">
                        <button onClick={() => router.push('/login')} className="px-5 py-2 text-sm font-semibold text-white hover:text-white transition-colors rounded-full">
                            Log in
                        </button>
                        <button onClick={() => router.push('/signup')} className="relative px-5 py-2 text-sm font-semibold text-[#275085] bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-white transition-all active:scale-95">
                            <span className="relative z-10">Sign up</span>
                        </button>
                    </div>

                    {/* ════════════════════════════════════════════
                        TABLET Auth Buttons (md–lg) — compact
                       ════════════════════════════════════════════ */}
                    <div className="hidden md:flex lg:hidden items-center p-1 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30 pointer-events-auto">
                        <button onClick={() => router.push('/login')} className="px-3.5 py-1.5 text-[13px] font-semibold text-white hover:text-white transition-colors rounded-full">
                            Log in
                        </button>
                        <button onClick={() => router.push('/signup')} className="relative px-3.5 py-1.5 text-[13px] font-semibold text-[#275085] bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-white transition-all active:scale-95">
                            <span className="relative z-10">Sign up</span>
                        </button>
                    </div>

                    {/* ════════════════════════════════════════════
                        MOBILE — Hamburger button (<md)
                       ════════════════════════════════════════════ */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                        className="md:hidden flex items-center justify-center w-10 h-10 bg-[#275085]/90 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(39,80,133,0.3)] border border-[#275085]/30 text-white active:scale-95 transition-transform"
                    >
                        {mobileOpen ? <X aria-hidden="true" className="w-4.5 h-4.5" /> : <Menu aria-hidden="true" className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </nav>

            {/* ════════════════════════════════════════════════════════
                MOBILE MENU — full-screen overlay (<md)
               ════════════════════════════════════════════════════════ */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#275085]/60 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />

                    {/* Menu content */}
                    <div className="relative z-10 mx-4 mt-20 p-2 bg-[#275085]/95 backdrop-blur-2xl rounded-[24px] border border-white/10 shadow-[0_24px_80px_rgba(39,80,133,0.5)]">
                        {/* Role switcher (landing pages only) */}
                        {isLandingPage && (
                            <div className="p-3 mb-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 mb-3 px-1">
                                    I&apos;m a...
                                </p>
                                <div className="flex gap-1.5">
                                    {ROLES.map((role) => (
                                        <button
                                            type="button"
                                            key={role.key}
                                            onClick={() => handleRoleSelect(role.key, role.path)}
                                            className={`flex-1 py-2.5 text-[13px] font-bold rounded-full transition-all duration-200 active:scale-95 ${activeRole === role.key
                                                ? 'bg-white/90 text-[#275085] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                                                : 'text-white/80 hover:bg-white/10'
                                                }`}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        {isLandingPage && <div className="h-px bg-white/10 mx-3" />}

                        {/* Nav links */}
                        <div className="p-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = item.href === '/blog' ? pathname.startsWith('/blog') : pathname === item.href;
                                return (
                                    <button
                                        type="button"
                                        key={item.label}
                                        onClick={() => handleNavClick(item.href)}
                                        className={`w-full text-left px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] ${isActive
                                            ? 'bg-white/15 text-white'
                                            : 'text-white/85 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 mx-3" />

                        {/* Auth buttons */}
                        <div className="p-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleNavClick('/login')}
                                className="flex-1 py-3 text-[14px] font-bold text-white/85 hover:text-white rounded-full hover:bg-white/10 transition-all active:scale-95"
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('/signup')}
                                className="flex-1 py-3 text-[14px] font-bold text-[#275085] bg-white/90 rounded-full border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-white transition-all active:scale-95"
                            >
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
