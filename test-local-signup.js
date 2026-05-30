const url = 'http://localhost:3000/api/register';
const payload = {
  name: 'Test Local Debug',
  email: 'testdebug_' + Date.now() + '@gmail.com',
  password: 'password123',
  role: 'CUSTOMER'
};

async function test() {
  try {
    console.log("Sending signup request to local dev server...");
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const body = await res.json();
    console.log('Body:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
