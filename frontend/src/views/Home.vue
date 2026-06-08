<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <!-- Background Slides for Cross-Fade -->
      <div class="hero-bg-slides">
        <div 
          v-for="(imgUrl, idx) in heroImagesList" 
          :key="idx" 
          class="hero-bg-slide"
          :class="{ active: idx === activeIndex }"
          :style="{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%), url(${imgUrl})` }"
        ></div>
      </div>

      <div class="hero-content animate-fade-in" style="z-index: 2; position: relative;">
        <p class="hero-eyebrow">Plataforma de Leilões #1 em Moçambique</p>
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-subtitle">{{ heroSubtitle }}</p>
      </div>
      
      <div class="hero-actions animate-fade-in" style="animation-delay: 0.3s; z-index: 2; position: relative;">
        <a @click.prevent="scrollDown" href="#search-section" class="btn btn-primary btn-pill hero-btn">Começar Pesquisa</a>
        <router-link to="/register" class="btn btn-secondary btn-pill hero-btn">Criar Conta</router-link>
      </div>

      <div class="down-arrow" @click="scrollDown" style="z-index: 2; position: relative;">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>

    <!-- Search Section (Pesquisar Veículos) -->
    <section class="search-section" id="search-section">
      <div class="container">
        <h2 class="search-section-title">Pesquisar Veículos</h2>
        <form @submit.prevent="handleSearch" class="search-bar-form">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Digite a marca, modelo ou palavra-chave..." 
              class="search-input"
            />
            <button type="submit" class="search-icon-btn" aria-label="Pesquisar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          <router-link to="/auctions" class="btn btn-advanced-search">Pesquisa Avançada</router-link>
        </form>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="partners-section">
      <div class="container">
        <div class="partners-grid">
          <!-- BCI Logo -->
          <div class="partner-logo" title="BCI">
            <span class="logo-text red-blue">BCI</span>
            <span class="logo-desc">Apoio Financeiro</span>
          </div>
          <!-- Millennium Bim -->
          <div class="partner-logo" title="Millennium bim">
            <span class="logo-text yellow-red">Millennium bim</span>
          </div>
          <!-- Standard Bank -->
          <div class="partner-logo" title="Standard Bank">
            <svg viewBox="0 0 100 24" width="95" height="22" fill="currentColor">
              <rect x="2" y="2" width="10" height="20" rx="1" fill="#0033a0" />
              <rect x="5" y="7" width="4" height="10" fill="#ffffff" />
            </svg>
            <span class="logo-text-sb">Standard Bank</span>
          </div>
          <!-- Santam -->
          <div class="partner-logo" title="Santam">
            <span class="logo-santam">Santam</span>
            <span class="logo-desc">Seguros</span>
          </div>
          <!-- MFC -->
          <div class="partner-logo" title="MFC">
            <span class="logo-mfc">MFC</span>
            <span class="logo-desc">Financiamento</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Auctions Section (Leilões ao Vivo) -->
    <section class="live-events-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title-premium">Leilões ao Vivo</h2>
          <router-link to="/auctions" class="view-all-link">Ver todos</router-link>
        </div>
        
        <div class="live-events-scroll-container">
          <div class="live-events-scroll">
            <div 
              v-for="event in liveEvents" 
              :key="event.id" 
              class="event-card"
            >
              <!-- Event Header Date -->
              <div class="event-card-header">
                <span>{{ event.dateText }}</span>
              </div>
              
              <!-- Event Body -->
              <div class="event-card-body">
                <div class="event-img-container">
                  <img :src="event.image" alt="Imagem do Evento" class="event-img" />
                </div>
                
                <div class="event-details">
                  <div class="detail-item">
                    <span class="detail-icon">🚗</span>
                    <span class="detail-text"><strong>{{ event.lots }}</strong> Lotes</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span class="detail-text">{{ event.location }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">📄</span>
                    <span class="detail-text">{{ event.code }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">🔨</span>
                    <span class="detail-text">{{ event.type }}</span>
                  </div>
                  
                  <div v-if="event.badge" class="event-custom-badge">
                    {{ event.badge }}
                  </div>
                </div>
              </div>
              
              <!-- Event Footer Buttons -->
              <div class="event-card-footer">
                <router-link to="/auctions" class="btn btn-event-outline">Catálogo</router-link>
                <router-link to="/auctions" class="btn btn-event-solid">Entrar no Leilão</router-link>
              </div>
              <div v-if="event.hasPreBid" class="event-prebid-note">
                Pré-licitação aberta. Faça o seu lance agora.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Sales Section (Vendas em Destaque) -->
    <section class="featured-sales-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title-premium">Vendas em Destaque</h2>
          <router-link to="/auctions" class="view-all-link">Ver todos</router-link>
        </div>

        <div v-if="loadingAuctions" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>A carregar destaques...</p>
        </div>
        
        <div v-else-if="featuredAuctions.length === 0" class="empty-state-card">
          <p>Nenhum leilão em destaque no momento.</p>
        </div>

        <div v-else class="sales-grid">
          <div 
            v-for="auction in featuredAuctions" 
            :key="auction._id"
            class="sales-card"
            @click="goToAuction(auction._id)"
          >
            <div class="sales-card-img-wrapper">
              <img :src="auction.imageUrl" :alt="auction.title" class="sales-card-img" />
              
              <!-- Badges Overlay -->
              <div class="badge-overlay-container">
                <span class="badge-item date-badge">
                  📅 {{ formatBadgeDate(auction.endTime) }}
                </span>
                <span class="badge-item bid-badge">
                  🔨 {{ auction.bids?.length || 0 }}
                </span>
                <button 
                  @click.stop="toggleLike(auction._id)" 
                  class="badge-item heart-badge"
                  :class="{ liked: isLiked(auction._id) }"
                  aria-label="Gostar"
                >
                  ❤️ {{ getLikesCount(auction._id) }}
                </button>
              </div>
            </div>

            <div class="sales-card-info">
              <h3 class="sales-car-title">{{ auction.title }}</h3>
              <div class="sales-price-row">
                <span class="sales-price-label">Lance Actual</span>
                <span class="sales-price-val">{{ formatCurrency(auction.currentPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What others are interested in Section (Mais Procurados / Próximos) -->
    <section class="interests-section">
      <div class="container">
        <h2 class="section-title-premium">Mais Procurados</h2>
        
        <div class="interests-grid">
          <div 
            v-for="item in comingSoonItems" 
            :key="item.id"
            class="interest-card"
          >
            <div class="interest-img-wrapper">
              <img :src="item.image" :alt="item.title" class="interest-img" />
              <span class="coming-soon-badge">Brevemente</span>
              
              <button 
                @click="toggleSoonLike(item)" 
                class="interest-heart-btn"
                :class="{ liked: item.liked }"
                aria-label="Gostar"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ item.likes }}</span>
              </button>
            </div>
            
            <div class="interest-info">
              <h3 class="interest-title">{{ item.title }}</h3>
              <p class="interest-sub">Leilão de Salvados</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section (Porquê escolher) -->
    <section class="features-section" id="features">
      <div class="container">
        <h2 class="features-title">Porquê escolher a Prime Auction?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lances em Tempo Real</h3>
            <p>Tecnologia WebSocket garante que todos vêem os lances instantaneamente, sem necessidade de atualizar a página.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Segurança Garantida</h3>
            <p>Autenticação JWT robusta e gestão completa de utilizadores pelo administrador da plataforma.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Leilões Exclusivos</h3>
            <p>Produtos de alta qualidade curados pela nossa equipa, garantindo leilões de prestígio e valor real.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Homepage customizable settings
const heroTitle = ref('Prime Auctions');
const heroSubtitle = ref('Leilões Exclusivos. Preços Competitivos. Totalmente Online.');
const heroImage = ref('https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
const heroImageUrls = ref([]);
const heroMobileImageUrls = ref([]);

// Search state
const searchQuery = ref('');

// Dynamic auctions
const featuredAuctions = ref([]);
const loadingAuctions = ref(true);

// Likes management (simulated per browser storage/session)
const likedAuctions = ref({});
const localLikesCount = ref({});

// Navigation slide control
const activeIndex = ref(0);
let intervalId = null;
const isMobileViewport = ref(window.innerWidth <= 768);

const onResize = () => {
  isMobileViewport.value = window.innerWidth <= 768;
  restartSlideshow();
};

const scrollDown = () => {
  const target = document.getElementById('search-section');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/auctions?search=${encodeURIComponent(searchQuery.value.trim())}`);
  } else {
    router.push('/auctions');
  }
};

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const formatBadgeDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  // pt-PT style: "seg, 8 de jun"
  let formatted = date.toLocaleDateString('pt-PT', options);
  // capitalize first letters
  return formatted.replace(/\b[a-z]/g, char => char.toUpperCase()).replace(' De ', ' ');
};

// Hero Slideshow
const heroImagesList = computed(() => {
  if (isMobileViewport.value && heroMobileImageUrls.value.length > 0) {
    return heroMobileImageUrls.value;
  }
  if (heroImageUrls.value.length > 0) {
    return heroImageUrls.value;
  }
  return [heroImage.value];
});

const restartSlideshow = () => {
  if (intervalId) clearInterval(intervalId);
  activeIndex.value = 0;
  if (heroImagesList.value.length > 1) {
    intervalId = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % heroImagesList.value.length;
    }, 5000);
  }
};

// Likes simulation logic
const initLikes = (id) => {
  if (localLikesCount.value[id] === undefined) {
    // Generate a realistic stable like count based on auction ID string
    const hex = id.substring(id.length - 4);
    const numeric = parseInt(hex, 16) || 0;
    localLikesCount.value[id] = (numeric % 150) + 12;
  }
};

const isLiked = (id) => {
  return !!likedAuctions.value[id];
};

const getLikesCount = (id) => {
  initLikes(id);
  return localLikesCount.value[id];
};

const toggleLike = (id) => {
  initLikes(id);
  if (likedAuctions.value[id]) {
    likedAuctions.value[id] = false;
    localLikesCount.value[id]--;
  } else {
    likedAuctions.value[id] = true;
    localLikesCount.value[id]++;
  }
};

// Live events mock list in Portuguese
const liveEvents = ref([
  {
    id: 1,
    dateText: 'Segunda, 8 Jun — 09:00',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    lots: 202,
    location: 'Nacional',
    code: 'Código 2',
    type: 'Apenas Online',
    hasPreBid: false,
    badge: ''
  },
  {
    id: 2,
    dateText: 'Terça, 9 Jun — 09:00',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    lots: 200,
    location: 'Nacional',
    code: 'Código 2',
    type: 'Apenas Online',
    hasPreBid: true,
    badge: ''
  },
  {
    id: 3,
    dateText: 'Terça, 9 Jun — 19:00',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    lots: 50,
    location: 'Nacional',
    code: 'Código 2',
    type: 'Apenas Online',
    hasPreBid: true,
    badge: 'Apenas Pick-ups / Bakkies'
  }
]);

// Coming soon list mock in Portuguese
const comingSoonItems = ref([
  {
    id: 101,
    title: '2021 BMW M4 Coupe',
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=600&q=80',
    likes: 2472,
    liked: false
  },
  {
    id: 102,
    title: '2023 TOYOTA HILUX 2.8 GD-6',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    likes: 1970,
    liked: false
  },
  {
    id: 103,
    title: '2022 MERCEDES-BENZ A45 AMG',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    likes: 1104,
    liked: false
  },
  {
    id: 104,
    title: '2020 FORD RANGER WILDTRAK',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=600&q=80',
    likes: 1074,
    liked: false
  }
]);

const toggleSoonLike = (item) => {
  if (item.liked) {
    item.liked = false;
    item.likes--;
  } else {
    item.liked = true;
    item.likes++;
  }
};

const fetchActiveAuctions = async () => {
  loadingAuctions.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/auctions?status=active`);
    if (res.data && res.data.success) {
      // slice top 4 for Featured Sales
      featuredAuctions.value = res.data.data.slice(0, 4);
    }
  } catch (err) {
    console.error('Failed to load active auctions for featured section:', err);
  } finally {
    loadingAuctions.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('resize', onResize);

  // Load custom homepage settings
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/settings/homepage`);
    if (res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (data.heroTitle) heroTitle.value = data.heroTitle;
      if (data.heroSubtitle) heroSubtitle.value = data.heroSubtitle;
      if (data.heroImageUrl) heroImage.value = data.heroImageUrl;
      if (data.heroImageUrls) heroImageUrls.value = data.heroImageUrls;
      if (data.heroMobileImageUrls) heroMobileImageUrls.value = data.heroMobileImageUrls;
    }
  } catch (err) {
    console.warn('Failed to load homepage custom settings, using default fallback.', err);
  }

  // Load active auctions
  await fetchActiveAuctions();

  // Start slideshow after settings are loaded
  restartSlideshow();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
.home-container {
  width: 100%;
}

/* ─── Hero ─── */
.hero-section {
  height: 100svh;
  min-height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: clamp(100px, 18vh, 160px) 1.5rem clamp(40px, 6vh, 80px);
  position: relative;
  overflow: hidden;
}

.hero-bg-slides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-bg-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.hero-bg-slide.active {
  opacity: 1;
}

.hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  margin-bottom: 1rem;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  color: #ffffff;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: clamp(0.9rem, 2.5vw, 1.15rem);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 560px;
}

.hero-btn {
  min-width: 200px;
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  max-width: 260px;
  cursor: pointer;
}

.btn-primary.hero-btn {
  background-color: #171a20;
  color: white;
}
.btn-primary.hero-btn:hover {
  background-color: #2a2d36;
}

.btn-secondary.hero-btn {
  background-color: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.4);
}
.btn-secondary.hero-btn:hover {
  background-color: rgba(255, 255, 255, 0.28);
}

.down-arrow {
  position: absolute;
  bottom: clamp(20px, 4vh, 40px);
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2.5s ease-in-out infinite;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  padding: 0.5rem;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

/* ─── Search Section (Green Banner) ─── */
.search-section {
  background-color: #006643;
  padding: 2.5rem 1.5rem;
  color: white;
  text-align: left;
}

.search-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.25rem;
}

.search-bar-form {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 1100px;
  align-items: center;
}

.search-input-wrapper {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1.25rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #171a20;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  outline: none;
}

.search-icon-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #006643;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: transform 0.2s;
}

.search-icon-btn:hover {
  transform: scale(1.1);
}

.btn-advanced-search {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
}

.btn-advanced-search:hover {
  background-color: white;
  color: #006643;
}

/* ─── Partners Section ─── */
.partners-section {
  background-color: #ffffff;
  padding: 1.5rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.partners-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.partner-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  transition: opacity 0.3s;
  user-select: none;
}

.partner-logo:hover {
  opacity: 1;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo-text.red-blue {
  color: #0033a0;
  background: linear-gradient(135deg, #0033a0 60%, #e31b23 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-text.yellow-red {
  color: #e31b23;
}

.logo-text-sb {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0033a0;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logo-santam {
  font-size: 1.3rem;
  font-weight: 700;
  color: #007cc3;
  font-style: italic;
}

.logo-mfc {
  font-size: 1.4rem;
  font-weight: 900;
  color: #005a36;
  letter-spacing: -1px;
}

.logo-desc {
  font-size: 0.65rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* ─── Premium Titles ─── */
.section-title-premium {
  font-size: 1.5rem;
  font-weight: 700;
  color: #171a20;
  position: relative;
  letter-spacing: -0.3px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.view-all-link {
  color: #006643;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s;
}

.view-all-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

/* ─── Live Events (Leilões ao Vivo) ─── */
.live-events-section {
  padding: 3rem 1.5rem;
  background-color: #f9fafb;
}

.live-events-scroll-container {
  position: relative;
  width: 100%;
}

.live-events-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.5rem 0 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.live-events-scroll::-webkit-scrollbar {
  height: 6px;
}

.live-events-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.live-events-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}

.event-card {
  flex: 0 0 340px;
  scroll-snap-align: start;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.event-card-header {
  background-color: #ffd204;
  color: #171a20;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
}

.event-card-body {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  flex-grow: 1;
}

.event-img-container {
  width: 110px;
  height: 110px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f3f4f6;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  justify-content: center;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #374151;
}

.detail-icon {
  font-size: 0.95rem;
  width: 20px;
  display: inline-block;
}

.detail-text {
  font-weight: 500;
}

.event-custom-badge {
  display: inline-block;
  align-self: flex-start;
  background-color: #005a36;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-top: 4px;
}

.event-card-footer {
  padding: 0.875rem 1rem 1rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.75rem;
}

.btn-event-outline {
  flex: 1;
  background-color: transparent;
  color: #171a20;
  border: 1px solid #171a20;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 4px;
  text-align: center;
  text-transform: uppercase;
}

.btn-event-outline:hover {
  background-color: #f3f4f6;
}

.btn-event-solid {
  flex: 1.2;
  background-color: #171a20;
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 4px;
  text-align: center;
  text-transform: uppercase;
  border: none;
}

.btn-event-solid:hover {
  background-color: #333333;
}

.event-prebid-note {
  font-size: 0.75rem;
  color: #4b5563;
  padding: 0 1rem 0.875rem;
  text-align: left;
  border-top: none;
}

/* ─── Featured Sales (Vendas em Destaque) ─── */
.featured-sales-section {
  padding: 3.5rem 1.5rem;
  background-color: #ffffff;
}

.sales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.sales-card {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.sales-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.sales-card-img-wrapper {
  height: 180px;
  position: relative;
  background-color: #f3f4f6;
  overflow: hidden;
}

.sales-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.sales-card:hover .sales-card-img {
  transform: scale(1.04);
}

/* Badges on image overlay */
.badge-overlay-container {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  flex-wrap: wrap;
}

.badge-item {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  display: inline-flex;
  align-items: center;
}

.date-badge {
  background-color: #ffd204;
  color: #171a20;
}

.bid-badge {
  background-color: rgba(23, 26, 32, 0.85);
  color: white;
  backdrop-filter: blur(4px);
}

.heart-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.heart-badge:hover {
  transform: scale(1.08);
}

.heart-badge.liked {
  background-color: #fee2e2;
  color: #ef4444;
}

.sales-card-info {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
  text-align: left;
}

.sales-car-title {
  font-size: 1rem;
  font-weight: 600;
  color: #171a20;
  margin: 0;
  line-height: 1.4;
  height: 2.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sales-price-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.6rem;
}

.sales-price-label {
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sales-price-val {
  font-size: 1.15rem;
  font-weight: 700;
  color: #006643;
}

/* ─── Interests Section (What others are interested in) ─── */
.interests-section {
  padding: 3rem 1.5rem;
  background-color: #f9fafb;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.interest-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.interest-card:hover {
  transform: translateY(-3px);
}

.interest-img-wrapper {
  height: 160px;
  position: relative;
  background-color: #f3f4f6;
}

.interest-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coming-soon-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #005a36;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.interest-heart-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  backdrop-filter: blur(4px);
}

.interest-heart-btn:hover {
  transform: scale(1.05);
}

.interest-heart-btn.liked {
  background-color: #fee2e2;
  color: #ef4444;
}

.interest-info {
  padding: 0.85rem 1rem;
  text-align: left;
}

.interest-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #171a20;
  margin: 0 0 2px;
}

.interest-sub {
  font-size: 0.75rem;
  color: #6b7280;
}

/* ─── Features Section (Original) ─── */
.features-section {
  padding: clamp(60px, 10vw, 100px) 1.5rem;
  background-color: #ffffff;
}

.features-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 600;
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem 1.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  border: 1px solid #f3f4f6;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 2.25rem;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.65;
}

/* ─── Placeholders & Empty states ─── */
.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6b7280;
  gap: 0.5rem;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f4f6;
  border-top-color: #006643;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-card {
  padding: 3rem 0;
  color: #6b7280;
  font-style: italic;
}

/* ─── Mobile Adjustments ─── */
@media (max-width: 768px) {
  .search-bar-form {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .btn-advanced-search {
    width: 100%;
    text-align: center;
  }

  .event-card {
    flex: 0 0 290px;
  }

  .live-events-scroll {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-btn {
    width: 100%;
    max-width: 100%;
  }
}
</style>
