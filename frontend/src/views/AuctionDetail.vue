<template>
  <div class="auction-detail-container" v-if="auction">
    <div class="split-layout">
      <!-- Left side: Image full bleed -->
      <div class="image-side" :style="{ backgroundImage: `url(${auction.imageUrl})` }">
      </div>
      
      <!-- Right side: Content and Bidding -->
      <div class="content-side">
        <div class="content-wrapper animate-fade-in">
          <h1 class="title">{{ auction.title }}</h1>
          <p class="description">{{ auction.description }}</p>
          
          <div class="status-box">
            <div class="price-info">
              <span class="label">Current Bid</span>
              <span class="price highlight">{{ formatCurrency(auction.currentPrice) }}</span>
            </div>
            <div class="time-info">
              <span class="label">Ends At</span>
              <span class="time">{{ new Date(auction.endTime).toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="bidding-section" v-if="!isEnded">
            <h3 class="section-title">Place a Bid</h3>
            <div v-if="!authStore.isAuthenticated" class="auth-warning">
              <router-link to="/login">Sign in</router-link> to place a bid.
            </div>
            <div v-else-if="authStore.isAdmin" class="auth-warning">
              Admins cannot participate in auctions.
            </div>
            <form v-else @submit.prevent="placeBid" class="bid-form">
              <div class="input-with-button">
                <span class="currency-prefix">MZN</span>
                <input 
                  type="number" 
                  v-model="bidAmount" 
                  class="form-input bid-input" 
                  :min="auction.currentPrice + 1"
                  required 
                />
                <button type="submit" class="btn btn-primary btn-pill">Bid Now</button>
              </div>
              <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
            </form>
          </div>
          <div v-else class="ended-section">
            <h3 class="section-title">Auction Ended</h3>
            <p>This auction is no longer active.</p>
          </div>

          <!-- Bids History -->
          <div class="history-section">
            <h3 class="section-title">Bid History</h3>
            <ul class="bid-list">
              <li v-for="bid in bids" :key="bid._id" class="bid-item">
                <span class="bid-user">{{ bid.user.name }}</span>
                <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
              </li>
              <li v-if="bids.length === 0" class="no-bids">No bids yet. Be the first!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-full">
    Loading...
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

const route = useRoute();
const authStore = useAuthStore();
const auction = ref(null);
const bids = ref([]);
const bidAmount = ref(0);
const errorMsg = ref('');
let socket = null;

const isEnded = computed(() => {
  if (!auction.value) return true;
  return new Date() > new Date(auction.value.endTime) || auction.value.status === 'finished';
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const fetchAuctionData = async () => {
  try {
    const [auctionRes, bidsRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/auctions/${route.params.id}`),
      axios.get(`http://localhost:5000/api/bids/${route.params.id}`)
    ]);
    auction.value = auctionRes.data.data;
    bids.value = bidsRes.data.data;
    bidAmount.value = auction.value.currentPrice + 100; // Suggest slightly higher bid
  } catch (err) {
    console.error(err);
  }
};

const placeBid = async () => {
  errorMsg.value = '';
  try {
    await axios.post(`http://localhost:5000/api/bids/${route.params.id}`, 
      { amount: bidAmount.value },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    // Success - Socket will broadcast the update, no need to manually append here unless desired for instant local feel
    bidAmount.value = 0;
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Error placing bid';
  }
};

onMounted(() => {
  fetchAuctionData();

  // Socket setup
  socket = io('http://localhost:5000');
  
  socket.emit('join_auction', route.params.id);

  socket.on('new_bid', (data) => {
    // Update current price
    if (auction.value) {
      auction.value.currentPrice = data.currentPrice;
      // Auto-update suggested bid amount if the user hasn't typed a custom one
      if (bidAmount.value <= data.currentPrice) {
        bidAmount.value = data.currentPrice + 100;
      }
    }
    // Add to top of history
    bids.value.unshift(data.bid);
  });
});

onUnmounted(() => {
  if (socket) {
    socket.emit('leave_auction', route.params.id);
    socket.disconnect();
  }
});
</script>

<style scoped>
.auction-detail-container {
  height: 100vh;
  width: 100%;
}
.split-layout {
  display: flex;
  height: 100%;
}
.image-side {
  flex: 6;
  background-size: cover;
  background-position: center;
}
.content-side {
  flex: 4;
  background-color: var(--bg-color);
  overflow-y: auto;
  padding: 100px 3rem 3rem 3rem;
  box-shadow: -10px 0 30px rgba(0,0,0,0.05);
}
.title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}
.status-box {
  background-color: #f9fafb;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  border: 1px solid #eee;
}
.label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}
.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}
.time {
  font-size: 1.1rem;
  font-weight: 500;
}
.section-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 500;
}
.input-with-button {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.currency-prefix {
  font-weight: 500;
  color: var(--text-secondary);
}
.bid-input {
  flex-grow: 1;
}
.bid-list {
  list-style: none;
  margin-top: 1rem;
}
.bid-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.bid-user {
  font-weight: 500;
}
.bid-amount {
  font-weight: 600;
}
.no-bids {
  color: var(--text-light);
  font-style: italic;
  padding: 1rem 0;
}
.error-msg {
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
.auth-warning {
  padding: 1rem;
  background-color: #fff3cd;
  color: #856404;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}
.loading-full {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.5rem;
}

@media (max-width: 992px) {
  .split-layout {
    flex-direction: column;
  }
  .image-side {
    height: 50vh;
    flex: none;
  }
  .content-side {
    height: auto;
    padding: 2rem;
  }
}
</style>
