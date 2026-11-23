import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LandingFooter from '@/app/landing-sections/LandingFooter';
import OrganizationSection from '@/app/landing-sections/OrganizationSection';
import { PLANNER_LINKS, type PlannerPageId } from '@/lib/planner-links';
import { PLANNER_PAGES } from '@/lib/planner-pages';

export function plannerMetadata(pageId: PlannerPageId): Metadata {
    const { title, description } = PLANNER_PAGES[pageId];
    const url = PLANNER_LINKS[pageId].href;
    const brandedTitle = `${title} | TaskTornado`;

    return {
        title: brandedTitle,
        description,
        alternates: { canonical: url },
        openGraph: { title: brandedTitle, description, url, type: 'website', siteName: 'TaskTornado' },
    };
}

export function PlannerPage({ pageId }: { pageId: PlannerPageId }) {
    const { heading, intro, stepsHeading, steps, example, related } = PLANNER_PAGES[pageId];

    return (
        <article className="min-h-screen bg-[#fffaf4] text-sky-950 dark:bg-gray-950 dark:text-sky-100">
            <div className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-36">
                <Link href="/" className="inline-flex font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                    TaskTornado home
                </Link>
                <header className="mb-12 mt-7 max-w-4xl sm:mb-16">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">{heading}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sky-900/75 dark:text-sky-200/75">{intro}</p>
                    <Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#275085] px-6 py-3 font-semibold text-white hover:bg-sky-800 dark:bg-sky-700">
                        Get started free <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </header>
            </div>
            <OrganizationSection
                content={{
                    heading: stepsHeading,
                    cards: steps.map(({ heading, detail }) => ({ title: heading, desc: detail })),
                }}
            />

            <section aria-labelledby="planner-example" className="px-6 pb-12 md:px-12 md:pb-20">
                <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-[40px] bg-[#eef4fd] p-8 dark:bg-slate-900 md:gap-12 md:p-12 lg:grid-cols-[1.1fr_1fr]">
                    <div>
                        <h2 id="planner-example" className="scroll-mt-20 text-3xl font-semibold leading-tight tracking-tight text-[#275085] dark:text-[#7ec0f2] md:text-4xl">
                            {example.heading}
                        </h2>
                        <p className="mt-4 leading-relaxed text-[#275085]/85 dark:text-[#b4dbf9]">
                            {example.intro}
                        </p>
                        <dl className="mt-5 divide-y divide-[#275085]/15 dark:divide-[#7ec0f2]/20">
                            {example.rows.map((row) => (
                                <div key={row.label} className="py-3 last:pb-0">
                                    <dt className="font-semibold text-[#275085] dark:text-[#7ec0f2]">{row.label}</dt>
                                    <dd className="mt-1 text-sm leading-relaxed text-[#275085]/85 dark:text-[#b4dbf9]">{row.detail}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="relative mx-auto aspect-[8/5] w-full max-w-lg overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-800">
                        <Image
                            src={example.image.src}
                            alt={example.image.alt}
                            fill
                            sizes="(max-width: 768px) calc(100vw - 112px), 512px"
                            className="object-contain"
                        />
                    </div>
                </div>

                {pageId === 'ai' && (
                    <section className="mx-auto mt-10 max-w-6xl" aria-labelledby="aurora-access">
                        <h2 id="aurora-access" className="text-xl font-bold text-[#275085] dark:text-[#7ec0f2]">
                            Aurora access and data
                        </h2>
                        <p className="mt-3 max-w-3xl leading-relaxed text-[#275085]/85 dark:text-[#b4dbf9]">
                            Aurora is available to eligible signed-in students. Ages 13–17 need parent or guardian approval before using AI features.
                            Requests may include your prompt, a short conversation history, and relevant planner records.
                            Review teacher instructions and your class materials when checking the plan.
                        </p>
                    </section>
                )}

                <nav aria-label="Related planner guides" className="mx-auto mt-10 max-w-6xl">
                    <h2 className="text-xl font-bold text-[#275085] dark:text-[#7ec0f2]">Related guides</h2>
                    <ul className="mt-4 flex flex-wrap gap-3">
                        {related.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#275085]/15 bg-white px-4 py-2 text-sm font-semibold text-[#275085] transition-colors hover:bg-[#eef4fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#275085] dark:border-slate-700 dark:bg-slate-900 dark:text-[#b4dbf9] dark:hover:bg-slate-800 dark:focus-visible:outline-[#7ec0f2]"
                                >
                                    {link.label}
                                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>

            <LandingFooter />
        </article>
    );
}
