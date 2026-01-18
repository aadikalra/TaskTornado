import { Metadata } from 'next';
import { getDashboardData } from '@/lib/data-loader';
import DashboardClient from './DashboardClient';
import { createClient } from '@/lib/supabase/server';
import { Class, Homework, Test } from '@/context/ClassContext';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | TaskTornado',
  description: 'Your academic hub. Track homework, manage classes, and monitor your study progress.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?redirectTo=%2Fdashboard');
  }

  let initialClasses: Class[] = [];
  let initialHomeworks: Homework[] = [];
  let initialTests: Test[] = [];

  const { classes, homeworks, tests } = await getDashboardData(supabase, session.user);
  initialClasses = classes;
  initialHomeworks = homeworks;
  initialTests = tests;

  return (
    <DashboardClient
      initialClasses={initialClasses}
      initialHomeworks={initialHomeworks}
      initialTests={initialTests}
    />
  );
}
