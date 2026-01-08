'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, List } from 'lucide-react';
import { TutorialShareMenu } from '@/components/TutorialShareMenu';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TOCItem {
    id: string;
    text: string;
}

interface TutorialArticleTemplateProps {
    title: string;
    description: string;
    author?: string;
    date?: string;
    readTime?: string;
    children: React.ReactNode;
    nextTutorial?: {
        title: string;
        href: string;
        label?: string;
    };
}

export function TutorialArticleTemplate({
    title,
    description,
    author = "TaskTornado Team",
    date = "Jan 7, 2026",
    readTime = "5 min read",
    children,
    nextTutorial
}: TutorialArticleTemplateProps) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Small delay to ensure children are rendered
        const timer = setTimeout(() => {
            const articleHeadings = Array.from(document.querySelectorAll('article h2'));
            const headingData = articleHeadings.map((h, index) => {
                const text = h.textContent || '';
                const id = h.id || text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                h.id = id;
                return { id, text };
            });
            setHeadings(headingData);

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveId(entry.target.id);
                        }
                    });
                },
                { rootMargin: '-100px 0px -66%' }
            );

            articleHeadings.forEach((h) => observer.observe(h));
            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, [children]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const navHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900">
                <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/tutorials" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Tutorials</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <TutorialShareMenu
                            title={title}
                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        />
                    </div>
                </div>
            </nav>

            <div className="max-w-[1100px] mx-auto flex justify-center gap-16 px-6">
                {/* Main Article column */}
                <article className="max-w-[720px] w-full py-20">
                    {/* Article Header */}
                    <header className="mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.15] tracking-tight"
                        >
                            {title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 dark:text-gray-400 mb-8 font-light leading-relaxed"
                        >
                            {description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 py-6 border-y border-gray-100 dark:border-gray-900"
                        >
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                                </div>
                            </div>
                        </motion.div>
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {children}
                    </div>

                    {/* Footer Navigation */}
                    <footer className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-900">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Continue Reading</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {nextTutorial && (
                                <Link href={nextTutorial.href} className="group block">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">{nextTutorial.label || 'Next Tutorial'}</span>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{nextTutorial.title}</h4>
                                    </div>
                                </Link>
                            )}
                            <Link href="/tutorials" className="group block">
                                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Directory</span>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Browse All Tutorials</h4>
                                </div>
                            </Link>
                        </div>
                    </footer>
                </article>

                {/* Right Sidebar TOC - Hidden on mobile/small tablets */}
                <aside className="hidden xl:block w-64 pt-20">
                    <div className="sticky top-32">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-[10px] mb-6">
                            <List className="w-3 h-3" />
                            <span>Table of Contents</span>
                        </div>
                        <nav className="space-y-4">
                            {headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={cn(
                                        "block text-left text-sm transition-all duration-300 hover:pl-1",
                                        activeId === heading.id
                                            ? "text-blue-600 dark:text-blue-400 font-medium pl-2 border-l-2 border-blue-600 dark:border-blue-400"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 pl-2 border-l-2 border-transparent"
                                    )}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-900">
                            <p className="text-[11px] text-gray-400 dark:text-gray-600 leading-relaxed font-medium">
                                Helping you master TaskTornado, one step at a time.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
