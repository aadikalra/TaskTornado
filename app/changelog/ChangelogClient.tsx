'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useState, useEffect, useMemo } from 'react';

type Version = {
  version: string;
  date: string;
  title: string;
  highlight: string;
  type: 'major' | 'Alpha' | 'minor';
  short: string[];
  full: string[];
  image?: string; // Optional image field
};

interface ChangelogClientProps {
  initialVersions?: Version[];
}

const TIMELINE_COLORS = [
  'text-red-500',
  'text-blue-500',
  'text-purple-500',
  'text-emerald-500',
  'text-amber-500',
];

const DOT_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
];

export default function ChangelogClient({ initialVersions }: ChangelogClientProps) {
  const [versions, setVersions] = useState<Version[]>(initialVersions ?? []);
  const [loading, setLoading] = useState(!initialVersions || initialVersions.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchVersions = async (showRefresher = false) => {
    try {
      if (showRefresher) setIsRefreshing(true);
      else setLoading(true);

      const response = await fetch(`https://api.npoint.io/9eb23a1980287e881d97?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      console.error('Error fetching changelog:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialVersions || initialVersions.length === 0) {
      fetchVersions();
    }
  }, []);

  const filteredVersions = useMemo(() => 
    versions.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.full.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.highlight.toLowerCase().includes(searchQuery.toLowerCase())
    ), [versions, searchQuery]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const scrollToVersion = (version: string) => {
    const element = document.getElementById(`version-${version}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans relative selection:bg-sky-100 dark:selection:bg-sky-900/30">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 bg-dotted pointer-events-none opacity-[0.4] dark:opacity-[0.15]" />

      <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-24 pb-32">
        
        {/* Adjusted Header Container for Widescreen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 mb-20 items-end">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif italic text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
                Changelog
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium">
                New updates, improvements, and fixes to TaskTornado.
              </p>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 self-start md:self-end">
              <AnimatePresence>
                {showSearch && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="relative"
                  >
                    <input 
                      type="text"
                      placeholder="Search updates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-full transition-all ${showSearch ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                title="Search"
              >
                <HugeIcon name="Search01" size={20} />
              </button>
              <button 
                onClick={() => fetchVersions(true)}
                disabled={isRefreshing}
                className={`p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="Reload"
              >
                <HugeIcon name="Rotate01" size={20} />
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'TaskTornado Changelog', url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                title="Share"
              >
                <HugeIcon name="Share03" size={20} />
              </button>
            </div>
          </header>
          <div className="hidden lg:block h-px bg-zinc-100 dark:bg-zinc-900 translate-y-[-12px]" />
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20">
          
          {/* Main Content (Changelog) */}
          <div className="relative">
            {/* Main vertical line */}
            <div className="absolute left-[132px] top-0 bottom-0 w-px bg-zinc-100 dark:bg-zinc-900 hidden md:block" />

            <div className="space-y-32">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <HugeIcon name="LoaderPinwheel" className="animate-spin text-zinc-300" size={32} />
                  <p className="text-zinc-400 font-medium tracking-wide">Fetching updates...</p>
                </div>
              ) : filteredVersions.length === 0 ? (
                <div className="text-center py-40 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl">
                  <p className="text-zinc-400 text-lg">No updates found matching "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-sky-500 font-bold hover:underline">Clear search</button>
                </div>
              ) : filteredVersions.map((v, i) => {
                const colorIndex = i % TIMELINE_COLORS.length;
                const accentColorClass = TIMELINE_COLORS[colorIndex];
                const dotColorClass = DOT_COLORS[colorIndex];

                return (
                  <motion.div
                    key={v.version}
                    id={`version-${v.version}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="relative grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-12 group scroll-mt-32"
                  >
                    {/* Date (Left) */}
                    <div className={`hidden md:block pt-[11px] text-right font-bold text-sm tracking-tight whitespace-nowrap transition-colors ${accentColorClass}`}>
                      {formatDate(v.date)}
                    </div>

                    {/* Content (Right) */}
                    <div className="relative pl-8 md:pl-0">
                      {/* Dot on line */}
                      <div className={`absolute -left-[41.5px] top-[14px] w-3 h-3 rounded-full z-10 hidden md:block ${dotColorClass} shadow-[0_0_0_4px_rgba(255,255,255,1)] dark:shadow-[0_0_0_4px_rgba(9,9,11,1)] transition-transform group-hover:scale-125`} />
                      
                      {/* Mobile Dot */}
                      <div className={`md:hidden absolute left-0 top-[18px] w-2 h-2 rounded-full ${dotColorClass}`} />

                      <div className="mb-8">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono font-bold px-2 py-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 rounded-md uppercase tracking-wider">
                              v{v.version}
                            </span>
                            {v.type === 'major' && (
                              <span className="text-[10px] font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md uppercase tracking-widest leading-none">
                                Major
                              </span>
                            )}
                         </div>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {v.title}
                        </h2>
                      </div>

                      {/* Image if available */}
                      {v.image && (
                        <div className="mb-12 rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/30 dark:shadow-none group-hover:shadow-blue-500/10 transition-all duration-500">
                          <img src={v.image} alt={v.title} className="w-full h-auto object-cover hover:scale-[1.03] transition-transform duration-1000" />
                        </div>
                      )}

                      {/* Content Groups */}
                      <div className="space-y-12">
                        {v.highlight && (
                          <div className="mb-4">
                            <h3 className="text-xl text-zinc-800 dark:text-zinc-200 leading-relaxed italic font-serif opacity-90">
                              {v.highlight}
                            </h3>
                          </div>
                        )}

                        {v.full.length > 0 && (
                          <div className="space-y-6">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                               Changes
                            </h4>
                            <ul className="space-y-5">
                              {v.full.map((item, idx) => {
                                const isCategory = item.endsWith(':') && item.length < 20;
                                if (isCategory) {
                                  return (
                                    <li key={idx} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-10 first:mt-0 block border-b border-zinc-50 dark:border-zinc-900 pb-2">
                                      {item}
                                    </li>
                                  );
                                }
                                return (
                                  <li key={idx} className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400 leading-relaxed group/item">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 group-hover/item:bg-blue-400 transition-colors" />
                                    <span className="text-[16px] group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-200 transition-colors">{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar (Right) - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-12">
              
              {/* Version Navigation */}
              <div className="space-y-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                  Version History
                </h3>
                <div className="relative border-l border-zinc-100 dark:border-zinc-900 space-y-1">
                  {versions.slice(0, 10).map((v) => (
                    <button
                      key={v.version}
                      onClick={() => scrollToVersion(v.version)}
                      className="group flex flex-col items-start w-full pl-6 py-2.5 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-r-xl"
                    >
                      <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                        v{v.version}
                      </span>
                      <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-500 truncate w-full">
                        {v.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[32px] space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-100">{versions.length}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Total Releases</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-100">
                      {versions.filter(v => v.type === 'major').length}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Major Updates</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* Footer */}
        <footer className="mt-48 pt-16 border-t border-zinc-100 dark:border-zinc-900 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-900 mb-8">
            <HugeIcon name="Calendar02" className="text-zinc-300" size={20} />
          </div>
          <p className="text-zinc-400 dark:text-zinc-600 text-[11px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} TaskTornado • Evolving for Students
          </p>
        </footer>
      </div>
    </div>
  );
}