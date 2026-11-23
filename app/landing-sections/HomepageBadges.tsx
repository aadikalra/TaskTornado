'use client';

import Script from 'next/script';
import { useRef, type CSSProperties } from 'react';
import styles from './HomepageBadges.module.css';

declare global {
    interface Window {
        Trustpilot?: {
            loadFromElement: (element: HTMLElement) => void;
        };
    }
}

function TrustBox() {
    const widget = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                ref={widget}
                className="trustpilot-widget w-full text-center"
                data-locale="en-US"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="6b03ca589898c9d06ed5b473"
                data-style-height="52px"
                data-style-width="100%"
            >
                <a
                    href="https://www.trustpilot.com/review/tasktornado.app"
                    target="_blank"
                    rel="noopener"
                    className="text-sm font-semibold text-[#275085] underline underline-offset-4 dark:text-sky-200"
                >
                    Trustpilot
                </a>
            </div>
            <Script
                src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
                strategy="afterInteractive"
                async
                onReady={() => {
                    if (widget.current) window.Trustpilot?.loadFromElement(widget.current);
                }}
            />
        </>
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
                className="h-auto max-w-full dark:hidden"
            />
            <img
                src={darkSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                className="hidden h-auto max-w-full dark:block"
            />
        </a>
    );
}

const badges = [
    {
        name: 'BuiltByIndies',
        content: (
            <div
                className="[&_img]:h-[60px]"
                dangerouslySetInnerHTML={{
                    __html: '<a href="https://builtbyindies.com/products/tasktornado?utm_source=badge&utm_medium=embed&utm_campaign=live" target="_blank"><img src="https://builtbyindies.com/badge/f60292b4-3615-4fe0-9484-0a81f7d0bf9e.svg" alt="BuiltByIndies" height="60" /></a>',
                }}
            />
        ),
    },
    {
        name: 'Trustpilot',
        content: <TrustBox />,
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
            <a href="https://semilaunch.com/" target="_blank" rel="noopener" hidden>
                <img
                    src="https://semilaunch.com/assets/badge.png"
                    alt="Featured on SemiLaunch"
                    width={220}
                    height={77}
                    loading="lazy"
                />
            </a>
        </section>
    );
}
