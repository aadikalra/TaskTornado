'use client';

import React from 'react';
import { useDarkMode } from '@/context/DarkModeContext';

export const DarkModeIndicator: React.FC = () => {
  const { isDark } = useDarkMode();

  if (!isDark) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
      🌙 Dark Mode
    </div>
  );
};
