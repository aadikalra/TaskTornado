'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Search, Hash, ArrowRight, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { getFullVersionString, BUILD_VERSION } from '@/config/version';

type Version = {
  version: string;
  date: string;
  title: string;
  highlight: string;
  type: 'major' | 'Alpha' | 'minor';
  short: string[];
  full: string[];
};

interface ChangelogClientProps {
  initialVersions?: Version[];
}

export default function ChangelogClient({ initialVersions }: ChangelogClientProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>(initialVersions ?? []);
  const [loading, setLoading] = useState(!initialVersions || initialVersions.length === 0);
  const [error, setError] = useState<string | null>(null);
  const { getContainerClass } = useWideLayout();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchVersions = async (showRefresher = false) => {
    try {
      if (showRefresher) setIsRefreshing(true);
      else setLoading(true);

      setError(null);
      // Add cache-busting timestamp
      const response = await fetch(`https://api.npoint.io/9eb23a1980287e881d97?t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch changelog data: ${response.status}`);
      }

      const data = await response.json();

      if (!data.versions || !Array.isArray(data.versions)) {
        throw new Error('Invalid data format received from API');
      }

      setVersions(data.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching changelog data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Only fetch on mount if no initial data was provided
  useEffect(() => {
    if (!initialVersions || initialVersions.length === 0) {
      fetchVersions();
    }
  }, []);

  // Show all versions (no date filtering)
  const getVisibleVersions = () => {
    return versions;
  };

  // Version comparison utility
  const compareVersions = (version1: string, version2: string): number => {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    return 0;
  };

  // Check if current build is outdated (only compare with released versions, not future ones)
  const isOutdated = useMemo(() => {
    if (versions.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the latest released version (not future)
    const latestReleasedVersion = versions.find(version => {
      const versionDate = new Date(version.date + 'T00:00:00');
      return today >= versionDate;
    });

    if (!latestReleasedVersion) return false;

    return compareVersions(latestReleasedVersion.version, BUILD_VERSION) > 0;
  }, [versions]);

  const visibleVersions = getVisibleVersions();

  // Filter versions based on search query
  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return visibleVersions;
    const query = searchQuery.toLowerCase();
    return visibleVersions.filter((v: Version) =>
      v.version.toLowerCase().includes(query) ||
      v.title.toLowerCase().includes(query) ||
      v.highlight.toLowerCase().includes(query) ||
      v.short.some((s: string) => s.toLowerCase().includes(query)) ||
      v.full.some((f: string) => f.toLowerCase().includes(query))
    );
  }, [visibleVersions, searchQuery]);

  const scrollToVersion = (version: string) => {
    const element = document.getElementById(`version-${version}`);
    if (element) {
      const offset = 100; // Adjust for sticky header/spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-400/[0.05] dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-400/[0.03] dark:bg-violet-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
              Changelog
            </h1>
            <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
              Product updates and improvements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-auto flex items-center gap-3"
          >
            <button
              onClick={() => fetchVersions(true)}
              disabled={isRefreshing || loading}
              className="inline-flex items-center gap-2 h-10 px-4 bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5]/60 dark:hover:bg-sky-500/20 transition-all active:scale-95 shrink-0 disabled:opacity-50"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Refresh'}
            </button>
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500 dark:text-sky-400" />
              <input
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none focus:ring-2 focus:ring-sky-400/30 transition-all"
              />
            </div>
          </motion.div>
        </div>

        {/* Outdated Build Alert */}
        {isOutdated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-100/50 dark:bg-amber-950/30 rounded-[16px]"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Update Available
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You're using build {getFullVersionString()}, but a newer version is available.
                  Some bug fixes and improvements that have been addressed in the latest version may not be available to you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* In Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8 sm:mb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Bug Fixes */}
                <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] p-5 sm:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-bold text-sky-800 dark:text-sky-200">
                      Bug Fixes
                    </h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-100/60 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-sky-700/70 dark:text-sky-400/70">
                      <span className="text-sky-500/40 dark:text-sky-400/40 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">None at the moment</span>
                    </li>
                  </ul>
                </div>

                {/* New Features */}
                <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] p-5 sm:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-bold text-sky-800 dark:text-sky-200">
                      New Features
                    </h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-sky-700/70 dark:text-sky-400/70">
                      <span className="text-sky-500/40 dark:text-sky-400/40 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">Developing significant platform updates via a multi-phase rollout. Phase 1 is now live as of v2.4.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Versions List */}
            <div className="space-y-8 sm:space-y-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-500/50 mb-4" />
                  <p className="text-sky-700/60 dark:text-sky-400/60">Loading changelog...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-red-500 dark:text-red-400 mb-2">Failed to load changelog</p>
                  <p className="text-sm text-sky-700/60 dark:text-sky-400/60 text-center max-w-md">
                    {error}
                  </p>
                </div>
              ) : filteredVersions.length === 0 ? (
                <div className="text-center py-12 text-sky-700/60 dark:text-sky-400/60">
                  No updates found matching "{searchQuery}"
                </div>
              ) : (
                filteredVersions.map((v, i) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const versionDate = new Date(v.date + 'T00:00:00');
                  const isFuture = today < versionDate;

                  return (
                    <div key={v.version} id={`version-${v.version}`} className="relative scroll-mt-24">
                      {/* FUTURE tag */}
                      {isFuture && (
                        <div className="absolute -top-2 -left-1 sm:-top-2.5 sm:-left-1 bg-[#ebf6b5]/80 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full z-10">
                          Future
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isFuture ? 0.5 : 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group ${isFuture ? 'relative bg-sky-50/30 dark:bg-sky-950/20 p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-[24px]' : ''}`}
                      >
                        {/* Special styling for future versions */}
                        {isFuture && (
                          <div className="absolute inset-0 border-2 border-dashed border-sky-200 dark:border-sky-800 rounded-[24px] opacity-40 pointer-events-none" />
                        )}

                        {/* Version Header */}
                        <div className={`relative flex flex-col sm:flex-row sm:items-start justify-between mb-4 pb-4 border-b ${isFuture ? 'border-sky-200 dark:border-sky-900/30' : 'border-sky-100 dark:border-sky-900/20'} gap-3`}>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                              <h2 className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-200 leading-tight">
                                {v.title}
                              </h2>
                              <span className="text-xs sm:text-sm font-mono text-sky-700 dark:text-sky-300">
                                v{v.version}
                              </span>
                              {v.type === 'major' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">
                                  Major
                                </span>
                              )}
                              {(['2.0', '2.0.1', '1.9.9', '1.9.8', '1.9.7', '1.9.6', '1.9.5', '1.9.4', '1.9.3', '1.9.0', '1.8.9', '1.8.8', '1.4', '1.3', '1.2', '1.1', '1.0', '0.9.0', '0.8.5', '0.8.0'].includes(v.version)) && (
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-100/60 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                                  New Feature
                                </span>
                              )}
                              {v.type === 'minor' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-sky-100/60 dark:bg-sky-500/10 text-sky-600/60 dark:text-sky-400/60 rounded-full">
                                  Minor
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-700 dark:text-sky-300">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {new Date(v.date + 'T00:00:00').toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                timeZone: 'UTC'
                              })}
                            </div>
                          </div>

                          <button
                            onClick={() => setOpen(open === v.version ? null : v.version)}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 px-3 rounded-full hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10 active:scale-95"
                          >
                            {open === v.version ? (
                              <>
                                Hide
                                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </>
                            ) : (
                              <>
                                Details
                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Highlight */}
                        {v.highlight && (
                          <p className={`relative text-sm sm:text-base text-sky-800 dark:text-sky-200 mb-4 sm:mb-6 leading-relaxed ${isFuture ? 'text-sky-900 dark:text-sky-100' : ''}`}>
                            {v.highlight}
                          </p>
                        )}

                        {/* Short list */}
                        <ul className="space-y-1.5 sm:space-y-2">
                          {v.short.map((txt, idx) => (
                            <li key={idx} className={`relative flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${isFuture ? 'text-sky-800 dark:text-sky-200' : 'text-sky-800 dark:text-sky-300'}`}>
                              <span className="text-sky-500 dark:text-sky-400 mt-0.5 shrink-0">•</span>
                              <span className="leading-relaxed wrap-break-word">{txt}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Full list */}
                        <AnimatePresence>
                          {open === v.version && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="mt-4 sm:mt-6 pt-4 sm:pt-6 space-y-1.5 sm:space-y-2 border-t border-sky-100 dark:border-sky-900/20">
                                {v.full.map((txt, idx) => (
                                  <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={`relative flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${isFuture ? 'text-sky-800 dark:text-sky-300' : 'text-sky-700 dark:text-sky-300'}`}
                                  >
                                    <span className="text-sky-500/60 dark:text-sky-400/60 mt-0.5 shrink-0">•</span>
                                    <span className="leading-relaxed wrap-break-word">{txt}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sticky Table of Contents (Desktop) */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-sky-500 dark:text-sky-400 mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Version History
                </h3>
                <div
                  className="relative border-l border-sky-100 dark:border-sky-900/20 ml-2 space-y-1"
                  onMouseLeave={() => setHoveredVersion(null)}
                >
                  {filteredVersions.map((v) => (
                    <button
                      key={v.version}
                      onClick={() => scrollToVersion(v.version)}
                      onMouseEnter={() => setHoveredVersion(v.version)}
                      className="group relative flex items-center justify-between w-full text-left pl-4 py-1.5 text-sm text-sky-700 dark:text-sky-300 hover:text-sky-500 dark:hover:text-sky-400 font-medium transition-colors"
                    >
                      {hoveredVersion === v.version && (
                        <motion.div
                          layoutId="toc-active-line"
                          className="absolute -left-px top-0 bottom-0 w-[2px] bg-sky-500 dark:bg-sky-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span>v{v.version}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats or Summary */}
              <div className="p-4 bg-[#f5f9fc] dark:bg-zinc-800 rounded-[16px]">
                <h4 className="text-[11px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em] mb-3">
                  Overview
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sky-800/70 dark:text-sky-200/70 font-medium">Total Releases</span>
                    <span className="font-bold text-sky-900 dark:text-sky-100">{versions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sky-800/70 dark:text-sky-200/70 font-medium">Major Updates</span>
                    <span className="font-bold text-sky-900 dark:text-sky-100">
                      {versions.filter(v => v.type === 'major').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sky-800/70 dark:text-sky-200/70 font-medium">Latest</span>
                    <span className="font-bold text-sky-900 dark:text-sky-100">
                      {versions.length > 0 ? versions[0].version : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-sky-100 dark:border-sky-900/20"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
              Built for students • Public Beta {getFullVersionString()}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                className="text-xs sm:text-sm font-bold text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 px-3 rounded-full hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10 active:scale-95"
              >
                Send Feedback
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}