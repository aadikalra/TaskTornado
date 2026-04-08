'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BUILD_VERSION, getFullVersionString } from '@/config/version';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  href: string;
  icon: React.ReactNode;
}

const tutorialsData: Tutorial[] = [
  {
    id: 'onboarding',
    title: 'Getting Started',
    description: 'Personalize your TaskTornado experience, from grade selection to elective optimization.',
    category: 'Getting Started',
    difficulty: 'beginner',
    tags: ['setup', 'classes', 'onboarding'],
    href: '/tutorials/onboarding',
    icon: <HugeIcon name="Star" className="w-5 h-5" />,
  },
  {
    id: 'starring-homeworks',
    title: 'Priority Stars',
    description: 'Highlight your most important assignments by converting priority tags into prominent stars.',
    category: 'Features',
    difficulty: 'beginner',
    tags: ['homework', 'priority', 'organization'],
    href: '/tutorials/starring-homeworks',
    icon: <HugeIcon name="Zap" className="w-5 h-5" />,
  },
  {
    id: 'test-details',
    title: 'Test Details',
    description: 'Access comprehensive info about upcoming tests — dates, study materials, and grades.',
    category: 'Features',
    difficulty: 'beginner',
    tags: ['tests', 'exams', 'study-materials'],
    href: '/tutorials/test-details',
    icon: <HugeIcon name="FileEmpty02" className="w-5 h-5" />,
  },
  {
    id: 'recurring-homework',
    title: 'Recurring Homework',
    description: 'Set up assignments that repeat daily or weekly, ensuring you never miss a routine task.',
    category: 'Features',
    difficulty: 'intermediate',
    tags: ['homework', 'recurring', 'automation'],
    href: '/tutorials/recurring-homeworks',
    icon: <HugeIcon name="Zap" className="w-5 h-5" />,
  },
  {
    id: 'csv-import',
    title: 'CSV Import for Flashcards',
    description: 'Import flashcard decks from spreadsheets, Quizlet exports, or plain text files.',
    category: 'Features',
    difficulty: 'beginner',
    tags: ['flashcards', 'csv', 'import', 'spreadsheet'],
    href: '/tutorials/csv-import',
    icon: <HugeIcon name="FileEmpty02" className="w-5 h-5" />,
  },
  {
    id: 'changelog',
    title: `What's New in v${BUILD_VERSION}`,
    description: 'Explore the latest features and improvements in the newest version of TaskTornado.',
    category: 'Release Notes',
    difficulty: 'beginner',
    tags: ['updates', 'new-features'],
    href: '/changelog',
    icon: <HugeIcon name="FileEmpty02" className="w-5 h-5" />,
  }
];

const ALL_CATEGORIES = ['All', 'Getting Started', 'Features', 'Release Notes'];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTutorials = useMemo(() => {
    let results = tutorialsData;
    if (activeCategory !== 'All') {
      results = results.filter(t => t.category === activeCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return results;
  }, [searchQuery, activeCategory]);

  const handleSemanticSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setAiSuggestions([]);
      return;
    }
    setIsSuggesting(true);
    try {
      const tutorialsContext = tutorialsData.map(t => ({
        id: t.id, title: t.title, description: t.description, category: t.category
      }));
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on the user's search query "${query}", identify the top 3 most relevant tutorial IDs from this list: ${JSON.stringify(tutorialsContext)}. Return ONLY a JSON array of strings (the IDs). If none are relevant, return an empty array []. No explanation.`,
          action: 'generate',
          model: 'gemma-3n-e4b-it'
        })
      });
      const reader = response.body?.getReader();
      let text = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.response) text += parsed.response;
              } catch (e) { }
            }
          }
        }
      }
      const match = text.match(/\[.*\]/s);
      if (match) setAiSuggestions(JSON.parse(match[0]));
    } catch (error) {
      console.error('Semantic search error:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSemanticSearch(searchQuery);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const suggestedTutorials = tutorialsData.filter(t => aiSuggestions.includes(t.id));

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">

      {/* ── Ambient glows ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16">

        {/* ═══════════════════════════════════════════════════════════════════
            HEADER — title left, search right
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="pt-28 pb-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            {/* Left — title & subtitle */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                Learn TaskTornado
              </h1>
              <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
                Step-by-step guides for every feature.
              </p>
            </motion.div>

            {/* Right — expanding search bar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="shrink-0"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{ width: searchExpanded ? 320 : 40 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className={`relative h-10 flex items-center rounded-full overflow-hidden bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 ${!searchExpanded ? 'cursor-pointer hover:bg-sky-100 dark:hover:bg-zinc-700 hover:border-sky-300 dark:hover:border-sky-700' : ''
                    } ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                  style={{ originX: 1 }}
                  onClick={() => {
                    if (!searchExpanded) {
                      setSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 80);
                    }
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    {isSuggesting ? (
                      <HugeIcon name="LoaderPinwheel" className="w-4 h-4 text-sky-500 animate-spin" />
                    ) : (
                      <HugeIcon name="Search01" className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    )}
                  </div>
                  <div className={`flex items-center flex-1 min-w-0 overflow-hidden transition-opacity duration-200 ${searchExpanded ? 'opacity-100 pr-4' : 'opacity-0 w-0 pr-0'}`}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search guides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => {
                        setSearchFocused(false);
                        if (!searchQuery) setSearchExpanded(false);
                      }}
                      className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none w-full min-w-0"
                    />
                    {searchQuery && (
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); setSearchQuery(''); setAiSuggestions([]); searchInputRef.current?.focus(); }}
                        className="p-0.5 ml-1 rounded-full text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors shrink-0"
                      >
                        <HugeIcon name="Cancel01" className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* AI suggestion chips */}
              <AnimatePresence>
                {suggestedTutorials.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 flex flex-wrap gap-1.5"
                  >
                    <span className="text-[9px] font-bold text-sky-500/50 dark:text-sky-400/50 uppercase tracking-widest self-center mr-0.5">
                      AI →
                    </span>
                    {suggestedTutorials.map(t => (
                      <Link key={t.id} href={t.href}>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full hover:bg-[#ebf6b5] dark:hover:bg-sky-500/30 transition-colors">
                          {t.title}
                          <HugeIcon name="ArrowRight01" className="w-2 h-2" />
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── Category pills ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${activeCategory === cat
                  ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400'
                  : 'text-sky-600/90 dark:text-sky-400/90 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            GUIDE GRID
           ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pb-16"
        >
          {filteredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutorials.map((tutorial, index) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                >
                  <Link href={tutorial.href} className="group block h-full">
                    <div className="flex flex-col h-full p-6 md:p-7 rounded-[24px] bg-[#f5f9fc] dark:bg-zinc-800 hover:shadow-xl hover:shadow-sky-500/[0.06] transition-all duration-500 hover:-translate-y-1">

                      {/* Icon + difficulty */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 text-sky-500 dark:text-sky-400">
                          {tutorial.icon}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                          {tutorial.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-sky-800 dark:text-sky-200 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors leading-snug mb-2">
                        {tutorial.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[13px] text-sky-800/80 dark:text-sky-300 leading-relaxed flex-grow">
                        {tutorial.description}
                      </p>

                      {/* Bottom link */}
                      <div className="flex items-center gap-1.5 mt-6 text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-all">
                        <span>{tutorial.id === 'changelog' ? 'View changelog' : 'Read guide'}</span>
                        <HugeIcon name="ArrowRight01" className="w-3 h-3 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-sky-700/60 dark:text-sky-400/60 mb-3">No guides match &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full hover:bg-[#ebf6b5] dark:hover:bg-sky-500/30 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pb-16 pt-8 border-t border-sky-100 dark:border-sky-900/20"
        >
          <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
            Built for students • Public Beta {getFullVersionString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
