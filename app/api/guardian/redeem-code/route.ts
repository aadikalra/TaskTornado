import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user is a guardian
        const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();

        if (profile?.account_type !== 'guardian') {
            return NextResponse.json(
                { error: 'Only guardian accounts can redeem invite codes' },
                { status: 403 }
            );
        }

        const { code } = await req.json();

        if (!code || typeof code !== 'string' || code.length !== 6) {
            return NextResponse.json(
                { error: 'Invalid code format. Please enter a 6-character code.' },
                { status: 400 }
            );
        }

        const normalizedCode = code.toUpperCase().trim();

        // Look up the code
        const { data: invite, error: lookupError } = await supabase
            .from('link_invites')
            .select('*')
            .eq('code', normalizedCode)
            .is('used_by', null)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (lookupError || !invite) {
            return NextResponse.json(
                { error: 'Invalid or expired code. Please ask your child for a new code.' },
                { status: 404 }
            );
        }

        // Prevent self-linking
        if (invite.student_id === user.id) {
            return NextResponse.json(
                { error: 'You cannot link to your own account.' },
                { status: 400 }
            );
        }

        // Check for existing active link
        const { data: existingLink } = await supabase
            .from('parent_links')
            .select('id')
            .eq('parent_id', user.id)
            .eq('student_id', invite.student_id)
            .eq('status', 'active')
            .maybeSingle();

        if (existingLink) {
            return NextResponse.json(
                { error: 'You are already linked to this student.' },
                { status: 409 }
            );
        }

        // Create the parent-student link
        const { error: linkError } = await supabase
            .from('parent_links')
            .insert({
                parent_id: user.id,
                student_id: invite.student_id,
            });

        if (linkError) {
            console.error('Failed to create parent link:', linkError);
            return NextResponse.json(
                { error: 'Failed to link accounts. Please try again.' },
                { status: 500 }
            );
        }

        // Mark the invite code as used
        await supabase
            .from('link_invites')
            .update({
                used_by: user.id,
                used_at: new Date().toISOString(),
            })
            .eq('id', invite.id);

        // Get the student's profile for the response
        const { data: studentProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', invite.student_id)
            .single();

        return NextResponse.json({
            success: true,
            student: {
                id: invite.student_id,
                name: studentProfile?.full_name ?? 'Student',
                email: studentProfile?.email ?? null,
            },
        });
    } catch (error) {
        console.error('Redeem code error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
