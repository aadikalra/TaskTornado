'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Clock, Calendar, User, Tag, ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

    const categories = ['All', 'Product', 'Design', 'Engineering', 'Scale', 'Education'];

    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const postsByCategory = useMemo(() => {
        const groups: Record<string, BlogPost[]> = {};
        filteredPosts.forEach(post => {
            if (!groups[post.category]) groups[post.category] = [];
            groups[post.category].push(post);
        });
        return groups;
    }, [filteredPosts]);

    const activeCategories = useMemo(() => {
        if (activeCategory !== 'All') return [activeCategory];
        return categories.filter(c => c !== 'All' && postsByCategory[c]?.length > 0);
    }, [activeCategory, categories, postsByCategory]);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Minimal Header */}
            <header className="pt-24 pb-12 px-6">
                <div className="max-w-[1240px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div className="max-w-2xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-500 mb-4 block">
                                Journal
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                                Stories about <span className="text-neutral-400 dark:text-neutral-600 italic font-serif">building.</span>
                            </h1>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-5 py-2.5 bg-neutral-100 dark:bg-zinc-900 rounded-full border-none focus:ring-2 focus:ring-blue-500/10 w-full md:w-[240px] text-xs transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>


            {/* Categories & Filter */}
            <section className="px-6 mb-12 sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-zinc-900">
                <div className="max-w-[1240px] mx-auto py-3 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${activeCategory === cat
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid Section */}
            <section className="px-6 pb-24">
                <div className="max-w-[1240px] mx-auto space-y-20">
                    {activeCategories.map((cat) => (
                        <div key={cat} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                                    {cat}
                                </h2>
                                <div className="h-px bg-neutral-100 dark:bg-zinc-900 w-full" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {postsByCategory[cat]?.map((post, idx) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link href={post.href} className="group block">
                                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-neutral-100 dark:bg-zinc-900">
                                                <Image
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 text-[9px] text-neutral-400 dark:text-neutral-500 mb-2 font-bold uppercase tracking-widest">
                                                {post.date}
                                                <span className="w-0.5 h-0.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                                {post.readTime}
                                            </div>

                                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4 line-clamp-2">
                                                {post.excerpt}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-zinc-900/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-zinc-800" />
                                                    <span className="text-[10px] font-bold text-neutral-600 dark:text-zinc-400">{post.author}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-32">
                            <p className="text-neutral-500 text-sm">No stories found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Minimal CTA */}
            <section className="px-6 py-32 bg-neutral-50 dark:bg-zinc-900/40">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">Stay ahead of the curve.</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-10 text-lg">Subscribe to our newsletter for early access to features and education insights.</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                        <button className="px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all">
                            Join Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
