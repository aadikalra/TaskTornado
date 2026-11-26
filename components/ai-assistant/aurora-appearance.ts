'use client';

import { useMemo, useSyncExternalStore } from 'react';

export const AURORA_SHAPES = [
  { id: 'kite', label: 'Kite' },
  { id: 'pebble', label: 'Pebble' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'drop', label: 'Drop' },
] as const;

export const AURORA_PALETTES = [
  { id: 'violet', label: 'Violet', body: '#8955ed', eyes: '#fff9ff' },
  { id: 'blue', label: 'Cornflower', body: '#6198f9', eyes: '#152a55' },
  { id: 'jade', label: 'Jade', body: '#38c0a4', eyes: '#0e342f' },
  { id: 'rose', label: 'Rose', body: '#ec81ac', eyes: '#4e1536' },
  { id: 'amber', label: 'Amber', body: '#f1b764', eyes: '#50300c' },
] as const;

export const AURORA_EYES = [
  { id: 'soft', label: 'Soft' },
  { id: 'round', label: 'Round' },
  { id: 'slanted', label: 'Slanted' },
  { id: 'star', label: 'Star' },
] as const;

export const AURORA_EXPRESSIONS = [
  { id: 'idle', label: 'Idle' },
  { id: 'thinking', label: 'Thinking' },
  { id: 'working', label: 'Working' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
] as const;

export type AuroraExpression = (typeof AURORA_EXPRESSIONS)[number]['id'];

export type AuroraAppearance = {
  shape: (typeof AURORA_SHAPES)[number]['id'];
  palette: (typeof AURORA_PALETTES)[number]['id'];
  eyes: (typeof AURORA_EYES)[number]['id'];
  blink: boolean;
};

export const DEFAULT_AURORA_APPEARANCE: AuroraAppearance = {
  shape: 'kite',
  palette: 'violet',
  eyes: 'soft',
  blink: true,
};

const STORAGE_KEY = 'aurora-avatar-appearance';
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) notifyListeners();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', handleStorage);
  };
}

function readAppearance() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const serverAppearance = () => null;

function parseAppearance(saved: string | null): AuroraAppearance {
  if (!saved) return DEFAULT_AURORA_APPEARANCE;
  try {
    const stored = JSON.parse(saved);
    return {
      shape: AURORA_SHAPES.find(option => option.id === stored?.shape)?.id ?? DEFAULT_AURORA_APPEARANCE.shape,
      palette: AURORA_PALETTES.find(option => option.id === stored?.palette)?.id ?? DEFAULT_AURORA_APPEARANCE.palette,
      eyes: AURORA_EYES.find(option => option.id === stored?.eyes)?.id ?? DEFAULT_AURORA_APPEARANCE.eyes,
      blink: typeof stored?.blink === 'boolean' ? stored.blink : DEFAULT_AURORA_APPEARANCE.blink,
    };
  } catch {
    return DEFAULT_AURORA_APPEARANCE;
  }
}

export function useAuroraAppearance() {
  const saved = useSyncExternalStore(subscribe, readAppearance, serverAppearance);
  return useMemo(() => parseAppearance(saved), [saved]);
}

export function saveAuroraAppearance(value: AuroraAppearance) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  notifyListeners();
}
