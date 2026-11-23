import { Geist, Geist_Mono, Inter, Nunito_Sans, Edu_NSW_ACT_Cursive } from 'next/font/google';

import './globals.css';
import '@/components/animate-ui/components/page-transition.css';
import { AuthProvider } from '@/context/AuthContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ToastProvider } from '@/context/ToastContext';
import { PageTransitionRoot } from '@/components/PageTransitionRoot';
import React from 'react';
import { SITE_ORIGIN } from '@/lib/site-url';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: 'variable',
});

const eduNswActCursive = Edu_NSW_ACT_Cursive({
  variable: '--font-edu-nsw-act-cursive',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
});

export const metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: 'TaskTornado',
  description: 'A comprehensive task management tool for students to organize homework, classes, schedules, and group chats.',
  keywords: 'task, organizer, homework, classes, student, academic, study',
  authors: [{ name: 'TaskTornado Team' }],
  icons: {
    icon: [
      { url: '/favicon-light.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/favicon-light.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: [
      { url: '/favicon-light.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
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
        <link
          rel="preload"
          as="image"
          href="/logo-light.webp"
          type="image/webp"
          media="(prefers-color-scheme: light)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/logo-dark.webp"
          type="image/webp"
          media="(prefers-color-scheme: dark)"
          fetchPriority="high"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable} ${eduNswActCursive.variable} font-sans antialiased bg-[#F8FAFC] dark:bg-gray-900 text-[#111827] dark:text-gray-100`} suppressHydrationWarning>
        <AuthProvider>
          <DarkModeProvider>
            <ToastProvider>
              <PageTransitionRoot>{children}</PageTransitionRoot>
            </ToastProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
