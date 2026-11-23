import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-posts';
import { PUBLIC_CONTENT_PATHS } from '@/lib/public-content';
import { SITE_ORIGIN } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [...PUBLIC_CONTENT_PATHS, ...blogPosts.map((post) => post.href)];
    return paths.map((pathname) => ({ url: new URL(pathname, SITE_ORIGIN).href }));
}
