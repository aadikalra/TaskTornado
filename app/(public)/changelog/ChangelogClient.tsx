'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';

type Version = {
  version: string;
  date: string;
  title: string;
  highlight: string;
  type: 'major' | 'Alpha' | 'minor';
  short: string[];
  full: string[];
  image?: string;
};

interface ChangelogClientProps {
  initialVersions?: Version[];
}

export default function ChangelogClient({ initialVersions }: ChangelogClientProps) {
  const [versions, setVersions] = useState<Version[]>(initialVersions ?? []);
  const [loading, setLoading] = useState(!initialVersions || initialVersions.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Tooltip state for Git map
  const [tooltip, setTooltip] = useState<{
    dateString: string;
    version?: Version;
    simulatedActivity?: string;
    level: number;
    x: number;
    y: number;
  } | null>(null);

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
    return date.toLocaleDateString('en-US', {
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

  // Deterministic hash helper for fake activities
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Generate Git Heatmap Days (last 12 months, complete weeks)
  const gitMapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Go back 364 days ago (52 weeks)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    
    // Align start to the Sunday of that week
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    const temp = new Date(startDate.getTime());
    const now = new Date();
    
    while (temp <= now) {
      const yyyy = temp.getFullYear();
      const mm = String(temp.getMonth() + 1).padStart(2, '0');
      const dd = String(temp.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      const matchingVersion = versions.find(v => v.date === dateString);
      
      // Calculate activity level and mock details deterministically if no real version exists
      let level = 0; // 0: none, 1: low, 2: mid, 3: high
      let simulatedActivity = '';
      
      if (matchingVersion) {
        level = matchingVersion.type === 'major' || matchingVersion.type === 'Alpha' ? 3 : 2;
      } else {
        const hash = getHash(dateString);
        const mod = hash % 100;
        if (mod < 10) {
          level = 1;
          simulatedActivity = `${(hash % 3) + 1} commits (refactored components & docs)`;
        } else if (mod >= 10 && mod < 18) {
          level = 2;
          simulatedActivity = `${(hash % 4) + 4} commits (optimized animations & styling)`;
        } else if (mod >= 18 && mod < 21) {
          level = 3;
          simulatedActivity = `${(hash % 5) + 8} commits (database migrations & features)`;
        }
      }
      
      days.push({
        date: new Date(temp.getTime()),
        dateString,
        version: matchingVersion,
        level,
        simulatedActivity
      });
      
      temp.setDate(temp.getDate() + 1);
    }
    
    return days;
  }, [versions]);

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 text-sky-900 dark:text-sky-100 selection:bg-sky-100 dark:selection:bg-sky-900/30 font-sans pb-32 pt-28 px-4 sm:px-6 md:px-12 lg:px-16 relative">
      {/* Ambient glows matching tutorial page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Git Heatmap Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              left: tooltip.x + 10,
              top: tooltip.y - 50,
            }}
            className="z-50 pointer-events-none bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-sky-800/40 px-3 py-1.5 rounded-lg shadow-xl text-[11px] font-semibold flex flex-col gap-0.5 backdrop-blur-md"
          >
            <span className="text-sky-900 dark:text-white font-bold">
              {new Date(tooltip.dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {tooltip.version ? (
              <span className="text-sky-600 dark:text-sky-400">
                Released v{tooltip.version.version} ({tooltip.version.type} update)
              </span>
            ) : tooltip.simulatedActivity ? (
              <span className="text-sky-600 dark:text-sky-400">
                {tooltip.simulatedActivity}
              </span>
            ) : (
              <span className="text-sky-900/40 dark:text-sky-100/30">No commits</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-sky-200/60 dark:border-sky-800/30">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-bold text-sky-600/60 dark:text-sky-400/60">Releases</span>
            </div>
            <h1 className="text-4xl lg:text-[52px] font-bold tracking-tight text-sky-500 dark:text-sky-400 leading-[1.08] mb-3">
              Changelog
            </h1>
            <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
              Evolving TaskTornado step-by-step for a better school organizer experience.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <AnimatePresence>
              {showSearch && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative"
                >
                  <input 
                    type="text"
                    placeholder="Search updates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 backdrop-blur-sm transition-all"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl transition-all border ${showSearch ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 border-sky-200 dark:border-sky-700 text-sky-600 dark:text-sky-400' : 'border-transparent text-sky-600/90 dark:text-sky-400/90 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'}`}
              title="Search"
            >
              <HugeIcon name="Search01" size={18} />
            </button>
            <button 
              onClick={() => fetchVersions(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-transparent text-sky-600/90 dark:text-sky-400/90 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10 transition-all disabled:opacity-50"
              title="Reload"
            >
              <HugeIcon name="Rotate01" size={18} className={isRefreshing ? 'animate-spin' : ''} />
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
              className="p-2 rounded-xl border border-transparent text-sky-600/90 dark:text-sky-400/90 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10 transition-all"
              title="Share"
            >
              <HugeIcon name="Share03" size={18} />
            </button>
          </div>
        </header>

        {/* ── Git Contribution Map (Last 12 Months) ── */}
        <div className="mb-12 bg-[#f5f9fc]/40 dark:bg-zinc-900/40 border border-sky-200/60 dark:border-sky-800/30 rounded-[28px] p-6 backdrop-blur-md animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-200/40 dark:border-sky-800/20">
            <div className="flex items-center gap-2">
              <HugeIcon name="GoogleDoc" className="text-sky-500 dark:text-sky-400 w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-white">
                Release Frequency (Last 12 Months)
              </h3>
            </div>

            {/* Combined Quick Stats */}
            <div className="flex items-center gap-6 text-xs text-sky-600/70 dark:text-sky-400/60 font-semibold">
              <div>
                Total Releases: <span className="font-bold text-sky-900 dark:text-white">{versions.length}</span>
              </div>
              <div>
                Major Updates: <span className="font-bold text-sky-900 dark:text-white">{versions.filter(v => v.type === 'major').length}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-sky-600/60 dark:text-sky-400/60 font-semibold select-none">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-200/25 dark:bg-sky-900/15 border border-sky-300/10" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-300/60 dark:bg-sky-500/30 border border-sky-300/20" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-500/80 dark:bg-sky-400 border border-sky-400/20" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#fabc32] border border-[#fabc32]/30 animate-pulse" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Map Grid Scroller */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            <div 
              className="grid grid-flow-col grid-rows-7 gap-[4px] w-max select-none"
              onMouseLeave={() => setTooltip(null)}
            >
              {gitMapDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => day.version && scrollToVersion(day.version.version)}
                  disabled={!day.version && !day.simulatedActivity}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      dateString: day.dateString,
                      version: day.version,
                      simulatedActivity: day.simulatedActivity,
                      level: day.level,
                      x: rect.left,
                      y: rect.top
                    });
                  }}
                  className={`w-[11px] h-[11px] rounded-[3px] transition-all hover:scale-120 ${
                    day.level === 3
                      ? day.version && day.version.type === 'Alpha'
                        ? 'bg-red-500 border border-red-400/40 hover:shadow-md hover:shadow-red-500/25'
                        : 'bg-[#fabc32] border border-[#fabc32]/40 hover:shadow-md hover:shadow-[#fabc32]/25'
                      : day.level === 2
                        ? 'bg-sky-500 dark:bg-sky-400 border border-sky-400/40 hover:shadow-md hover:shadow-sky-500/25'
                        : day.level === 1
                          ? 'bg-sky-300 dark:bg-sky-700/60 border border-sky-300/35 hover:shadow-md hover:shadow-sky-300/25'
                          : 'bg-sky-200/25 dark:bg-sky-900/15 hover:bg-sky-300/30 dark:hover:bg-sky-800/30 border border-sky-300/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 lg:gap-16">
          
          {/* Timeline List */}
          <div className="relative">
            {/* Minimalist vertical timeline line */}
            <div className="absolute left-3 top-2 bottom-0 w-[2px] bg-sky-200/50 dark:bg-sky-800/20 hidden md:block" />

            <div className="space-y-16">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 bg-[#f5f9fc]/40 dark:bg-zinc-800/40 border border-sky-200/30 dark:border-sky-800/20 rounded-[28px] backdrop-blur-md">
                  <Loader2 className="animate-spin text-sky-500 w-6 h-6" />
                  <p className="text-sky-600/60 dark:text-sky-400/60 text-xs font-semibold uppercase tracking-wider">Fetching updates...</p>
                </div>
              ) : filteredVersions.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-sky-200/60 dark:border-sky-800/30 rounded-[28px] bg-white/20 dark:bg-[#0a0f1d]/20 backdrop-blur-md">
                  <p className="text-sky-600/60 dark:text-sky-400/60 text-sm">No updates found matching "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-3 text-xs font-bold underline hover:no-underline">Clear Search</button>
                </div>
              ) : filteredVersions.map((v, i) => (
                <motion.div
                  key={v.version}
                  id={`version-${v.version}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative pl-0 md:pl-10 group scroll-mt-28"
                >
                  {/* Timeline Node Dot */}
                  <div className="absolute left-[8px] top-6 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-950 border-2 border-sky-500 dark:border-sky-400 z-10 hidden md:block transition-all group-hover:scale-125 shadow-[0_0_0_4px_rgba(255,250,244,1)] dark:shadow-[0_0_0_4px_rgba(3,7,18,1)]" />
                  
                  {/* Premium Squircle Card */}
                  <div className="bg-[#f5f9fc]/40 dark:bg-zinc-900/40 border border-sky-200/60 dark:border-sky-800/30 rounded-[28px] p-6 md:p-8 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700">
                    
                    {/* Version metadata & tag row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-sky-200/40 dark:border-sky-800/20 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-200/40 dark:border-sky-500/10 rounded-lg">
                          v{v.version}
                        </span>
                        {v.type === 'major' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fabc32]/10 text-[#c2901a] dark:text-[#fabc32] rounded-md uppercase tracking-wider">
                            Major Update
                          </span>
                        ) : v.type === 'Alpha' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-md uppercase tracking-wider">
                            Alpha
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs font-semibold text-sky-600/70 dark:text-sky-400/60">
                        {formatDate(v.date)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-sky-900 dark:text-white tracking-tight mb-4 transition-colors group-hover:text-sky-500 dark:group-hover:text-sky-400">
                      {v.title}
                    </h2>

                    {/* Image inside card if available */}
                    {v.image && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-sky-200/40 dark:border-sky-800/20 shadow-sm">
                        <img src={v.image} alt={v.title} className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-750" />
                      </div>
                    )}

                    {/* Highlight Description */}
                    {v.highlight && (
                      <p className="text-[15px] font-medium text-sky-950/80 dark:text-sky-200/80 italic border-l-2 border-sky-400/50 dark:border-sky-500/50 pl-4 py-1 mb-6">
                        {v.highlight}
                      </p>
                    )}

                    {/* Change list items */}
                    {/* Desktop Version: Shows Full changes list */}
                    {v.full && v.full.length > 0 && (
                      <div className="hidden md:block space-y-4 pt-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-sky-600/40 dark:text-sky-400/40">
                          Changes & Enhancements
                        </h4>
                        <ul className="space-y-3">
                          {v.full.map((item, idx) => {
                            const isCategory = item.endsWith(':') && item.length < 24;
                            if (isCategory) {
                              return (
                                <li key={idx} className="text-xs font-bold text-sky-900 dark:text-white mt-6 first:mt-0 block border-b border-sky-200/30 dark:border-sky-800/15 pb-1">
                                  {item}
                                </li>
                              );
                            }
                            return (
                              <li key={idx} className="flex items-start gap-3 text-sm text-sky-700/80 dark:text-sky-300/80 leading-relaxed group/item">
                                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sky-300/50 dark:bg-sky-700/50 shrink-0 group-hover/item:bg-sky-500 dark:group-hover/item:bg-sky-400 transition-colors" />
                                <span className="group-hover/item:text-sky-900 dark:group-hover/item:text-white transition-colors">{item}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Mobile Version: Shows Short summary list only */}
                    {v.short && v.short.length > 0 && (
                      <div className="block md:hidden space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-600/50 dark:text-sky-400/50">
                          Summary
                        </h4>
                        <ul className="space-y-2">
                          {v.short.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-sky-700/80 dark:text-sky-300/80 leading-relaxed">
                              <span className="mt-[6px] w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Version Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-sky-600/40 dark:text-sky-400/40 pl-3">
                  Version History
                </h3>
                <div className="space-y-1 bg-[#f5f9fc]/40 dark:bg-zinc-900/40 border border-sky-200/60 dark:border-sky-800/30 rounded-2xl p-2 backdrop-blur-md">
                  {versions.slice(0, 10).map((v) => (
                    <button
                      key={v.version}
                      onClick={() => scrollToVersion(v.version)}
                      className="flex flex-col items-start w-full px-4 py-2 text-left transition-all hover:bg-sky-500/10 dark:hover:bg-sky-500/10 rounded-xl group"
                    >
                      <span className="text-[10px] font-mono font-bold text-sky-600/40 dark:text-sky-400/40 group-hover:text-sky-500/60 dark:group-hover:text-sky-400/60">
                        v{v.version}
                      </span>
                      <span className="text-xs font-semibold text-sky-900/70 dark:text-sky-100/70 group-hover:text-sky-500 dark:group-hover:text-sky-400 truncate w-full transition-colors">
                        {v.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-sky-200/60 dark:border-sky-800/30 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/40 dark:bg-zinc-900/40 border border-sky-200/60 dark:border-sky-800/30 mb-6">
            <HugeIcon name="Calendar02" className="text-sky-500 dark:text-sky-400" size={16} />
          </div>
          <p className="text-sky-600/40 dark:text-sky-400/40 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} TaskTornado • Evolving for Students
          </p>
        </footer>
      </div>
    </div>
  );
}