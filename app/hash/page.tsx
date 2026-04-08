'use client';

import React from 'react';
import { Facehash } from 'facehash';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { patchFacehashFaces } from '@/lib/facehash-custom-faces';

patchFacehashFaces();

const COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
];

const LABELS = [
    'Blue', 'Indigo', 'Violet', 'Pink',
    'Rose', 'Amber', 'Emerald', 'Teal',
    'Cyan', 'Sky', 'Orange', 'Slate',
];

const NAMES = [
    'Dave', 'Quinn', 'Hank', 'Olga',
    'Alice', 'Bob', 'Charlie', 'Sam',
    'Grace', 'Mia', 'Ruby', 'Jack',
];

export default function HashColorsPage() {
    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-1/4 w-[600px] h-[600px] bg-sky-200/20 dark:bg-sky-500/6 rounded-full blur-[140px]" />
                <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-[#ebf6b5]/20 dark:bg-emerald-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 pt-24 pb-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f9fc] dark:bg-zinc-800/50 border border-sky-200/60 dark:border-sky-800/30 rounded-full mb-6">
                        <HugeIcon name="Star" className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Facehash System</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-sky-900 dark:text-sky-100 mb-4 leading-tight">
                        Color Palette
                    </h1>
                    <p className="text-lg text-sky-700/60 dark:text-sky-300/60 leading-relaxed max-w-2xl">
                        Every Facehash picks one of these <strong className="text-sky-800 dark:text-sky-200">12 curated colors</strong> based on the hash of
                        your name. The palette is designed to feel vibrant yet harmonious —
                        spanning cool blues, warm ambers, and everything in between.
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/40 dark:bg-sky-500/10 px-3 py-1.5 rounded-full border border-[#d4e88e]/50 dark:border-sky-500/20">
                            12 unique colors
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-[#f5f9fc] dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-sky-200/60 dark:border-sky-800/30">
                            <HugeIcon name="User01" className="w-3 h-3" />
                            Deterministic by name
                        </span>
                    </div>
                </motion.div>

                {/* Color grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {NAMES.map((name, i) => (
                        <motion.div
                            key={name}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + i * 0.04 }}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className="rounded-2xl overflow-hidden shadow-lg shadow-sky-500/10 group-hover:shadow-xl group-hover:shadow-sky-500/20 transition-all duration-300 hover:scale-105">
                                <Facehash
                                    name={name}
                                    size={96}
                                    enableBlink
                                    intensity3d="dramatic"
                                    colors={COLORS}
                                    style={{ borderRadius: '16px' }}
                                />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-bold text-sky-900 dark:text-sky-100 block">
                                    {LABELS[i]}
                                </span>
                                <span className="text-xs text-sky-700/50 dark:text-sky-400/50 font-mono">
                                    {COLORS[i]}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="mt-12 pt-8 border-t border-sky-100 dark:border-sky-800/30 flex flex-wrap gap-4"
                >
                    <Link
                        href="/hash/eyes"
                        className="inline-flex items-center gap-2 text-sm font-bold text-sky-600/70 hover:text-sky-600 dark:text-sky-400/70 dark:hover:text-sky-400 transition-colors"
                    >
                        See all eye styles
                        <HugeIcon name="ArrowRight01" className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
