async function run() {
  console.log('Fetching https://gainhelm.com/ using Node fetch...');
  try {
    const res = await fetch('https://gainhelm.com/');
    console.log('Status:', res.status);
    console.log('Server:', res.headers.get('server'));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();
