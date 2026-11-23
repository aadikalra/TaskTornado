import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    const { heading, intro, steps, example, related } = PLANNER_PAGES[pageId];

    return (
        <article className="min-h-screen bg-[#fffaf4] text-sky-950 dark:bg-gray-950 dark:text-sky-100">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
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

                {pageId === 'student' && (
                    <figure className="mb-12">
                        <Image
                            src="/recording/dashboard-source.png"
                            alt="TaskTornado dashboard with color-coded classes and assignment due dates"
                            width={1604}
                            height={1000}
                            sizes="(max-width: 1150px) 94vw, 1088px"
                            className="h-auto w-full rounded-2xl border border-sky-100 dark:border-sky-900"
                        />
                        <figcaption className="mt-3 text-sm text-sky-800/75 dark:text-sky-200/70">
                            The TaskTornado dashboard with example coursework.
                        </figcaption>
                    </figure>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
                    <section className="rounded-3xl border border-sky-100 bg-white p-6 dark:border-sky-900 dark:bg-slate-900 sm:p-8">
                        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
                        <ol className="mt-5 space-y-5">
                            {steps.map((step) => (
                                <li key={step.heading}>
                                    <h3 className="font-semibold">{step.heading}</h3>
                                    <p className="mt-1 leading-relaxed text-sky-900/75 dark:text-sky-100/75">{step.detail}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                    <section className="rounded-3xl border border-sky-100 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/45 sm:p-8">
                        <h2 className="text-2xl font-bold tracking-tight">{example.heading}</h2>
                        <p className="mt-3 leading-relaxed text-sky-900/75 dark:text-sky-100/75">{example.intro}</p>
                        <dl className="mt-5 divide-y divide-sky-200/70 dark:divide-sky-800/75">
                            {example.rows.map((row) => (
                                <div key={row.label} className="py-3 first:pt-0 last:pb-0">
                                    <dt className="font-semibold">{row.label}</dt>
                                    <dd className="mt-1 text-sm leading-relaxed text-sky-900/80 dark:text-sky-100/75">{row.detail}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>

                {pageId === 'ai' && (
                    <section className="mt-9 max-w-3xl" aria-labelledby="aurora-access">
                        <h2 id="aurora-access" className="text-xl font-bold">Aurora access and data</h2>
                        <p className="mt-3 leading-relaxed text-sky-900/75 dark:text-sky-100/75">
                            Aurora is available to eligible signed-in students. Ages 13–17 need parent or guardian approval before using AI features.
                            Requests may include your prompt, a short conversation history, and relevant planner records.
                            Review teacher instructions and your class materials when checking the plan.
                        </p>
                    </section>
                )}

                <nav aria-label="Related planner guides" className="mt-10 border-t border-sky-100 pt-7 dark:border-sky-900">
                    <h2 className="text-xl font-bold">Explore more</h2>
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                        {related.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </article>
    );
}
