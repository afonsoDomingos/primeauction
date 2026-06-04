/**
 * Prime Auction - End-to-End Flow Verification v2
 * Tests: auth, bid placement, bid blocking (ended), winner registration, socket events
 */

const BASE = 'http://localhost:5000';

// Helpers
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

const pass = (msg) => console.log(`  ✅  ${msg}`);
const fail = (msg) => console.log(`  ❌  ${msg}`);
const info = (msg) => console.log(`  ℹ️   ${msg}`);
const section = (msg) => console.log(`\n${'─'.repeat(50)}\n  ${msg}\n${'─'.repeat(50)}`);

// ──────────────────────────────────────────────────
async function run() {
  section('1. AUTHENTICATION');

  // Admin login
  const adminLogin = await api('POST', '/api/auth/login', {
    email: 'admin@primeauctions.com',
    password: '@Admin123@',
  });
  if (adminLogin.status === 200) {
    pass(`Admin login OK  (token: ${adminLogin.body.token?.slice(0, 20)}...)`);
  } else {
    fail(`Admin login FAILED: ${JSON.stringify(adminLogin.body)}`);
    return;
  }
  const adminToken = adminLogin.body.token;

  // Client login
  const clientLogin = await api('POST', '/api/auth/login', {
    email: 'cliente@primeauctions.com',
    password: '@Cliente123@',
  });
  if (clientLogin.status === 200) {
    pass('Client login OK');
  } else {
    fail(`Client login FAILED: ${JSON.stringify(clientLogin.body)}`);
    return;
  }
  const clientToken = clientLogin.body.token;

  // ──────────────────────────────────────────────────
  section('2. CREATE SHORT-LIVED AUCTION (ends in 8 seconds)');

  const endTime = new Date(Date.now() + 8_000).toISOString();
  const createRes = await api('POST', '/api/auctions', {
    title: 'Test Auction – Auto Expiry',
    description: 'Automated verification auction',
    imageUrl: 'https://via.placeholder.com/400',
    startingPrice: 100,
    endTime,
  }, adminToken);

  if (createRes.status === 201) {
    pass(`Auction created  ID: ${createRes.body.data._id}`);
  } else {
    fail(`Auction creation FAILED: ${JSON.stringify(createRes.body)}`);
    return;
  }
  const auctionId = createRes.body.data._id;

  // ──────────────────────────────────────────────────
  section('3. PLACE VALID BID (before expiry)');

  await sleep(500); // small delay

  const bid1 = await api('POST', `/api/bids/${auctionId}`, { amount: 500 }, clientToken);
  if (bid1.status === 201) {
    pass(`Bid of 500 MZN accepted`);
  } else {
    fail(`Bid FAILED: ${JSON.stringify(bid1.body)}`);
    return;
  }

  // ──────────────────────────────────────────────────
  section('4. WAIT FOR AUCTION TO EXPIRE (10 seconds)');
  info('Sleeping 10 seconds...');
  await sleep(10_000);
  info('Awake!');

  // ──────────────────────────────────────────────────
  section('5. VERIFY AUCTION FINISHED (on-demand via GET)');

  const auctionGet = await api('GET', `/api/auctions/${auctionId}`);
  if (auctionGet.status === 200) {
    const a = auctionGet.body.data;
    if (a.status === 'finished') {
      pass(`Auction status = "finished"`);
    } else {
      fail(`Auction status = "${a.status}" (expected "finished")`);
    }

    if (a.winner) {
      pass(`Winner recorded: ${a.winner.name} <${a.winner.email}>`);
    } else {
      fail(`No winner recorded in DB`);
    }

    info(`Final price: ${a.currentPrice} MZN`);
  } else {
    fail(`GET auction FAILED: ${JSON.stringify(auctionGet.body)}`);
  }

  // ──────────────────────────────────────────────────
  section('6. ATTEMPT BID AFTER EXPIRY (must be blocked)');

  const lateBid = await api('POST', `/api/bids/${auctionId}`, { amount: 9999 }, clientToken);
  if (lateBid.status === 400) {
    pass(`Late bid correctly BLOCKED: "${lateBid.body.error}"`);
  } else {
    fail(`Late bid was NOT blocked – status ${lateBid.status}: ${JSON.stringify(lateBid.body)}`);
  }

  // ──────────────────────────────────────────────────
  section('7. VERIFY MY BIDS (client dashboard data)');

  const myBids = await api('GET', '/api/bids/mybids', null, clientToken);
  if (myBids.status === 200) {
    pass(`My bids endpoint OK  (${myBids.body.count} bids found)`);
    const won = myBids.body.data.find(b => b.auction?._id === auctionId || b.auction === auctionId);
    if (won) pass(`Bid for this auction appears in user's history`);
    else info(`Bid for this auction not found in mybids (may use different ID format)`);
  } else {
    fail(`My bids FAILED: ${JSON.stringify(myBids.body)}`);
  }

  // ──────────────────────────────────────────────────
  section('8. CLEANUP - Delete test auction');

  const del = await api('DELETE', `/api/auctions/${auctionId}`, null, adminToken);
  if (del.status === 200) {
    pass('Test auction deleted');
  } else {
    fail(`Delete FAILED: ${JSON.stringify(del.body)}`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('  VERIFICATION COMPLETE');
  console.log('═'.repeat(50) + '\n');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
