import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

// Lazily create the admin client so that a missing key only throws at
// runtime (when the client is actually used), not at build time when
// Next.js imports this module during static page generation.
let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      '❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      '📋 Add it to your deployment environment variables (e.g. Vercel dashboard)\n' +
      '   or to your local .env.local file.\n' +
      '📍 Find it in: Supabase Dashboard → Project Settings → API → service_role key'
    );
  }
  if (!_adminClient) {
    _adminClient = createClient<Database>(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _adminClient;
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getAdminClient();
    return (client as any)[prop];
  },
});

// Function to get all auth users
export async function getAllAuthUsers() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }
    
    return users;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

// Function to print user profiles
export async function printAllUserProfiles() {
  console.log('🔍 Fetching all user profiles from Supabase Auth...\n');
  
  const users = await getAllAuthUsers();
  
  if (!users) {
    console.log('❌ Failed to fetch users');
    return;
  }
  
  console.log(`✅ Found ${users.length} user(s):\n`);
  
  users.forEach((user, index) => {
    console.log(`👤 User ${index + 1}:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Phone: ${user.phone || 'Not provided'}`);
    console.log(`   User Metadata:`, user.user_metadata);
    console.log(`   App Metadata:`, user.app_metadata);
    console.log('---');
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total Users: ${users.length}`);
  console.log(`   Confirmed Emails: ${users.filter(u => u.email_confirmed_at).length}`);
  console.log(`   Users with Last Sign In: ${users.filter(u => u.last_sign_in_at).length}`);
}
