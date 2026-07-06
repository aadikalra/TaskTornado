import { Metadata } from 'next';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = {
    title: 'Getting Started with TaskTornado | Onboarding Guide',
    description: 'A comprehensive guide to personalizing your TaskTornado experience, from grade selection to elective optimization. Build your perfect academic hub today.',
    keywords: ['TaskTornado onboarding', 'getting started', 'grade selection', 'academic hub', 'student setup'],
    openGraph: {
        title: 'Getting Started with TaskTornado',
        description: 'Build your foundation for an organized academic life.',
        type: 'article',
        url: 'https://tasktornado.com/tutorials/onboarding',
    }
};

export default function Page() {
    return <OnboardingClient />;
}
