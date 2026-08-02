'use client';

import { motion } from 'framer-motion';
import { Facehash } from 'facehash';
import Image from 'next/image';
import { Star } from 'lucide-react';

const COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
];

const QuoteIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10 8H6C6 6.5 6.8 5.4 7.5 4.8L6.2 3.5C4.8 4.6 4 6.2 4 8V14H10V8ZM20 8H16C16 6.5 16.8 5.4 17.5 4.8L16.2 3.5C14.8 4.6 14 6.2 14 8V14H20V8Z" />
    </svg>
);

const row1 = [
    {
        quote: "Everything I need to do is finally in one place. I can see what is due, choose what to work on next, and stop worrying that I forgot something.",
        title: "A calmer school week",
        context: "High school junior",
        avatar: "G"
    },
    {
        quote: "Instead of staring at a huge assignment, I can break it into smaller steps and make progress without feeling overwhelmed.",
        title: "Big projects feel doable",
        context: "College sophomore",
        avatar: "S"
    },
    {
        quote: "The study tools fit right beside my classes and tasks, so reviewing for a test feels like part of my plan—not another app I have to manage.",
        title: "Studying stays connected",
        context: "High school senior",
        avatar: "B"
    },
    {
        quote: "My deadlines, notes, and useful links stay with the right course. I spend less time searching and more time actually getting the work done.",
        title: "No more tab hunting",
        context: "College freshman",
        avatar: "D"
    }
];

const row2 = [
    {
        quote: "The grade calculator turns ‘Am I doing okay?’ into a clear answer. I can see what I need on the next assignment and plan accordingly.",
        title: "Goals become concrete",
        context: "High school sophomore",
        avatar: "J"
    },
    {
        quote: "I can move from checking an assignment to reviewing flashcards without losing focus. My whole study flow feels simpler.",
        title: "Fewer tools, more focus",
        context: "College junior",
        avatar: "N"
    },
    {
        quote: "Seeing every assignment on one calendar makes the week feel predictable. I know which days are busy before they sneak up on me.",
        title: "The week at a glance",
        context: "High school freshman",
        avatar: "V"
    },
    {
        quote: "When everyday classwork is organized, I have more energy for applications and long-term goals. School feels a lot less chaotic.",
        title: "More room for what matters",
        context: "College senior",
        avatar: "M"
    }
];

const TestimonialCard = ({ item }: { item: { quote: string; title: string; context: string; avatar: string } }) => (
    <div className="flex-shrink-0 w-[340px] md:w-[420px] min-h-[260px] md:min-h-[280px] mx-3 md:mx-4 bg-[#f5f6f8] dark:bg-zinc-900 rounded-[28px] p-8 md:p-10 flex flex-col justify-between border border-[#275085]/5 dark:border-zinc-800">
        <div>
            <div className="mb-5 flex items-center justify-between">
                <div className="text-[#275085] dark:text-[#4a9cdb]">
                    <QuoteIcon />
                </div>
                <div className="flex gap-0.5 text-amber-400" aria-label="Five-star illustrative review">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    ))}
                </div>
            </div>
            <p className="text-[#275085] dark:text-zinc-300 text-[15px] md:text-base leading-relaxed mb-8 font-medium">
                “{item.quote}”
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#275085]/10 cursor-help" aria-label="Illustrative student avatar">
                    <Facehash
                        name={`illustrative-${item.avatar}`}
                        size={40}
                        colors={COLORS}
                        intensity3d="dramatic"
                    />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#275085] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl shadow-[#275085]/20">
                    illustrative profile
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#275085]" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-[#275085] dark:text-zinc-100 mb-0.5">{item.title}</span>
                <span className="text-[11px] text-[#275085]/50 dark:text-zinc-500 uppercase tracking-widest font-semibold">{item.context}</span>
            </div>
        </div>
    </div>
);

export default function SocialProofSection() {
    // Duplicate arrays for infinite scroll loops
    const duplicatedRow1 = [...row1, ...row1, ...row1];
    const duplicatedRow2 = [...row2, ...row2, ...row2];

    return (
        <section className="py-24 md:py-32 bg-[#FFF9F0] dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-8">

                {/* ── Outer Card Container ── */}
                <div className="bg-[#eaf2ff] dark:bg-zinc-900 rounded-[40px] md:rounded-[64px] py-16 md:py-24 overflow-hidden shadow-sm">

                    {/* ── Header Area (centered, top) ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 md:mb-16 px-6 md:px-0"
                    >
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full pl-1.5 pr-4 py-1.5 shadow-xl shadow-blue-500/10 mb-6 sm:mb-8">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">i</span>
                            </div>
                            <span className="text-[12px] font-bold tracking-wide">
                                Made for real student routines
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl md:text-5xl font-semibold text-blue-500 dark:text-blue-400 tracking-tight leading-[1.15] mb-4 max-w-3xl mx-auto">
                            School feels lighter when everything works together.
                        </h2>
                        <p className="mx-auto max-w-xl text-sm font-medium text-blue-700/60 dark:text-blue-300/60">
                            Illustrative reviews based on common student workflows. They are examples, not verified customer testimonials.
                        </p>
                    </motion.div>

                    {/* ── Split Layout: Image Left + Carousel Right ── */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 items-center px-8 md:px-16">

                        {/* Left: Illustration */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="lg:w-[35%] shrink-0 flex items-center justify-center"
                        >
                            <Image
                                src="/socialFeedback.png"
                                alt="Illustration of student organization scenarios"
                                width={400}
                                height={400}
                                className="w-full max-w-[340px] h-auto object-contain"
                            />
                        </motion.div>

                        {/* Right: Carousel */}
                        <div className="relative w-full lg:w-[65%] flex flex-col gap-5 md:gap-6 overflow-hidden">
                            {/* Edge Gradients */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 z-10 pointer-events-none bg-gradient-to-r from-[#eaf2ff] dark:from-zinc-900 to-transparent" />
                            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 z-10 pointer-events-none bg-gradient-to-l from-[#eaf2ff] dark:from-zinc-900 to-transparent" />

                            {/* Row 1 (Scrolls Left) */}
                            <div className="flex animate-marquee-left hover:[animation-play-state:paused] w-max">
                                {duplicatedRow1.map((item, i) => (
                                    <TestimonialCard key={`r1-${i}`} item={item} />
                                ))}
                            </div>

                            {/* Row 2 (Scrolls Right) */}
                            <div className="flex animate-marquee-right hover:[animation-play-state:paused] w-max">
                                {duplicatedRow2.map((item, i) => (
                                    <TestimonialCard key={`r2-${i}`} item={item} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Custom Animations for Marquees */}
            <style jsx>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333333%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-33.333333%); }
                    100% { transform: translateX(0); }
                }
                
                .animate-marquee-left {
                    animation: marquee-left 40s linear infinite;
                }
                
                .animate-marquee-right {
                    animation: marquee-right 40s linear infinite;
                }
                
                @media (max-width: 768px) {
                    .animate-marquee-left { animation-duration: 25s; }
                    .animate-marquee-right { animation-duration: 25s; }
                }
            `}</style>
        </section>
    );
}
