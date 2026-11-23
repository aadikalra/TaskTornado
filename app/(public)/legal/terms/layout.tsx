import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Terms of Service | TaskTornado',
    description: 'Read the TaskTornado terms, including account eligibility, acceptable use, and how to contact the team.',
    alternates: { canonical: '/legal/terms' },
};

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
