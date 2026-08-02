'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCatData, CatFriendship } from '@/lib/catTreats';

export interface ShopItem {
  id: string;
  name: string;
  category: 'hats' | 'eyewear' | 'accessories';
  price: number;
  icon: string;
  description: string;
  propKey: 'is100PercentDone' | 'isNightStudy' | 'isHeadphones' | 'isWizard' | 'isBowtie' | 'isSunglasses' | 'isGraduation';
  defaultUnlocked?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'bowtie',
    name: 'Cozy Red Bowtie',
    category: 'accessories',
    price: 2,
    icon: '🎀',
    description: 'A dapper red bowtie for a distinguished scholar cat.',
    propKey: 'isBowtie',
    defaultUnlocked: true,
  },
  {
    id: 'glasses',
    name: 'Scholar Glasses & Coffee',
    category: 'eyewear',
    price: 5,
    icon: '👓',
    description: 'Cute round study glasses and a steaming mug of dark roast coffee.',
    propKey: 'isNightStudy',
    defaultUnlocked: true,
  },
  {
    id: 'sunglasses',
    name: 'Cool Sunglasses',
    category: 'eyewear',
    price: 8,
    icon: '🕶️',
    description: 'Sleek dark wayfarer shades for maximum study swagger.',
    propKey: 'isSunglasses',
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    category: 'hats',
    price: 10,
    icon: '👑',
    description: 'A gem-studded golden crown awarded to homework royalty.',
    propKey: 'is100PercentDone',
  },
  {
    id: 'headphones',
    name: 'Gamer Headphones',
    category: 'accessories',
    price: 12,
    icon: '🎧',
    description: 'Studio-grade over-ear headphones with cyan LED rings.',
    propKey: 'isHeadphones',
  },
  {
    id: 'wizard',
    name: 'Wizard Hat',
    category: 'hats',
    price: 15,
    icon: '🧙‍♂️',
    description: 'Deep indigo magic hat with golden star embellishments.',
    propKey: 'isWizard',
  },
  {
    id: 'graduation',
    name: 'Graduation Cap',
    category: 'hats',
    price: 20,
    icon: '🎓',
    description: 'Classic mortarboard cap with a golden tassel for academic excellence.',
    propKey: 'isGraduation',
  },
];

const STORAGE_UNLOCKED_KEY = 'tasktornado_cat_unlocked_items';
const STORAGE_EQUIPPED_KEY = 'tasktornado_cat_equipped_items';

export function getUnlockedItems(): string[] {
  if (typeof window === 'undefined') return ['bowtie', 'glasses'];
  try {
    const data = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    return data ? JSON.parse(data) : ['bowtie', 'glasses'];
  } catch {
    return ['bowtie', 'glasses'];
  }
}

export function getEquippedItems(): string[] {
  if (typeof window === 'undefined') return ['bowtie'];
  try {
    const data = localStorage.getItem(STORAGE_EQUIPPED_KEY);
    return data ? JSON.parse(data) : ['bowtie'];
  } catch {
    return ['bowtie'];
  }
}

export function buyShopItem(item: ShopItem): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Server context' };

  const currentUnlocked = getUnlockedItems();
  if (currentUnlocked.includes(item.id)) {
    return { success: false, message: 'Item already unlocked!' };
  }

  const catData = getCatData();
  if (catData.treats < item.price) {
    return { success: false, message: `Need ${item.price - catData.treats} more Fish Treats 🐟!` };
  }

  // Deduct treats
  const newTreats = catData.treats - item.price;
  localStorage.setItem('tasktornado_cat_treats', newTreats.toString());

  // Unlock item
  const updatedUnlocked = [...currentUnlocked, item.id];
  localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(updatedUnlocked));

  // Auto equip
  const currentEquipped = getEquippedItems();
  if (!currentEquipped.includes(item.id)) {
    localStorage.setItem(STORAGE_EQUIPPED_KEY, JSON.stringify([...currentEquipped, item.id]));
  }

  window.dispatchEvent(new CustomEvent('cat-treats-updated', { detail: { treats: newTreats } }));
  window.dispatchEvent(new CustomEvent('cat-shop-updated'));

  return { success: true, message: `Unlocked ${item.name}! 🎉` };
}

export function toggleEquipItem(itemId: string): string[] {
  if (typeof window === 'undefined') return [];

  const currentEquipped = getEquippedItems();
  let updated: string[];
  if (currentEquipped.includes(itemId)) {
    updated = currentEquipped.filter(id => id !== itemId);
  } else {
    updated = [...currentEquipped, itemId];
  }

  localStorage.setItem(STORAGE_EQUIPPED_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('cat-shop-updated'));
  return updated;
}

export function useCatShop() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setUnlocked(getUnlockedItems());
    setEquipped(getEquippedItems());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('cat-shop-updated', handleUpdate);
    window.addEventListener('cat-treats-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cat-shop-updated', handleUpdate);
      window.removeEventListener('cat-treats-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return { unlocked, equipped, refresh };
}
