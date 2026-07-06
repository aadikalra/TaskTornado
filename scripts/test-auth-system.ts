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
  console.error('❌ Missing required environment variables');
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

// Test function to verify Google user detection
async function testGoogleUserDetection() {
  console.log('🧪 Testing Google user detection logic...\n');
  
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('ℹ️  No users found');
    return;
  }
  
  console.log(`📊 Testing ${users.length} user(s):\n`);
  
  users.forEach((user, index) => {
    console.log(`👤 User ${index + 1}: ${user.email}`);
    
    // Test the same logic used in AuthContext
    const isGoogleUser = user.app_metadata?.provider === 'google';
    
    console.log(`   Google User: ${isGoogleUser ? '✅ Yes' : '❌ No'}`);
    console.log(`   Provider (app_metadata): ${user.app_metadata?.provider || 'None'}`);
    console.log(`   Provider (user_metadata): ${user.user_metadata?.provider || 'None'}`);
    console.log(`   Email domain: ${user.email?.split('@')[1] || 'Unknown'}`);
    console.log(`   Email verified: ${user.user_metadata?.email_verified ? 'Yes' : 'No'}`);
    console.log('---');
  });
  
  console.log('\n✅ Google user detection test completed!');
  console.log('📝 The authentication system now uses Supabase Auth instead of profiles table');
}

// Run the test
testGoogleUserDetection().catch(console.error);
