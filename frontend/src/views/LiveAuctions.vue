<template>
  <div class="live-auctions-container">
    <!-- Live Auctions Banner -->
    <section class="live-banner">
      <div class="container">
        <div class="banner-content">
          <h1 class="banner-title">Junte-se aos Nossos Leilões ao Vivo</h1>
          <p class="banner-subtitle">Participe de leilões em tempo real com lances competitivos e veículos verificados</p>
          <div class="banner-badge">
            <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Confiável. Transparente. Seguro.
          </div>
        </div>
      </div>
    </section>

    <!-- Next Auction Section -->
    <section class="next-auction-section">
      <div class="container">
        <div class="next-auction-card">
          <div class="next-auction-image">
            <div class="auction-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" class="car-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <div class="next-auction-info">
            <div class="auction-label">PRÓXIMO LEILÃO</div>
            <h2 class="auction-title">Leilão de Veículos Premium</h2>
            <div class="auction-details">
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Qui, 15 Out 2026</span>
              </div>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>19:00</span>
              </div>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Maputo, Moçambique</span>
              </div>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>50 Lotes</span>
              </div>
            </div>
            <div class="countdown">
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.days }}</span>
                <span class="countdown-label">Dias</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.hours }}</span>
                <span class="countdown-label">Horas</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.minutes }}</span>
                <span class="countdown-label">Min</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.seconds }}</span>
                <span class="countdown-label">Seg</span>
              </div>
            </div>
            <button class="btn btn-view-catalogue">Ver Catálogo</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Auction Listings with Tabs -->
    <section class="auction-listings-section">
      <div class="container">
        <div class="tabs-container">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span class="tab-count">({{ tab.count }})</span>
          </button>
        </div>

        <div class="auction-cards-grid">
          <div v-for="auction in filteredAuctions" :key="auction.id" class="auction-card">
            <div class="auction-card-image">
              <div class="card-image-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" class="card-car-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            <div class="auction-card-content">
              <div class="card-date">{{ auction.date }}</div>
              <div class="card-time">{{ auction.time }}</div>
              <div class="card-lots">{{ auction.lots }} Lotes</div>
              <div class="card-category">{{ auction.category }}</div>
              <p class="card-description">{{ auction.description }}</p>
              <button class="btn btn-catalogue">Catálogo</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="feature-title">Veículos Verificados</h3>
            <p class="feature-description">Todos os veículos são inspecionados e verificados antes do leilão</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 class="feature-title">Processo Transparente</h3>
            <p class="feature-description">Lances em tempo real com histórico completo visível</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="feature-title">Lances Fáceis</h3>
            <p class="feature-description">Sistema intuitivo para fazer lances em segundos</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="feature-title">Suporte Confiável</h3>
            <p class="feature-description">Equipa de suporte disponível para ajudar em qualquer momento</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const activeTab = ref('today')
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })

const tabs = [
  { id: 'today', label: 'A Começar Hoje', count: 1 },
  { id: 'tomorrow', label: 'Amanhã', count: 2 },
  { id: 'upcoming', label: 'Agendados', count: 25 }
]

const auctions = ref([
  {
    id: 1,
    date: 'Qui, 15 Out 2026',
    time: '19:00',
    lots: 50,
    category: 'Pick-ups Apenas',
    description: 'Pré-lances abertos. Coloque o seu lance agora.',
    tab: 'today'
  },
  {
    id: 2,
    date: 'Sex, 16 Out 2026',
    time: '18:00',
    lots: 35,
    category: 'Sedans',
    description: 'Pré-lances abertos. Coloque o seu lance agora.',
    tab: 'tomorrow'
  },
  {
    id: 3,
    date: 'Sáb, 17 Out 2026',
    time: '10:00',
    lots: 40,
    category: 'SUVs',
    description: 'Pré-lances abertos. Coloque o seu lance agora.',
    tab: 'tomorrow'
  },
  {
    id: 4,
    date: 'Seg, 19 Out 2026',
    time: '14:00',
    lots: 25,
    category: 'Carrinhas',
    description: 'Ainda por começar.',
    tab: 'upcoming'
  },
  {
    id: 5,
    date: 'Ter, 20 Out 2026',
    time: '15:00',
    lots: 30,
    category: 'Pick-ups',
    description: 'Ainda por começar.',
    tab: 'upcoming'
  },
  {
    id: 6,
    date: 'Qua, 21 Out 2026',
    time: '16:00',
    lots: 45,
    category: 'Veículos Diversos',
    description: 'Ainda por começar.',
    tab: 'upcoming'
  }
])

const filteredAuctions = computed(() => {
  if (activeTab.value === 'upcoming') {
    return auctions.value.filter(a => a.tab === 'upcoming').slice(0, 6)
  }
  return auctions.value.filter(a => a.tab === activeTab.value)
})

let countdownInterval = null

const updateCountdown = () => {
  const targetDate = new Date('2026-10-15T19:00:00')
  const now = new Date()
  const diff = targetDate - now

  if (diff > 0) {
    countdown.value.days = Math.floor(diff / (1000 * 60 * 60 * 24))
    countdown.value.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    countdown.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    countdown.value.seconds = Math.floor((diff % (1000 * 60)) / 1000)
  }
}

onMounted(() => {
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.live-auctions-container {
  min-height: 100vh;
  background-color: #ffffff;
}

/* Live Banner */
.live-banner {
  background: linear-gradient(135deg, var(--gobid-green) 0%, #008c44 100%);
  padding: 4rem 1.5rem;
  text-align: center;
  color: white;
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #ffffff;
}

.banner-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.badge-icon {
  width: 20px;
  height: 20px;
}

/* Next Auction Section */
.next-auction-section {
  padding: 4rem 1.5rem;
  background-color: #f9fafb;
}

.next-auction-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.next-auction-image {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.auction-image-placeholder {
  text-align: center;
}

.car-icon {
  width: 80px;
  height: 80px;
  color: #9ca3af;
}

.next-auction-info {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auction-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gobid-green);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.auction-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #171a20;
}

.auction-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.detail-icon {
  width: 18px;
  height: 18px;
  color: var(--gobid-green);
}

.countdown {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.countdown-item {
  text-align: center;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.countdown-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gobid-green);
}

.countdown-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

/* Auction Listings Section */
.auction-listings-section {
  padding: 4rem 1.5rem;
  background-color: #ffffff;
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  border-color: var(--gobid-green);
  color: var(--gobid-green);
}

.tab-btn.active {
  background: var(--gobid-green);
  color: white;
  border-color: var(--gobid-green);
}

.tab-count {
  margin-left: 0.25rem;
  font-weight: 700;
}

.auction-cards-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.auction-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.auction-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.auction-card-image {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image-placeholder {
  text-align: center;
}

.card-car-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.auction-card-content {
  padding: 1.5rem;
}

.card-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gobid-green);
  margin-bottom: 0.25rem;
}

.card-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.card-lots {
  font-size: 0.9rem;
  font-weight: 700;
  color: #171a20;
  margin-bottom: 0.25rem;
}

.card-category {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

/* Features Section */
.features-section {
  padding: 4rem 1.5rem;
  background-color: #f9fafb;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: var(--gobid-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.feature-icon svg {
  width: 28px;
  height: 28px;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #171a20;
}

.feature-description {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Buttons */
.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-view-catalogue {
  background: var(--gobid-green);
  color: white;
  width: 100%;
}

.btn-view-catalogue:hover {
  background: #008c44;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.3);
}

.btn-catalogue {
  background: transparent;
  color: var(--gobid-green);
  border: 2px solid var(--gobid-green);
  width: 100%;
}

.btn-catalogue:hover {
  background: var(--gobid-green);
  color: white;
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 1.75rem;
  }

  .next-auction-card {
    grid-template-columns: 1fr;
  }

  .next-auction-image {
    min-height: 250px;
  }

  .auction-details {
    grid-template-columns: 1fr;
  }

  .countdown {
    grid-template-columns: repeat(4, 1fr);
  }

  .tabs-container {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }

  .auction-cards-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>