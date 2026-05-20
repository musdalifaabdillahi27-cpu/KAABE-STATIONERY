const http = require('http');
const loginData = JSON.stringify({ username: 'staff', password: 'staff123', role: 'staff' });
const loginOptions = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('LOGIN', res.statusCode, body);
    if (res.statusCode !== 200) return;

    const token = JSON.parse(body).token;
    const debtData = JSON.stringify({
      customerName: 'Test User',
      phone: '+1234567890',
      issueDate: '2026-04-29',
      totalAmount: 100,
      amountPaid: 20,
      status: 'Partial',
      notes: 'Test debt',
    });
    const debtOptions = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/debts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(debtData),
        Authorization: 'Bearer ' + token,
      },
    };
    const debtReq = http.request(debtOptions, (res2) => {
      let body2 = '';
      res2.on('data', (chunk) => (body2 += chunk));
      res2.on('end', () => {
        console.log('CREATE', res2.statusCode, body2);
        const getOptions = {
          hostname: '127.0.0.1',
          port: 3000,
          path: '/api/debts',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        };
        const getReq = http.request(getOptions, (res3) => {
          let body3 = '';
          res3.on('data', (chunk) => (body3 += chunk));
          res3.on('end', () => {
            console.log('GET', res3.statusCode, body3);
          });
        });
        getReq.on('error', (err) => console.error(err));
        getReq.end();
      });
    });
    debtReq.on('error', (err) => console.error(err));
    debtReq.write(debtData);
    debtReq.end();
  });
});
loginReq.on('error', (err) => console.error(err));
loginReq.write(loginData);
loginReq.end();
