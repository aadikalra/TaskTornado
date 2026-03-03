import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch active links where this user is the parent
        const { data: links, error: linksError } = await supabase
            .from('parent_links')
            .select('student_id, created_at')
            .eq('parent_id', user.id)
            .eq('status', 'active');

        if (linksError) {
            console.error('Failed to fetch linked children:', linksError);
            return NextResponse.json(
                { error: 'Failed to fetch linked children' },
                { status: 500 }
            );
        }

        if (!links?.length) {
            return NextResponse.json({ children: [] });
        }

        // Get student profiles
        const studentIds = links.map(l => l.student_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds);

        const children = links.map(link => {
            const profile = profiles?.find(p => p.id === link.student_id);
            return {
                id: link.student_id,
                name: profile?.full_name ?? 'Student',
                email: profile?.email ?? null,
                linkedAt: link.created_at,
            };
        });

        return NextResponse.json({ children });
    } catch (error) {
        console.error('Get children error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
