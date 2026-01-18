import { Metadata } from 'next';
import TutorialsClient from './TutorialsClient';

export const metadata: Metadata = {
  title: 'Guides & Tutorials | TaskTornado',
  description: 'Master your academic workflow with expert guides for TaskTornado. Learn how to use our AI assistant, manage homework, and stay organized.',
  keywords: ['TaskTornado', 'tutorials', 'student organization', 'study guides', 'academic productivity', 'AI study assistant'],
  openGraph: {
    title: 'TaskTornado Guides & Tutorials',
    description: 'Master your academic workflow with expert guides for TaskTornado.',
    type: 'website',
    url: 'https://tasktornado.com/tutorials',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskTornado Guides & Tutorials',
    description: 'Master your academic workflow with expert guides for TaskTornado.',
  }
};

export default function Page() {
  return <TutorialsClient />;
}
