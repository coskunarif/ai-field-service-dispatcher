import dns from 'dns';

dns.resolve4('gainhelm.com', (err, addresses) => {
  if (err) {
    console.error('gainhelm.com error:', err);
  } else {
    console.log('gainhelm.com addresses:', addresses);
  }
});

dns.resolve4('gainhelm-web-250134012801.us-central1.run.app', (err, addresses) => {
  if (err) {
    console.error('cloud run error:', err);
  } else {
    console.log('cloud run addresses:', addresses);
  }
});
