'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, List, ArrowRight } from 'lucide-react';
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
    category?: string;
    author?: string;
    date?: string;
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
    category,
    author = "TaskTornado Team",
    date = "Jan 7, 2026",
    children,
    nextTutorial
}: TutorialArticleTemplateProps) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll);

        const timer = setTimeout(() => {
            const articleHeadings = Array.from(document.querySelectorAll('article h2'));
            const headingData = articleHeadings.map((h) => {
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
            return () => {
                observer.disconnect();
                window.removeEventListener('scroll', handleScroll);
            };
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
        <div className="min-h-screen pt-20 bg-[#fffaf4] dark:bg-gray-950 font-sans selection:bg-sky-100 dark:selection:bg-sky-900/30 relative">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-[250px] h-[250px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            {/* Sticky Nav Bar */}
            <nav className={cn(
                "sticky top-0 z-50 transition-all duration-500 px-4 sm:px-6",
                scrolled
                    ? "bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-sky-100/60 dark:border-sky-900/20 h-14"
                    : "bg-transparent h-16"
            )}>
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full">
                    <Link href="/tutorials" className="flex items-center gap-2 text-sky-600/70 hover:text-sky-600 dark:text-sky-400/70 dark:hover:text-sky-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Tutorials</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <TutorialShareMenu
                            title={title}
                        />
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-[1100px] mx-auto flex justify-center gap-16 px-6">
                {/* Main Article column */}
                <article className="max-w-[720px] w-full py-16 sm:py-20">
                    {/* Article Header */}
                    <header className="mb-14">
                        {category && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5"
                            >
                                <span className="inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">
                                    {category}
                                </span>
                            </motion.div>
                        )}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-sky-500 dark:text-sky-400 mb-6 leading-[1.12] tracking-tight"
                        >
                            {title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-sky-700/70 dark:text-sky-300/70 mb-10 font-light leading-relaxed"
                        >
                            {description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 py-6 border-y border-sky-100/60 dark:border-sky-900/20"
                        >
                            <div className="w-11 h-11 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-sky-600/60 dark:text-sky-400/60" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-sky-800 dark:text-sky-200">{author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-sky-600/60 dark:text-sky-400/60 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                                </div>
                            </div>
                        </motion.div>
                    </header>

                    {/* Article Content — styled to match app palette */}
                    <div className={cn(
                        "max-w-none space-y-6",
                        // Heading styles
                        "[&>section_h2]:text-2xl [&>section_h2]:md:text-3xl [&>section_h2]:font-bold [&>section_h2]:text-sky-500 [&>section_h2]:dark:text-sky-400 [&>section_h2]:mt-14 [&>section_h2]:mb-5 [&>section_h2]:tracking-tight",
                        // Paragraph styles
                        "[&>section_p]:text-lg [&>section_p]:leading-[1.8] [&>section_p]:text-sky-800/70 [&>section_p]:dark:text-sky-300/70",
                        // List styles
                        "[&>section_ul]:text-sky-800/70 [&>section_ul]:dark:text-sky-300/70",
                        "[&>section_ol]:text-sky-800/70 [&>section_ol]:dark:text-sky-300/70",
                    )}>
                        {children}
                    </div>

                    {/* Footer Navigation */}
                    <footer className="mt-20 pt-12 border-t border-sky-100/60 dark:border-sky-900/20">
                        <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 mb-6">Continue Reading</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {nextTutorial && (
                                <Link href={nextTutorial.href} className="group block">
                                    <div className="p-6 bg-[#f5f9fc] dark:bg-zinc-800 rounded-[20px] group-hover:shadow-xl group-hover:shadow-sky-500/[0.06] transition-all duration-500 group-hover:-translate-y-1">
                                        <span className="text-[9px] font-bold text-sky-600/60 dark:text-sky-400/60 uppercase tracking-widest mb-2 block">
                                            {nextTutorial.label || 'Next Tutorial'}
                                        </span>
                                        <h4 className="text-lg font-bold text-sky-800 dark:text-sky-200 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                            {nextTutorial.title}
                                            <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                        </h4>
                                    </div>
                                </Link>
                            )}
                            <Link href="/tutorials" className="group block">
                                <div className="p-6 bg-[#f5f9fc] dark:bg-zinc-800 rounded-[20px] group-hover:shadow-xl group-hover:shadow-sky-500/[0.06] transition-all duration-500 group-hover:-translate-y-1">
                                    <span className="text-[9px] font-bold text-sky-600/60 dark:text-sky-400/60 uppercase tracking-widest mb-2 block">Directory</span>
                                    <h4 className="text-lg font-bold text-sky-800 dark:text-sky-200 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                        Browse All Tutorials
                                        <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                    </h4>
                                </div>
                            </Link>
                        </div>
                    </footer>
                </article>

                {/* Right Sidebar TOC */}
                <aside className="hidden xl:block w-64 pt-20">
                    <div className="sticky top-28">
                        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                            <List className="w-3 h-3" />
                            <span>In this guide</span>
                        </div>
                        <nav className="space-y-4">
                            {headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={cn(
                                        "block text-left text-sm transition-all duration-300 hover:pl-1",
                                        activeId === heading.id
                                            ? "text-sky-600 dark:text-sky-400 font-bold pl-3 border-l-2 border-sky-500 dark:border-sky-400"
                                            : "text-sky-600/40 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 pl-3 border-l-2 border-transparent"
                                    )}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-sky-100/60 dark:border-sky-900/20">
                            <p className="text-[11px] text-sky-600/40 dark:text-sky-400/40 leading-relaxed font-medium">
                                Helping you master TaskTornado, one step at a time.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
