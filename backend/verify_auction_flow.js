require('dotenv').config();
const mongoose = require('mongoose');
const { io } = require('socket.io-client');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const User = require('./models/User');

const API_URL = 'http://localhost:5000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runVerification = async () => {
  let socket = null;
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

    // 2. Obtain JWT tokens via Login API using native fetch
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

    // 3. Create an auction ending in 8 seconds
    console.log('--- Step 3: Admin creating a temporary auction (ends in 8s) ---');
    const endTime = new Date(Date.now() + 8000); // 8 seconds from now
    
    const auctionRes = await fetch(`${API_URL}/api/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Verificacao Responsividade e WebSockets',
        description: 'Leilao de teste para validar propagacao em tempo real e bloqueio pós fim.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80',
        startingPrice: 10000,
        endTime: endTime.toISOString()
      })
    });
    
    if (!auctionRes.ok) {
      throw new Error(`Create auction failed: ${auctionRes.statusText}`);
    }
    const auctionResData = await auctionRes.json();
    createdAuction = auctionResData.data;
    const auctionId = createdAuction._id;
    console.log(`✓ Auction created: "${createdAuction.title}" (ID: ${auctionId}), ends at ${endTime.toLocaleTimeString()}`);

    // 4. Connect client to Socket.io and join auction room
    console.log('--- Step 4: Connecting client via WebSockets ---');
    socket = io(API_URL);

    let socketConnected = false;
    socket.on('connect', () => {
      socketConnected = true;
      console.log(`✓ Socket connected: ${socket.id}`);
      socket.emit('join_auction', auctionId);
    });

    let socketBidReceived = null;
    let socketEndedReceived = null;

    socket.on('new_bid', (data) => {
      socketBidReceived = data;
      console.log(`📡 WebSocket Event [new_bid] received! Current Price: ${data.currentPrice} MZN`);
    });

    socket.on('auction_ended', (data) => {
      socketEndedReceived = data;
      console.log(`📡 WebSocket Event [auction_ended] received! Winner: ${data.winner ? data.winner.name : 'None'}, Winning Bid: ${data.winningBid} MZN`);
    });

    await sleep(2500); // Wait for connection/room joins

    if (!socketConnected) {
      throw new Error('Socket failed to connect within 2.5 seconds.');
    }

    // 5. Place a bid and verify WebSocket propagation
    console.log('--- Step 5: Client placing a bid of 15,000 MZN ---');
    const bidRes = await fetch(`${API_URL}/api/bids/${auctionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({ amount: 15000 })
    });
    
    if (!bidRes.ok) {
      const errorData = await bidRes.json();
      throw new Error(`Place bid failed: ${errorData.error || bidRes.statusText}`);
    }
    const bidResData = await bidRes.json();
    const placedBid = bidResData.data;
    console.log(`✓ Bid request returned success. Bid Amount: ${placedBid.amount} MZN`);

    // Give socket a moment to propagate
    await sleep(2000);

    if (socketBidReceived && socketBidReceived.currentPrice === 15000) {
      console.log('✓ SUCCESS: WebSocket propagated price change instantly!');
    } else {
      throw new Error('FAIL: WebSocket did NOT propagate price change.');
    }

    // 6. Wait for the auction to expire
    console.log('--- Step 6: Waiting for the auction to expire (sleep 6 seconds) ---');
    await sleep(6000);

    // 7. Try to place a bid AFTER the auction has expired
    console.log('--- Step 7: Placing a bid after expiration ---');
    const postEndRes = await fetch(`${API_URL}/api/bids/${auctionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
      },
      body: JSON.stringify({ amount: 20000 })
    });
    
    if (postEndRes.ok) {
      throw new Error('FAIL: Server accepted a bid after the auction ended!');
    } else {
      const errorData = await postEndRes.json();
      if (postEndRes.status === 400 && errorData.error === 'This auction has ended') {
        console.log('✓ SUCCESS: Server correctly blocked subsequent bids with 400 Bad Request ("This auction has ended")');
      } else {
        throw new Error(`FAIL: Unexpected error response when placing post-end bid: ${errorData.error}`);
      }
    }

    // 8. Wait for cron or fetch via API to check winner registration
    console.log('--- Step 8: Fetching auction details to check winner registration ---');
    
    // Check if socket got the auction_ended broadcast
    if (socketEndedReceived) {
      console.log('✓ SUCCESS: WebSocket received [auction_ended] event immediately when auction expired!');
    } else {
      console.log('ℹ WebSocket did not trigger auction_ended yet, checking database/API');
    }

    const getRes = await fetch(`${API_URL}/api/auctions/${auctionId}`);
    if (!getRes.ok) {
      throw new Error(`Fetch auction failed: ${getRes.statusText}`);
    }
    const getResData = await getRes.json();
    const resolvedAuction = getResData.data;

    console.log(`Resolved Auction Status: ${resolvedAuction.status}`);
    console.log(`Resolved Auction Winner: ${resolvedAuction.winner ? resolvedAuction.winner.name : 'None'} (${resolvedAuction.winner ? resolvedAuction.winner.email : 'N/A'})`);

    if (resolvedAuction.status === 'finished' && resolvedAuction.winner && resolvedAuction.winner.email === 'cliente@primeauctions.com') {
      console.log('✓ SUCCESS: Auction finalized, status set to "finished", and winner registered correctly!');
    } else {
      throw new Error('FAIL: Auction status or winner was not registered correctly.');
    }

    console.log('\n=========================================');
    console.log('🎉 ALL FLOW VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('1. End-to-end user authentication & endpoints: OK');
    console.log('2. Instant WebSocket price propagation: OK');
    console.log('3. Post-expiration bid blocking: OK');
    console.log('4. Dynamic/Cron winner registration: OK');
    console.log('=========================================');

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    // Clean up DB
    console.log('\n--- Step 9: Cleaning up test data from Database ---');
    if (createdAuction) {
      await Bid.deleteMany({ auction: createdAuction._id });
      await Auction.deleteOne({ _id: createdAuction._id });
      console.log('✓ Deleted test bids and auction');
    }
    if (socket) {
      socket.disconnect();
      console.log('✓ Disconnected websocket client');
    }
    await mongoose.disconnect();
    console.log('✓ Disconnected DB. Exiting.');
    process.exit(0);
  }
};

runVerification();
