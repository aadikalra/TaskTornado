'use client';

import { useSearch } from '@/context/SearchContext';
import {
  Search,
  Folder,
  Hash,
  PlusSquare,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchResults } from './SearchResults';
import { useEffect, useState } from 'react';

export function SearchBar() {
  const { isOpen, query, setQuery, closeSearch } = useSearch();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

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


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={closeSearch}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 ring-1 ring-black/5">

              {/* Search Header */}
              <div className="relative border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  id="global-search-input"
                  type="text"
                  className="flex-1 text-lg outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 bg-transparent"
                  placeholder="Type a command or search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  autoComplete="off"
                />
                <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-lg font-light select-none ml-auto">
                  <span>{isMac ? '⌘' : 'Ctrl'}</span>
                  <span>K</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="py-2">
                  <SearchResults />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-neutral-800/40 border-t border-gray-100 dark:border-gray-800/60 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400/80">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="flex gap-0.5">
                      <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                        <ArrowUp className="w-2.5 h-2.5" strokeWidth={2.5} />
                      </kbd>
                      <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                        <ArrowDown className="w-2.5 h-2.5" strokeWidth={2.5} />
                      </kbd>
                    </div>
                    <span>navigate</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                      <CornerDownLeft className="w-2.5 h-2.5" strokeWidth={2.5} />
                    </kbd>
                    <span>select</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={closeSearch}>
                    <kbd className="inline-flex items-center justify-center min-w-[22px] h-4 px-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[9px] font-sans">
                      esc
                    </kbd>
                    <span>close</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Search trigger button for the navbar (keeping it just in case, though user uses DockNav)
type SearchTriggerProps = {
  className?: string;
};

export function SearchTrigger({ className = '' }: SearchTriggerProps) {
  const { openSearch } = useSearch();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      onClick={openSearch}
      className={`group flex items-center gap-3 h-10 px-4 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all shadow-sm hover:shadow-md backdrop-blur-sm ${className}`}
      aria-label="Search"
    >
      <Search className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="hidden sm:inline font-medium opacity-80 group-hover:opacity-100">Search</span>
      <div className="hidden md:flex items-center gap-1 ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
        <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-sans bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-sans bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          K
        </kbd>
      </div>
    </button>
  );
}