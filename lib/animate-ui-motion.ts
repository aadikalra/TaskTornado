'use client';

import { useSyncExternalStore } from 'react';

// Motion tokens used by Animate UI's registry PageTransition component.
// Kept locally to avoid pulling in unrelated component-library peer dependencies.
export const ease = {
  out: [0.23, 1, 0.32, 1],
  leave: [0, 0, 0.58, 1],
  resize: [0.4, 0, 0.1, 1],
  inOut: [0.77, 0, 0.175, 1],
} satisfies Record<string, [number, number, number, number]>;

export const blur = { panel: 'blur(5px)' };

const query = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function useShouldReduceMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
