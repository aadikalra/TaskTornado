import { PLANNER_LINKS } from './planner-links';

export const PUBLIC_CONTENT_PATHS = [
    '/',
    '/features',
    ...Object.values(PLANNER_LINKS).map(({ href }) => href),
    '/about',
    '/legal/privacy',
    '/legal/terms',
    '/pricing',
    '/teachers',
    '/guardians',
    '/blog',
    '/changelog',
    '/grades',
    '/wordcount',
    '/publiccalendar',
    '/tutorials',
    '/tutorials/onboarding',
    '/tutorials/recurring-homeworks',
    '/tutorials/starring-homeworks',
    '/tutorials/test-details',
];
