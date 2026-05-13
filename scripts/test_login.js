const http = require('http');
const data = JSON.stringify({ idUsuario: 11, clave: '123456' });
const options = {
  hostname: 'localhost',
  port: 8082,
  path: '/LinkedApi/Login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let d = '';
  res.on('data', (chunk) => d += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', d);
  });
});
req.on('error', (e) => console.error('ERROR', e.message));
req.write(data);
req.end();
