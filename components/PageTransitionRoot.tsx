'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useSelectedLayoutSegment } from 'next/navigation';

const PageTransition = dynamic(
  () => import('@/components/animate-ui/components/page-transition').then((m) => m.PageTransition),
);

/** Shared layouts animate their content; standalone routes use this fallback. */
export function PageTransitionRoot({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  if (segment === '(app)' || segment === '(public)') return children;

  return <PageTransition effect="wipe">{children}</PageTransition>;
}
