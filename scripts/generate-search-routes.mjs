import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDirectory = path.join(projectRoot, 'app');
const outputFile = path.join(projectRoot, 'lib/search/generated-site-routes.ts');

// These are real routes, but they are intentionally not part of user-facing search.
const excludedRoutes = ['/hash/eyes', '/images', '/mail', '/signup-old'];

const titleOverrides = {
    '/': 'Home',
    '/ai-guidelines': 'AI Guidelines',
    '/discussions': 'Discussion Boards',
    '/quiz': 'Interactive Quizzes',
    '/writing-assist': 'Writing Assistant',
    '/hash': 'FaceHash Playground',
    '/grades': 'Public Grade Calculator',
    '/publiccalendar': 'Public Calendar',
    '/wordcount': 'Word Counter',
};

const descriptionOverrides = {
    '/': 'TaskTornado landing page',
    '/dashboard': 'Classes, assignments, tests, and progress',
    '/calendar': 'Plan assignments, tests, and school events',
    '/tests': 'View and manage tests and exams',
    '/quiz': 'Create, save, and take practice quizzes',
    '/flashcards': 'Create and study flashcard decks',
    '/discussions': 'Ask questions and share academic resources',
    '/groups': 'Collaborate with classmates in study groups',
    '/grade-calculator': 'Calculate and save weighted class grades',
    '/writing-assist': 'Draft, revise, and improve writing',
    '/grader': 'Review writing against a rubric',
    '/translate': 'Translate text between languages',
    '/web-saves': 'Search saved links, bookmarks, and folders',
    '/settings': 'Account, appearance, and app preferences',
    '/games': 'Browse all study breaks and games',
    '/tutorials': 'Browse TaskTornado guides and tutorials',
    '/blog': 'TaskTornado stories, guides, and updates',
};

const keywordOverrides = {
    '/dashboard': ['home', 'overview', 'command center', 'classes', 'homework'],
    '/calendar': ['schedule', 'events', 'dates', 'planner', 'due'],
    '/tests': ['exam', 'quiz', 'assessment', 'beta', 'alpha'],
    '/grade-calculator': ['grades', 'weighted grades', 'gpa', 'percentage', 'average', 'powerschool', 'smart paste'],
    '/flashcards': ['flash cards', 'cards', 'memorize', 'review', 'study deck'],
    '/writing-assist': ['essay', 'editor', 'compose', 'grammar', 'writing assistant'],
    '/web-saves': ['links', 'bookmarks', 'websites', 'folders'],
};

const walk = async directory => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(entry => {
            const entryPath = path.join(directory, entry.name);
            return entry.isDirectory() ? walk(entryPath) : entryPath;
        }),
    );
    return files.flat();
};

const routeFromPageFile = pageFile => {
    const relativePath = path.relative(appDirectory, pageFile).replaceAll(path.sep, '/');
    const routeSegments = relativePath
        .split('/')
        .slice(0, -1)
        .filter(segment => !segment.startsWith('('));

    if (routeSegments.some(segment => segment.startsWith('['))) return null;
    return routeSegments.length ? `/${routeSegments.join('/')}` : '/';
};

const humanize = value =>
    value
        .replace(/[-_]+/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, letter => letter.toUpperCase());

const titleForRoute = route =>
    titleOverrides[route] || humanize(route.split('/').filter(Boolean).at(-1) || 'Home');

const categoryForRoute = route => {
    if (route.startsWith('/blog')) return 'Blog';
    if (route.startsWith('/tutorials')) return 'Help';
    if (
        route === '/games' ||
        ['/snake', '/task-tower', '/color-match', '/math-sprint', '/memory-match', '/reaction-time', '/typing-speed', '/word-scramble'].includes(route)
    ) return 'Games';
    if (
        ['/login', '/signup', '/forgot-password', '/reset-password', '/account-eligibility', '/complete-signup', '/parental-consent'].includes(route) ||
        route.startsWith('/guardian/link')
    ) return 'Account';
    if (
        ['/dashboard', '/cat-shop', '/settings'].includes(route) ||
        route.startsWith('/guardian/dashboard')
    ) return 'App';
    if (
        ['/calendar', '/tests', '/quiz', '/flashcards', '/discussions', '/groups'].includes(route)
    ) return 'School';
    if (
        ['/grade-calculator', '/grader', '/writing-assist', '/translate', '/web-saves', '/grades', '/publiccalendar', '/wordcount', '/hash'].includes(route)
    ) return 'Tools';
    return 'About';
};

const iconForRoute = (route, category) => {
    if (route === '/' || route === '/dashboard') return 'Home02';
    if (route.includes('calendar')) return 'Calendar02';
    if (route.includes('flashcard')) return 'Cards01';
    if (route.includes('quiz')) return 'Quiz04';
    if (route.includes('test') || route === '/teachers') return 'GraduationCap';
    if (route.includes('grade')) return 'ChartAnalysis';
    if (route.includes('writing')) return 'AiContentGenerator02';
    if (route.includes('translate') || route.includes('translation')) return 'Translate';
    if (route.includes('discussion')) return 'Chat';
    if (route.includes('group')) return 'UserGroup03';
    if (route.includes('web-saves')) return 'Bookmark03';
    if (route.includes('settings')) return 'Settings02';
    if (route.includes('hash')) return 'Fingerprint';
    if (route.includes('legal') || route.includes('guardian')) return 'Security01';

    return {
        Account: 'Login01',
        App: 'LayoutGrid',
        School: 'Book01',
        Tools: 'LayoutGrid',
        Games: 'Gameboy',
        Help: 'HelpCircle',
        Blog: 'Blogger',
        About: 'Star',
    }[category];
};

const keywordsForRoute = (route, title, category) => {
    const routeWords = route
        .split('/')
        .filter(Boolean)
        .flatMap(segment => segment.split('-'))
        .map(word => word.toLowerCase());

    return [...new Set([
        title.toLowerCase(),
        category.toLowerCase(),
        ...routeWords,
        ...(keywordOverrides[route] || []),
    ])];
};

const pageFiles = (await walk(appDirectory))
    .filter(file => path.basename(file) === 'page.tsx')
    .sort();

const routes = pageFiles
    .map(routeFromPageFile)
    .filter(route => route && !excludedRoutes.includes(route))
    .map(href => {
        const title = titleForRoute(href);
        const category = categoryForRoute(href);
        return {
            title,
            href,
            description: descriptionOverrides[href] || `Open the ${title} page`,
            icon: iconForRoute(href, category),
            category,
            keywords: keywordsForRoute(href, title, category),
        };
    })
    .sort((left, right) => left.href.localeCompare(right.href));

const generatedSource = `// This file is generated by scripts/generate-search-routes.mjs.
// Run \`npm run search:index\` to refresh it manually. Dev and production builds do this automatically.

export const GENERATED_SITE_SEARCH_ROUTES = ${JSON.stringify(routes, null, 4)} as const;

export const GENERATED_SEARCH_EXCLUDED_ROUTES = ${JSON.stringify(excludedRoutes, null, 4)} as const;
`;

await writeFile(outputFile, generatedSource);
console.log(`Generated ${routes.length} searchable page routes.`);
