// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { GENERATED_SEARCH_EXCLUDED_ROUTES, GENERATED_SITE_SEARCH_ROUTES } from './generated-site-routes.ts';

export type SearchSection =
    | 'Pages'
    | 'Classes'
    | 'Assignments'
    | 'Tests & exams'
    | 'Flashcard decks'
    | 'Quizzes'
    | 'Web saves'
    | 'Study groups';

export interface SearchItem {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    icon: string;
    section: SearchSection;
    keywords?: string[];
    badge?: string;
    external?: boolean;
    priority?: number;
}

export interface SiteSearchRoute {
    title: string;
    href: string;
    description: string;
    icon: string;
    category: 'App' | 'School' | 'Tools' | 'Games' | 'Help' | 'Blog' | 'Account' | 'About';
    keywords: readonly string[];
}

export const SITE_SEARCH_EXCLUDED_ROUTES = GENERATED_SEARCH_EXCLUDED_ROUTES;
export const SITE_SEARCH_ROUTES: readonly SiteSearchRoute[] = GENERATED_SITE_SEARCH_ROUTES;

const ROUTE_CATEGORY_PRIORITY: Record<SiteSearchRoute['category'], number> = {
    App: 70,
    School: 70,
    Tools: 65,
    Games: 35,
    Help: 30,
    About: 20,
    Account: 15,
    Blog: 5,
};

export const siteRouteToSearchItem = (route: SiteSearchRoute): SearchItem => ({
    id: `route:${route.href}`,
    title: route.title,
    subtitle: route.description,
    href: route.href,
    icon: route.icon,
    section: 'Pages',
    keywords: [...route.keywords, route.category],
    badge: route.category,
    priority: ROUTE_CATEGORY_PRIORITY[route.category],
});

const normalize = (value: string) =>
    value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');

const editDistance = (left: string, right: string) => {
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    const current = new Array<number>(right.length + 1);

    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        current[0] = leftIndex;
        for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
            current[rightIndex] = Math.min(
                current[rightIndex - 1] + 1,
                previous[rightIndex] + 1,
                previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
            );
        }
        for (let index = 0; index < previous.length; index += 1) previous[index] = current[index];
    }

    return previous[right.length];
};

const fuzzyTokenScore = (queryToken: string, words: string[]) => {
    if (queryToken.length < 3) return 0;
    const threshold = queryToken.length >= 7 ? 2 : 1;
    let best = Number.POSITIVE_INFINITY;

    for (const word of words) {
        if (Math.abs(word.length - queryToken.length) > threshold) continue;
        best = Math.min(best, editDistance(queryToken, word));
        if (best === 0) break;
    }

    return best <= threshold ? 18 - best * 5 : 0;
};

export type SearchMatchReason = 'title' | 'description' | 'keyword' | 'link' | 'similar';

const getSearchMatchReason = (item: SearchItem, rawQuery: string): SearchMatchReason => {
    const query = normalize(rawQuery);
    if (!query) return 'similar';

    const title = normalize(item.title);
    const subtitle = normalize(item.subtitle);
    const keywords = normalize(item.keywords?.join(' ') || '');
    const href = normalize(item.href);
    const queryTokens = query.split(' ').filter(Boolean);
    const hasTokenMatch = (value: string) => queryTokens.some(token => value.includes(token));

    if (title === query || title.includes(query) || hasTokenMatch(title)) return 'title';
    if (keywords.includes(query) || hasTokenMatch(keywords)) return 'keyword';
    if (subtitle.includes(query) || hasTokenMatch(subtitle)) return 'description';
    if (href.includes(query) || hasTokenMatch(href)) return 'link';
    return 'similar';
};

const scoreSearchItem = (item: SearchItem, rawQuery: string) => {
    const query = normalize(rawQuery);
    if (!query) return 0;

    const title = normalize(item.title);
    const subtitle = normalize(item.subtitle);
    const keywords = normalize(item.keywords?.join(' ') || '');
    const href = normalize(item.href);
    const allText = `${title} ${subtitle} ${keywords} ${href}`;
    const allWords = allText.split(' ').filter(Boolean);
    const titleWords = title.split(' ').filter(Boolean);
    const queryTokens = query.split(' ').filter(Boolean);

    let score = item.priority || 0;
    if (title === query) score += 1000;
    else if (title.startsWith(query)) score += 700;
    else if (titleWords.some(word => word.startsWith(query))) score += 520;
    else if (title.includes(query)) score += 420;
    else if (keywords.includes(query)) score += 280;
    else if (subtitle.includes(query)) score += 180;
    else if (href.includes(query)) score += 120;

    for (const token of queryTokens) {
        if (titleWords.includes(token)) score += 120;
        else if (titleWords.some(word => word.startsWith(token))) score += 90;
        else if (title.includes(token)) score += 70;
        else if (keywords.includes(token)) score += 45;
        else if (subtitle.includes(token)) score += 30;
        else if (href.includes(token)) score += 20;
        else {
            const fuzzyScore = fuzzyTokenScore(token, allWords);
            if (!fuzzyScore) return 0;
            score += fuzzyScore;
        }
    }

    return score;
};

export type RankedSearchItem = SearchItem & {
    score: number;
    matchReason: SearchMatchReason;
};

export const rankSearchItems = (
    items: SearchItem[],
    query: string,
    limit = 48,
): RankedSearchItem[] =>
    items
        .map(item => ({
            ...item,
            score: scoreSearchItem(item, query),
            matchReason: getSearchMatchReason(item, query),
        }))
        .filter(item => item.score > 0)
        .sort((left, right) =>
            right.score - left.score ||
            (right.priority || 0) - (left.priority || 0) ||
            left.title.localeCompare(right.title),
        )
        .slice(0, limit);
