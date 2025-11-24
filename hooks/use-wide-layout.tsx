'use client';

import { useState, useEffect } from 'react';

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export function useWideLayout() {
  const [useWideLayout, setUseWideLayout] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('useWideLayout');
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
  });

  const toggleWideLayout = (checked: boolean) => {
    setUseWideLayout(checked);
    setCookie('useWideLayout', checked.toString());
  };

  const getContainerClass = (normalMaxWidth: string = 'max-w-4xl') => {
    return useWideLayout 
      ? 'w-[90%] max-w-none mx-auto px-8' 
      : `${normalMaxWidth} mx-auto px-6`;
  };

  return {
    useWideLayout,
    toggleWideLayout,
    getContainerClass
  };
}
