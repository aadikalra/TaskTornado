import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Free Word Counter for Essays | TaskTornado',
    description: 'Count words, characters, sentences, and paragraphs in your essay and estimate reading time. No account required.',
    alternates: { canonical: '/wordcount' },
};

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
