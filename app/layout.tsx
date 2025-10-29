import { Geist, Geist_Mono } from 'next/font/google';
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
import AuthWrapper from '@/components/AuthWrapper';
import { ClientLayout } from './ClientLayout';
import React from 'react';

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

export const metadata = {
  title: 'TaskTornado',
  description: 'A comprehensive task management tool for students to organize homework, classes, schedules, and study groups.',
  keywords: 'task, organizer, homework, classes, student, academic, study',
  authors: [{ name: 'TaskTornado Team' }],
  icons: {
    icon: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/TaskTornadoDark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/TaskTornadoDark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/TaskTornado.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/TaskTornadoDark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
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
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <DarkModeProvider>
            <ClassProvider>
              <DataProvider>
                <SearchProvider>
                  <AIProvider>
                    <WebSavesProvider>
                      <StudyGroupsProvider>
                        <ToastProvider>
                          <AuthWrapper>
                            <ClientLayout>{children}</ClientLayout>
                          </AuthWrapper>
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
