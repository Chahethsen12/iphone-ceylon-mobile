import http from 'http';

const postData = JSON.stringify({
  customerInfo: {
    name: 'Firebase Test 3',
    email: 'test3@firebase.com',
    phone: '0771234567',
    address: '123 Cloud St',
    city: 'Colombo',
    postalCode: '00100'
  },
  orderItems: [{
    product: '60d21b4667d0d8992e610c85',
    name: 'iPhone 15 Pro',
    quantity: 1,
    price: 350000
  }],
  deliveryFee: 500,
  totalAmount: 350500,
  paymentMethod: 'Cash on Delivery'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
