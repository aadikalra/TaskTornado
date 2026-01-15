'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, Home, ChevronRight, Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  href: string;
}

const tutorialsData: Tutorial[] = [
  {
    id: 'onboarding',
    title: 'Getting Started',
    description: 'A comprehensive guide to personalizing your TaskTornado experience, from grade selection to elective optimization.',
    category: 'Getting Started',
    difficulty: 'beginner',
    tags: ['setup', 'classes', 'onboarding'],
    href: '/tutorials/onboarding'
  },
  {
    id: 'starring-homeworks',
    title: 'Priority Stars',
    description: 'Learn how to highlight your most important assignments by converting their priority tags into prominent stars.',
    category: 'Features',
    difficulty: 'beginner',
    tags: ['homework', 'priority', 'organization'],
    href: '/tutorials/starring-homeworks'
  },
  {
    id: 'test-details',
    title: 'Test Details',
    description: 'Discover how to access comprehensive information about your upcoming tests, including dates, study materials, and grades.',
    category: 'Features',
    difficulty: 'beginner',
    tags: ['tests', 'exams', 'study-materials', 'organization'],
    href: '/tutorials/test-details'
  },
  {
    id: 'recurring-homework',
    title: 'Recurring Homework',
    description: 'Save time by learning how to set up assignments that repeat daily or weekly, ensuring you never miss a routine task.',
    category: 'Features',
    difficulty: 'intermediate',
    tags: ['homework', 'recurring', 'automation', 'productivity'],
    href: '/tutorials/recurring-homeworks'
  },
  {
    id: 'changelog',
    title: 'Version 2.3 Update',
    description: 'Explore the latest features and bug fixes in the newest version of TaskTornado.',
    category: 'Release Notes',
    difficulty: 'beginner',
    tags: ['updates', 'new-features'],
    href: '/changelog'
  }
];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const filteredTutorials = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tutorialsData.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSemanticSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setAiSuggestions([]);
      return;
    }

    setIsSuggesting(true);
    try {
      const tutorialsContext = tutorialsData.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category
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

      // Since it's a streaming response, we need to handle it properly or just read the text
      // However, our API route returns a stream by default. 
      // Let's use the reader pattern from MainApp.tsx

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
      if (match) {
        const ids = JSON.parse(match[0]);
        setAiSuggestions(ids);
      }
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

  const categories = ['Getting Started', 'Features', 'Release Notes'];

  const suggestedTutorials = tutorialsData.filter(t => aiSuggestions.includes(t.id));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      <main className="max-w-screen-xl mx-auto px-6 py-20">
        <header className="mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
          >
            Guides & Tutorials
          </motion.h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-normal max-w-xl">
            Master your academic workflow with expert guides and insights for TaskTornado.
          </p>

          <div className="mt-8 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
              <div className="relative flex items-center gap-3 p-1.5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/60 rounded-xl shadow-sm focus-within:shadow-lg focus-within:border-blue-400/30 dark:focus-within:border-blue-500/20 transition-all duration-500">
                <div className="pl-3.5">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="How do I set up recurring homework?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent py-2.5 outline-none text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="pr-1.5">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-lg font-semibold text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Smart Search</span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(isSuggesting || suggestedTutorials.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 p-3.5 bg-gray-50/50 dark:bg-neutral-900/50 border border-gray-100 dark:border-gray-800/60 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Intelligent Recommendations
                    </span>
                    {isSuggesting && <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />}
                  </div>

                  {suggestedTutorials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {suggestedTutorials.map((t) => (
                        <Link key={t.id} href={t.href}>
                          <div className="p-3 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800/80 rounded-lg hover:border-blue-400/50 dark:hover:border-blue-500/30 transition-all shadow-none hover:shadow-sm">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5 line-clamp-1">{t.title}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tight">{t.category}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="h-12 flex-1 bg-gray-100/50 dark:bg-white/5 animate-pulse rounded-lg" />
                      <div className="h-12 flex-1 bg-gray-100/50 dark:bg-white/5 animate-pulse rounded-lg" />
                      <div className="h-12 flex-1 bg-gray-100/50 dark:bg-white/5 animate-pulse rounded-lg" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="space-y-16">
          {categories.map((category) => {
            const tutorialsInCategory = filteredTutorials.filter(t => t.category === category);
            if (tutorialsInCategory.length === 0) return null;

            return (
              <section key={category} className="space-y-5">
                <div className="flex items-center gap-3 px-0.5">
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {category}
                  </h2>
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100/50 dark:border-blue-800/30">
                    {tutorialsInCategory.length}
                  </span>
                  <div className="h-px bg-gradient-to-r from-gray-200 dark:from-gray-800 via-gray-100/20 dark:via-gray-900/20 to-transparent flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tutorialsInCategory.map((tutorial, index) => (
                    <motion.div
                      key={tutorial.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={tutorial.href} className="group block h-full">
                        <div className="flex flex-col h-full p-6 rounded-2xl bg-white/50 dark:bg-neutral-900/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all duration-500 shadow-none hover:shadow-xl hover:shadow-blue-500/5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                              {tutorial.difficulty}
                            </span>
                            <div className="flex -space-x-1">
                              {tutorial.tags.slice(0, 2).map(tag => (
                                <div key={tag} className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 border border-white dark:border-neutral-900" title={tag} />
                              ))}
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors leading-tight mb-2">
                            {tutorial.title}
                          </h3>

                          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                            {tutorial.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-blue-500 transition-all pt-4 border-t border-gray-100/50 dark:border-gray-800/50">
                            <span>{tutorial.id === 'changelog' ? 'Open Changelog' : 'View Guide'}</span>
                            <ArrowRight className="w-3 h-3 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No guides found for "{searchQuery}"</p>
            <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">View all guides</Button>
          </div>
        )}
      </main>
    </div>
  );
}
