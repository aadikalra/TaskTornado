'use client';

import { Button } from '@/components/animate-ui/components/buttons/button';

interface MiniAIAssistantProps {
  enabled: boolean;
}

export default function MiniAIAssistant({ enabled }: MiniAIAssistantProps) {
  if (!enabled) return null;

  return (
    <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-700 ease-in-out">
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Enter text..."
          className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button variant="default" size="icon-sm" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5"/>
            <path d="M5 12l7-7 7 7"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}
