const apiKey = process.env.RESEND_API_KEY;

async function listTemplates() {
  if (!apiKey) {
    console.error('RESEND_API_KEY is required.');
    process.exitCode = 1;
    return;
  }

  console.log('Listing Resend templates...');
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
