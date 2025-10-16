// Reseed Symposium (restaurantId=3) menu into DB against a base URL
// Usage: BASE_URL=http://localhost:3003 node scripts/reseed-symposium.js

const fs = require('fs');

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const email = process.env.ADMIN_EMAIL || 'andre@symposium.com';
  const password = process.env.ADMIN_PASS || 'admin123';

  let token = '';
  try {
    if (fs.existsSync('/tmp/login_admin.json')) {
      const raw = fs.readFileSync('/tmp/login_admin.json', 'utf8');
      const parsed = JSON.parse(raw);
      token = parsed.token || '';
    }
  } catch (e) {}

  if (!token) {
    const authResp = await fetch(`${baseUrl}/api/restaurant-admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await authResp.json();
    if (!authResp.ok || !data.token) {
      console.error('Login failed:', data);
      process.exit(1);
    }
    token = data.token;
    try { fs.writeFileSync('/tmp/login_admin.json', JSON.stringify(data)); } catch (e) {}
  }

  const reseedResp = await fetch(`${baseUrl}/api/restaurant-admin/menu-db/reseed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ restaurantId: '3' })
  });
  const reseedData = await reseedResp.json();
  if (!reseedResp.ok) {
    console.error('Reseed failed:', reseedData);
    process.exit(1);
  }
  console.log('Reseed success:', reseedData);
}

main().catch(err => { console.error(err); process.exit(1); });


