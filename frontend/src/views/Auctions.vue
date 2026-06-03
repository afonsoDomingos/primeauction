<template>
  <div class="auctions-container">
    <div class="container animate-fade-in" style="padding-top: 100px;">
      <h2 class="page-title">Available Auctions</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else class="auction-grid">
        <div v-for="auction in auctions" :key="auction.id" class="card auction-card" @click="goToAuction(auction._id)">
          <div class="card-img-wrapper">
            <img :src="auction.imageUrl" :alt="auction.title" class="card-img" />
          </div>
          <div class="card-content">
            <h3 class="auction-title">{{ auction.title }}</h3>
            <div class="price-row">
              <span class="price-label">Current Bid:</span>
              <span class="price-value">{{ formatCurrency(auction.currentPrice) }}</span>
            </div>
            <div class="time-row">
              <span>Ends: {{ new Date(auction.endTime).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const auctions = ref([]);
const loading = ref(true);
const router = useRouter();

const fetchAuctions = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/auctions`);
    auctions.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

onMounted(() => {
  fetchAuctions();
});
</script>

<style scoped>
.auctions-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}
.page-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-weight: 600;
}
.auction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding-bottom: 4rem;
}
.auction-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.card-img-wrapper {
  height: 200px;
  overflow: hidden;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.auction-card:hover .card-img {
  transform: scale(1.05);
}
.card-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.auction-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 500;
}
.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.price-value {
  font-weight: 600;
  color: var(--text-primary);
}
.time-row {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: auto;
}
</style>
