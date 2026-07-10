async function run() {
  const url = 'https://gainhelm-web-250134012801.us-central1.run.app/api/validate-calendar';
  console.log(`Posting to ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ calendar_url: 'not-a-valid-url' }),
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (err) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error cause:', err.cause);
    console.error('Error stack:', err.stack);
  }
}

run();
