import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { rankSearchItems, SITE_SEARCH_EXCLUDED_ROUTES, SITE_SEARCH_ROUTES, siteRouteToSearchItem } from './site-search.ts';

const routeFromPagePath = (pagePath: string) => {
    const segments = pagePath
        .replace(/\\/g, '/')
        .split('/')
        .filter(segment => segment !== 'app' && segment !== 'page.tsx' && !segment.startsWith('('));
    return segments.length ? `/${segments.join('/')}` : '/';
};

test('indexes every static user-facing page route', () => {
    const indexedRoutes = new Set(SITE_SEARCH_ROUTES.map(route => route.href));
    const excludedRoutes = new Set<string>(SITE_SEARCH_EXCLUDED_ROUTES);
    const pageFiles = readdirSync('app', { recursive: true, encoding: 'utf8' })
        .filter(path => path.endsWith('/page.tsx') || path === 'page.tsx')
        .map(path => `app/${path}`)
        .filter(path => !path.includes('/['));

    for (const pageFile of pageFiles) {
        const route = routeFromPagePath(pageFile);
        assert.ok(
            indexedRoutes.has(route) || excludedRoutes.has(route),
            `Static page route ${route} is missing from the site-wide search index`,
        );
    }

    const actualRoutes = new Set(pageFiles.map(routeFromPagePath));
    for (const indexedRoute of indexedRoutes) {
        assert.ok(
            actualRoutes.has(indexedRoute),
            `Search index contains stale route ${indexedRoute}; run npm run search:index`,
        );
    }
});

test('contains no duplicate route entries', () => {
    const routes = SITE_SEARCH_ROUTES.map(route => route.href);
    assert.equal(new Set(routes).size, routes.length);
});

test('ranks exact, partial, and typo-tolerant matches', () => {
    const items = SITE_SEARCH_ROUTES.map(siteRouteToSearchItem);

    assert.equal(rankSearchItems(items, 'calendar')[0]?.href, '/calendar');
    assert.equal(rankSearchItems(items, 'calender')[0]?.href, '/calendar');
    assert.equal(rankSearchItems(items, 'weighted grades')[0]?.href, '/grade-calculator');
    assert.equal(rankSearchItems(items, 'flash cards')[0]?.href, '/flashcards');
});
