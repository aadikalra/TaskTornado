'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

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

  // Check if current route should show navbar
  const shouldShowNavbar = protectedRoutes.some(route => pathname?.startsWith(route));

  // Routes that should hide navbar (public routes and 404s)
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAIGuidelinesPage = pathname === '/ai-guidelines';
  const isLegalPage = pathname?.startsWith('/legal');
  const is404Page = !shouldShowNavbar && !isLandingPage && !isAuthPage && !isAIGuidelinesPage && !isLegalPage;

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && (
        <>
          <Navbar />
          <SearchBar />
        </>
      )}
      <main className={shouldShowNavbar ? 'flex-1 pt-24 md:pt-26 bg-transparent' : 'flex-1'}>
        {children}
      </main>
    </div>
  );
}
