/**
 * Prime Auction — CRUD Flow Verification
 * Tests: Create, Read, Update, Delete on Auctions + Bids
 */

const BASE = 'http://localhost:5000';

const api = async (method, path, body, token) => {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body)  opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  return { status: res.status, body: json };
};

const pass = (msg) => console.log(`  ✅  ${msg}`);
const fail = (msg) => console.log(`  ❌  ${msg}`);
const info = (msg) => console.log(`  ℹ️   ${msg}`);
const section = (t) => console.log(`\n${'─'.repeat(52)}\n  ${t}\n${'─'.repeat(52)}`);

async function run() {
  /* ── AUTH ── */
  section('AUTH — Admin & Client Login');
  const adminRes  = await api('POST', '/api/auth/login', { email: 'admin@primeauctions.com',   password: '@Admin123@'   });
  const clientRes = await api('POST', '/api/auth/login', { email: 'cliente@primeauctions.com', password: '@Cliente123@' });

  if (adminRes.status  === 200) pass('Admin login OK');  else { fail(`Admin login FAILED: ${JSON.stringify(adminRes.body)}`);  return; }
  if (clientRes.status === 200) pass('Client login OK'); else { fail(`Client login FAILED: ${JSON.stringify(clientRes.body)}`); return; }

  const A = adminRes.body.token;
  const C = clientRes.body.token;

  /* ── CREATE ── */
  section('CREATE — Novo Leilão (POST /api/auctions)');
  const endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h from now
  const createRes = await api('POST', '/api/auctions', {
    title: '[CRUD Test] Relógio Vintage',
    description: 'Leilão criado pelo script de verificação CRUD.',
    imageUrl: 'https://via.placeholder.com/400',
    startingPrice: 200,
    endTime,
  }, A);

  if (createRes.status === 201) {
    pass(`Leilão criado  →  ID: ${createRes.body.data._id}  |  preço inicial: ${createRes.body.data.startingPrice} MZN`);
  } else {
    fail(`Criação FAILED: ${JSON.stringify(createRes.body)}`); return;
  }
  const id = createRes.body.data._id;

  /* ── READ (list) ── */
  section('READ — Listar todos os leilões (GET /api/auctions)');
  const listRes = await api('GET', '/api/auctions');
  if (listRes.status === 200) {
    pass(`Lista obtida  →  ${listRes.body.count} leilões no total`);
    const found = listRes.body.data.find(a => a._id === id);
    found ? pass('Novo leilão aparece na lista') : fail('Novo leilão NÃO aparece na lista');
  } else {
    fail(`Lista FAILED: ${JSON.stringify(listRes.body)}`);
  }

  /* ── READ (single) ── */
  section(`READ — Leilão individual (GET /api/auctions/${id})`);
  const getRes = await api('GET', `/api/auctions/${id}`);
  if (getRes.status === 200) {
    const a = getRes.body.data;
    pass(`Leilão encontrado  →  "${a.title}"  status: ${a.status}`);
  } else {
    fail(`GET individual FAILED: ${JSON.stringify(getRes.body)}`);
  }

  /* ── UPDATE ── */
  section(`UPDATE — Editar leilão (PUT /api/auctions/${id})`);
  const updateRes = await api('PUT', `/api/auctions/${id}`, {
    title: '[CRUD Test] Relógio Vintage — EDITADO',
    description: 'Descrição actualizada pelo script de verificação.',
    startingPrice: 250,
  }, A);

  if (updateRes.status === 200) {
    const a = updateRes.body.data;
    pass(`Leilão actualizado  →  novo título: "${a.title}"`);
    a.startingPrice === 250 ? pass('Preço actualizado correctamente (250 MZN)') : fail(`Preço esperado 250, recebido ${a.startingPrice}`);
  } else {
    fail(`Update FAILED: ${JSON.stringify(updateRes.body)}`);
  }

  /* ── BID (Create) ── */
  section('BID — Colocar lance (POST /api/bids/:id)');
  const bidRes = await api('POST', `/api/bids/${id}`, { amount: 350 }, C);
  if (bidRes.status === 201) {
    pass(`Lance de 350 MZN registado  →  bid ID: ${bidRes.body.data._id}`);
  } else {
    fail(`Lance FAILED: ${JSON.stringify(bidRes.body)}`);
  }

  /* ── BID (Read) ── */
  section('BID — Listar lances do leilão (GET /api/bids/:id)');
  const bidsRes = await api('GET', `/api/bids/${id}`);
  if (bidsRes.status === 200) {
    pass(`${bidsRes.body.count} lance(s) encontrado(s) para este leilão`);
    bidsRes.body.data.forEach((b, i) => info(`  Lance ${i+1}: ${b.amount} MZN por ${b.user?.name}`));
  } else {
    fail(`Listar lances FAILED: ${JSON.stringify(bidsRes.body)}`);
  }

  /* ── MY BIDS ── */
  section('BID — Meus lances (GET /api/bids/mybids)');
  const myRes = await api('GET', '/api/bids/mybids', null, C);
  if (myRes.status === 200) {
    pass(`${myRes.body.count} lance(s) no histórico do cliente`);
  } else {
    fail(`My bids FAILED: ${JSON.stringify(myRes.body)}`);
  }

  /* ── ADMIN CANNOT BID ── */
  section('SEGURANÇA — Admin não pode licitar');
  const adminBidRes = await api('POST', `/api/bids/${id}`, { amount: 9999 }, A);
  adminBidRes.status !== 201
    ? pass(`Admin bloqueado correctamente (status ${adminBidRes.status}): "${adminBidRes.body.error}"`)
    : fail('Admin conseguiu colocar lance — FALHA DE SEGURANÇA!');

  /* ── DELETE ── */
  section(`DELETE — Eliminar leilão (DELETE /api/auctions/${id})`);
  const delRes = await api('DELETE', `/api/auctions/${id}`, null, A);
  if (delRes.status === 200) {
    pass('Leilão eliminado com sucesso');
  } else {
    fail(`Delete FAILED: ${JSON.stringify(delRes.body)}`);
  }

  /* ── CONFIRM DELETED ── */
  section('CONFIRM — Leilão já não existe após delete');
  const afterDel = await api('GET', `/api/auctions/${id}`);
  afterDel.status === 404
    ? pass('GET retorna 404 — leilão correctamente removido da BD')
    : fail(`Esperado 404, recebido ${afterDel.status}`);

  console.log('\n' + '═'.repeat(52));
  console.log('  CRUD VERIFICATION COMPLETE');
  console.log('═'.repeat(52) + '\n');
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
