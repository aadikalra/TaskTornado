'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CatFriendship {
  treats: number;
  friendshipXP: number;
  level: number;
  levelTitle: string;
  nextLevelXP: number;
}

const STORAGE_TREATS_KEY = 'tasktornado_cat_treats';
const STORAGE_FRIENDSHIP_KEY = 'tasktornado_cat_friendship_xp';

const FRIENDSHIP_LEVELS = [
  { minXP: 0, title: 'Acquaintance 🐾' },
  { minXP: 30, title: 'Study Buddy 🐟' },
  { minXP: 75, title: 'Bestie 💕' },
  { minXP: 140, title: 'Soulmate ✨' },
  { minXP: 220, title: 'Cat Royalty 👑' },
];

export function getCatData(): CatFriendship {
  if (typeof window === 'undefined') {
    return { treats: 2, friendshipXP: 0, level: 1, levelTitle: 'Acquaintance 🐾', nextLevelXP: 30 };
  }
  const treats = parseInt(localStorage.getItem(STORAGE_TREATS_KEY) || '2', 10);
  const friendshipXP = parseInt(localStorage.getItem(STORAGE_FRIENDSHIP_KEY) || '0', 10);

  let level = 1;
  let levelTitle = FRIENDSHIP_LEVELS[0].title;
  let nextLevelXP = FRIENDSHIP_LEVELS[1].minXP;

  for (let i = FRIENDSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (friendshipXP >= FRIENDSHIP_LEVELS[i].minXP) {
      level = i + 1;
      levelTitle = FRIENDSHIP_LEVELS[i].title;
      nextLevelXP = FRIENDSHIP_LEVELS[i + 1]?.minXP || (FRIENDSHIP_LEVELS[i].minXP + 100);
      break;
    }
  }

  return { treats, friendshipXP, level, levelTitle, nextLevelXP };
}

export function awardFishTreat(amount = 1): number {
  if (typeof window === 'undefined') return 1;
  const current = parseInt(localStorage.getItem(STORAGE_TREATS_KEY) || '2', 10);
  const updated = current + amount;
  localStorage.setItem(STORAGE_TREATS_KEY, updated.toString());
  window.dispatchEvent(new CustomEvent('cat-treats-updated', { detail: { treats: updated } }));
  return updated;
}

export function feedCatTreat(): { success: boolean; data: CatFriendship; xpAwarded: number } {
  if (typeof window === 'undefined') return { success: false, data: getCatData(), xpAwarded: 0 };
  const currentTreats = parseInt(localStorage.getItem(STORAGE_TREATS_KEY) || '2', 10);
  if (currentTreats <= 0) {
    return { success: false, data: getCatData(), xpAwarded: 0 };
  }

  const newTreats = currentTreats - 1;
  const currentXP = parseInt(localStorage.getItem(STORAGE_FRIENDSHIP_KEY) || '0', 10);
  const newXP = currentXP + 15;

  localStorage.setItem(STORAGE_TREATS_KEY, newTreats.toString());
  localStorage.setItem(STORAGE_FRIENDSHIP_KEY, newXP.toString());

  const updatedData = getCatData();
  window.dispatchEvent(new CustomEvent('cat-treats-updated', { detail: updatedData }));

  return { success: true, data: updatedData, xpAwarded: 15 };
}

export function useCatFriendship() {
  const [catData, setCatData] = useState<CatFriendship>(getCatData());

  const refresh = useCallback(() => {
    setCatData(getCatData());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('cat-treats-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cat-treats-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return { catData, refresh };
}
