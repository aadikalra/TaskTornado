'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Search, Hash, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { Input } from '@/components/ui/input';
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

export default function ChangelogPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getContainerClass } = useWideLayout();

  // Fetch version data from API
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://api.npoint.io/9eb23a1980287e881d97');

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
      }
    };

    fetchVersions();
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-24">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
              Changelog
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Product updates and improvements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
          </motion.div>
        </div>

        {/* Outdated Build Alert */}
        {isOutdated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg"
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
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      Bug Fixes
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded">
                      In Progress
                    </span>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-gray-400 dark:text-gray-600 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">None at the moment</span>
                    </li>
                  </ul>
                </div>

                {/* New Features */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      New Features
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">
                      In Progress
                    </span>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-gray-400 dark:text-gray-600 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">TaskTornado is now feature-complete. Future updates will focus on patches and bug fixes.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Versions List */}
            <div className="space-y-8 sm:space-y-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading changelog...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-red-500 dark:text-red-400 mb-2">Failed to load changelog</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                    {error}
                  </p>
                </div>
              ) : filteredVersions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
                        <div className="absolute -top-2 -left-1 sm:-top-2.5 sm:-left-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded z-10">
                          FUTURE
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isFuture ? 0.5 : 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group ${isFuture ? 'relative bg-blue-50/30 dark:bg-blue-950/20 p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-xl' : ''}`}
                      >
                        {/* Special styling for future versions */}
                        {isFuture && (
                          <div className="absolute inset-0 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl opacity-40 pointer-events-none" />
                        )}

                        {/* Version Header */}
                        <div className={`relative flex flex-col sm:flex-row sm:items-start justify-between mb-4 pb-4 border-b ${isFuture ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800'} gap-3`}>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white leading-tight">
                                {v.title}
                              </h2>
                              <span className="text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-400">
                                v{v.version}
                              </span>
                              {v.type === 'major' && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">
                                  Major
                                </span>
                              )}
                              {(['2.0', '2.0.1', '1.9.9', '1.9.8', '1.9.7', '1.9.6', '1.9.5', '1.9.4', '1.9.3', '1.9.0', '1.8.9', '1.8.8', '1.4', '1.3', '1.2', '1.1', '1.0', '0.9.0', '0.8.5', '0.8.0'].includes(v.version)) && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded">
                                  New Feature
                                </span>
                              )}
                              {v.type === 'minor' && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 rounded">
                                  Minor
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                            className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95"
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
                          <p className={`relative text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed ${isFuture ? 'text-gray-700 dark:text-gray-200' : ''}`}>
                            {v.highlight}
                          </p>
                        )}

                        {/* Short list */}
                        <ul className="space-y-1.5 sm:space-y-2">
                          {v.short.map((txt, idx) => (
                            <li key={idx} className={`relative flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${isFuture ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              <span className="text-gray-400 dark:text-gray-600 mt-0.5 shrink-0">•</span>
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
                              <ul className="mt-4 sm:mt-6 pt-4 sm:pt-6 space-y-1.5 sm:space-y-2 border-t border-gray-100 dark:border-gray-900">
                                {v.full.map((txt, idx) => (
                                  <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={`relative flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${isFuture ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}
                                  >
                                    <span className="text-gray-300 dark:text-gray-700 mt-0.5 shrink-0">•</span>
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
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Version History
                </h3>
                <div
                  className="relative border-l border-gray-200 dark:border-gray-800 ml-2 space-y-1"
                  onMouseLeave={() => setHoveredVersion(null)}
                >
                  {filteredVersions.map((v) => (
                    <button
                      key={v.version}
                      onClick={() => scrollToVersion(v.version)}
                      onMouseEnter={() => setHoveredVersion(v.version)}
                      className="group relative flex items-center justify-between w-full text-left pl-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {hoveredVersion === v.version && (
                        <motion.div
                          layoutId="toc-active-line"
                          className="absolute -left-px top-0 bottom-0 w-[2px] bg-gray-900 dark:bg-white"
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
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Overview
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Releases</span>
                    <span className="font-medium text-gray-900 dark:text-white">{versions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Major Updates</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {versions.filter(v => v.type === 'major').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latest</span>
                    <span className="font-medium text-gray-900 dark:text-white">
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
          className="mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta {getFullVersionString()}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95"
              >
                Send Feedback
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95"
              >
                Report Issue
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}