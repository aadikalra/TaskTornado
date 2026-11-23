'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { useAI } from '@/context/AIContext';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import * as React from 'react';
import dynamic from 'next/dynamic';
import ReboundNavbar from '@/components/ReboundNavbar';
import { patchFacehashFaces } from '@/lib/facehash-custom-faces';

// Register custom eye types before any Facehash renders
patchFacehashFaces();

const PageTransition = dynamic(
  () => import('@/components/animate-ui/components/page-transition').then((m) => m.PageTransition),
);

// Dynamically import heavy overlays & authenticated navs so the public landing page stays fast
const AppNavbar = dynamic(() => import('@/components/AppNavbar'), {
  ssr: false,
});

const GuardianNavbar = dynamic(() => import('@/components/GuardianNavbar'), {
  ssr: false,
});

const SearchBar = dynamic(() => import('@/components/SearchBar').then((m) => m.SearchBar), {
  ssr: false,
});

const CustomContextMenu = dynamic(
  () => import('@/components/CustomContextMenu').then((m) => m.CustomContextMenu),
  { ssr: false }
);

const DictionaryPopup = dynamic(
  () => import('@/components/DictionaryPopup').then((m) => m.DictionaryPopup),
  { ssr: false }
);

const AdvancedAIGlow = dynamic(() => import('@/components/AdvancedAIGlow'), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
  /** @deprecated The sidebar has been removed; kept so existing layouts still compile. */
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

export function ClientLayout({ children, initialSidebarCollapsed }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAIAssistantOpen, isAISidebarMode } = useAI();
  const { user, isGuardian, loading: authLoading } = useAuth() || {};
  const { isOpen: isSearchOpen } = useSearch();
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; hasSelection?: boolean; selectedText?: string; isAiChat?: boolean } | null>(null);
  const [dictionaryWord, setDictionaryWord] = React.useState<string | null>(null);

  // Advanced AI Mode state + accessibility preferences from cookies
  const [advancedAIMode, setAdvancedAIMode] = React.useState(false);

  React.useEffect(() => {
    const cookies = document.cookie.split('; ');
    const saved = cookies.find(row => row.startsWith('advancedAIMode='));
    if (saved) {
      setAdvancedAIMode(saved.split('=')[1] === 'true');
    }
    const dyslexic = cookies.find(row => row.startsWith('useDyslexicFont='));
    if (dyslexic?.split('=')[1] === 'true') {
      if (!document.getElementById('opendyslexic-stylesheet')) {
        const link = document.createElement('link');
        link.id = 'opendyslexic-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
        document.head.appendChild(link);
      }
      document.body.classList.add('dyslexic-font');
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

  // Presentation and demo routes intentionally skip every piece of site chrome so their content can occupy the full display.
  if (pathname === '/publiccalendar/tv' || pathname === '/aurora' || pathname === '/demo') {
    return <PageTransition effect="wipe">{children}</PageTransition>;
  }

  return (
    <>
      {process.env.NEXT_PUBLIC_IS_VERCEL === '1' && <Analytics />}
      {advancedAIMode && <AdvancedAIGlow enabled={advancedAIMode} />}
      <div className="min-h-screen flex flex-col" onContextMenu={handleContextMenu}>
        {/* SearchBar - mounted only when opened via Cmd+K / search trigger */}
        {isSearchOpen && <SearchBar />}

        <main
          className="flex-1 bg-transparent overflow-x-hidden pt-0"
          style={{
            marginRight: showSidebarMargin ? 420 : 0,
            transition: 'margin-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {pathname === '/' && !user ? (
            children
          ) : (
            <PageTransition effect="wipe">
              {pathname === '/' && user ? (
                <div
                  aria-label="Opening dashboard"
                  className="flex min-h-screen items-center justify-center"
                >
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#275085]/20 border-t-[#275085]" />
                </div>
              ) : (
                children
              )}
            </PageTransition>
          )}
        </main>
        {/* Nav: GuardianNavbar for guardians; AppNavbar for standard student routes; ReboundNavbar for logged-out */}
        <React.ViewTransition name="site-navigation" default="site-navigation">
          {user
            ? (!authLoading && (isGuardian ? <GuardianNavbar /> : <AppNavbar />))
            : <ReboundNavbar />}
        </React.ViewTransition>
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
