import { getDashboardData } from '@/lib/data-loader';
import DashboardClient from './DashboardClient';
import { createClient } from '@/lib/supabase/server';
import { Class, Homework, Test } from '@/context/ClassContext';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let initialClasses: Class[] = [];
  let initialHomeworks: Homework[] = [];
  let initialTests: Test[] = [];

  if (session) {
    const { classes, homeworks, tests } = await getDashboardData(supabase, session.user);
    initialClasses = classes;
    initialHomeworks = homeworks;
    initialTests = tests;
  }

  return (
    <DashboardClient
      initialClasses={initialClasses}
      initialHomeworks={initialHomeworks}
      initialTests={initialTests}
    />
  );
}
