#!/usr/bin/env tsx

// Create a simple way to load env vars
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

// Debug: Check if env vars are loaded
console.log('Environment check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing');
console.log('');

import { printAllUserProfiles } from '../lib/supabase/admin';

async function main() {
  await printAllUserProfiles();
}

main().catch(console.error);
