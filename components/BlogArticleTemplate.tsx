'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, List, Share2, Bookmark, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TOCItem {
    id: string;
    text: string;
}

interface BlogArticleTemplateProps {
    title: string;
    description: string;
    category: string;
    author: string;
    authorRole: string;
    date: string;
    readTime: string;
    coverImage: string;
    children: React.ReactNode;
}

export function BlogArticleTemplate({
    title,
    description,
    category,
    author,
    authorRole,
    date,
    readTime,
    coverImage,
    children
}: BlogArticleTemplateProps) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [scrolled, setScrolled] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);

        // TOC logic
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
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Nav Bar */}
            <nav className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 px-6 py-4",
                scrolled ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-zinc-900 h-16" : "bg-transparent h-20"
            )}>
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full">
                    <Link href="/blog" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Back to Journal</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSaved(!saved)}
                            className="p-2 text-neutral-400 hover:text-blue-500 transition-colors"
                        >
                            {saved ? <Check className="w-5 h-5 text-green-500" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-neutral-400 hover:text-blue-500 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="pt-32 pb-20 px-6">
                <div className="max-w-[800px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-8 inline-block">
                            {category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight mb-8">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-500 dark:text-zinc-400 font-light leading-relaxed mb-12">
                            {description}
                        </p>

                        <div className="flex items-center gap-6 py-8 border-y border-neutral-100 dark:border-zinc-900">
                            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 overflow-hidden relative">
                                <User className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-neutral-900 dark:text-white">{author}</p>
                                <p className="text-xs text-neutral-500 dark:text-zinc-500 italic">{authorRole}</p>
                            </div>
                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" /> {date}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> {readTime}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Cover Image */}
            <section className="px-6 mb-20 max-w-[1100px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl"
                >
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            </section>

            {/* Layout Wrapper */}
            <div className="max-w-[1100px] mx-auto flex justify-center gap-16 px-6 relative">
                {/* Main Article column */}
                <article className="max-w-[720px] w-full pb-32">
                    <div className={cn(
                        "max-w-none space-y-8",
                        // Manual prose-like styles
                        "[&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:font-bold [&>h2]:text-neutral-900 [&>h2]:dark:text-white [&>h2]:mt-20 [&>h2]:mb-8 [&>h2]:tracking-tight",
                        "[&>p]:text-xl [&>p]:leading-[1.8] [&>p]:text-neutral-600 [&>p]:dark:text-zinc-400 [&>p]:mb-8 [&>p]:font-sans [&>p]:font-light",
                        "[&>blockquote]:border-l-4 [&>blockquote]:border-blue-600 [&>blockquote]:pl-8 [&>blockquote]:italic [&>blockquote]:text-2xl [&>blockquote]:text-neutral-500 [&>blockquote]:dark:text-zinc-400 [&>blockquote]:my-16 [&>blockquote]:font-serif",
                        "[&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-8 [&>ul]:space-y-4 [&>ul]:text-neutral-600 [&>ul]:dark:text-zinc-400 [&>ul]:text-xl",
                        "[&>ul>li]:leading-relaxed"
                    )}>
                        {children}
                    </div>
                </article>

                {/* Right Sidebar TOC */}
                <aside className="hidden xl:block w-64">
                    <div className="sticky top-32">
                        <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                            <List className="w-3 h-3" />
                            <span>In this article</span>
                        </div>
                        <nav className="space-y-4">
                            {headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={cn(
                                        "block text-left text-sm transition-all duration-300 hover:pl-1",
                                        activeId === heading.id
                                            ? "text-blue-600 dark:text-blue-400 font-bold pl-3 border-l-2 border-blue-600 dark:border-blue-400"
                                            : "text-neutral-400 dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-300 pl-3 border-l-2 border-transparent"
                                    )}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </nav>

                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="px-6 py-32 border-t border-neutral-100 dark:border-zinc-900 bg-neutral-50 dark:bg-zinc-900/10">
                <div className="max-w-[800px] mx-auto text-center">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Continue the journey.</h3>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/blog" className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all">
                            Browse Journal
                        </Link>
                        <Link href="/tutorials" className="px-8 py-3 bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white font-bold rounded-2xl border border-neutral-200 dark:border-zinc-800 hover:scale-105 active:scale-95 transition-all">
                            View Tutorials
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
