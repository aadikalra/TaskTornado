import { Metadata } from 'next';
import { getDashboardData } from '@/lib/data-loader';
import { createClient } from '@/lib/supabase/server';
import { Class, Homework, Test } from '@/context/ClassContext';
import { ClassProvider } from '@/context/ClassContext';
import { HomeworkProvider } from '@/context/HomeworkContext';
import { TestProvider } from '@/context/TestContext';
import { ToastProvider } from '@/context/ToastContext';
import { redirect } from 'next/navigation';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
    title: 'Calendar | TaskTornado',
    description: 'View your academic calendar with homework deadlines, tests, and school events.',
    robots: {
        index: false,
        follow: true,
    },
};

export default async function CalendarPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login?redirectTo=%2Fcalendar');
    }

    let initialClasses: Class[] = [];
    let initialHomeworks: Homework[] = [];
    let initialTests: Test[] = [];

    try {
        const { classes, homeworks, tests } = await getDashboardData(supabase, session.user);
        initialClasses = classes;
        initialHomeworks = homeworks;
        initialTests = tests;
    } catch (error) {
        console.error('Error prefetching calendar data:', error);
    }

    return (
        <ToastProvider>
            <ClassProvider initialClasses={initialClasses}>
                <HomeworkProvider initialHomeworks={initialHomeworks}>
                    <TestProvider initialTests={initialTests}>
                        <CalendarClient />
                    </TestProvider>
                </HomeworkProvider>
            </ClassProvider>
        </ToastProvider>
    );
}
