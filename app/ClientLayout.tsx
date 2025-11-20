'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { CustomContextMenu } from '@/components/CustomContextMenu';
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
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Define all valid routes that should show the navbar
  const protectedRoutes = [
    '/dashboard',
    '/calendar',
    '/homework',
    '/flashcards',
    '/web-saves',
    '/settings',
    '/groups',
    '/complete-signup'
  ];

  // Keep the navbar logic but don't use it for showing Navbar component
  const shouldShowNavbar = false; // Always hide the top navbar
  
  // Routes that should hide navbar (public routes)
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
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
        {/* Always show DockNav on all pages except landing, auth, and legal pages */}
        {!isLandingPage && !isAuthPage && !isLegalPage && <DockNav />}
        {contextMenu && <CustomContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />}
      </div>
    </>
  );
}
