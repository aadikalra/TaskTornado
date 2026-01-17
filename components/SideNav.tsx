'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    BookOpen,
    Calendar,
    Search,
    Sparkles,
    Users,
    MessageSquare,
    Settings,
    GraduationCap,
    Clock,
    Pin,
    Gamepad2,
    FileText,
    LogOut,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useAI } from '@/context/AIContext';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    onClick?: () => void;
}

export function SideNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth() || {}; // Added signOut
    const { openSearch } = useSearch();
    const { isAIAssistantOpen, setAIAssistantOpen } = useAI();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const allItems: NavItem[] = [
        { id: 'home', label: 'Home', icon: LayoutGrid, path: user ? '/dashboard' : '/' },
        { id: 'search', label: 'Search', icon: Search, path: '#', onClick: openSearch },
        {
            id: 'ai',
            label: 'Aurora',
            icon: Sparkles,
            path: '#',
            onClick: () => {
                if (!user) {
                    router.push('/login');
                    return;
                }
                setAIAssistantOpen(!isAIAssistantOpen);
            }
        },
        { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
        { id: 'flashcards', label: 'Flashcards', icon: BookOpen, path: '/flashcards' },
        { id: 'quiz', label: 'Quizzes', icon: GraduationCap, path: '/quiz' },
        { id: 'web-saves', label: 'Web Saves', icon: Pin, path: '/web-saves' },
        { id: 'writing', label: 'Writing', icon: FileText, path: '/writing-assist' },
        { id: 'groups', label: 'Groups', icon: Users, path: '/groups' },
        { id: 'discussions', label: 'Discussion', icon: MessageSquare, path: '/discussions' },
        { id: 'games', label: 'Games', icon: Gamepad2, path: '/games' },
        { id: 'changelog', label: 'Updates', icon: FileText, path: '/changelog' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];

    // Filter items based on auth, similar to DockNav
    const navItems = allItems.filter(item => {
        if (!user) {
            return ['home', 'changelog'].includes(item.id);
        }
        return true;
    });

    const activeItem = navItems.find(item => item.path === pathname)?.id || (pathname === '/dashboard' ? 'home' : null);

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 z-50 bg-[#e3e9f0]/40 dark:bg-[#0f172a]/40 backdrop-blur-2xl border-r border-white/20 dark:border-white/5">
            {/* Logo */}
            <div className="mb-8 text-[#264f84] dark:text-blue-400 shrink-0">
                <GraduationCap className="w-10 h-10" strokeWidth={1.5} />
            </div>

            {/* Nav Items - Scrollable area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar py-2">
                <nav className="flex flex-col gap-6 w-full">
                    {navItems.map((item) => {
                        const isActive = activeItem === item.id;
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                className="relative flex flex-col items-center group cursor-pointer"
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    } else {
                                        router.push(item.path);
                                    }
                                }}
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="indicator"
                                        className="absolute left-0 w-1 h-8 bg-[#264f84] dark:bg-blue-500 rounded-r-full"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}

                                {/* Icon Container */}
                                <div
                                    className={cn(
                                        "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                                        isActive
                                            ? "bg-[#264f84] text-white shadow-lg shadow-[#264f84]/20"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "mt-1.5 text-[10px] font-medium transition-colors duration-300 opacity-0 group-hover:opacity-100",
                                        isActive ? "text-[#264f84] dark:text-blue-400 opacity-100" : "text-gray-400 dark:text-gray-500"
                                    )}
                                >
                                    {item.label}
                                </span>

                                {/* Hover Tooltip */}
                                <AnimatePresence>
                                    {hoveredItem === item.id && !isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="absolute left-20 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-xl"
                                        >
                                            {item.label}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 flex flex-col items-center gap-6 shrink-0">
                <div className="p-3 rounded-2xl bg-white/30 dark:bg-white/5 text-gray-500 hover:text-[#264f84] transition-colors cursor-pointer group relative">
                    <Clock className="w-6 h-6 stroke-[1.5]" />
                    <div className="absolute left-20 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                        Study Timer
                    </div>
                </div>

                {user && (
                    <div
                        onClick={() => signOut?.()}
                        className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 transition-colors cursor-pointer group relative"
                    >
                        <LogOut className="w-6 h-6 stroke-[1.5]" />
                        <div className="absolute left-20 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
