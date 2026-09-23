'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Settings,
  Sun,
  Timer,
  X,
} from 'lucide-react';

import { HugeIcon } from '@/lib/huge-icon-map';
import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { useAI } from '@/context/AIContext';
import { useSearch } from '@/context/SearchContext';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface ToolItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

// Core navigation without Homework (per user request)
export const coreNavItems: NavItem[] = [
  { label: 'Overview', href: '/newhome', icon: 'Home02' },
  { label: 'Calendar', href: '/calendar', icon: 'Calendar02' },
  { label: 'Tests', href: '/tests', icon: 'TestTube' },
  { label: 'Grades', href: '/grade-calculator', icon: 'ChartAnalysis' },
];

export const allNavbarTools: ToolItem[] = [
  { label: 'Flashcards', href: '/flashcards', icon: 'Cards01', badge: 'Study' },
  { label: 'Quizzes', href: '/quiz', icon: 'Quiz04', badge: 'AI' },
  { label: 'Writing Assist', href: '/writing-assist', icon: 'AiContentGenerator02', badge: 'AI' },
  { label: 'AI Grader', href: '/grader', icon: 'SchoolReportCard', badge: 'AI' },
  { label: 'Translate', href: '/translate', icon: 'Translate' },
  { label: 'Study Groups', href: '/groups', icon: 'UserGroup03' },
  { label: 'Discussions', href: '/discussions', icon: 'Chat' },
  { label: 'Web Saves', href: '/web-saves', icon: 'Bookmark03' },
  { label: 'Mail', href: '/mail', icon: 'MailSend01' },
  { label: 'Mini Games', href: '/games', icon: 'Gameboy' },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/newhome"
      aria-label="TaskTornado Home"
      className="group flex items-center gap-2.5 text-[#275085] dark:text-sky-300 transition-opacity hover:opacity-90 min-w-0 overflow-hidden"
    >
      <div className="relative shrink-0 h-8 w-8">
        <Image
          src="/TaskTornado.svg"
          alt="TaskTornado Logo"
          width={32}
          height={32}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
          priority
        />
        <Image
          src="/TaskTornadoDark.svg"
          alt="TaskTornado Logo"
          width={32}
          height={32}
          className="hidden h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 dark:block"
          priority
        />
      </div>
      <div
        className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
          compact ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[180px] opacity-100 translate-x-0'
        }`}
      >
        <span className="text-[1.35rem] font-bold tracking-tight text-[#275085] dark:text-sky-200 whitespace-nowrap block">
          TaskTornado
        </span>
      </div>
    </Link>
  );
}

export interface NewHomeSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  canAnimate?: boolean;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  isStudyTimerOpen: boolean;
  setIsStudyTimerOpen: (open: boolean) => void;
  timerInfo: {
    isMinimized: boolean;
    isRunning: boolean;
    timeLeft: number;
    totalTime: number;
    formattedTime: string;
    progress: number;
  } | null;
  setTimerRestoreSignal: React.Dispatch<React.SetStateAction<number>>;
}

export default function NewHomeSidebar({
  isCollapsed,
  onToggleCollapse,
  canAnimate = false,
  mobileNavOpen,
  setMobileNavOpen,
  isStudyTimerOpen,
  setIsStudyTimerOpen,
  timerInfo,
  setTimerRestoreSignal,
}: NewHomeSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, full_name, signOut } = useAuth() || {};
  const { isDark, toggleDarkMode } = useDarkMode();
  const { setAIAssistantOpen } = useAI();
  const { openSearch } = useSearch();

  const [toolsFlyoutOpen, setToolsFlyoutOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamically calculate visible tools count based on screen height
  const [visibleToolsCount, setVisibleToolsCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      const h = window.innerHeight;
      if (h >= 920) {
        setVisibleToolsCount(5);
      } else if (h >= 780) {
        setVisibleToolsCount(3);
      } else {
        setVisibleToolsCount(2);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const visibleTools = useMemo(() => allNavbarTools.slice(0, visibleToolsCount), [visibleToolsCount]);
  const popupTools = useMemo(() => allNavbarTools.slice(visibleToolsCount), [visibleToolsCount]);

  const displayName = full_name || user?.email?.split('@')[0] || 'Student';
  const initials = useMemo(() => {
    const names = full_name?.trim().split(/\s+/);
    if (!names || !names[0]) return user?.email?.charAt(0).toUpperCase() || 'U';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, [full_name, user?.email]);

  const isItemActive = (href: string) => {
    if (href === '/newhome') return pathname === '/newhome';
    if (href === '/calendar') return pathname === '/calendar' || pathname?.startsWith('/calendar/');
    if (href === '/tests') return pathname === '/tests' || pathname?.startsWith('/tests/');
    if (href === '/grade-calculator') return pathname === '/grade-calculator' || pathname?.startsWith('/grade-calculator/');
    return pathname === href || pathname?.startsWith(href + '/');
  };

  // Close flyouts on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsFlyoutOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfilePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSignOut = async () => {
    setProfilePopoverOpen(false);
    setMobileNavOpen(false);
    if (signOut) {
      await signOut();
      router.push('/');
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP PERSISTENT FIXED/STICKY SIDEBAR (NO SCROLLING)
          ───────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 hidden lg:flex flex-col justify-between border-r border-[#ead9cc] dark:border-gray-800 bg-[#f7efe4]/95 dark:bg-gray-900/95 backdrop-blur-md select-none h-screen max-h-screen overflow-visible ${
          canAnimate ? 'transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]' : 'transition-none'
        } ${isCollapsed ? 'w-[68px] px-3 py-4' : 'w-[280px] px-3.5 py-4'}`}
      >
        {/* Floating edge toggle pill on sidebar right border */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-5 z-40 grid h-6 w-6 place-items-center rounded-full border border-[#ead9cc] dark:border-gray-700 bg-[#fffaf4] dark:bg-gray-800 text-[#857b70] dark:text-gray-400 shadow-md hover:text-[#275085] dark:hover:text-sky-300 hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 cursor-pointer"
        >
          <ChevronLeft
            className={`h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* TOP SECTION */}
        <div className="flex flex-col gap-2.5 min-w-0 w-full overflow-hidden">
          {/* Header with Brand */}
          <div className="flex items-center h-9 px-0.5 shrink-0 overflow-hidden">
            <BrandMark compact={isCollapsed} />
          </div>

          {/* Search Planner Button */}
          <button
            type="button"
            onClick={openSearch}
            title="Search planner (⌘K)"
            className="flex h-9 w-full items-center rounded-xl bg-white/85 dark:bg-gray-800/85 px-2.5 text-[#857b70] dark:text-gray-400 border border-[#ead9cc] dark:border-gray-700/60 shadow-xs hover:border-[#dbc5b5] dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-colors text-left group overflow-hidden"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center text-[#a89d91] dark:text-gray-400 group-hover:text-[#275085] dark:group-hover:text-sky-300 transition-colors">
              <HugeIcon name="Search01" size={16} className="h-4 w-4 shrink-0" />
            </span>
            <div
              className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed
                  ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                  : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5 flex-1'
              }`}
            >
              <span className="text-[12px] font-medium text-[#7d746a] dark:text-gray-300 whitespace-nowrap block">
                Search planner
              </span>
            </div>
            <span
              className={`overflow-hidden transition-[opacity,transform,max-width] duration-200 ${
                isCollapsed
                  ? 'max-w-0 opacity-0 scale-90 pointer-events-none'
                  : 'max-w-[40px] opacity-100 scale-100'
              }`}
            >
              <kbd className="rounded-md border border-[#dfcebf] dark:border-gray-700 bg-[#f0e4d6]/60 dark:bg-gray-900 px-1.5 py-0.5 text-[9px] font-semibold text-[#857b70] dark:text-gray-400 block whitespace-nowrap">
                ⌘K
              </kbd>
            </span>
          </button>

          {/* Core Navigation Items */}
          <nav className="space-y-0.5" aria-label="Main navigation">
            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed
                  ? 'max-h-0 opacity-0 mb-0'
                  : 'max-h-6 opacity-100 mb-1 px-2.5'
              }`}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9c9183] dark:text-gray-500 whitespace-nowrap">
                Navigation
              </p>
            </div>
            {coreNavItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex h-9 w-full items-center rounded-xl px-2.5 text-left transition-colors duration-150 overflow-hidden ${
                    active
                      ? 'bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 shadow-xs border border-[#ead9cc]/80 dark:border-gray-700 font-semibold'
                      : 'text-[#6c645b] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50 hover:text-[#275085] dark:hover:text-sky-300 font-medium'
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg transition-colors ${
                      active
                        ? 'text-[#275085] dark:text-sky-300'
                        : 'text-[#9e9488] dark:text-gray-500 group-hover:text-[#275085] dark:group-hover:text-sky-300'
                    }`}
                  >
                    <HugeIcon name={item.icon} size={16} className="h-4 w-4 shrink-0" />
                  </span>
                  <div
                    className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                      isCollapsed
                        ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                        : 'max-w-[180px] opacity-100 translate-x-0 ml-2.5 flex-1'
                    }`}
                  >
                    <span className="text-[12.5px] truncate whitespace-nowrap block">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions (Study Timer & Live Timer Bar) */}
          <div className="pt-2 border-t border-[#ead9cc] dark:border-gray-800 space-y-1">
            {/* Live Minimized Timer Bar */}
            {timerInfo?.isMinimized && (
              <button
                type="button"
                onClick={() => {
                  setIsStudyTimerOpen(true);
                  setTimerRestoreSignal((s) => s + 1);
                }}
                title="Restore active study timer"
                className="flex h-9 w-full items-center rounded-xl bg-[#275085]/10 dark:bg-sky-500/15 border border-[#275085]/25 dark:border-sky-500/30 text-[#275085] dark:text-sky-300 hover:border-[#275085]/40 transition-colors px-2.5 overflow-hidden"
              >
                <div className="relative grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[#275085] text-white">
                  <Timer className="h-3 w-3" />
                  {timerInfo.isRunning && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-white dark:ring-gray-900 animate-pulse" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                      : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5 flex-1 text-left'
                  }`}
                >
                  <p className="text-[11px] font-bold tabular-nums leading-none whitespace-nowrap">{timerInfo.formattedTime}</p>
                  <p className="text-[9px] text-[#7d746a] dark:text-gray-400 truncate mt-0.5 whitespace-nowrap">
                    {timerInfo.isRunning ? 'Active session' : 'Paused'}
                  </p>
                </div>
                {!isCollapsed && (
                  <div className="w-10 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shrink-0 ml-1">
                    <div
                      className="h-full bg-[#275085] dark:bg-sky-400 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${timerInfo.progress}%` }}
                    />
                  </div>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsStudyTimerOpen(true)}
              title="Study Timer"
              className="flex h-8.5 w-full items-center rounded-xl bg-white/80 dark:bg-gray-800/80 border border-[#ead9cc] dark:border-gray-700/80 px-2.5 text-[11.5px] font-medium text-[#275085] dark:text-sky-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xs transition-all group overflow-hidden"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center">
                <Timer className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              </span>
              <div
                className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                  isCollapsed
                    ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                    : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5'
                }`}
              >
                <span className="whitespace-nowrap block">
                  Study Timer
                </span>
              </div>
            </button>
          </div>

          {/* Tools & AI Section */}
          <div className="pt-2 border-t border-[#ead9cc] dark:border-gray-800">
            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed
                  ? 'max-h-0 opacity-0 mb-0'
                  : 'max-h-6 opacity-100 mb-1 px-2.5 flex items-center justify-between'
              }`}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9c9183] dark:text-gray-500 whitespace-nowrap">
                Tools & AI
              </p>
              <span className="text-[9px] font-semibold text-[#a89d91] dark:text-gray-500 whitespace-nowrap">
                {allNavbarTools.length} total
              </span>
            </div>

            <div className="space-y-0.5">
              {visibleTools.map((tool) => {
                const active = isItemActive(tool.href);
                return (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    title={isCollapsed ? tool.label : undefined}
                    className={`group flex h-8 w-full items-center justify-between rounded-xl px-2.5 text-left transition-colors duration-150 overflow-hidden ${
                      active
                        ? 'bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 font-semibold shadow-xs border border-[#ead9cc]/80 dark:border-gray-700'
                        : 'text-[#6c645b] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50 hover:text-[#275085] dark:hover:text-sky-300'
                    }`}
                  >
                    <span className="flex items-center min-w-0 flex-1">
                      <span className="grid h-5 w-5 shrink-0 place-items-center">
                        <HugeIcon name={tool.icon} size={15} className="h-[15px] w-[15px] shrink-0" />
                      </span>
                      <div
                        className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                          isCollapsed
                            ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                            : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5 flex-1'
                        }`}
                      >
                        <span className="text-[12px] truncate whitespace-nowrap block">
                          {tool.label}
                        </span>
                      </div>
                    </span>
                    {tool.badge && (
                      <span
                        className={`overflow-hidden transition-[opacity,transform,max-width] duration-200 ${
                          isCollapsed
                            ? 'max-w-0 opacity-0 scale-90 pointer-events-none'
                            : 'max-w-[40px] opacity-100 scale-100'
                        }`}
                      >
                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#275085]/10 dark:bg-sky-500/20 text-[#275085] dark:text-sky-300 block whitespace-nowrap">
                          {tool.badge}
                        </span>
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* More Tools trigger button for the rest */}
              {popupTools.length > 0 && (
                <button
                  type="button"
                  onClick={() => setToolsFlyoutOpen(!toolsFlyoutOpen)}
                  title={`More Tools (${popupTools.length})`}
                  className={`group flex h-8 w-full items-center justify-between rounded-xl px-2.5 text-left transition-colors duration-150 mt-0.5 overflow-hidden ${
                    toolsFlyoutOpen
                      ? 'bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 font-semibold shadow-xs border border-[#ead9cc]/80 dark:border-gray-700'
                      : 'text-[#7d746a] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50 hover:text-[#275085] dark:hover:text-sky-300'
                  }`}
                >
                  <span className="flex items-center min-w-0 flex-1">
                    <span className="grid h-5 w-5 shrink-0 place-items-center text-[#9e9488] dark:text-gray-500">
                      <HugeIcon name="LayoutGrid" size={14} className="h-3.5 w-3.5 shrink-0" />
                    </span>
                    <div
                      className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                        isCollapsed
                          ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                          : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5 flex-1'
                      }`}
                    >
                      <span className="text-[12px] font-medium whitespace-nowrap block">
                        More tools ({popupTools.length})
                      </span>
                    </div>
                  </span>
                  <span
                    className={`overflow-hidden transition-[opacity,transform,max-width] duration-200 ${
                      isCollapsed
                        ? 'max-w-0 opacity-0 pointer-events-none'
                        : 'max-w-[20px] opacity-100'
                    }`}
                  >
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                        toolsFlyoutOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#ead9cc] dark:border-gray-800 shrink-0 w-full overflow-hidden">
          {/* Aurora AI Button */}
          <button
            type="button"
            onClick={() => setAIAssistantOpen(true)}
            title="Aurora AI Assistant"
            className="w-full flex h-9 items-center rounded-xl bg-gradient-to-r from-[#275085] to-[#3d608f] dark:from-[#173359] dark:to-[#22477a] px-2.5 text-white shadow-xs hover:opacity-95 transition-all text-left overflow-hidden relative"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center">
              <HugeIcon name="AiMagic" size={15} className="h-[15px] w-[15px] text-white shrink-0" />
            </span>
            <div
              className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed
                  ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                  : 'max-w-[160px] opacity-100 translate-x-0 ml-2.5 flex-1'
              }`}
            >
              <p className="text-[12px] font-semibold leading-none whitespace-nowrap">Aurora AI</p>
              <p className="mt-0.5 truncate text-[9.5px] text-white/70 whitespace-nowrap">Study companion</p>
            </div>
            <span
              className={`h-2 w-2 rounded-full bg-[#45d39b] ring-1.5 ring-white dark:ring-gray-900 shrink-0 transition-all duration-200 ${
                isCollapsed ? 'absolute top-1.5 right-1.5' : 'relative ml-1'
              }`}
            />
          </button>

          {/* User Profile & Account Bar */}
          <div className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-gray-800/70 p-1 border border-[#ead9cc]/80 dark:border-gray-700/60 overflow-hidden h-10 w-full">
            <button
              type="button"
              onClick={() => isCollapsed ? setProfilePopoverOpen(!profilePopoverOpen) : null}
              title={isCollapsed ? `${displayName} (Account & Settings)` : undefined}
              className="flex items-center min-w-0 flex-1 overflow-hidden text-left"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#275085] to-[#3d608f] text-white font-bold text-[10.5px] shadow-xs select-none">
                {initials}
              </div>
              <div
                className={`overflow-hidden transition-[max-width,opacity,transform] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
                  isCollapsed
                    ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                    : 'max-w-[140px] opacity-100 translate-x-0 ml-2 flex-1'
                }`}
              >
                <p className="truncate text-[11.5px] font-semibold text-[#1f3f6b] dark:text-sky-200 leading-tight whitespace-nowrap">
                  {displayName}
                </p>
                <p className="truncate text-[9px] text-[#857b70] dark:text-gray-400 leading-tight whitespace-nowrap mt-0.5">
                  {user?.email ? user.email.split('@')[0] : 'Student'}
                </p>
              </div>
            </button>

            <div
              className={`flex items-center gap-0.5 shrink-0 overflow-hidden transition-[max-width,opacity] duration-200 ${
                isCollapsed
                  ? 'max-w-0 opacity-0 pointer-events-none'
                  : 'max-w-[85px] opacity-100'
              }`}
            >
              <button
                type="button"
                onClick={toggleDarkMode}
                title={isDark ? 'Light mode' : 'Dark mode'}
                className="grid h-6.5 w-6.5 place-items-center rounded-lg text-[#6c645b] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-[#275085]" />}
              </button>
              <Link
                href="/settings"
                title="Settings"
                className={`grid h-6.5 w-6.5 place-items-center rounded-lg transition-colors ${
                  pathname === '/settings'
                    ? 'bg-[#eaf2fb] dark:bg-sky-500/20 text-[#275085] dark:text-sky-300 font-semibold'
                    : 'text-[#6c645b] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
              {user && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Log out"
                  className="grid h-6.5 w-6.5 place-items-center rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          FLOATING TOOLS FLYOUT POPOVER (NEXT TO SIDEBAR)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toolsFlyoutOpen && (
          <motion.div
            ref={toolsRef}
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={`fixed z-50 w-[330px] rounded-2xl border border-[#ead9cc] dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-3.5 text-[#171722] dark:text-gray-100 ${
              isCollapsed ? 'left-[76px] top-28' : 'left-[290px] top-28'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ead9cc]/80 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <HugeIcon name="LayoutGrid" size={16} className="text-[#275085] dark:text-sky-300" />
                <span className="text-[13px] font-bold text-[#1f3f6b] dark:text-sky-200">Tools & AI Suite</span>
              </div>
              <button
                type="button"
                onClick={() => setToolsFlyoutOpen(false)}
                className="text-[#9c9183] hover:text-[#275085] dark:hover:text-sky-300 p-1 rounded-lg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {allNavbarTools.map((tool) => {
                const active = isItemActive(tool.href);
                return (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    onClick={() => setToolsFlyoutOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-[12px] font-medium transition-colors group ${
                      active
                        ? 'bg-[#eaf2fb] dark:bg-sky-500/20 text-[#275085] dark:text-sky-300 font-semibold'
                        : 'text-[#555661] dark:text-gray-300 hover:bg-[#f7efe4] dark:hover:bg-gray-800/80 hover:text-[#275085] dark:hover:text-sky-300'
                    }`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#eaf2fb] dark:bg-sky-500/10 text-[#275085] dark:text-sky-300 group-hover:scale-105 transition-transform">
                      <HugeIcon name={tool.icon} size={15} className="h-[15px] w-[15px]" />
                    </span>
                    <span className="truncate flex-1">{tool.label}</span>
                    {tool.badge && (
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#275085]/10 dark:bg-sky-500/20 text-[#275085] dark:text-sky-300">
                        {tool.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#ead9cc]/80 dark:border-gray-800 flex items-center justify-between text-[10.5px] text-[#857b70] dark:text-gray-400 px-1">
              <Link href="/blog" onClick={() => setToolsFlyoutOpen(false)} className="hover:text-[#275085] dark:hover:text-sky-300">Blog</Link>
              <span>•</span>
              <Link href="/tutorials" onClick={() => setToolsFlyoutOpen(false)} className="hover:text-[#275085] dark:hover:text-sky-300">Tutorials</Link>
              <span>•</span>
              <Link href="/changelog" onClick={() => setToolsFlyoutOpen(false)} className="hover:text-[#275085] dark:hover:text-sky-300">Changelog</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          COLLAPSED PROFILE POPOVER (ANCHORED TO AVATAR)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCollapsed && profilePopoverOpen && (
          <motion.div
            ref={profileRef}
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed z-50 left-[76px] bottom-4 w-[220px] rounded-2xl border border-[#ead9cc] dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-2.5 text-[#171722] dark:text-gray-100"
          >
            <div className="px-2 py-1.5 border-b border-[#ead9cc]/80 dark:border-gray-800 mb-1.5">
              <p className="text-[12px] font-bold text-[#1f3f6b] dark:text-sky-200 truncate">{displayName}</p>
              <p className="text-[10px] text-[#857b70] dark:text-gray-400 truncate">{user?.email || 'Student'}</p>
            </div>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-[#555661] dark:text-gray-300 hover:bg-[#f7efe4] dark:hover:bg-gray-800 transition-colors text-left"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-[#275085]" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <Link
              href="/settings"
              onClick={() => setProfilePopoverOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-[#555661] dark:text-gray-300 hover:bg-[#f7efe4] dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left mt-1 pt-1.5 border-t border-[#ead9cc]/80 dark:border-gray-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-IN DRAWER
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-[300px] max-w-[85vw] h-full bg-[#f7efe4] dark:bg-gray-900 border-r border-[#ead9cc] dark:border-gray-800 shadow-2xl flex flex-col justify-between p-4 overflow-y-auto"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <BrandMark compact />
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[#ead9cc] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 shadow-xs hover:bg-white/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    openSearch();
                    setMobileNavOpen(false);
                  }}
                  className="flex h-9.5 w-full items-center justify-between gap-2.5 rounded-xl bg-white dark:bg-gray-800 px-3 text-[#857b70] dark:text-gray-400 border border-[#ead9cc] dark:border-gray-700/60 shadow-xs text-left"
                >
                  <span className="flex items-center gap-2">
                    <HugeIcon name="Search01" size={16} />
                    <span className="text-[12.5px] font-medium text-[#7d746a] dark:text-gray-300">Search planner</span>
                  </span>
                  <kbd className="text-[10px] bg-[#f0e4d6] dark:bg-gray-900 px-1.5 py-0.5 rounded border border-[#dfcebf] dark:border-gray-700">⌘K</kbd>
                </button>

                <nav className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9c9183] dark:text-gray-500">Navigation</p>
                  {coreNavItems.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium ${
                          active
                            ? 'bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 font-semibold shadow-xs border border-[#ead9cc]/80 dark:border-gray-700'
                            : 'text-[#6c645b] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <HugeIcon name={item.icon} size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-[#ead9cc] dark:border-gray-800 space-y-1.5">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9c9183] dark:text-gray-500">Quick Actions</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudyTimerOpen(true);
                      setMobileNavOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-white dark:bg-gray-800 border border-[#ead9cc] dark:border-gray-700 px-2.5 py-2 text-[12px] font-medium text-[#275085] dark:text-sky-300"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    <span>Study Timer</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#ead9cc] dark:border-gray-800 space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9c9183] dark:text-gray-500">Tools & Apps</p>
                  <div className="grid grid-cols-2 gap-1 max-h-[220px] overflow-y-auto pr-1">
                    {allNavbarTools.map((tool) => {
                      const active = isItemActive(tool.href);
                      return (
                        <Link
                          key={tool.label}
                          href={tool.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-[12px] font-medium transition-colors ${
                            active
                              ? 'bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 font-semibold'
                              : 'text-[#555661] dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800'
                          }`}
                        >
                          <HugeIcon name={tool.icon} size={15} className="text-[#275085] dark:text-sky-300 shrink-0" />
                          <span className="truncate">{tool.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#ead9cc] dark:border-gray-800 space-y-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAIAssistantOpen(true);
                    setMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#275085] to-[#3d608f] px-3 py-2 text-white"
                >
                  <HugeIcon name="AiMagic" size={16} />
                  <span className="text-[12px] font-semibold flex-1 text-left">Aurora AI Assistant</span>
                  <span className="h-2 w-2 rounded-full bg-[#45d39b] animate-pulse" />
                </button>

                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-gray-800 border border-[#ead9cc] dark:border-gray-700">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#275085] text-white font-bold text-xs">
                      {initials}
                    </div>
                    <p className="truncate text-[12px] font-semibold text-[#1f3f6b] dark:text-sky-200">{displayName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      className="grid h-7 w-7 place-items-center rounded-lg text-[#6c645b] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-[#275085]" />}
                    </button>
                    <Link
                      href="/settings"
                      onClick={() => setMobileNavOpen(false)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-[#6c645b] dark:text-gray-300"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Link>
                    {user && (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
