import { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
    title: 'TaskTornado | The Ultimate AI-Powered Student Organizer',
    description: 'TaskTornado is an all-in-one academic hub for students. Manage homework, classes, and study schedules with our built-in Aurora AI tutor. Free forever, built for students.',
    keywords: ['TaskTornado', 'student organizer', 'AI tutor', 'homework tracker', 'academic planner', 'study assistant', 'free student tools'],
    openGraph: {
        title: 'TaskTornado | AI-Powered Student Organizer',
        description: 'The all-in-one hub for your academic life. Homework, classes, and AI tutoring in one place.',
        type: 'website',
        url: 'https://tasktornado.com',
        images: [
            {
                url: 'https://tasktornado.com/2.svg',
                width: 800,
                height: 600,
                alt: 'TaskTornado Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TaskTornado | AI-Powered Student Organizer',
        description: 'The all-in-one hub for your academic life. Free forever.',
        images: ['https://tasktornado.com/2.svg'],
    },
    alternates: {
        canonical: 'https://tasktornado.com',
    },
};

export default function Page() {
    return <LandingClient />;
}
