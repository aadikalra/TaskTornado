import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user profile and data (Supabase DB)
    // Note: Foreign keys referencing auth.users with ON DELETE CASCADE will handle cascading deletes,
    // but we can manually clean up the profile record to be safe.
    await supabaseAdmin.from('profiles').delete().eq('id', user.id);

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Success response
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
  }
}
