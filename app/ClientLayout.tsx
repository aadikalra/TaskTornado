'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { useAI } from '@/context/AIContext';
import { useAuth } from '@/context/AuthContext';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { DictionaryPopup } from '@/components/DictionaryPopup';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/context/ToastContext';
import { OnboardingTour } from '@/components/OnboardingTour';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import ReboundNavbar from '@/components/ReboundNavbar';
import { patchFacehashFaces } from '@/lib/facehash-custom-faces';

// Register custom eye types before any Facehash renders
patchFacehashFaces();


// Dynamically import navs with no SSR to avoid hydration issues
const DockNav = dynamic(() => import('@/components/DockNav'), {
  ssr: false,
});
const AppNavbar = dynamic(() => import('@/components/AppNavbar'), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isAIAssistantOpen, isAISidebarMode } = useAI();
  const { user } = useAuth() || {};
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; hasSelection?: boolean; selectedText?: string } | null>(null);
  const [dictionaryWord, setDictionaryWord] = React.useState<string | null>(null);

  // Track if we're on desktop (md+) for sidebar margin
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showSidebarMargin = isDesktop && isAIAssistantOpen && isAISidebarMode;

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    // Detect text selection
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    const hasSelection = Boolean(selectedText && selectedText.length > 0);

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      hasSelection,
      selectedText: hasSelection ? selectedText : undefined
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

  // Define all valid routes that should show the navbar
  const protectedRoutes = [
    '/dashboard',
    '/calendar',
    '/homework',
    '/flashcards',
    '/web-saves',
    '/discussions',
    '/settings',
    '/groups',
    '/complete-signup'
  ];

  // Keep the navbar logic but don't use it for showing Navbar component
  const shouldShowNavbar = false; // Always hide the top navbar

  // Routes that should hide navbar (public routes)
  const isLandingPage = pathname === '/' || pathname === '/guardians' || pathname === '/teachers';
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/translate' || pathname === '/tutorials' || pathname === '/changelog' || pathname === '/blog';
  const isAIGuidelinesPage = pathname === '/ai-guidelines';
  const isLegalPage = pathname?.startsWith('/legal');
  const is404Page = !isLandingPage && !isAuthPage && !isLegalPage;

  return (
    <>
      <Analytics />
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
          {children}
        </main>
        {/* Nav: AppNavbar for logged-in, ReboundNavbar for logged-out */}
        {user ? <AppNavbar /> : <ReboundNavbar />}
        <OnboardingTour />
        {contextMenu && (
          <CustomContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            hasSelection={contextMenu.hasSelection}
            selectedText={contextMenu.selectedText}
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
