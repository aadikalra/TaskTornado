'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { PageTransition } from '@/components/animate-ui/components/page-transition';

/** Shared layouts animate their content; standalone routes use this fallback. */
export function PageTransitionRoot({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  if (segment === '(app)' || segment === '(public)') return children;

  return <PageTransition effect="wipe">{children}</PageTransition>;
}
