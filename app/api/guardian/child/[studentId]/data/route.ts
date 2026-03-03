import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId } = await params;

        // Verify the guardian has an active link to this student
        const { data: link, error: linkError } = await supabase
            .from('parent_links')
            .select('id')
            .eq('parent_id', user.id)
            .eq('student_id', studentId)
            .eq('status', 'active')
            .maybeSingle();

        if (linkError || !link) {
            return NextResponse.json(
                { error: 'You do not have access to this student\'s data' },
                { status: 403 }
            );
        }

        // Fetch student profile
        const { data: studentProfile } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', studentId)
            .single();

        // Fetch student's classes
        const { data: classes } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', studentId)
            .order('name', { ascending: true });

        // Fetch student's homework
        const { data: homework } = await supabase
            .from('homework')
            .select('*, classes(*)')
            .eq('user_id', studentId)
            .order('due_date', { ascending: true });

        // Fetch student's tests
        const { data: tests } = await supabase
            .from('tests')
            .select('*, classes(*)')
            .eq('user_id', studentId)
            .order('test_date', { ascending: true });

        // Compute summary stats
        const allHomework = homework ?? [];
        const totalHomework = allHomework.length;
        const completedHomework = allHomework.filter((hw: any) => hw.completed).length;
        const completionRate = totalHomework > 0
            ? Math.round((completedHomework / totalHomework) * 100)
            : 0;

        const now = new Date();
        const overdueHomework = allHomework.filter((hw: any) =>
            !hw.completed && new Date(hw.due_date) < now
        ).length;

        const upcomingHomework = allHomework.filter((hw: any) =>
            !hw.completed && new Date(hw.due_date) >= now
        ).length;

        const allTests = tests ?? [];
        const upcomingTests = allTests.filter((t: any) =>
            new Date(t.test_date) >= now &&
            t.status !== 'completed' &&
            t.status !== 'taken'
        ).length;

        return NextResponse.json({
            student: {
                id: studentId,
                name: studentProfile?.full_name ?? 'Student',
                email: studentProfile?.email ?? null,
            },
            classes: classes ?? [],
            homework: allHomework,
            tests: allTests,
            summary: {
                totalHomework,
                completedHomework,
                completionRate,
                overdueHomework,
                upcomingHomework,
                totalTests: allTests.length,
                upcomingTests,
            },
        });
    } catch (error) {
        console.error('Get child data error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
