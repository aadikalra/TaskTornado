'use client';

import React from 'react';
import { Facehash } from 'facehash';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
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
                        <HugeIcon name="Eye" className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Facehash System</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-sky-900 dark:text-sky-100 mb-4 leading-tight">
                        Eye Styles
                    </h1>
                    <p className="text-lg text-sky-700/60 dark:text-sky-300/60 leading-relaxed max-w-2xl">
                        There are <strong className="text-sky-800 dark:text-sky-200">10 distinct eye styles</strong>, each giving your avatar a unique personality.
                        Your eye style is deterministically chosen from your name — same name, same eyes, every time.
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/40 dark:bg-sky-500/10 px-3 py-1.5 rounded-full border border-[#d4e88e]/50 dark:border-sky-500/20">
                            <HugeIcon name="Star" className="w-3 h-3" />
                            4 classic + 6 custom
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-[#f5f9fc] dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-sky-200/60 dark:border-sky-800/30">
                            <HugeIcon name="Star" className="w-3 h-3" />
                            12 colors each
                        </span>
                    </div>
                </motion.div>

                {/* Face groups grid */}
                <div className="space-y-5">
                    {FACE_GROUPS.map((group, groupIdx) => (
                        <motion.div
                            key={group.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + groupIdx * 0.05 }}
                            className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-sky-100/60 dark:border-sky-800/30 hover:border-sky-300/60 dark:hover:border-sky-600/30 transition-all"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <span className="text-2xl">{group.emoji}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100">
                                            {group.label}
                                        </h2>
                                        {groupIdx >= 4 && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-[#ebf6b5]/40 dark:bg-sky-500/10 px-2.5 py-1 rounded-full border border-[#d4e88e]/50 dark:border-sky-500/20">
                                                Custom
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-sky-700/60 dark:text-sky-300/60 leading-relaxed">
                                        {group.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                {group.names.map((name, i) => (
                                    <motion.div
                                        key={name}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 + groupIdx * 0.05 + i * 0.03 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="rounded-2xl overflow-hidden shadow-lg shadow-sky-500/10 hover:shadow-xl hover:shadow-sky-500/20 transition-all hover:scale-105">
                                            <Facehash
                                                name={name}
                                                size={56}
                                                enableBlink
                                                intensity3d="dramatic"
                                                colors={COLORS}
                                                style={{ borderRadius: '16px' }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-medium text-sky-700/50 dark:text-sky-400/50">
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
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="mt-10 p-8 rounded-3xl bg-gradient-to-br from-[#f5f9fc] to-[#ebf6b5]/30 dark:from-sky-500/5 dark:to-emerald-500/5 border border-sky-200/60 dark:border-sky-800/30"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
                            <HugeIcon name="Calculator" className="w-6 h-6 text-sky-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-2">
                                How many unique Facehashes are there?
                            </h3>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 leading-relaxed">
                                With <strong className="text-sky-800 dark:text-sky-200">10 eye styles</strong> × <strong className="text-sky-800 dark:text-sky-200">12 colors</strong> × <strong className="text-sky-800 dark:text-sky-200">6 3D rotations</strong> × <strong className="text-sky-800 dark:text-sky-200">unique blink timing</strong>, there are
                                at least <strong className="text-sky-800 dark:text-sky-200">720 distinct visual combinations</strong>. Add in the initial letter (26 possibilities) and you get <strong className="text-sky-800 dark:text-sky-200">18,720+</strong> unique-looking avatars — more than enough to ensure
                                no two students in your school look alike.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                    className="mt-12 pt-8 border-t border-sky-100 dark:border-sky-800/30 flex flex-wrap gap-4"
                >
                    <Link
                        href="/hash"
                        className="inline-flex items-center gap-2 text-sm font-bold text-sky-600/70 hover:text-sky-600 dark:text-sky-400/70 dark:hover:text-sky-400 transition-colors"
                    >
                        <HugeIcon name="Star" className="w-4 h-4" />
                        See all colors
                    </Link>
                    <Link
                        href="/blog/facehash"
                        className="inline-flex items-center gap-2 text-sm font-bold text-sky-600/70 hover:text-sky-600 dark:text-sky-400/70 dark:hover:text-sky-400 transition-colors"
                    >
                        Read the full article
                        <HugeIcon name="ArrowRight01" className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
