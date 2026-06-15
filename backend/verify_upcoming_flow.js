require('dotenv').config();
const mongoose = require('mongoose');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const User = require('./models/User');

const API_URL = 'http://localhost:5000';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runVerification = async () => {
  let createdAuction = null;

  try {
    // 1. Connect to DB to fetch users
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- Step 1: Connected to DB for verification ---');

    const adminUser = await User.findOne({ email: 'admin@primeauctions.com' });
    const clientUser = await User.findOne({ email: 'cliente@primeauctions.com' });

    if (!adminUser || !clientUser) {
      throw new Error('Test users are not seeded. Run seed first.');
    }

    // 2. Obtain JWT tokens via Login API
    console.log('--- Step 2: Logging in via API to obtain JWT tokens ---');
    
    const adminLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@primeauctions.com', password: '@Admin123@' })
    });
    
    if (!adminLoginRes.ok) {
      throw new Error(`Admin login failed: ${adminLoginRes.statusText}`);
    }
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('✓ Admin login successful');

    const clientLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cliente@primeauctions.com', password: '@Cliente123@' })
    });
    
    if (!clientLoginRes.ok) {
      throw new Error(`Client login failed: ${clientLoginRes.statusText}`);
    }
    const clientLoginData = await clientLoginRes.json();
    const clientToken = clientLoginData.token;
    console.log('✓ Client login successful');

    // 3. Create an auction starting in 5 seconds and ending in 30 seconds
    console.log('--- Step 3: Admin creating an upcoming auction (starts in 5s) ---');
    const startTime = new Date(Date.now() + 5000); // 5 seconds from now
    const endTime = new Date(Date.now() + 30000); // 30 seconds from now
    
    const auctionRes = await fetch(`${API_URL}/api/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Leilao Agendado para Teste',
        description: 'Validacao de leilao com inicio futuro e bloqueio de lances.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80',
        startingPrice: 10000,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: 'Outros'
      })
    });
    
    if (!auctionRes.ok) {
      throw new Error(`Create auction failed: ${auctionRes.statusText}`);
    }
    const auctionResData = await auctionRes.json();
    createdAuction = auctionResData.data;
    const auctionId = createdAuction._id;
    console.log(`✓ Auction created: "${createdAuction.title}" (ID: ${auctionId}), status in response: ${createdAuction.status}`);

    if (createdAuction.status !== 'upcoming') {
      throw new Error(`FAIL: Initial status should be "upcoming", got "${createdAuction.status}"`);
    }
    console.log('✓ SUCCESS: Initial status is "upcoming"');

    // 4. Try to place a bid on it right away (should fail)
    console.log('--- Step 4: Placing a bid before start time (should be blocked) ---');
    const prematureBidRes = await fetch(`${API_URL}/api/bids/${auctionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({ amount: 12000 })
    });

    if (prematureBidRes.ok) {
      throw new Error('FAIL: Placed bid successfully before start time!');
    } else {
      const errorData = await prematureBidRes.json();
      if (prematureBidRes.status === 400 && errorData.error === 'Este leilão ainda não começou') {
        console.log('✓ SUCCESS: Bid blocked with: "Este leilão ainda não começou"');
      } else {
        throw new Error(`FAIL: Unexpected error response when placing premature bid: ${errorData.error}`);
      }
    }

    // 5. Wait for the auction start time to pass
    console.log('--- Step 5: Waiting 6 seconds for start time to pass ---');
    await sleep(6000);

    // 6. Fetch auction details (validating on-demand activation)
    console.log('--- Step 6: Fetching auction details to verify activation ---');
    const getRes = await fetch(`${API_URL}/api/auctions/${auctionId}`);
    if (!getRes.ok) {
      throw new Error(`Fetch auction failed: ${getRes.statusText}`);
    }
    const getResData = await getRes.json();
    const activeAuction = getResData.data;
    console.log(`✓ Auction fetched. Status is: "${activeAuction.status}"`);

    if (activeAuction.status !== 'active') {
      throw new Error(`FAIL: Status should have transitioned to "active", got "${activeAuction.status}"`);
    }
    console.log('✓ SUCCESS: Status auto-transitioned to "active"');

    // 7. Place a bid now (should succeed)
    console.log('--- Step 7: Placing a bid now that it has started ---');
    const validBidRes = await fetch(`${API_URL}/api/bids/${auctionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({ amount: 15000 })
    });

    if (!validBidRes.ok) {
      const errorData = await validBidRes.json();
      throw new Error(`FAIL: Failed to place valid bid: ${errorData.error}`);
    }
    const validBidData = await validBidRes.json();
    console.log(`✓ Bid placed successfully. Amount: ${validBidData.data.amount} MZN`);

    console.log('\n=========================================');
    console.log('🎉 ALL UPCOMING FLOW VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    // Clean up DB
    console.log('\n--- Step 8: Cleaning up test data from Database ---');
    if (createdAuction) {
      await Bid.deleteMany({ auction: createdAuction._id });
      await Auction.deleteOne({ _id: createdAuction._id });
      console.log('✓ Deleted test bids and auction');
    }
    await mongoose.disconnect();
    console.log('✓ Disconnected DB. Exiting.');
    process.exit(0);
  }
};

runVerification();
