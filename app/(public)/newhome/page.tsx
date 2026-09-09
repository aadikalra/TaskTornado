import type { Metadata } from 'next';

import NewHomeDashboard from '@/components/NewHomeDashboard';

export const metadata: Metadata = {
  title: 'Home | TaskTornado',
  description: 'A focused home dashboard for homework, tests, deadlines, and school events.',
};

export default function NewHomePage() {
  return <NewHomeDashboard />;
}
