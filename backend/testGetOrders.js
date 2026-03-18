import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    try {
      const orders = JSON.parse(body);
      console.log(`Successfully fetched ${orders.length} orders from fallback!`);
      if (orders.length > 0) {
        console.log('Last order:', JSON.stringify(orders[0], null, 2));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.log('Response body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
