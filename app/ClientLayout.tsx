'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLandingPage && !isAuthPage && (
        <>
          <Navbar />
          <SearchBar />
        </>
      )}
      <main className={(!isLandingPage && !isAuthPage) ? 'flex-1 pt-24 md:pt-26 bg-transparent' : 'flex-1'}>
        {children}
      </main>
    </div>
  );
}
