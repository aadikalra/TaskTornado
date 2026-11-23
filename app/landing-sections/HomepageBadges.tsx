'use client';

import type { CSSProperties } from 'react';
import styles from './HomepageBadges.module.css';

function TrustpilotBadge() {
    return (
        <a
            href="https://www.trustpilot.com/review/tasktornado.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] items-center justify-center gap-2 rounded-lg border border-[#00b67a]/35 bg-white px-4 text-sm font-semibold text-[#191919] shadow-xs transition-colors hover:border-[#00b67a] dark:border-[#00b67a]/40 dark:bg-zinc-900 dark:text-zinc-100"
        >
            <span>Review us on</span>
            <span className="inline-flex items-center gap-1 font-bold">
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-[#00b67a]"
                    fill="currentColor"
                >
                    <path d="M12 1.75l2.85 6.86 7.4.6-5.64 4.84 1.72 7.2L12 17.39l-6.33 3.86 1.72-7.2-5.64-4.84 7.4-.6L12 1.75z" />
                </svg>
                <span>Trustpilot</span>
            </span>
        </a>
    );
}

function ThemedBadge({
    href,
    alt,
    lightSrc,
    darkSrc,
    width,
    height,
}: {
    href: string;
    alt: string;
    lightSrc: string;
    darkSrc: string;
    width: number;
    height: number;
}) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="max-w-full">
            <img
                src={lightSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                className="h-auto max-w-full dark:hidden"
            />
            <img
                src={darkSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                className="hidden h-auto max-w-full dark:block"
            />
        </a>
    );
}

const badges = [
    {
        name: 'BuiltByIndies',
        content: (
            <a
                href="https://builtbyindies.com/products/tasktornado?utm_source=badge&utm_medium=embed&utm_campaign=live"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
            >
                <img
                    src="https://builtbyindies.com/badge/f60292b4-3615-4fe0-9484-0a81f7d0bf9e.svg"
                    alt="BuiltByIndies"
                    width={220}
                    height={60}
                    loading="lazy"
                    decoding="async"
                    className="h-[60px] w-auto"
                />
            </a>
        ),
    },
    {
        name: 'Trustpilot',
        content: <TrustpilotBadge />,
    },
    {
        name: 'Boost Domain Rating',
        content: (
            <ThemedBadge
                href="https://boostdomainrating.com/item/tasktornado.app?utm_source=badge"
                alt="TaskTornado - Domain Rating"
                lightSrc="https://boostdomainrating.com/api/badge/tasktornado.app?color=light&icon=checkmark&shape=round&textStyle=italic-lowercase&primary=%23265dab"
                darkSrc="https://boostdomainrating.com/api/badge/tasktornado.app?color=dark&icon=checkmark&shape=round&textStyle=italic-lowercase&primary=%23265dab"
                width={281}
                height={54}
            />
        ),
    },
    {
        name: 'DevHub',
        content: (
            <ThemedBadge
                href="https://devhub.best/projects/tasktornado?utm_source=badge"
                alt="Featured on DevHub"
                lightSrc="https://r2.direasy-multi-tenant.focusapps.app/uploads/616d0b1a-3979-4b8c-94d1-b4f1fedd3ead/1783239702078/53yqmim54zv/featured-on-light.svg"
                darkSrc="https://r2.direasy-multi-tenant.focusapps.app/uploads/616d0b1a-3979-4b8c-94d1-b4f1fedd3ead/1783239705242/q5ooy1np7e/featured-on-dark.svg"
                width={150}
                height={44}
            />
        ),
    },
];

export default function HomepageBadges() {
    return (
        <section aria-label="Featured links" className="bg-[#fffaf4] py-6 [container-type:inline-size] dark:bg-gray-950">
            <ul className={styles.track} role="list" style={{ '--badge-count': badges.length } as CSSProperties}>
                {badges.map(({ name, content }, index) => (
                    <li key={name} className={styles.badge} style={{ '--badge-index': index } as CSSProperties}>
                        {content}
                    </li>
                ))}
            </ul>
            <a href="https://semilaunch.com/" target="_blank" rel="noopener noreferrer" hidden>
                <img
                    src="https://semilaunch.com/assets/badge.png"
                    alt="Featured on SemiLaunch"
                    width={220}
                    height={77}
                    loading="lazy"
                    decoding="async"
                />
            </a>
        </section>
    );
}
