// Using global fetch (available natively in Node 18+)

// Test payload matching the shape Supabase sends to the Send Email Hook
const payload = {
  user: {
    id: 'test-user-id',
    email: 'caraadi8@gmail.com', // Change to your email to test receiving it
  },
  email_data: {
    token: 'test-token',
    token_hash: 'test-token-hash',
    redirect_to: 'http://localhost:3000/dashboard',
    email_action_type: 'signup',
    site_url: 'http://localhost:3000',
  }
};

async function testHook() {
  const url = 'http://localhost:3000/api/auth/send-email';
  console.log(`🚀 Sending test request to local hook: ${url}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mock a basic signature header
        'x-supabase-signature': 't=123456,v1=test-sig-value',
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ Error hitting local route:', error.message);
  }
}

testHook();
