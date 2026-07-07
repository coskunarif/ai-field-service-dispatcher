import net from 'net';

const client = new net.Socket();
client.setTimeout(5000);

console.log('Connecting to 216.239.34.21:443 (gainhelm.com)...');
client.connect(443, '216.239.34.21', () => {
  console.log('Connected successfully!');
  client.destroy();
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
  client.destroy();
});

client.on('timeout', () => {
  console.error('Connection timed out!');
  client.destroy();
});
