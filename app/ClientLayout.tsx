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

// Register custom eye types before any Facehash renders
patchFacehashFaces();


// Dynamically import navs with no SSR to avoid hydration issues

const AppNavbar = dynamic(() => import('@/components/AppNavbar'), {
  ssr: false,
});

const GuardianNavbar = dynamic(() => import('@/components/GuardianNavbar'), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
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

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAIAssistantOpen, isAISidebarMode } = useAI();
  const { user, isGuardian, loading: authLoading } = useAuth() || {};
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; hasSelection?: boolean; selectedText?: string; isAiChat?: boolean } | null>(null);
  const [dictionaryWord, setDictionaryWord] = React.useState<string | null>(null);
  
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

  // Presentation routes intentionally skip every piece of site chrome so the
  // content can occupy the entire display (for example, a wall-mounted TV).
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
        <main
          className={`flex-1 bg-transparent overflow-x-hidden pt-0`}
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
        {/* Nav: GuardianNavbar for guardians, AppNavbar for students, ReboundNavbar for logged-out */}
        {!authLoading && (
          user
            ? (isGuardian ? <GuardianNavbar /> : <AppNavbar />)
            : <ReboundNavbar />
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
