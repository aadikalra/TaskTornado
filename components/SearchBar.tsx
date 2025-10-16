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
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
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
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-white/20">
                  <div className="flex items-center px-4 py-3">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                      id="global-search-input"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm pr-14"
                      placeholder="Search"
                      autoComplete="off"
                      autoFocus
                    />
                    <div className="absolute right-4 flex items-center space-x-2">
                      {query ? (
                        <button
                          onClick={() => setQuery('')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          Esc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {query && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
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
  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;

  return (
    <button
      onClick={openSearch}
      className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      aria-label="Search"
    >
      <Search className="w-5 h-5" />
    </button>
  );
}
