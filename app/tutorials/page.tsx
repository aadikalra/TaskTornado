'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Home, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  href: string;
}

const tutorialsData: Tutorial[] = [
  {
    id: 'onboarding',
    title: 'Onboarding: Setting Up Your Academic Success',
    description: 'A comprehensive guide to personalizing your TaskTornado experience, from grade selection to elective optimization.',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '5 min read',
    tags: ['setup', 'classes', 'onboarding'],
    href: '/tutorials/onboarding'
  }
];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutorials = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tutorialsData.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <div className="relative w-full max-w-sm ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-none text-sm"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-[720px] mx-auto px-6 py-20">
        <header className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            Guides & Tutorials
          </motion.h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-light">
            Expert advice on staying organized, productive, and academically ahead with TaskTornado.
          </p>
        </header>

        <section className="space-y-16">
          {filteredTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tutorial.href} className="group block">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                    <span>{tutorial.category.replace('-', ' ')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tutorial.estimatedTime}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                    {tutorial.title}
                  </h2>

                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tutorial.description}
                  </p>

                  <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

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
