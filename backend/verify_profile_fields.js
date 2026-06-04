/**
 * Prime Auction - Profile Fields Verification
 * Tests: province, gender, age saved and returned correctly
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
  section('1. CLIENT LOGIN');
  const login = await api('POST', '/api/auth/login', {
    email: 'cliente@primeauctions.com',
    password: '@Cliente123@'
  });
  if (login.status !== 200) { fail(`Login failed: ${JSON.stringify(login.body)}`); return; }
  pass('Client login OK');
  const token = login.body.token;

  section('2. UPDATE PROFILE WITH NEW FIELDS');
  const update = await api('PUT', '/api/auth/updateprofile', {
    province: 'Maputo Cidade',
    gender: 'Masculino',
    age: 30
  }, token);

  if (update.status === 200) {
    const u = update.body.user;
    pass(`Province saved: "${u.province}"`);
    pass(`Gender saved: "${u.gender}"`);
    pass(`Age saved: ${u.age}`);
  } else {
    fail(`Update failed: ${JSON.stringify(update.body)}`);
    return;
  }

  section('3. VERIFY FIELDS ON /api/auth/me');
  const me = await api('GET', '/api/auth/me', null, token);
  if (me.status === 200) {
    const u = me.data || me.body.data;
    const province = u?.province;
    const gender   = u?.gender;
    const age      = u?.age;
    if (province === 'Maputo Cidade') pass(`Province persisted: "${province}"`);
    else fail(`Province mismatch: "${province}"`);
    if (gender === 'Masculino') pass(`Gender persisted: "${gender}"`);
    else fail(`Gender mismatch: "${gender}"`);
    if (age === 30) pass(`Age persisted: ${age}`);
    else fail(`Age mismatch: ${age}`);
  } else {
    fail(`GET /me failed: ${JSON.stringify(me.body)}`);
  }

  section('4. RESET FIELDS (cleanup)');
  const reset = await api('PUT', '/api/auth/updateprofile', {
    province: null,
    gender: null,
    age: null
  }, token);
  if (reset.status === 200) pass('Fields reset to null for clean state');
  else fail(`Reset failed: ${JSON.stringify(reset.body)}`);

  console.log('\n' + '═'.repeat(50));
  console.log('  PROFILE FIELDS VERIFICATION COMPLETE');
  console.log('═'.repeat(50) + '\n');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
