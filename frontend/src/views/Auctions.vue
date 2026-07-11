<template>
  <div class="auctions-container">
    <div class="container animate-fade-in" style="padding-top: 100px; padding-bottom: 60px;">
      <div class="page-header">
        <h2 class="page-title">
          {{ route.query.search ? `Resultados para: "${route.query.search}"` : 'Leilões Activos' }}
        </h2>
        <p class="page-subtitle">Encontre os melhores leilões e faça o seu lance agora</p>
        
        <!-- Filtros Activos -->
        <div v-if="route.query.search || route.query.status || route.query.category" class="active-filters">
          <span v-if="route.query.search" class="filter-badge">
            Pesquisa: <strong>{{ route.query.search }}</strong>
            <button @click="clearSearch" class="clear-btn" title="Limpar pesquisa">&times;</button>
          </span>
          <span v-if="route.query.status" class="filter-badge">
            Estado: <strong>{{ route.query.status === 'active' ? 'Ativo' : 'Terminado' }}</strong>
            <button @click="clearStatus" class="clear-btn" title="Limpar estado">&times;</button>
          </span>
          <span v-if="route.query.category" class="filter-badge">
            Categoria: <strong>{{ route.query.category }}</strong>
            <button @click="clearCategory" class="clear-btn" title="Limpar categoria">&times;</button>
          </span>
        </div>
      </div>

      <!-- Category Filter Bar (Horizontal Chips) -->
      <div class="categories-bar">
        <button 
          @click="selectCategory('')" 
          class="category-chip" 
          :class="{ active: !route.query.category }"
        >
          <span>🏷️ Todos</span>
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat._id" 
          @click="selectCategory(cat.name)" 
          class="category-chip" 
          :class="{ active: route.query.category === cat.name }"
        >
          <span>{{ getCategoryEmoji(cat.name) }} {{ cat.name }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else-if="auctions.length === 0" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h3>Nenhum leilão disponível</h3>
        <p>De momento não existem leilões activos. Volte mais tarde.</p>
      </div>
      <div v-else class="auction-grid">
        <div
          v-for="auction in auctions"
          :key="auction.id"
          class="card auction-card"
          @click="goToAuction(auction._id)"
        >
          <div class="card-img-wrapper">
            <img :src="auction.imageUrl" :alt="auction.title" class="card-img" loading="lazy" />
            <div class="card-status" :class="auction.status">
              {{ auction.status === 'active' ? 'Activo' : (auction.status === 'upcoming' ? 'Agendado' : 'Terminado') }}
            </div>
          </div>
          <div class="card-content">
            <h3 class="auction-title">{{ auction.title }}</h3>
            <p class="auction-description">{{ auction.description?.slice(0, 80) }}{{ auction.description?.length > 80 ? '…' : '' }}</p>
            <div class="card-footer">
              <div class="price-col">
                <span class="price-label">{{ auction.status === 'upcoming' ? 'Preço inicial' : 'Lance actual' }}</span>
                <span class="price-value">{{ formatCurrency(auction.status === 'upcoming' ? auction.startingPrice : auction.currentPrice) }}</span>
              </div>
              <div class="time-col">
                <span class="price-label">{{ auction.status === 'upcoming' ? 'Começa em' : (auction.status === 'active' ? 'Termina em' : 'Terminado') }}</span>
                <span class="time-value" :style="{ color: auction.status === 'active' ? '#ef4444' : '#6b7280', fontWeight: '600' }">
                  {{ auction.status === 'finished' ? 'Terminado' : getCountdownText(auction.status === 'upcoming' ? auction.startTime : auction.endTime) }}
                </span>
              </div>
            </div>
            <div class="card-cta">
              <span class="cta-text">Ver Leilão →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

const auctions = ref([]);
const categories = ref([]);
const loading = ref(true);
const router = useRouter();
const route = useRoute();

const fetchCategories = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/categories`);
    categories.value = res.data.data;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

const fetchAuctions = async () => {
  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const searchVal = route.query.search || '';
    const statusVal = route.query.status || '';
    const categoryVal = route.query.category || '';
    
    let url = `${apiUrl}/api/auctions`;
    const params = [];
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    if (statusVal) params.push(`status=${encodeURIComponent(statusVal)}`);
    if (categoryVal) params.push(`category=${encodeURIComponent(categoryVal)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const res = await axios.get(url);
    auctions.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const selectCategory = (catName) => {
  const query = { ...route.query };
  if (catName) {
    query.category = catName;
  } else {
    delete query.category;
  }
  router.push({ path: '/auctions', query });
};

const clearSearch = () => {
  const query = { ...route.query };
  delete query.search;
  router.push({ path: '/auctions', query });
};

const clearStatus = () => {
  const query = { ...route.query };
  delete query.status;
  router.push({ path: '/auctions', query });
};

const clearCategory = () => {
  selectCategory('');
};

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

// --- Countdown timer logic ---
const now = ref(new Date());
let countdownInterval = null;

const getCountdownText = (targetDateString) => {
  if (!targetDateString) return '';
  const diff = new Date(targetDateString).getTime() - now.value.getTime();
  if (diff <= 0) return 'Terminado';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

const getCategoryEmoji = (name) => {
  const norm = name.toLowerCase();
  if (norm.includes('veiculo') || norm.includes('carro') || norm.includes('moto') || norm.includes('automovel')) return '🚗';
  if (norm.includes('imovel') || norm.includes('casa') || norm.includes('apartamento') || norm.includes('equipamento')) return '🏠';
  if (norm.includes('eletronica') || norm.includes('tecnologia') || norm.includes('computador') || norm.includes('telemovel')) return '💻';
  if (norm.includes('mobiliario') || norm.includes('decoracao') || norm.includes('moveis')) return '🪑';
  if (norm.includes('maquinaria') || norm.includes('industrial') || norm.includes('fabrica')) return '🏭';
  if (norm.includes('outro') || norm.includes('geral') || norm.includes('bens')) return '📦';
  return '🏷️';
};

// Watch query parameters
watch(() => route.query.search, () => {
  fetchAuctions();
});
watch(() => route.query.status, () => {
  fetchAuctions();
});
watch(() => route.query.category, () => {
  fetchAuctions();
});

onMounted(() => {
  fetchCategories();
  fetchAuctions();
  
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.auctions-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  margin-bottom: 2.5rem;
}

/* ─── Categories Bar ─── */
.categories-bar {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem 1.5rem;
  margin-bottom: 2rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.categories-bar::-webkit-scrollbar {
  display: none;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 30px;
  background-color: #ffffff;
  color: var(--text-secondary);
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-chip:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.category-chip.active {
  background-color: #1a56db;
  color: #ffffff;
  border-color: #1a56db;
  box-shadow: 0 4px 14px rgba(26, 86, 219, 0.3);
  font-weight: 600;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--btn-secondary-bg);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #e5e7eb;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-light);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: rgba(0,0,0,0.1);
  color: var(--text-primary);
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-light);
}

/* ─── Auction Grid ─── */
.auction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.auction-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auction-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

/* ─── Card Image ─── */
.card-img-wrapper {
  position: relative;
  height: 210px;
  overflow: hidden;
  background-color: #eee;
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

.card-status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-status.active {
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
}

.card-status.upcoming {
  background-color: rgba(255, 152, 0, 0.9);
  color: white;
}

.card-status.finished {
  background-color: rgba(0,0,0,0.5);
  color: white;
}

/* ─── Card Content ─── */
.card-content {
  padding: 1.25rem 1.5rem 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
}

.auction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.auction-description {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.55;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.price-col, .time-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-col {
  text-align: right;
}

.price-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  font-weight: 500;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--btn-primary-bg);
}

.time-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.card-cta {
  margin-top: 1rem;
}

.cta-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--btn-primary-bg);
  transition: letter-spacing 0.2s ease;
}

.auction-card:hover .cta-text {
  letter-spacing: 0.5px;
}

/* ─── Loading skeletons ─── */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 380px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Empty state ─── */
.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9rem;
}

/* ─── Mobile ─── */
@media (max-width: 580px) {
  .auction-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
}
</style>
