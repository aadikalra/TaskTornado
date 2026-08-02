'use client';

import { useSearch } from '@/context/SearchContext';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchResults } from './SearchResults';
import { useEffect, useState } from 'react';

export function SearchBar() {
  const { isOpen, query, setQuery, closeSearch } = useSearch();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-sky-900/10 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeSearch}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[10vh] sm:top-[12vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-3 sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Site-wide search"
          >
            <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-500/10 overflow-hidden border border-sky-100/60 dark:border-sky-800/30 ring-1 ring-sky-200/50 dark:ring-sky-700/30">

              {/* Search Header */}
              <div className="relative border-b border-sky-100/60 dark:border-sky-800/30 px-5 py-4 flex items-center gap-3">
                <HugeIcon name="Search01" className="w-5 h-5 text-sky-500" />
                <input
                  id="global-search-input"
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="global-search-results"
                  aria-autocomplete="list"
                  className="flex-1 text-lg outline-none text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 bg-transparent"
                  placeholder="Search pages, classes, assignments, and more…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  autoComplete="off"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sky-600/50 dark:text-sky-400/50 hover:text-sky-800 dark:hover:text-sky-200 hover:bg-sky-100/70 dark:hover:bg-sky-500/15 transition-colors"
                    aria-label="Clear search"
                  >
                    <HugeIcon name="Cancel01" size={14} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-sky-600/50 dark:text-sky-400/50 text-sm font-medium select-none ml-auto">
                    <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>
                    <span className="text-xs font-bold">K</span>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div id="global-search-results" className="max-h-[62vh] sm:max-h-[560px] overflow-y-auto custom-scrollbar">
                <div className="py-2">
                  <SearchResults />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#f5f9fc] dark:bg-zinc-800/40 border-t border-sky-100/60 dark:border-sky-800/30 px-5 py-3 flex items-center justify-between text-[11px] text-sky-700/60 dark:text-sky-400/60">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="flex gap-0.5">
                      <kbd className="inline-flex items-center justify-center w-5 h-5 rounded-lg border border-sky-200/60 dark:border-sky-700/40 bg-white dark:bg-zinc-800 shadow-sm">
                        <HugeIcon name="ArrowUp02" className="w-2.5 h-2.5" />
                      </kbd>
                      <kbd className="inline-flex items-center justify-center w-5 h-5 rounded-lg border border-sky-200/60 dark:border-sky-700/40 bg-white dark:bg-zinc-800 shadow-sm">
                        <HugeIcon name="ArrowDown01" className="w-2.5 h-2.5" />
                      </kbd>
                    </div>
                    <span className="hidden sm:inline">navigate</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <kbd className="inline-flex items-center justify-center w-5 h-5 rounded-lg border border-sky-200/60 dark:border-sky-700/40 bg-white dark:bg-zinc-800 shadow-sm">
                      <span className="text-[11px] leading-none">↵</span>
                    </kbd>
                    <span className="hidden sm:inline">open</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium cursor-pointer hover:text-sky-900 dark:hover:text-sky-200 transition-colors" onClick={closeSearch}>
                    <kbd className="inline-flex items-center justify-center min-w-[26px] h-5 px-1.5 rounded-lg border border-sky-200/60 dark:border-sky-700/40 bg-white dark:bg-zinc-800 shadow-sm text-[9px] font-sans font-bold">
                      esc
                    </kbd>
                    <span className="hidden sm:inline">close</span>
                  </div>
                </div>
                <span className="hidden sm:inline font-medium">Site-wide search</span>
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
      className={`group flex items-center gap-3 h-10 px-4 text-sm text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-xl transition-all shadow-sm hover:shadow-md backdrop-blur-sm ${className}`}
      aria-label="Search"
    >
      <HugeIcon name="Search01" className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="hidden sm:inline font-medium opacity-80 group-hover:opacity-100">Search</span>
      <div className="hidden md:flex items-center gap-1 ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
        <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-sans bg-[#f5f9fc] dark:bg-zinc-800 rounded border border-sky-200/60 dark:border-sky-700/40">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-sans bg-[#f5f9fc] dark:bg-zinc-800 rounded border border-sky-200/60 dark:border-sky-700/40">
          K
        </kbd>
      </div>
    </button>
  );
}
