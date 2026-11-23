import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/site-url';
import LandingClient from './LandingClient';

const title = 'TaskTornado | Free Student Planner & Homework Tracker';
const description = 'TaskTornado is a free student planner for tracking homework, classes, deadlines, and grades. Plan study sessions and get help from the Aurora AI tutor.';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'TaskTornado',
        url: '/',
        images: [{ url: '/2.svg', alt: 'TaskTornado logo' }],
    },
    twitter: {
        card: 'summary',
        title,
        description,
        images: ['/2.svg'],
    },
};

const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TaskTornado',
    url: new URL('/', SITE_ORIGIN).href,
    description,
};

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, '\\u003c') }}
            />
            <LandingClient />
        </>
    );
}
