'use client';

import { useSearch } from '@/context/SearchContext';
import { Search, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchResults } from './SearchResults';
import { useTheme } from 'next-themes';

export function SearchBar() {
  const { isOpen, query, setQuery, closeSearch } = useSearch();
  const { theme } = useTheme();
  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;
  const isDark = theme === 'dark';

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
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={closeSearch}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="relative">
              {/* Main Search Container */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <input
                    id="global-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-base"
                    placeholder="Search homework, classes..."
                    autoComplete="off"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                  >
                    <SearchResults />
                  </motion.div>
                )}

                {/* Empty State / Tips */}
                {!query && (
                  <div className="px-5 py-8">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Quick Search
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Search for homework, classes, and more
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm font-medium">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm font-medium">
                    K
                  </kbd>
                  <span className="ml-1">to open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm font-medium">
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

  return (
    <button
      onClick={openSearch}
      className={`group flex items-center gap-2.5 h-9 px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all ${className}`}
      aria-label="Search"
    >
      <Search className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline font-medium">Search</span>
      <div className="hidden md:flex items-center gap-0.5 ml-auto pl-2">
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
          K
        </kbd>
      </div>
    </button>
  );
}