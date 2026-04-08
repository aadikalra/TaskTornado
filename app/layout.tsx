import { Geist, Geist_Mono, Inter, Nunito_Sans } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ClassProvider } from '@/context/ClassContext';
import { DataProvider } from '@/context/DataContext';
import { SearchProvider } from '@/context/SearchContext';
import { AIProvider } from '@/context/AIContext';
import { WebSavesProvider } from '@/context/WebSavesContext';
import { StudyGroupsProvider } from '@/context/StudyGroupsContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ToastProvider } from '@/context/ToastContext';
import { UpgradeProvider } from '@/context/UpgradeContext';
import AuthWrapper from '@/components/AuthWrapper';
import { ClientLayout } from './ClientLayout';
import React from 'react';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'TaskTornado',
  description: 'A comprehensive task management tool for students to organize homework, classes, schedules, and group chats.',
  keywords: 'task, organizer, homework, classes, student, academic, study',
  authors: [{ name: 'TaskTornado Team' }],
  icons: {
    icon: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml' },
    ],
    shortcut: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>

      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable} font-sans antialiased bg-[#F8FAFC] dark:bg-gray-900 text-[#111827] dark:text-gray-100`} suppressHydrationWarning>
        <AuthProvider>
          <DarkModeProvider>
            <ClassProvider>
              <DataProvider>
                <SearchProvider>
                  <AIProvider>
                    <WebSavesProvider>
                      <StudyGroupsProvider>
                        <ToastProvider>
                          <UpgradeProvider>
                            <AuthWrapper>
                              <ClientLayout>{children}</ClientLayout>
                            </AuthWrapper>
                          </UpgradeProvider>
                        </ToastProvider>
                      </StudyGroupsProvider>
                    </WebSavesProvider>
                  </AIProvider>
                </SearchProvider>
              </DataProvider>
            </ClassProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
