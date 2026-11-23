import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Privacy Policy | TaskTornado',
    description: 'Learn what data TaskTornado collects, how it uses school and AI interaction data, and how to contact the team about privacy.',
    alternates: { canonical: '/legal/privacy' },
};

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
