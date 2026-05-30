const url = 'https://tailor-match.vercel.app/api/register';
const payload = {
  name: 'Test Live Debug',
  email: 'testdebug_' + Date.now() + '@gmail.com',
  password: 'password123',
  role: 'CUSTOMER'
};

async function test() {
  try {
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
