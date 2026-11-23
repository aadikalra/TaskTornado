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
];

export default function HomepageBadges() {
    return (
        <section aria-label="Featured links" className="bg-[#fffaf4] px-4 py-6 dark:bg-gray-950">
            <div className="mx-auto max-w-5xl [container-type:inline-size]">
                <ul className={styles.track} role="list" style={{ '--badge-count': badges.length } as CSSProperties}>
                    {badges.map(({ name, content }, index) => (
                        <li key={name} className={styles.badge} style={{ '--badge-index': index } as CSSProperties}>
                            {content}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
