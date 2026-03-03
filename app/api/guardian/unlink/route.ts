import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId } = await req.json();

        if (!studentId) {
            return NextResponse.json(
                { error: 'studentId is required' },
                { status: 400 }
            );
        }

        // Either the parent or the student can unlink
        const { data: link, error: linkError } = await supabase
            .from('parent_links')
            .select('id, parent_id, student_id')
            .or(`parent_id.eq.${user.id},student_id.eq.${user.id}`)
            .eq('student_id', studentId)
            .eq('status', 'active')
            .maybeSingle();

        if (linkError || !link) {
            return NextResponse.json(
                { error: 'No active link found' },
                { status: 404 }
            );
        }

        // Verify the current user is part of this link
        if (link.parent_id !== user.id && link.student_id !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to unlink this connection' },
                { status: 403 }
            );
        }

        // Revoke the link
        const { error: updateError } = await supabase
            .from('parent_links')
            .update({
                status: 'revoked',
                updated_at: new Date().toISOString(),
            })
            .eq('id', link.id);

        if (updateError) {
            console.error('Failed to unlink:', updateError);
            return NextResponse.json(
                { error: 'Failed to unlink accounts' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unlink error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
