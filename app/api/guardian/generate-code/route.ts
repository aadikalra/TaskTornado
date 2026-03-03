import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Characters excluding ambiguous ones (O/0/I/1/L)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(length = 6): string {
    return Array.from({ length }, () =>
        CHARSET[Math.floor(Math.random() * CHARSET.length)]
    ).join('');
}

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user is a student (guardians shouldn't generate codes)
        const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();

        if (profile?.account_type === 'guardian') {
            return NextResponse.json(
                { error: 'Only student accounts can generate invite codes' },
                { status: 403 }
            );
        }

        // Rate limiting: max 5 codes per student per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count } = await supabase
            .from('link_invites')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .gte('created_at', today.toISOString());

        if ((count ?? 0) >= 5) {
            return NextResponse.json(
                { error: 'You can only generate 5 invite codes per day' },
                { status: 429 }
            );
        }

        // Generate a unique code
        let code = generateCode();
        let attempts = 0;

        // Retry if code collision (very unlikely)
        while (attempts < 5) {
            const { data: existing } = await supabase
                .from('link_invites')
                .select('id')
                .eq('code', code)
                .maybeSingle();

            if (!existing) break;
            code = generateCode();
            attempts++;
        }

        // Set expiry to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { error: insertError } = await supabase
            .from('link_invites')
            .insert({
                student_id: user.id,
                code,
                expires_at: expiresAt,
            });

        if (insertError) {
            console.error('Failed to create invite code:', insertError);
            return NextResponse.json(
                { error: 'Failed to generate invite code' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            code,
            expiresAt,
        });
    } catch (error) {
        console.error('Generate code error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
