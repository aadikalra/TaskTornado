import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Free Weighted Grade Calculator | TaskTornado',
    description: 'Calculate your class grade from assignment scores and category weights. Check your current percentage for free without an account.',
    alternates: { canonical: '/grades' },
};

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
