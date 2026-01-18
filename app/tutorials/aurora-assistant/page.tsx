import { Metadata } from 'next';
import AuroraAssistantClient from './AuroraAssistantClient';

export const metadata: Metadata = {
    title: 'Aurora AI Assistant Guide | TaskTornado',
    description: 'Master your academic workflow with Aurora—the supportive, data-aware assistant designed to help you study smarter, not just harder. Learn about @commands, smart widgets, and more.',
    keywords: ['Aurora AI', 'study assistant', 'Socratic teaching', 'academic AI', 'TaskTornado AI', 'student tools'],
    openGraph: {
        title: 'Aurora AI Assistant Guide | TaskTornado',
        description: 'Master your academic workflow with Aurora—the supportive, data-aware assistant.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/aurora-assistant',
    }
};

export default function Page() {
    return <AuroraAssistantClient />;
}
