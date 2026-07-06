const apiKey = 're_CJtffQ9z_KGSnphwAw5KSAiBV2AXSX5gK';

async function listTemplates() {
  console.log('🔍 Listing Resend templates...');
  try {
    const res = await fetch('https://api.resend.com/templates', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      console.error('Error listing templates:', await res.text());
      return;
    }

    const data = await res.json();
    console.log('Templates:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listTemplates();
