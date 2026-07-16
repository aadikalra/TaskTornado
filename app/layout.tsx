import { Geist, Geist_Mono, Inter, Nunito_Sans, Edu_NSW_ACT_Cursive } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ToastProvider } from '@/context/ToastContext';
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

const eduNswActCursive = Edu_NSW_ACT_Cursive({
  variable: '--font-edu-nsw-act-cursive',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata = {
  title: 'TaskTornado',
  description: 'A comprehensive task management tool for students to organize homework, classes, schedules, and group chats.',
  keywords: 'task, organizer, homework, classes, student, academic, study',
  authors: [{ name: 'TaskTornado Team' }],
  icons: {
    icon: [
      { url: '/2.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/3.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/2.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/3.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: [
      { url: '/2.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/3.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
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
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable} ${eduNswActCursive.variable} font-sans antialiased bg-[#F8FAFC] dark:bg-gray-900 text-[#111827] dark:text-gray-100`} suppressHydrationWarning>
        <AuthProvider>
          <DarkModeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
