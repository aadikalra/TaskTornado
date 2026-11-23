import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Student Planner Features | TaskTornado',
    description: 'Explore TaskTornado’s homework tracker, school calendar, grade calculator, flashcards, and Aurora AI tutor for students.',
    alternates: { canonical: '/features' },
};

export default function FeaturesLayout({ children }: { children: ReactNode }) {
    return children;
}
