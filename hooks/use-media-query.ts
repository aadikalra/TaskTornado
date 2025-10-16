'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Update the state with the current value
    setMatches(media.matches);
    
    // Create an event listener to update the state when the media query changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add the event listener
    media.addEventListener('change', listener);
    
    // Clean up the event listener when the component unmounts
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}
