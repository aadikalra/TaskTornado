'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
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
    const [saved, setSaved] = useState(false);

    useEffect(() => {
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
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans selection:bg-sky-100 dark:selection:bg-sky-900/30 relative">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-[250px] h-[250px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <nav className="absolute top-16 sm:top-[72px] lg:top-20 inset-x-0 z-40 px-4 sm:px-6 h-20 bg-transparent">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full">
                    <Link href="/blog" className="flex items-center gap-2 text-sky-600/70 hover:text-sky-600 dark:text-sky-400/70 dark:hover:text-sky-400 transition-colors">
                        <HugeIcon name="ArrowLeft01" className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Journal</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSaved(!saved)}
                            className="p-2 text-sky-600/50 hover:text-sky-600 dark:text-sky-400/50 dark:hover:text-sky-400 transition-colors rounded-lg hover:bg-sky-100/40 dark:hover:bg-sky-500/10"
                        >
                            {saved ? <HugeIcon name="CheckmarkCircle02" className="w-5 h-5 text-emerald-500" /> : <HugeIcon name="Bookmark03" className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-sky-600/50 hover:text-sky-600 dark:text-sky-400/50 dark:hover:text-sky-400 transition-colors rounded-lg hover:bg-sky-100/40 dark:hover:bg-sky-500/10">
                            <HugeIcon name="Share03" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="relative z-10 pt-40 md:pt-48 pb-16 px-6">
                <div className="max-w-[800px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">
                                {category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-sky-800 dark:text-sky-200 leading-[1.1] tracking-tight mb-8">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-sky-700/60 dark:text-sky-300/60 font-light leading-relaxed mb-12">
                            {description}
                        </p>

                        <div className="flex items-center gap-6 py-8 border-y border-sky-100/60 dark:border-sky-900/20">
                            <div className="w-12 h-12 rounded-full bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center">
                                <HugeIcon name="User01" className="w-6 h-6 text-sky-600/50 dark:text-sky-400/50" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-sky-800 dark:text-sky-200">{author}</p>
                                <p className="text-xs text-sky-600/50 dark:text-sky-400/50 italic">{authorRole}</p>
                            </div>
                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-xs text-sky-600/50 dark:text-sky-400/50 font-medium uppercase tracking-widest">
                                    <HugeIcon name="Calendar02" className="w-3 h-3" /> {date}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-sky-600/50 dark:text-sky-400/50 font-medium uppercase tracking-widest">
                                    <HugeIcon name="Clock01" className="w-3 h-3" /> {readTime}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Cover Image */}
            <section className="relative z-10 px-6 mb-20 max-w-[1100px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-sky-500/[0.08]"
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
            <div className="relative z-10 max-w-[1100px] mx-auto flex justify-center gap-16 px-6">
                {/* Main Article column */}
                <article className="max-w-[720px] w-full pb-32">
                    <div className={cn(
                        "max-w-none space-y-8",
                        // Manual prose-like styles — sky palette
                        "[&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:font-bold [&>h2]:text-sky-800 [&>h2]:dark:text-sky-200 [&>h2]:mt-20 [&>h2]:mb-8 [&>h2]:tracking-tight",
                        "[&>h3]:text-xl [&>h3]:md:text-2xl [&>h3]:font-bold [&>h3]:text-sky-800 [&>h3]:dark:text-sky-200 [&>h3]:mt-12 [&>h3]:mb-4",
                        "[&>p]:text-xl [&>p]:leading-[1.8] [&>p]:text-sky-800/70 [&>p]:dark:text-sky-300/70 [&>p]:mb-8 [&>p]:font-sans [&>p]:font-light",
                        "[&>blockquote]:border-l-4 [&>blockquote]:border-sky-500 [&>blockquote]:pl-8 [&>blockquote]:italic [&>blockquote]:text-2xl [&>blockquote]:text-sky-700/60 [&>blockquote]:dark:text-sky-300/60 [&>blockquote]:my-16 [&>blockquote]:font-serif",
                        "[&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-8 [&>ul]:space-y-4 [&>ul]:text-sky-800/70 [&>ul]:dark:text-sky-300/70 [&>ul]:text-xl",
                        "[&>ul>li]:leading-relaxed",
                        "[&>ol]:list-decimal [&>ol]:pl-8 [&>ol]:mb-8 [&>ol]:space-y-4 [&>ol]:text-sky-800/70 [&>ol]:dark:text-sky-300/70 [&>ol]:text-xl",
                        "[&>ol>li]:leading-relaxed",
                    )}>
                        {children}
                    </div>
                </article>

                {/* Right Sidebar TOC */}
                <aside className="hidden xl:block w-64">
                    <div className="sticky top-28">
                        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                            <HugeIcon name="List" className="w-3 h-3" />
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
                                            ? "text-sky-600 dark:text-sky-400 font-bold pl-3 border-l-2 border-sky-500 dark:border-sky-400"
                                            : "text-sky-600/40 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 pl-3 border-l-2 border-transparent"
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
            <footer className="relative z-10 px-6 py-24 border-t border-sky-100/60 dark:border-sky-900/20">
                <div className="max-w-[800px] mx-auto text-center">
                    <h3 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mb-6">Continue the journey.</h3>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/blog" className="inline-flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/20">
                            Browse Journal
                            <HugeIcon name="ArrowRight01" className="w-4 h-4" />
                        </Link>
                        <Link href="/tutorials" className="inline-flex items-center gap-2 px-8 py-3 bg-[#f5f9fc] dark:bg-zinc-800 text-sky-700 dark:text-sky-300 font-bold rounded-full hover:scale-105 active:scale-95 transition-all border border-sky-200/60 dark:border-sky-800/30">
                            View Tutorials
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
