import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Facehash } from 'facehash';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import Dock from './Dock';
import { AIAssistant } from './AIAssistant';
import { StudyTimer } from './StudyTimer';
import IconMagnifier from './glass-icons/IconMagnifier';
import IconSparkle from './glass-icons/IconSparkle';
import IconCalendar from './glass-icons/IconCalendar';
import IconBookOpen from './glass-icons/IconBookOpen';
import IconPin from './glass-icons/IconPin';
import IconUsers from './glass-icons/IconUsers';
import IconFile from './glass-icons/IconFile';
import IconHouse from './glass-icons/IconHouse';
import IconGear from './glass-icons/IconGear';
import IconProgressBar from './glass-icons/IconProgressBar';
import IconBox from './glass-icons/IconBox';
import IconGrid2 from './glass-icons/IconGrid2';
import IconPen from './glass-icons/IconPen';
import IconTabOpen from './glass-icons/IconTabOpen';
import IconCircleCopyPlus from './glass-icons/IconCircleCopyPlus';
import IconMessageSquare from './glass-icons/IconMessageSquare';
import IconQuestion from './glass-icons/IconQuestions';
import { useAI } from '@/context/AIContext';
import IconBlog from './glass-icons/IconBlog';
import IconTranslate from './glass-icons/IconTranslate';
import IconBell from './glass-icons/IconBell';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationPanel, useNotifications } from './NotificationPanel';

export default function DockNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, full_name } = useAuth() || {};
  const { openSearch } = useSearch();
  const { isAIAssistantOpen, setAIAssistantOpen } = useAI();
  const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);

  // Track screen size for responsive item visibility
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsVerySmall(width < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close "More" menu on outside click
  useEffect(() => {
    if (!isMoreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    // Use a slight delay to prevent the click that opened the menu from immediately closing it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  // Close "More" menu on route change
  useEffect(() => {
    setIsMoreOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  // Items that go into the overflow "More" grid
  const overflowItems = [
    {
      icon: <IconBookOpen />,
      label: 'Flashcards',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/flashcards');
      },
      isActive: pathname === '/flashcards',
    },
    {
      icon: <IconGrid2 />,
      label: 'Quizzes',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/quiz');
      },
      isActive: pathname === '/quiz',
    },
    {
      icon: <IconPin />,
      label: 'Web Saves',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/web-saves');
      },
      isActive: pathname === '/web-saves',
    },
    {
      icon: <IconPen />,
      label: 'Writing',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/writing-assist');
      },
      isActive: pathname === '/writing-assist',
    },
    {
      icon: <IconTranslate />,
      label: 'Translate',
      onClick: () => router.push('/translate'),
      isActive: pathname === '/translate',
    },
    {
      icon: <IconCircleCopyPlus />,
      label: 'Grades',
      onClick: () => router.push('/grade-calculator'),
      isActive: pathname === '/grade-calculator',
    },
    {
      icon: <IconUsers />,
      label: 'Groups',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/groups');
      },
      isActive: pathname === '/groups',
    },
    {
      icon: <IconMessageSquare />,
      label: 'Discuss',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/discussions');
      },
      isActive: pathname === '/discussions',
    },
    {
      icon: <IconProgressBar />,
      label: 'Timer',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        setIsStudyTimerOpen(true); setIsMoreOpen(false);
      },
      isActive: isStudyTimerOpen,
    },
    {
      icon: <IconBox />,
      label: 'Games',
      onClick: () => {
        if (!user) { router.push('/login'); return; }
        router.push('/games');
      },
      isActive: pathname === '/games',
    },
    {
      icon: <IconQuestion />,
      label: 'Tutorials',
      onClick: () => router.push('/tutorials'),
      isActive: pathname === '/tutorials',
    },
    {
      icon: <IconBlog />,
      label: 'Blog',
      onClick: () => router.push('/blog'),
      isActive: pathname.startsWith('/blog'),
    },
    {
      icon: <IconFile />,
      label: 'Changelog',
      onClick: () => router.push('/changelog'),
      isActive: pathname === '/changelog',
    },
  ];

  // Public overflow items (logged-out) — only free tools + content pages
  const publicOverflowItems = [
    {
      icon: <IconTranslate />,
      label: 'Translate',
      onClick: () => router.push('/translate'),
      isActive: pathname === '/translate',
    },
    {
      icon: <IconCircleCopyPlus />,
      label: 'Grades',
      onClick: () => router.push('/grade-calculator'),
      isActive: pathname === '/grade-calculator',
    },
    {
      icon: <IconQuestion />,
      label: 'Tutorials',
      onClick: () => router.push('/tutorials'),
      isActive: pathname === '/tutorials',
    },
    {
      icon: <IconBlog />,
      label: 'Blog',
      onClick: () => router.push('/blog'),
      isActive: pathname.startsWith('/blog'),
    },
    {
      icon: <IconFile />,
      label: 'Changelog',
      onClick: () => router.push('/changelog'),
      isActive: pathname === '/changelog',
    },
  ];

  // Check if any overflow item is currently active
  const currentOverflowItems = user ? overflowItems : publicOverflowItems;
  const activeOverflowItem = currentOverflowItems.find(item => item.isActive);
  const isOverflowActive = !!activeOverflowItem;

  // The "More" icon — a simple 4-dot grid
  const MoreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="2.5" fill="url(#more-grad)" opacity="0.85" />
      <circle cx="16" cy="8" r="2.5" fill="url(#more-grad)" opacity="0.85" />
      <circle cx="8" cy="16" r="2.5" fill="url(#more-grad)" opacity="0.85" />
      <circle cx="16" cy="16" r="2.5" fill="url(#more-grad)" opacity="0.85" />
      <defs>
        <linearGradient id="more-grad" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6B7280" />
          <stop offset="1" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Primary dock items (always visible)
  const dockItems = user ? [
    // --- CORE ---
    {
      icon: <IconHouse />,
      label: 'Home',
      onClick: () => router.push('/dashboard'),
      priority: 'essential',
      isActive: pathname === '/dashboard' || pathname === '/',
      group: 'core'
    },
    {
      icon: <IconMagnifier />,
      label: 'Search',
      onClick: openSearch,
      priority: 'essential',
      group: 'core',
      dataTour: 'search'
    },
    {
      icon: <IconSparkle />,
      label: 'Aurora',
      onClick: () => {
        setAIAssistantOpen(!isAIAssistantOpen);
      },
      priority: 'essential',
      isActive: isAIAssistantOpen,
      group: 'core',
      dataTour: 'aurora'
    },
    {
      icon: <IconCalendar />,
      label: 'Calendar',
      onClick: () => router.push('/calendar'),
      priority: 'essential',
      isActive: pathname === '/calendar',
      group: 'core'
    },

    // --- DIVIDER ---
    { type: 'divider' as const },

    // --- MORE ---
    {
      icon: <MoreIcon />,
      label: 'More',
      onClick: () => { setIsMoreOpen(prev => !prev); setIsNotificationsOpen(false); },
      priority: 'essential',
      isActive: isMoreOpen || isOverflowActive,
      group: 'more'
    },

    // --- DIVIDER ---
    { type: 'divider' as const },

    // --- SYSTEM ---
    {
      icon: <NotificationBellIcon />,
      label: 'Alerts',
      onClick: () => { setIsNotificationsOpen(!isNotificationsOpen); setIsMoreOpen(false); },
      priority: 'essential',
      isActive: isNotificationsOpen,
      group: 'system'
    },
    {
      icon: <Facehash
        name={full_name || 'User'}
        size={28}
        enableBlink
        intensity3d="dramatic"
        showInitial={true}
        interactive={false}
        colors={['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6']}
        style={{ borderRadius: '50%' }}
      />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
      priority: 'essential',
      isActive: pathname === '/settings',
      group: 'system'
    },
  ] : [
    // Not signed in — public dock with More menu
    {
      icon: <IconHouse />,
      label: 'Home',
      onClick: () => router.push('/'),
      priority: 'essential',
      isActive: pathname === '/',
      group: 'core'
    },

    // --- DIVIDER ---
    { type: 'divider' as const },

    // --- MORE ---
    {
      icon: <MoreIcon />,
      label: 'More',
      onClick: () => { setIsMoreOpen(prev => !prev); setIsNotificationsOpen(false); },
      priority: 'essential',
      isActive: isMoreOpen || isOverflowActive,
      group: 'more'
    },

    // --- DIVIDER ---
    { type: 'divider' as const },

    // --- AUTH ---
    {
      icon: <IconTabOpen />,
      label: 'Login',
      onClick: () => router.push('/login'),
      priority: 'essential',
      group: 'system'
    },
    {
      icon: <IconCircleCopyPlus />,
      label: 'Sign Up',
      onClick: () => router.push('/signup'),
      priority: 'essential',
      group: 'system'
    },
  ];

  return (
    <>
      {/* Active overflow page breadcrumb — shows current page when on a "More" page */}
      <AnimatePresence>
        {activeOverflowItem && !isMoreOpen && (
          <motion.div
            key="breadcrumb"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[55] pointer-events-none"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="w-4 h-4 flex items-center justify-center opacity-70">
                {activeOverflowItem.icon}
              </div>
              <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {activeOverflowItem.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "More" overflow popover */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            ref={moreMenuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-[60] w-[340px] sm:w-[380px]"
          >
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-gray-200/60 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  All Tools
                </span>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.06] transition-all active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-1 p-3">
                {currentOverflowItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => {
                      item.onClick();
                      if (item.label !== 'Timer') setIsMoreOpen(false);
                    }}
                    className={`
                      flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer
                      ${item.isActive
                        ? 'bg-[#264f84]/10 dark:bg-blue-500/15'
                        : 'hover:bg-gray-100/80 dark:hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 flex items-center justify-center rounded-xl transition-all
                      ${item.isActive
                        ? 'bg-[#264f84]/15 dark:bg-blue-500/20 shadow-sm'
                        : 'bg-gray-100/80 dark:bg-white/[0.06]'
                      }
                    `}>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <span className={`
                      text-[11px] font-medium leading-tight text-center
                      ${item.isActive
                        ? 'text-[#264f84] dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dock
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setAIAssistantOpen(false)} />
      <StudyTimer trigger={<div />} isOpen={isStudyTimerOpen} onOpenChange={setIsStudyTimerOpen} />
      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}

// ─── Notification Bell with Badge ──────────────────────────────────────────────
function NotificationBellIcon() {
  const { notifications } = useNotifications();
  const count = notifications.length;

  return (
    <div className="relative">
      <IconBell />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-[3px] text-[8px] font-bold text-white bg-red-500 rounded-full leading-none shadow-sm">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}