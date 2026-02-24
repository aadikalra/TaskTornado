'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getFullVersionString } from '@/config/version';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    authorRole: string;
    readTime: string;
    category: string;
    coverImage: string;
    href: string;
}

const blogPosts: BlogPost[] = [
    {
        id: 'facehash',
        title: 'Facehash',
        excerpt: 'How we turn your name into a one-of-a-kind avatar — no uploads, no setup, no two students alike.',
        date: 'Feb 14, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Design',
        coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/facehash'
    },
    {
        id: 'grade-calculator',
        title: 'Grade Calculator',
        excerpt: 'Instant weighted percentage calculations from raw grade text.',
        date: 'Feb 8, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/grade-calculator'
    },
    {
        id: 'meet-aurora',
        title: 'Aurora AI',
        excerpt: 'Your always-on Socratic tutor for deep concept mastery.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '5 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/meet-aurora'
    },
    {
        id: 'the-command-center',
        title: 'Intelligent Dashboard',
        excerpt: 'A unified view of your assignments, grades, and priorities.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/the-command-center'
    },
    {
        id: 'smart-calendar',
        title: 'Smart Calendar',
        excerpt: 'Automated deadline tracking and workload visualization.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '3 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/smart-calendar'
    },
    {
        id: 'flashcards-reimagined',
        title: 'Flashcard System',
        excerpt: 'Active recall and spaced repetition for long-term retention.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '5 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/flashcards-reimagined'
    },
    {
        id: 'adaptive-quizzes',
        title: 'Quiz Engine',
        excerpt: 'Personalized assessments generated from your study notes.',
        date: 'Feb 8, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/adaptive-quizzes'
    },
    {
        id: 'research-hub',
        title: 'Web Saves Hub',
        excerpt: 'Source organization and link management for research.',
        date: 'Feb 7, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1454165833772-d99626a44bf7?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/research-hub'
    },
    {
        id: 'writing-companion',
        title: 'Writing Assistant',
        excerpt: 'AI insights to refine your essays and articulate complex ideas.',
        date: 'Feb 7, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '6 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/writing-companion'
    },
    {
        id: 'global-translation',
        title: 'Global Translation',
        excerpt: 'Context-preserving translation for academic materials.',
        date: 'Feb 6, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '3 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/global-translation'
    },
    {
        id: 'study-groups',
        title: 'Study Groups',
        excerpt: 'Collaborative spaces for peers to share resources and succeed.',
        date: 'Feb 6, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '5 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/study-groups'
    },
    {
        id: 'peer-discussions',
        title: 'Discussion Forums',
        excerpt: 'Structured peer engagement for deeper critical thinking.',
        date: 'Feb 5, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/peer-discussions'
    },
    {
        id: 'focus-timer',
        title: 'Study Timer',
        excerpt: 'Deep work management with Pomodoro and flow tracking.',
        date: 'Feb 5, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/focus-timer'
    },
    {
        id: 'learning-through-play',
        title: 'Learning Games',
        excerpt: 'Gamified academic practice to turn drills into challenges.',
        date: 'Feb 4, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '3 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/learning-through-play'
    },
    {
        id: 'learning-center',
        title: 'Tutorials Hub',
        excerpt: 'Master the platform with comprehensive guides and tips.',
        date: 'Feb 4, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '6 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/learning-center'
    },
    {
        id: 'making-of-aurora',
        title: 'Engineering Aurora',
        excerpt: 'Deep dive into building a Socratic, data-aware study AI.',
        date: 'Oct 15, 2025',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '7 min read',
        category: 'Engineering',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/making-of-aurora'
    }
];

export default function BlogClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchFocused, setSearchFocused] = useState(false);

    const categories = ['All', 'Product', 'Design', 'Engineering', 'Scale', 'Education'];

    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    // Featured post is always the first filtered post
    const featuredPost = filteredPosts[0];
    const remainingPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative selection:bg-sky-100 dark:selection:bg-sky-900/30">

            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-400/[0.05] dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-400/[0.03] dark:bg-violet-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* ═══════════════════════════════════════════════════════════
                    HEADER — title left, search right, pills below
                   ═══════════════════════════════════════════════════════════ */}
                <div className="pb-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        {/* Left — title & subtitle */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                                The Journal
                            </h1>
                            <p className="text-sm sm:text-base text-sky-700 dark:text-sky-300 font-medium">
                                Stories about building the future of learning.
                            </p>
                        </motion.div>

                        {/* Right — search bar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="w-full md:w-[340px] shrink-0"
                        >
                            <div
                                className={`relative flex items-center gap-2 px-4 py-2.5 bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full transition-all duration-300 ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                            >
                                <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Category pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap gap-2"
                    >
                        {categories.map(cat => (
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

                {filteredPosts.length === 0 ? (
                    <div className="text-center py-32">
                        <p className="text-sky-800 dark:text-sky-300 text-sm mb-4">No stories found for &quot;{searchQuery}&quot;</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full hover:bg-[#ebf6b5] dark:hover:bg-sky-500/30 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ═══════════════════════════════════════════════════════
                            FEATURED POST — large hero card
                           ═══════════════════════════════════════════════════════ */}
                        {featuredPost && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="mb-10"
                            >
                                <Link href={featuredPost.href} className="group block">
                                    <div className="relative rounded-[28px] overflow-hidden bg-[#f5f9fc] dark:bg-zinc-800">
                                        <div className="grid grid-cols-1 lg:grid-cols-2">
                                            {/* Image side */}
                                            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px]">
                                                <Image
                                                    src={featuredPost.coverImage}
                                                    alt={featuredPost.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                {/* Gradient overlay for mobile text readability */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:hidden" />
                                            </div>

                                            {/* Content side */}
                                            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">
                                                        Latest
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-700 dark:text-sky-300 bg-sky-100/50 dark:bg-sky-500/10 rounded-full">
                                                        {featuredPost.category}
                                                    </span>
                                                </div>

                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-800 dark:text-sky-200 leading-tight mb-4 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                                                    {featuredPost.title}
                                                </h2>

                                                <p className="text-sky-800/80 dark:text-sky-300 text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
                                                    {featuredPost.excerpt}
                                                </p>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#ebf6b5]/60 dark:bg-sky-500/15" />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-sky-800 dark:text-sky-200">{featuredPost.author}</p>
                                                            <p className="text-[10px] text-sky-700/60 dark:text-sky-400/60">{featuredPost.authorRole}</p>
                                                        </div>
                                                    </div>
                                                    <span className="w-px h-4 bg-sky-200/60 dark:bg-sky-800/40" />
                                                    <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">{featuredPost.date}</span>
                                                    <span className="w-px h-4 bg-sky-200/60 dark:bg-sky-800/40" />
                                                    <span className="flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {featuredPost.readTime}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-8 text-sm font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-all">
                                                    <span>Read story</span>
                                                    <ArrowRight className="w-4 h-4 -translate-x-1 group-hover:translate-x-0 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* ═══════════════════════════════════════════════════════
                            ARTICLE GRID — bento cards
                           ═══════════════════════════════════════════════════════ */}
                        {remainingPosts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {remainingPosts.map((post, idx) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.04, duration: 0.4 }}
                                        >
                                            <Link href={post.href} className="group block h-full">
                                                <div className="flex flex-col h-full rounded-[24px] bg-[#f5f9fc] dark:bg-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-sky-500/[0.06] transition-all duration-500 hover:-translate-y-1">
                                                    {/* Image */}
                                                    <div className="relative aspect-[16/10] overflow-hidden">
                                                        <Image
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                        {/* Category chip on image */}
                                                        <div className="absolute top-3 left-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md rounded-full">
                                                                {post.category}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex flex-col flex-grow p-5 sm:p-6">
                                                        {/* Meta */}
                                                        <div className="flex items-center gap-2 text-[10px] text-sky-700 dark:text-sky-300 font-medium mb-3">
                                                            <span>{post.date}</span>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-sky-500/40 dark:bg-sky-400/40" />
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {post.readTime}
                                                            </span>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-[15px] font-bold text-sky-800 dark:text-sky-200 mb-2 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors leading-snug">
                                                            {post.title}
                                                        </h3>

                                                        {/* Excerpt */}
                                                        <p className="text-[13px] text-sky-800/70 dark:text-sky-300/80 leading-relaxed flex-grow line-clamp-2 mb-4">
                                                            {post.excerpt}
                                                        </p>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-sky-100/60 dark:border-sky-900/20">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-[#ebf6b5]/60 dark:bg-sky-500/15" />
                                                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">{post.author}</span>
                                                            </div>
                                                            <ArrowRight className="w-3.5 h-3.5 text-sky-500/40 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════
                    FOOTER
                   ═══════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 pt-8 border-t border-sky-100 dark:border-sky-900/20"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/40 dark:bg-sky-500/10 rounded-full">
                                <BookOpen className="w-3 h-3" />
                                {blogPosts.length} stories
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
