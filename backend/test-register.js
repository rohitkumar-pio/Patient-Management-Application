const http = require('http');

const data = JSON.stringify({
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test Doctor',
  role: 'DOCTOR'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:');
    console.log(responseData);
    try {
      const json = JSON.parse(responseData);
      console.log('\nParsed Response:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
