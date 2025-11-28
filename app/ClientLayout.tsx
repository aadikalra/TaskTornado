'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { DictionaryPopup } from '@/components/DictionaryPopup';
import * as React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import DockNav with no SSR to avoid hydration issues
const DockNav = dynamic(() => import('@/components/DockNav'), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; hasSelection?: boolean; selectedText?: string } | null>(null);
  const [dictionaryWord, setDictionaryWord] = React.useState<string | null>(null);

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
  const isLandingPage = pathname === '/';
  const isAuthPage = false; // Show DockNav on login/signup pages
  const isAIGuidelinesPage = pathname === '/ai-guidelines';
  const isLegalPage = pathname?.startsWith('/legal');
  const is404Page = !isLandingPage && !isAuthPage && !isLegalPage;

  return (
    <>
      <Analytics />
      <div className="min-h-screen flex flex-col" onContextMenu={handleContextMenu}>
        {/* SearchBar - rendered globally so it can be opened from anywhere */}
        <SearchBar />
        <main className="flex-1 bg-transparent pb-24 md:pb-0">
          {children}
        </main>
        {/* Always show DockNav on all pages */}
        <DockNav />
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
