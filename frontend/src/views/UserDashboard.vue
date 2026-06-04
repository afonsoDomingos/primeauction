<template>
  <div class="dashboard-container">
    <div class="container animate-fade-in" style="padding-top: 100px; padding-bottom: 80px;">

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</div>
        <div class="profile-info">
          <h2 class="page-title" style="margin-bottom: 0.25rem;">{{ authStore.user?.name }}</h2>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <span class="status-badge" :class="authStore.user?.status">
            {{ authStore.user?.status === 'active' ? 'Activo' : 'Bloqueado' }}
          </span>
        </div>
        <button @click="logout" class="btn btn-logout">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ bids.length }}</span>
          <span class="stat-label">Lances Dados</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ uniqueAuctions }}</span>
          <span class="stat-label">Leilões Activos</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ formatCurrencyCompact(totalBid) }}</span>
          <span class="stat-label">Total Licitado</span>
        </div>
      </div>

      <!-- Bid History -->
      <div class="card bids-card">
        <div class="bids-header">
          <h3 class="section-title">Histórico de Lances</h3>
          <router-link v-if="bids.length > 0" to="/auctions" class="btn btn-primary btn-pill btn-sm">
            Explorar Mais
          </router-link>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>A carregar lances...</p>
        </div>

        <div v-else-if="bids.length === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>
          <h4>Ainda não fez nenhum lance</h4>
          <p>Explore os leilões activos e faça o seu primeiro lance!</p>
          <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
            Ver Leilões Activos
          </router-link>
        </div>

        <ul v-else class="bid-list">
          <li v-for="bid in bids" :key="bid._id" class="bid-item">
            <div class="bid-img-wrap" v-if="bid.auction?.imageUrl">
              <img :src="bid.auction.imageUrl" :alt="bid.auction.title" class="bid-img" />
            </div>
            <div class="bid-img-wrap placeholder-img" v-else>🏷️</div>

            <div class="bid-details">
              <strong class="bid-auction-title">{{ bid.auction?.title || 'Leilão Removido' }}</strong>
              <span class="bid-date">{{ new Date(bid.createdAt).toLocaleString('pt-MZ') }}</span>
            </div>

            <div class="bid-right">
              <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
              <router-link
                v-if="bid.auction"
                :to="`/auction/${bid.auction._id}`"
                class="btn btn-secondary btn-sm btn-pill"
              >Ver</router-link>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const bids = ref([]);
const loading = ref(true);

const uniqueAuctions = computed(() => {
  const ids = new Set(bids.value.map(b => b.auction?._id).filter(Boolean));
  return ids.size;
});

const totalBid = computed(() => {
  return bids.value.reduce((sum, b) => sum + (b.amount || 0), 0);
});

const fetchMyBids = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/bids/mybids`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    bids.value = res.data.data;
  } catch (err) {
    console.error('Error fetching bids:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { fetchMyBids(); });

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);

const formatCurrencyCompact = (value) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M MZN';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K MZN';
  return value + ' MZN';
};

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* ── Profile Header ── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--btn-primary-bg), #7b5ea7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info {
  flex-grow: 1;
}

.page-title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
}

.profile-email {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.blocked {
  background-color: #fdecea;
  color: #c62828;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.btn-logout:hover {
  background-color: #fdecea;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.stat-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  color: var(--btn-primary-bg);
  line-height: 1;
  margin-bottom: 0.4rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ── Bids Card ── */
.bids-card {
  padding: 1.75rem;
  border-radius: 12px;
}

.bids-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-light);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
}

/* ── Bid List ── */
.bid-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bid-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.bid-item:hover {
  background-color: #fafafa;
}

.bid-img-wrap {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.bid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.bid-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.bid-auction-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bid-date {
  font-size: 0.75rem;
  color: var(--text-light);
}

.bid-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.bid-amount {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--btn-primary-bg);
  white-space: nowrap;
}

.btn-sm {
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem 0.5rem;
  }

  .btn-logout {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .bids-card {
    padding: 1.25rem;
  }

  .bid-item {
    flex-wrap: wrap;
  }

  .bid-right {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: 0.25rem;
  }
}

@media (max-width: 380px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
