'use client';

import React from 'react';
import { Facehash } from 'facehash';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
        <div className="min-h-screen bg-white dark:bg-gray-950 p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/blog/facehash"
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    ← Back to Facehash article
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Color Palette
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-base leading-relaxed">
                    Every Facehash picks one of these 12 curated colors based on the hash of
                    your name. The palette is designed to feel vibrant yet harmonious —
                    spanning cool blues, warm ambers, and everything in between.
                </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {NAMES.map((name, i) => (
                    <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
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
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
                                {LABELS[i]}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {COLORS[i]}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                <Link
                    href="/hash/eyes"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    See all eye styles →
                </Link>
            </div>
        </div>
    );
}
