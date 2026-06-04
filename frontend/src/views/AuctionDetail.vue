<template>
  <div v-if="auction" class="auction-detail-container">
    <div class="split-layout">
      <!-- Left: Image -->
      <div class="image-side" :style="{ backgroundImage: `url(${auction.imageUrl})` }">
        <div class="image-overlay">
          <button class="back-btn" @click="$router.back()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </button>
        </div>
      </div>

      <!-- Right: Content & Bidding -->
      <div class="content-side">
        <div class="content-wrapper animate-fade-in">

          <!-- Status badge -->
          <span class="status-badge" :class="isEnded ? 'ended' : 'active'">
            {{ isEnded ? 'Terminado' : 'Activo' }}
          </span>

          <h1 class="title">{{ auction.title }}</h1>
          <p class="description">{{ auction.description }}</p>
          
          <!-- Price & Timer -->
          <div class="status-box">
            <div class="info-col">
              <span class="label">Lance Actual</span>
              <span class="price highlight">{{ formatCurrency(auction.currentPrice) }}</span>
            </div>
            <div class="info-col info-col-right">
              <span class="label">Termina Em</span>
              <span class="time">{{ new Date(auction.endTime).toLocaleString('pt-MZ') }}</span>
            </div>
          </div>
          
          <!-- Bid Form -->
          <div class="bidding-section" v-if="!isEnded">
            <h3 class="section-title">Fazer Lance</h3>
            <div v-if="!authStore.isAuthenticated" class="auth-warning">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <router-link to="/login">Faça login</router-link> para licitar.
            </div>
            <div v-else-if="authStore.isAdmin" class="auth-warning">
              Administradores não podem participar nos leilões.
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
                <button type="submit" class="btn btn-primary btn-pill bid-submit">Lance!</button>
              </div>
              <p v-if="bidSuccess" class="success-msg">✓ Lance registado com sucesso!</p>
              <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
            </form>
          </div>

          <div v-else class="ended-section">
            <h3 class="section-title">Leilão Terminado</h3>
            <p class="ended-text">Este leilão já não está activo.</p>
          </div>

          <!-- Bids History -->
          <div class="history-section">
            <h3 class="section-title">Histórico de Lances <span class="bid-count">{{ bids.length }}</span></h3>
            <ul class="bid-list">
              <li v-for="(bid, index) in bids" :key="bid._id" class="bid-item" :class="{ 'top-bid': index === 0 }">
                <div class="bid-left">
                  <div class="bid-avatar">{{ bid.user?.name?.charAt(0)?.toUpperCase() }}</div>
                  <span class="bid-user">{{ bid.user?.name }}</span>
                  <span v-if="index === 0" class="leader-badge">Líder</span>
                </div>
                <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
              </li>
              <li v-if="bids.length === 0" class="no-bids">
                Sem lances ainda. Seja o primeiro!
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-full">
    <div class="spinner"></div>
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
const bidSuccess = ref(false);
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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [auctionRes, bidsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/auctions/${route.params.id}`),
      axios.get(`${apiUrl}/api/bids/${route.params.id}`)
    ]);
    auction.value = auctionRes.data.data;
    bids.value = bidsRes.data.data;
    bidAmount.value = auction.value.currentPrice + 100;
  } catch (err) {
    console.error(err);
  }
};

const placeBid = async () => {
  errorMsg.value = '';
  bidSuccess.value = false;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.post(
      `${apiUrl}/api/bids/${route.params.id}`,
      { amount: bidAmount.value },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    bidSuccess.value = true;
    setTimeout(() => { bidSuccess.value = false; }, 3000);
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Erro ao registar lance';
  }
};

onMounted(() => {
  fetchAuctionData();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  socket = io(apiUrl);
  socket.emit('join_auction', route.params.id);

  socket.on('new_bid', (data) => {
    if (auction.value) {
      auction.value.currentPrice = data.currentPrice;
      if (bidAmount.value <= data.currentPrice) {
        bidAmount.value = data.currentPrice + 100;
      }
    }
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
/* ─── Container ─── */
.auction-detail-container {
  min-height: 100vh;
  width: 100%;
}

.split-layout {
  display: flex;
  min-height: 100vh;
}

/* ─── Image Side ─── */
.image-side {
  flex: 6;
  background-size: cover;
  background-position: center;
  position: sticky;
  top: 0;
  height: 100vh;
}

.image-overlay {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%);
  display: flex;
  align-items: flex-start;
  padding: 90px 2rem 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.35);
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.28);
}

/* ─── Content Side ─── */
.content-side {
  flex: 4;
  background-color: var(--bg-color);
  overflow-y: auto;
  padding: 90px 2.5rem 3rem;
  box-shadow: -8px 0 30px rgba(0,0,0,0.05);
}

/* ─── Status Badge ─── */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.12);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.ended {
  background-color: rgba(0,0,0,0.06);
  color: var(--text-light);
}

/* ─── Title & Description ─── */
.title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  line-height: 1.2;
}

.description {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* ─── Status Box ─── */
.status-box {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border: 1px solid #ebebeb;
  gap: 1rem;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-col-right {
  text-align: right;
}

.label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  font-weight: 600;
}

.price {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--btn-primary-bg);
  line-height: 1;
}

.time {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* ─── Section Titles ─── */
.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bid-count {
  background-color: var(--btn-primary-bg);
  color: white;
  border-radius: 20px;
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  font-weight: 700;
}

/* ─── Bid Form ─── */
.bid-form {
  margin-bottom: 2rem;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.currency-prefix {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.bid-input {
  flex-grow: 1;
  min-width: 0;
}

.bid-submit {
  white-space: nowrap;
  flex-shrink: 0;
}

.success-msg {
  color: #2e7d32;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

.error-msg {
  color: var(--danger-color);
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.auth-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: #fff8e6;
  color: #856404;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #fceab0;
}

.auth-warning a {
  color: var(--btn-primary-bg);
  font-weight: 600;
}

/* ─── Ended Section ─── */
.ended-section {
  margin-bottom: 2rem;
}

.ended-text {
  color: var(--text-light);
  font-size: 0.9rem;
}

/* ─── Bid List ─── */
.history-section {
  margin-top: 1.5rem;
}

.bid-list {
  list-style: none;
}

.bid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.bid-item:hover {
  background-color: #fafafa;
}

.bid-item.top-bid {
  background-color: #f0f5ff;
}

.bid-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bid-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: var(--btn-primary-bg);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.bid-user {
  font-weight: 500;
  font-size: 0.9rem;
}

.leader-badge {
  background-color: #ffd700;
  color: #7a5a00;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.bid-amount {
  font-weight: 700;
  color: var(--btn-primary-bg);
  font-size: 0.95rem;
}

.no-bids {
  color: var(--text-light);
  font-style: italic;
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.9rem;
}

/* ─── Loading ─── */
.loading-full {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Tablet ─── */
@media (max-width: 992px) {
  .split-layout {
    flex-direction: column;
    min-height: auto;
  }

  .image-side {
    height: 45vh;
    min-height: 280px;
    position: relative;
    top: auto;
    flex: none;
  }

  .content-side {
    flex: none;
    padding: 2rem 1.5rem 3rem;
    box-shadow: none;
  }
}

/* ─── Mobile ─── */
@media (max-width: 480px) {
  .status-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .info-col-right {
    text-align: left;
  }

  .input-with-button {
    flex-wrap: wrap;
  }

  .bid-input {
    width: 100%;
  }

  .bid-submit {
    width: 100%;
  }
}
</style>
