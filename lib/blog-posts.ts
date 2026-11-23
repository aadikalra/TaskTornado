interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    authorRole: string;
    readTime: string;
    category: string;
    coverImage: string;
    href: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: 'facehash',
        title: 'Facehash',
        excerpt: 'How we turn your name into a one-of-a-kind avatar — no uploads, no setup, no two students alike.',
        date: 'Feb 14, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Design',
        coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/facehash'
    },
    {
        id: 'grade-calculator',
        title: 'Grade Calculator',
        excerpt: 'Calculate a weighted grade from assignment scores and category weights.',
        date: 'Feb 8, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/grade-calculator'
    },
    {
        id: 'the-command-center',
        title: 'Intelligent Dashboard',
        excerpt: 'A unified view of your assignments, grades, and priorities.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/the-command-center'
    },
    {
        id: 'smart-calendar',
        title: 'Smart Calendar',
        excerpt: 'Automated deadline tracking and workload visualization.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '3 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/smart-calendar'
    },
    {
        id: 'flashcards-reimagined',
        title: 'Flashcard System',
        excerpt: 'Active recall and spaced repetition for long-term retention.',
        date: 'Feb 9, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '5 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/flashcards-reimagined'
    },
    {
        id: 'adaptive-quizzes',
        title: 'Quiz Engine',
        excerpt: 'Turn class notes and flashcards into practice questions for your next test.',
        date: 'Feb 8, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/adaptive-quizzes'
    },
    {
        id: 'research-hub',
        title: 'Web Saves Hub',
        excerpt: 'Source organization and link management for research.',
        date: 'Feb 7, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/research-hub'
    },
    {
        id: 'focus-timer',
        title: 'Study Timer',
        excerpt: 'Deep work management with Pomodoro and flow tracking.',
        date: 'Feb 5, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '4 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/focus-timer'
    },
    {
        id: 'learning-through-play',
        title: 'Learning Games',
        excerpt: 'Gamified academic practice to turn drills into challenges.',
        date: 'Feb 4, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '3 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/learning-through-play'
    },
    {
        id: 'learning-center',
        title: 'Tutorials Hub',
        excerpt: 'Master the platform with comprehensive guides and tips.',
        date: 'Feb 4, 2026',
        author: 'Aadi Kalra',
        authorRole: 'Founder',
        readTime: '6 min read',
        category: 'Product',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000',
        href: '/blog/learning-center'
    },
];
