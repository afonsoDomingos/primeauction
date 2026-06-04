/**
 * Prime Auction - Settings API Verification
 * Tests: homepage settings CRUD, authentication & authorization limits
 */

const BASE = 'http://localhost:5000';

const api = async (method, path, body, token) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body)  opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  return { status: res.status, body: json };
};

const pass = (msg) => console.log(`  ✅  ${msg}`);
const fail = (msg) => console.log(`  ❌  ${msg}`);
const section = (msg) => console.log(`\n${'─'.repeat(50)}\n  ${msg}\n${'─'.repeat(50)}`);

async function run() {
  section('1. AUTHENTICATING ACCOUNTS');
  
  // Admin Login
  const adminLogin = await api('POST', '/api/auth/login', {
    email: 'admin@primeauctions.com',
    password: '@Admin123@'
  });
  if (adminLogin.status !== 200) {
    fail(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    return;
  }
  const adminToken = adminLogin.body.token;
  pass('Admin authenticated successfully');

  // Client Login
  const clientLogin = await api('POST', '/api/auth/login', {
    email: 'cliente@primeauctions.com',
    password: '@Cliente123@'
  });
  if (clientLogin.status !== 200) {
    fail(`Client login failed: ${JSON.stringify(clientLogin.body)}`);
    return;
  }
  const clientToken = clientLogin.body.token;
  pass('Client authenticated successfully');

  section('2. PUBLIC ACCESS: GET CURRENT SETTINGS');
  const getInitial = await api('GET', '/api/settings/homepage');
  if (getInitial.status === 200) {
    pass(`Current settings exist: ${JSON.stringify(getInitial.body.data)}`);
  } else if (getInitial.status === 404) {
    pass('Settings not found (expected default/first-run behavior)');
  } else {
    fail(`Unexpected GET status: ${getInitial.status} - ${JSON.stringify(getInitial.body)}`);
  }

  section('3. PRIVILEGED ACCESS: UPDATE SETTINGS (ADMIN)');
  const testPayload = {
    heroTitle: 'Prime Leilões Moçambique',
    heroSubtitle: 'A melhor plataforma de leilões do país.',
    heroImageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200',
    heroImageUrls: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200',
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=1200'
    ],
    heroMobileImageUrls: [
      'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600'
    ]
  };

  const updateRes = await api('PUT', '/api/settings/homepage', testPayload, adminToken);
  if (updateRes.status === 200) {
    pass('Admin successfully updated homepage settings');
    const d = updateRes.body.data;
    if (d.heroTitle === testPayload.heroTitle && d.heroSubtitle === testPayload.heroSubtitle) {
      pass('Updated fields match payload');
    } else {
      fail(`Response data mismatch: ${JSON.stringify(d)}`);
    }
  } else {
    fail(`Admin update failed (status ${updateRes.status}): ${JSON.stringify(updateRes.body)}`);
  }

  section('4. SECURITY ACCESS: UPDATE SETTINGS (CLIENT - MUST BE BLOCKED)');
  const unauthorizedUpdate = await api('PUT', '/api/settings/homepage', {
    heroTitle: 'Hacked Title'
  }, clientToken);

  if (unauthorizedUpdate.status === 403) {
    pass('Client request correctly rejected with 403 Forbidden');
  } else {
    fail(`Client request was NOT blocked (status ${unauthorizedUpdate.status}): ${JSON.stringify(unauthorizedUpdate.body)}`);
  }

  section('5. PUBLIC ACCESS: VERIFY PERSISTENCE');
  const getUpdated = await api('GET', '/api/settings/homepage');
  if (getUpdated.status === 200) {
    const d = getUpdated.body.data;
    if (
      d.heroTitle === testPayload.heroTitle &&
      d.heroSubtitle === testPayload.heroSubtitle &&
      d.heroImageUrl === testPayload.heroImageUrl &&
      Array.isArray(d.heroImageUrls) &&
      d.heroImageUrls.length === 2 &&
      d.heroImageUrls[1] === testPayload.heroImageUrls[1] &&
      Array.isArray(d.heroMobileImageUrls) &&
      d.heroMobileImageUrls.length === 1 &&
      d.heroMobileImageUrls[0] === testPayload.heroMobileImageUrls[0]
    ) {
      pass('Persisted settings retrieved successfully and match (including multiple desktop and mobile URLs)');
    } else {
      fail(`Retrieved settings mismatch: ${JSON.stringify(d)}`);
    }
  } else {
    fail(`Failed to retrieve settings (status ${getUpdated.status}): ${JSON.stringify(getUpdated.body)}`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('  SETTINGS VERIFICATION COMPLETE');
  console.log('═'.repeat(50) + '\n');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
