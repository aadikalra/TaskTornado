import { Metadata } from 'next';
import StarringHomeworksClient from './StarringHomeworksClient';

export const metadata: Metadata = {
    title: 'Priority Stars Guide | TaskTornado',
    description: 'Learn how to highlight your most important assignments in TaskTornado by converting priority tags into prominent stars. Essential for effective homework management.',
    keywords: ['TaskTornado stars', 'priority management', 'homework organization', 'visual study tools', 'student productivity'],
    openGraph: {
        title: 'Priority Stars Guide | TaskTornado',
        description: 'Highlight what matters most with Priority Stars.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/starring-homeworks',
    }
};

export default function Page() {
    return <StarringHomeworksClient />;
}
