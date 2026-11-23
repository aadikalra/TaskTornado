import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site-url';

const publicPages = [
    '/',
    '/features',
    '/pricing',
    '/teachers',
    '/guardians',
    '/blog',
    '/changelog',
    '/tutorials',
    '/tutorials/onboarding',
    '/tutorials/recurring-homeworks',
    '/tutorials/starring-homeworks',
    '/tutorials/test-details',
];

export default function sitemap(): MetadataRoute.Sitemap {
    return publicPages.map((pathname) => ({ url: new URL(pathname, SITE_ORIGIN).href }));
}
