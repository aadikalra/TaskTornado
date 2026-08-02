import { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
    title: 'TaskTornado | Pre-Launch Student Organizer',
    description: 'TaskTornado is a pre-launch academic hub for U.S. students age 13+. Manage homework, classes, and study schedules, with student-appropriate AI tutoring planned.',
    keywords: ['TaskTornado', 'student organizer', 'AI tutor', 'homework tracker', 'academic planner', 'study assistant', 'free student tools'],
    openGraph: {
        title: 'TaskTornado | Pre-Launch Student Organizer',
        description: 'A pre-launch hub for homework, classes, and study schedules, with AI study tools planned.',
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
        title: 'TaskTornado | Pre-Launch Student Organizer',
        description: 'A U.S.-only, age-13+ hub for organizing academic work.',
        images: ['https://tasktornado.com/2.svg'],
    },
    alternates: {
        canonical: 'https://tasktornado.com',
    },
};

export default function Page() {
    return <LandingClient />;
}
