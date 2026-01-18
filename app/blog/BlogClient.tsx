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
        id: 'making-of-aurora',
        title: 'The Making of Aurora: Engineering an Impactful Study Assistant',
        excerpt: 'A deep dive into how we built a data-aware, Socratic AI that helps students study smarter, not just faster.',
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

    const categories = ['All', 'Product', 'Engineering', 'Scale', 'Education'];

    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);


    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Minimal Header */}
            <header className="pt-24 pb-12 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div className="max-w-2xl">
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-4 block">
                                The TaskTornado Journal
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">
                                Stories about building <br className="hidden md:block" />
                                <span className="text-neutral-400 dark:text-neutral-600 italic font-serif">the future of education.</span>
                            </h1>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-6 py-3 bg-neutral-100 dark:bg-zinc-900 rounded-full border-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-[300px] text-sm transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>


            {/* Categories & Filter */}
            <section className="px-6 mb-12 sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-zinc-900">
                <div className="max-w-[1200px] mx-auto py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${activeCategory === cat
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
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {filteredPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={post.href} className="group block h-full">
                                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6">
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-medium uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" /> {post.date}
                                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                        <Clock className="w-3 h-3" /> {post.readTime}
                                    </div>

                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                        {post.title}
                                    </h3>

                                    <p className="text-neutral-500 dark:text-neutral-400 text-[15px] leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-neutral-100 dark:border-zinc-900 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800" />
                                            <span className="text-sm font-bold text-neutral-900 dark:text-zinc-300">{post.author}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-neutral-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-32">
                            <p className="text-neutral-500 text-lg">No stories found for "{searchQuery}"</p>
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
