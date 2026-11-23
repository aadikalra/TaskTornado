'use client';

import Image from 'next/image';

const stats = [
    { value: '2+', label: 'States' },
    { value: '50+', label: 'Students' },
    { value: '1,000+', label: 'Hours' },
];

export default function UserReachSection() {
    return (
        <section className="py-24 md:py-32 bg-fuchsia-50 dark:bg-zinc-950/50 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                {/* ── Header ──────────────────────────────── */}
                <div className="text-center mb-12 md:mb-16">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-600/5 dark:bg-fuchsia-400/10 border border-fuchsia-600/15 dark:border-fuchsia-400/20 rounded-full mb-4">
                        Growing Fast
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-fuchsia-700 dark:text-fuchsia-300 tracking-tight leading-[1.15] mb-4">
                        Students everywhere.
                    </h2>
                    <p className="text-base md:text-lg text-fuchsia-950/80 dark:text-fuchsia-200 font-medium max-w-lg mx-auto leading-relaxed">
                        From California to Texas, TaskTornado helps students across the country stay on top of their education.
                    </p>
                </div>

                {/* ── Map ──────────────────────────────────── */}
                <div className="relative w-full max-w-2xl mx-auto mb-16 md:mb-20">
                    <Image
                        src="/userMap.png"
                        alt="World map showing TaskTornado user distribution"
                        width={1200}
                        height={600}
                        sizes="(max-width: 768px) 92vw, 672px"
                        className="w-full h-auto object-contain rounded-2xl"
                        priority={false}
                    />
                </div>

                {/* ── Stats Row ────────────────────────────── */}
                <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-3xl md:text-5xl font-bold text-fuchsia-700 dark:text-fuchsia-300 tracking-tight mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-fuchsia-900/80 dark:text-fuchsia-300 uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
