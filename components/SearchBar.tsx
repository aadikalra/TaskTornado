'use client';

import { useSearch } from '@/context/SearchContext';
import { Search, X } from 'lucide-react';
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
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 ${isDark ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm z-40`}
            onClick={closeSearch}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="relative">
              <div className="relative">
                <div className={`${isDark ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'} backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border ${isDark ? 'border-transparent' : 'border-white/20'}`}>
                  <div className="flex items-center px-4 py-3">
                    <Search className={`h-4 w-4 ${isDark ? 'text-gray-300' : 'text-gray-400'} mr-2`} />
                    <input
                      id="global-search-input"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={`w-full ${isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-transparent text-gray-900 placeholder-gray-500'} focus:outline-none text-sm pr-14`}
                      placeholder="Search"
                      autoComplete="off"
                      autoFocus
                    />
                    <div className="absolute right-4 flex items-center space-x-2">
                      {query ? (
                        <button
                          onClick={() => setQuery('')}
                          className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-400 bg-gray-100 border-gray-200'} px-1.5 py-0.5 rounded border`}>
                          Esc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {query && (
                  <div className={`absolute left-0 right-0 mt-2 ${isDark ? 'bg-gray-800 border-transparent' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden`}>
                    <SearchResults />
                  </div>
                )}
              </div>
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

  return (
    <button
      onClick={openSearch}
      className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-full transition-colors ${className}`}
      aria-label="Search"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}
