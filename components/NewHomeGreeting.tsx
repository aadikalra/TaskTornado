'use client';

import { useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import TextReveal from '@/components/TextReveal';

export default function NewHomeGreeting() {
  const { user, full_name } = useAuth();
  const { isDark } = useDarkMode();

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 6) return 'Burning the Midnight Oil';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Late Night Grind';
  }, []);

  const firstName = full_name?.split(' ')[0] || user?.email || 'Student';
  const headingText = `${timeGreeting}, ${firstName}!`;

  return (
    <TextReveal
      key={`${headingText}-${isDark}`}
      text={headingText}
      inline
      time="2.2s"
      color={isDark ? '#7dd3fc' : '#275085'}
    />
  );
}
