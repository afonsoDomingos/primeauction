<template>
  <div class="user-container">
    <div class="container animate-fade-in" style="padding-top: 100px;">
      <h2 class="page-title">My Dashboard</h2>
      
      <div class="dashboard-content">
        <div class="profile-section card">
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {{ authStore.user?.name }}</p>
          <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
          <p><strong>Status:</strong> <span class="badge">{{ authStore.user?.status }}</span></p>
          <button @click="logout" class="btn btn-danger mt-4">Logout</button>
        </div>

        <div class="bids-section card">
          <h3>My Bid History</h3>
          <div v-if="loading">Loading bids...</div>
          <div v-else-if="bids.length === 0" class="text-muted">
            You haven't placed any bids yet.
            <br>
            <router-link to="/auctions" class="btn btn-primary mt-4">Explore Auctions</router-link>
          </div>
          <ul v-else class="bid-list">
            <li v-for="bid in bids" :key="bid._id" class="bid-item">
              <div class="bid-details">
                <strong>{{ bid.auction?.title || 'Unknown Auction' }}</strong>
                <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
                <span class="bid-date">{{ new Date(bid.createdAt).toLocaleString() }}</span>
              </div>
              <router-link v-if="bid.auction" :to="`/auction/${bid.auction._id}`" class="btn btn-secondary btn-sm">View</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const bids = ref([]);
const loading = ref(true);

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

onMounted(() => {
  fetchMyBids();
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background-color: #f9fafb;
}
.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
}
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}
.card {
  padding: 2rem;
}
.badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.mt-4 {
  margin-top: 1.5rem;
}
.text-muted {
  color: var(--text-light);
}
.bid-list {
  list-style: none;
  margin-top: 1rem;
}
.bid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}
.bid-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.bid-amount {
  font-weight: 600;
  color: var(--text-primary);
}
.bid-date {
  font-size: 0.75rem;
  color: var(--text-light);
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.user-container {
  min-height: 100vh;
  background-color: #f9fafb;
}
.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
}
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}
.card {
  padding: 2rem;
}
.badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.mt-4 {
  margin-top: 1.5rem;
}
.text-muted {
  color: var(--text-light);
}
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
