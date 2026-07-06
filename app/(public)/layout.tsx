import { Analytics } from '@vercel/analytics/next';
import ReboundNavbar from '@/components/ReboundNavbar';
import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-transparent overflow-x-hidden pt-0">
          {children}
        </main>
        <ReboundNavbar />
      </div>
    </>
  );
}
