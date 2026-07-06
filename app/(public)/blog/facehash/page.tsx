'use client';

import React from 'react';
import { BlogArticleTemplate } from '@/components/BlogArticleTemplate';
import Link from 'next/link';
import { AnimationDemo } from '@/components/FacehashAnimationDemos';

export default function FacehashArticle() {
    return (
        <BlogArticleTemplate
            title="Facehash"
            description="How we turn your name into a one-of-a-kind avatar — no uploads, no setup, no two students alike."
            category="Design"
            author="Aadi Kalra"
            authorRole="Founder"
            date="Feb 14, 2026"
            readTime="4 min read"
            coverImage="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=2000"
        >
            <p>
                Every student on TaskTornado has a unique, colorful avatar staring back at them from the dashboard. But here&apos;s the thing — nobody ever uploaded a profile picture. These avatars are <strong>Facehashes</strong>: deterministically generated faces built entirely from your name.
            </p>

            <h2>What Is a Facehash?</h2>
            <p>
                A Facehash is a visual identity derived from a string — in our case, your full name. Think of it like a fingerprint for your username. The same name will <em>always</em> produce the same avatar, across any device, any browser, at any time.
            </p>
            <p>
                No account setup required. No awkward default silhouettes. The moment you sign up and enter your name, your Facehash is born.
            </p>

            <h2>How It Works</h2>
            <p>
                Under the hood, your name goes through a simple but effective <strong>hash function</strong> — the same kind of algorithm used in computer science to map data to fixed-size values. Here&apos;s the simplified version:
            </p>
            <ol>
                <li><strong>Hash your name</strong> — Each character in your name is converted to a number, combined using bit-shifting, and reduced to a single positive integer.</li>
                <li><strong>Pick an eye style</strong> — The hash is divided by 10 (the number of face types) and the remainder determines your eyes: Round, Cross, Line, Curved, Diamond, Star, Dot, Oval, Square, or Half-Moon.</li>
                <li><strong>Pick a color</strong> — The same hash, divided by 12 (the number of colors), picks your background from a curated palette spanning blues, pinks, ambers, greens, and more.</li>
                <li><strong>Pick a rotation</strong> — A subtle 3D tilt is chosen from a set of sphere positions, giving each avatar a slightly different angle and perspective.</li>
            </ol>
            <p>
                Because every property is derived from the hash, and the hash is derived from your name, the result is <strong>100% deterministic</strong>. Same input, same output, every time.
            </p>

            <h2>The Eye Styles</h2>
            <p>
                There are <strong>10 distinct eye styles</strong> — 4 classic and 6 custom — each giving your avatar a different personality:
            </p>
            <ul>
                <li><strong>Round Eyes</strong> — Simple, friendly circles. The classic, approachable look.</li>
                <li><strong>Cross Eyes</strong> — Bold X-shapes that feel playful and edgy.</li>
                <li><strong>Line Eyes</strong> — Minimal horizontal dashes. Calm and composed.</li>
                <li><strong>Curved Eyes</strong> — Happy, upturned arcs. Always smiling with its eyes.</li>
                <li><strong>Diamond Eyes</strong> — Rotated squares that create elegant diamond shapes.</li>
                <li><strong>Star Eyes</strong> — Four-pointed stars that sparkle with personality.</li>
                <li><strong>Dot Eyes</strong> — Tiny, minimalist dots. Quiet confidence.</li>
                <li><strong>Oval Eyes</strong> — Tall vertical ovals. Wide-eyed wonder.</li>
                <li><strong>Square Eyes</strong> — Rounded squares with a sturdy, dependable feel.</li>
                <li><strong>Half-Moon Eyes</strong> — Dreamy semicircles looking upward.</li>
            </ul>

            <div className="bg-[#f5f9fc] dark:bg-zinc-800 p-8 rounded-[24px] my-12 border border-sky-200/40 dark:border-sky-800/30">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-3">See All 10 Eye Styles</h3>
                <p className="mb-6 italic text-sky-700/60 dark:text-sky-300/60">
                    Explore every eye type with live, blinking Facehash examples and detailed descriptions.
                </p>
                <Link href="/hash/eyes" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-sky-500/20">
                    View Eye Styles →
                </Link>
            </div>

            <h2>The Color Palette</h2>
            <p>
                We carefully curated a palette of <strong>12 colors</strong> that feel vibrant yet harmonious. The palette spans cool blues, warm ambers, fresh greens, bold pinks, and a neutral slate — ensuring that no matter what color your name hashes to, it looks great.
            </p>
            <p>
                Each color was hand-picked to work beautifully in both light and dark mode, and to provide enough contrast for the white eyes and initial letter to remain legible.
            </p>

            <div className="bg-[#f5f9fc] dark:bg-zinc-800 p-8 rounded-[24px] my-12 border border-sky-200/40 dark:border-sky-800/30">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-3">See All 12 Colors</h3>
                <p className="mb-6 italic text-sky-700/60 dark:text-sky-300/60">
                    Browse the full palette with live Facehash examples for every color.
                </p>
                <Link href="/hash" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-sky-500/20">
                    View Color Palette →
                </Link>
            </div>

            <h2>Expressive Animations</h2>
            <p>
                Facehashes in TaskTornado aren&apos;t static — they&apos;re alive. Your avatar reacts to what&apos;s happening in your academic world. Press <strong>▶ Play</strong> on each demo to see the animation in action:
            </p>

            <h3>😟 Overdue Peek</h3>
            <p>
                When you have overdue homework, your Facehash slides over to the offending card and gives it a disapproving frown.
            </p>
            <AnimationDemo type="overdue" />

            <h3>😴 Sleepy Head</h3>
            <p>
                Between 10:30 PM and 5 AM, your avatar tilts onto a pillow with floating zzz&apos;s. It knows you should be sleeping.
            </p>
            <AnimationDemo type="sleepy" />

            <h3>🎉 Celebration Dance</h3>
            <p>
                Complete a homework? Your avatar crouches, launches into a backflip, and lands with a satisfying bounce.
            </p>
            <AnimationDemo type="celebration" />

            <h3>👑 Victory Lap</h3>
            <p>
                Finish <em>all</em> your homework? A golden crown with sparkling jewels appears above your avatar and stays there as a badge of honor.
            </p>
            <AnimationDemo type="victory" />

            <p>
                Each animation uses squash-and-stretch, anticipation, and follow-through — principles borrowed from Disney&apos;s 12 rules of animation — to feel natural and delightful.
            </p>

            <h2>Why Not Just Use Profile Pictures?</h2>
            <p>
                We considered it. But profile pictures come with friction: you need to find one, crop it, upload it, and hope it looks okay at 64 pixels. For a homework organizer aimed at students, we wanted something <strong>instant and effortless</strong>.
            </p>
            <p>
                Facehashes also create a sense of visual consistency across the platform. Every avatar shares the same language — shapes, colors, proportions — making the interface feel cohesive and designed, rather than a patchwork of random images.
            </p>

            <h2>The Details</h2>
            <p>
                A few subtle touches that make Facehashes feel premium:
            </p>
            <ul>
                <li><strong>Blinking</strong> — Each avatar blinks at a unique interval, seeded from the name hash. Some blink fast, some slow.</li>
                <li><strong>3D Tilt</strong> — The &ldquo;dramatic&rdquo; intensity preset gives each avatar a distinct 3D rotation, making them feel like real objects in space.</li>
                <li><strong>Initial Letter</strong> — When no custom mouth expression is active, your first initial is displayed inside the face, reinforcing identity.</li>
                <li><strong>Color Adaptation</strong> — Mouth expressions use <code>currentColor</code>, which automatically adapts based on the background luminance, ensuring visibility on every color.</li>
            </ul>

            <div className="bg-[#f5f9fc] dark:bg-zinc-800 p-8 rounded-[24px] my-12 border border-sky-200/40 dark:border-sky-800/30">
                <h3 className="text-xl font-bold text-sky-800 dark:text-sky-200 mb-4">Meet Yours</h3>
                <p className="mb-6 italic text-sky-700/60 dark:text-sky-300/60">Your Facehash is waiting on your dashboard. Same name, same face — always.</p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-sky-500/20">
                    Go to Dashboard
                </Link>
            </div>
        </BlogArticleTemplate>
    );
}
