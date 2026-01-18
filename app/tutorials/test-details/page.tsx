import { Metadata } from 'next';
import TestDetailsClient from './TestDetailsClient';

export const metadata: Metadata = {
    title: 'Managing Test Details | TaskTornado Study Guide',
    description: 'Discover how to access and manage comprehensive information about your upcoming tests, including dates, study materials, and grades in TaskTornado.',
    keywords: ['test details', 'exam management', 'study planning', 'TaskTornado tests', 'student grades'],
    openGraph: {
        title: 'Managing Test Details | TaskTornado',
        description: 'Keep track of every test and study material efficiently.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/test-details',
    }
};

export default function Page() {
    return <TestDetailsClient />;
}
