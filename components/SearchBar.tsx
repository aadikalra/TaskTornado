'use client';

import { useSearch } from '@/context/SearchContext';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchResults } from './SearchResults';

export function SearchBar() {
  const { isOpen, query, setQuery, closeSearch } = useSearch();
  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

  // Register hotkey
  useHotkeys('meta+k, ctrl+k', (e: KeyboardEvent) => {
    e.preventDefault();
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeSearch}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="relative">
              {/* Main Search Container */}
              <div className="bg-white dark:bg-gray-950 rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-sm overflow-hidden">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                  <input
                    id="global-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 py-3 pl-12 pr-12 text-base outline-none focus:border-neutral-500 dark:focus:border-neutral-600 transition text-gray-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    placeholder="Search..."
                    autoComplete="off"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {query && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: 0.05 }}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <SearchResults />
                  </motion.div>
                )}

                {/* Empty State / Tips */}
                {!query && (
                  <div className="px-4 py-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Search for homework, tests, classes, and pages
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="mt-3 flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400"
              >
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm font-medium">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm font-medium">
                    K
                  </kbd>
                  <span className="ml-1">to open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm font-medium">
                    ESC
                  </kbd>
                  <span className="ml-1">to close</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Search trigger button for the navbar
type SearchTriggerProps = {
  className?: string;
};

export function SearchTrigger({ className = '' }: SearchTriggerProps) {
  const { openSearch } = useSearch();
  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

  return (
    <button
      onClick={openSearch}
      className={`group flex items-center gap-3 h-10 px-4 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-2xl transition-all ${className}`}
      aria-label="Search"
    >
      <Search className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline">Search</span>
      <div className="hidden md:flex items-center gap-1 ml-auto">
        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded shadow-sm">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded shadow-sm">
          K
        </kbd>
      </div>
    </button>
  );
}