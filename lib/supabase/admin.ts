import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('📋 To get user profiles from auth, you need the service role key.');
  console.log('🔧 Add it to your .env.local file:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('📍 Where to find it:');
  console.log('   1. Go to your Supabase dashboard');
  console.log('   2. Navigate to Project Settings → API');
  console.log('   3. Copy the service_role (secret) key');
  console.log('   4. Add it to your .env.local file');
  process.exit(1);
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
