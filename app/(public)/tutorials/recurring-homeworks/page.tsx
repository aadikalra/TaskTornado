import { Metadata } from 'next';
import RecurringHomeworksClient from './RecurringHomeworksClient';

export const metadata: Metadata = {
    title: 'Automating Recurring Homework | TaskTornado productivity',
    description: 'Save time by learning how to set up assignments that repeat daily or weekly in TaskTornado. Perfect for routine study tasks and recurring projects.',
    keywords: ['recurring homework', 'homework automation', 'student productivity', 'TaskTornado features', 'study routine'],
    openGraph: {
        title: 'Automating Recurring Homework | TaskTornado',
        description: 'Set up your routine once, never forget a task again.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/recurring-homeworks',
    }
};

export default function Page() {
    return <RecurringHomeworksClient />;
}
