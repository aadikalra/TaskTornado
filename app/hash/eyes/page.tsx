'use client';

import React from 'react';
import { Facehash } from 'facehash';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { patchFacehashFaces } from '@/lib/facehash-custom-faces';

// Ensure custom faces are registered
patchFacehashFaces();

const COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
];

// Names verified with stringHash() % 10 to match each face type
const FACE_GROUPS = [
    {
        label: 'Round Eyes',
        emoji: '⭕',
        description: 'Simple, friendly circular eyes. The classic look — open, approachable, and expressive.',
        names: ['Nina', 'Rita', 'Lily', 'Nora', 'Troy', 'Noah'],
    },
    {
        label: 'Cross Eyes',
        emoji: '✖️',
        description: 'Bold X-shaped eyes that bring a playful, edgy energy. The crossed pattern adds visual complexity.',
        names: ['Uma', 'Vince', 'Aria', 'Chloe', 'Aiden', 'Caleb'],
    },
    {
        label: 'Line Eyes',
        emoji: '➖',
        description: 'Minimal horizontal dashes — a serene, composed expression. Modern and understated.',
        names: ['Grace', 'Ivy', 'Ella', 'Zoe', 'Jade', 'Kent'],
    },
    {
        label: 'Curved Eyes',
        emoji: '〰️',
        description: 'Happy, upturned arcs that always look like they\'re smiling with their eyes. Permanently delighted.',
        names: ['Quinn', 'Gina', 'Hugo', 'Stella', 'Rex', 'Clark'],
    },
    {
        label: 'Diamond Eyes',
        emoji: '💎',
        description: 'Rotated squares that create elegant diamond shapes. Sharp, geometric, and sophisticated.',
        names: ['Charlie', 'Dave', 'Oscar', 'Joel', 'Max', 'Seth'],
    },
    {
        label: 'Star Eyes',
        emoji: '✨',
        description: 'Four-pointed star shapes that sparkle with personality. Energetic and attention-grabbing.',
        names: ['Bob', 'Amy', 'Cara', 'Dan', 'Finn', 'Yuri'],
    },
    {
        label: 'Dot Eyes',
        emoji: '·',
        description: 'Tiny, understated dots. The most minimalist style — quiet confidence in just two small circles.',
        names: ['Hank', 'Pam', 'Tina', 'Xena', 'James', 'Ethan'],
    },
    {
        label: 'Oval Eyes',
        emoji: '🥚',
        description: 'Tall vertical ovals that feel alert and curious. Wide-eyed wonder in every glance.',
        names: ['Jack', 'Yara', 'Ben', 'Iris', 'Olga', 'Liam'],
    },
    {
        label: 'Square Eyes',
        emoji: '⬜',
        description: 'Rounded squares with a sturdy, dependable personality. Bold but balanced.',
        names: ['Alice', 'Eve', 'Frank', 'Leo', 'Vera', 'Walt'],
    },
    {
        label: 'Half-Moon Eyes',
        emoji: '🌙',
        description: 'Dreamy semicircles looking upward. A relaxed, contemplative gaze with an air of mystery.',
        names: ['Kate', 'Mia', 'Sam', 'Kim', 'Wendy', 'Owen'],
    },
];

export default function HashEyesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 p-6 sm:p-8 max-w-4xl mx-auto">
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
                    Eye Styles
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-base leading-relaxed max-w-2xl">
                    There are <strong className="text-gray-700 dark:text-gray-200">10 distinct eye styles</strong>, each giving your avatar a unique personality.
                    Your eye style is deterministically chosen from your name — same name, same eyes, every time.
                </p>
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        4 classic + 6 custom
                    </span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        12 colors each
                    </span>
                </div>
            </motion.div>

            <div className="space-y-6">
                {FACE_GROUPS.map((group, groupIdx) => (
                    <motion.div
                        key={group.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: groupIdx * 0.06 }}
                        className="p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <span className="text-xl mt-0.5">{group.emoji}</span>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                                    {group.label}
                                    {groupIdx >= 4 && (
                                        <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                                            Custom
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {group.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {group.names.map((name, i) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: groupIdx * 0.06 + i * 0.04 }}
                                    className="flex flex-col items-center gap-1.5"
                                >
                                    <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                        <Facehash
                                            name={name}
                                            size={52}
                                            enableBlink
                                            intensity3d="dramatic"
                                            colors={COLORS}
                                            style={{ borderRadius: '12px' }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                        {name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Fun fact section */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/50"
            >
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                    🧮 How many unique Facehashes are there?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    With <strong>10 eye styles</strong> × <strong>12 colors</strong> × <strong>6 3D rotations</strong> × <strong>unique blink timing</strong>, there are
                    at least <strong>720 distinct visual combinations</strong>. Add in the initial letter (26 possibilities) and you get <strong>18,720+</strong> unique-looking avatars — more than enough to ensure
                    no two students in your school look alike.
                </p>
            </motion.div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4">
                <Link
                    href="/hash"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    ← See all colors
                </Link>
                <Link
                    href="/blog/facehash"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                    Read the full article →
                </Link>
            </div>
        </div>
    );
}
