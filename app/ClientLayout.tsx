'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { SearchBar } from '@/components/SearchBar';
import { useAI } from '@/context/AIContext';
import { useAuth } from '@/context/AuthContext';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { DictionaryPopup } from '@/components/DictionaryPopup';
import * as React from 'react';
import dynamic from 'next/dynamic';
import ReboundNavbar from '@/components/ReboundNavbar';
import { patchFacehashFaces } from '@/lib/facehash-custom-faces';
import AdvancedAIGlow from '@/components/AdvancedAIGlow';
import { useSearch } from '@/context/SearchContext';
import { BrandMark } from '@/components/NewHomeSidebar';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Menu } from 'lucide-react';

// Register custom eye types before any Facehash renders
patchFacehashFaces();

// Dynamically import navs with no SSR to avoid hydration issues
const AppNavbar = dynamic(() => import('@/components/AppNavbar'), {
  ssr: false,
});

const GuardianNavbar = dynamic(() => import('@/components/GuardianNavbar'), {
  ssr: false,
});

const NewHomeSidebar = dynamic(() => import('@/components/NewHomeSidebar'), {
  ssr: false,
});

const AIAssistant = dynamic(() => import('@/components/AIAssistant').then((m) => m.AIAssistant), {
  ssr: false,
});

const StudyTimer = dynamic(() => import('@/components/StudyTimer').then((m) => m.StudyTimer), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
  initialSidebarCollapsed?: boolean;
}

// Student-only routes that guardians should NOT access
const STUDENT_ONLY_ROUTES = [
  '/dashboard',
  '/calendar',
  '/homework',
  '/flashcards',
  '/web-saves',
  '/discussions',
  '/groups',
  '/quiz',
  '/writing-assist',
  '/translate',
  '/grade-calculator',
  '/grader',
  '/games',
  '/complete-signup',
];

// Routes connected to the new navigation sidebar (tested instead of top navbar)
const SIDEBAR_EXACT_ROUTES = new Set([
  '/newhome',
  '/calendar',
  '/tests',
  '/grade-calculator',
  '/flashcards',
  '/quiz',
  '/writing-assist',
  '/grader',
  '/translate',
  '/groups',
  '/discussions',
  '/web-saves',
  '/mail',
  '/games',
  '/settings',
  '/snake',
  '/memory-match',
  '/word-scramble',
  '/reaction-time',
  '/task-tower',
  '/typing-speed',
  '/math-sprint',
  '/cat-shop',
  '/tutorials',
  '/changelog',
]);

const SIDEBAR_PREFIX_ROUTES = [
  '/calendar/',
  '/tests/',
  '/grade-calculator/',
  '/flashcards/',
  '/quiz/',
  '/writing-assist/',
  '/grader/',
  '/translate/',
  '/groups/',
  '/discussions/',
  '/web-saves/',
  '/mail/',
  '/games/',
  '/settings/',
  '/homework/',
];

function isSidebarRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SIDEBAR_EXACT_ROUTES.has(pathname)) return true;
  return SIDEBAR_PREFIX_ROUTES.some((prefix) => pathname.startsWith(prefix));
}

export function ClientLayout({ children, initialSidebarCollapsed }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAIAssistantOpen, isAISidebarMode, setAIAssistantOpen } = useAI();
  const { openSearch } = useSearch();
  const { user, isGuardian, loading: authLoading } = useAuth() || {};
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; hasSelection?: boolean; selectedText?: string; isAiChat?: boolean } | null>(null);
  const [dictionaryWord, setDictionaryWord] = React.useState<string | null>(null);

  // Desktop sidebar collapse state (persisted in cookie & localStorage for zero initial flash)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
    if (typeof initialSidebarCollapsed === 'boolean') return initialSidebarCollapsed;
    if (typeof window === 'undefined') return false;
    try {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('tasktornado_newhome_sidebar_collapsed='));
      if (cookie) return cookie.split('=')[1] === 'true';
      return localStorage.getItem('tasktornado_newhome_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Only enable width and padding-left transitions when user explicitly toggles the sidebar.
  // This completely eliminates the page-load/navigation flash-and-shrink glitch.
  const [canAnimateSidebar, setCanAnimateSidebar] = React.useState(false);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [isStudyTimerOpen, setIsStudyTimerOpen] = React.useState(false);
  const [timerInfo, setTimerInfo] = React.useState<{
    isMinimized: boolean;
    isRunning: boolean;
    timeLeft: number;
    totalTime: number;
    formattedTime: string;
    progress: number;
  } | null>(null);
  const [timerRestoreSignal, setTimerRestoreSignal] = React.useState(0);

  const toggleSidebarCollapsed = () => {
    setCanAnimateSidebar(true);
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tasktornado_newhome_sidebar_collapsed', String(next));
        document.cookie = `tasktornado_newhome_sidebar_collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close mobile sidebar drawer on route navigation
  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const isSidebarPage = Boolean(
    !isGuardian &&
    isSidebarRoute(pathname) &&
    (user || authLoading || pathname === '/newhome')
  );
  
  // Advanced AI Mode state
  const [advancedAIMode, setAdvancedAIMode] = React.useState(false);
  
  React.useEffect(() => {
    const saved = document.cookie.split('; ').find(row => row.startsWith('advancedAIMode='));
    if (saved) {
      setAdvancedAIMode(saved.split('=')[1] === 'true');
    }
  }, []);

  // Track if we're on desktop (md+) for sidebar margin
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showSidebarMargin = isDesktop && isAIAssistantOpen && isAISidebarMode;

  // Redirect guardians away from student-only routes
  React.useEffect(() => {
    if (user && isGuardian && STUDENT_ONLY_ROUTES.some(r => pathname === r || pathname?.startsWith(r + '/'))) {
      router.replace('/guardian/dashboard');
    }
  }, [user, isGuardian, pathname, router]);

  // The landing page is only for signed-out visitors. Once the authenticated
  // session and eligibility check finish, send each account to its dashboard.
  React.useEffect(() => {
    if (authLoading || !user || pathname !== '/') return;
    router.replace(isGuardian ? '/guardian/dashboard' : '/dashboard');
  }, [authLoading, isGuardian, pathname, router, user]);



  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    const target = event.target as HTMLElement | null;
    const isAiChat = Boolean(target?.closest('[data-ai-chat]'));

    // Detect text selection
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    const hasSelection = Boolean(selectedText && selectedText.length > 0);

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      hasSelection,
      selectedText: hasSelection ? selectedText : undefined,
      isAiChat,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleDictionaryOpen = (word: string) => {
    setDictionaryWord(word);
  };

  const closeDictionary = () => {
    setDictionaryWord(null);
  };

  // Presentation routes intentionally skip every piece of site chrome so their content can occupy the full display.
  if (pathname === '/publiccalendar/tv') {
    return <>{children}</>;
  }

  return (
    <>
      <Analytics />
      <AdvancedAIGlow enabled={advancedAIMode} />
      <div className="min-h-screen flex flex-col" onContextMenu={handleContextMenu}>
        {/* SearchBar - rendered globally so it can be opened from anywhere */}
        <SearchBar />

        {/* Mobile Header on sidebar-enabled pages */}
        {isSidebarPage && (
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#ead9cc] dark:border-gray-800 bg-[#fffaf4]/90 dark:bg-gray-950/90 backdrop-blur-md px-4 sm:px-6 lg:hidden">
            <BrandMark compact />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search planner"
                className="grid h-9 w-9 place-items-center rounded-xl border border-[#ead9cc] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 shadow-xs hover:bg-white/80 transition-colors"
              >
                <HugeIcon name="Search01" size={18} className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="grid h-9 w-9 place-items-center rounded-xl border border-[#ead9cc] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#275085] dark:text-sky-300 shadow-xs hover:bg-white/80 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>
        )}

        <main
          className={`flex-1 bg-transparent overflow-x-hidden pt-0 ${
            isSidebarPage ? (sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[280px]') : ''
          } ${
            canAnimateSidebar
              ? 'transition-[padding-left] duration-300 ease-[cubic-bezier(0.2,0,0,1)]'
              : 'transition-none'
          }`}
          style={{
            marginRight: showSidebarMargin ? 420 : 0,
            transition: 'margin-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {pathname === '/' && (authLoading || user) ? (
            <div
              aria-label={user ? 'Opening dashboard' : 'Checking account'}
              className="flex min-h-screen items-center justify-center"
            >
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#275085]/20 border-t-[#275085]" />
            </div>
          ) : (
            children
          )}
        </main>
        {/* Nav: Sidebar on connected routes; GuardianNavbar for guardians; AppNavbar for standard student routes; ReboundNavbar for logged-out */}
        {isSidebarPage ? (
          <>
            <NewHomeSidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapsed}
              canAnimate={canAnimateSidebar}
              mobileNavOpen={mobileNavOpen}
              setMobileNavOpen={setMobileNavOpen}
              isStudyTimerOpen={isStudyTimerOpen}
              setIsStudyTimerOpen={setIsStudyTimerOpen}
              timerInfo={timerInfo}
              setTimerRestoreSignal={setTimerRestoreSignal}
            />
            <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setAIAssistantOpen(false)} />
            <StudyTimer
              trigger={<div />}
              isOpen={isStudyTimerOpen}
              onOpenChange={setIsStudyTimerOpen}
              onMinimizedInfo={setTimerInfo}
              restoreSignal={timerRestoreSignal}
            />
          </>
        ) : (
          !authLoading && (
            user
              ? (isGuardian ? <GuardianNavbar /> : <AppNavbar />)
              : <ReboundNavbar />
          )
        )}
                {contextMenu && (
          <CustomContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            hasSelection={contextMenu.hasSelection}
            selectedText={contextMenu.selectedText}
            isAiChat={contextMenu.isAiChat}
            onDictionaryOpen={handleDictionaryOpen}
          />
        )}
        {dictionaryWord && (
          <DictionaryPopup
            word={dictionaryWord}
            isOpen={Boolean(dictionaryWord)}
            onClose={closeDictionary}
          />
        )}
      </div>
    </>
  );
}
