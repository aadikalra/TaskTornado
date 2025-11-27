#!/usr/bin/env tsx

// Load environment variables first
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line: string) => {
    // Skip comments and empty lines
    if (line.trim() && !line.trim().startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > -1) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

// Now import Supabase after env vars are loaded
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(
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
async function getAllAuthUsers() {
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
async function printAllUserProfiles() {
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

// Run the function
printAllUserProfiles().catch(console.error);
