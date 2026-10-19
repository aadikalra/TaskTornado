import { Metadata } from 'next';
import { AuroraCenteredDemo } from '@/components/AuroraCenteredDemo';

export const metadata: Metadata = {
  title: 'Aurora AI Demo | TaskTornado',
  description: 'Interactive demo of Aurora AI, your academic companion.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuroraDemoPage() {
  return <AuroraCenteredDemo />;
}
