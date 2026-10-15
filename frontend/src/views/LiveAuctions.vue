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
    <section class="next-auction-section" v-if="nextAuction">
      <div class="container">
        <div class="next-auction-card">
          <div class="next-auction-content">
            <div class="auction-label-bar">
              <span class="auction-label">PRÓXIMO LEILÃO</span>
            </div>
            <div class="auction-datetime">
              {{ formatDate(nextAuction.startTime) }} {{ formatTime(nextAuction.startTime) }}
            </div>
            <div class="auction-meta">
              <span>{{ nextAuction.category || 'Veículos Diversos' }}</span>
              <span class="separator">|</span>
              <span>Online Apenas</span>
            </div>
            <div class="auction-status-badge">{{ nextAuction.status === 'upcoming' ? 'Pré-lances abertos. Coloque o seu lance agora.' : 'Leilão activo. Lance agora!' }}</div>
            <div class="countdown-wrapper">
              <span class="countdown-label">Começa Em</span>
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
              </div>
            </div>
            <div class="auction-buttons">
              <button class="btn btn-catalogue-outline" @click="goToAuction(nextAuction._id)">Ver Catálogo</button>
              <button class="btn btn-join-auction" @click="goToAuction(nextAuction._id)">Participar</button>
            </div>
          </div>
          <div class="next-auction-image" @click="goToAuction(nextAuction._id)" style="cursor: pointer;">
            <img :src="nextAuction.imageUrl" :alt="nextAuction.title" class="auction-main-image" />
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

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>A carregar leilões...</p>
        </div>
        <div v-else-if="auctions.length === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>
          <h3>Nenhum leilão disponível</h3>
          <p>De momento não existem leilões agendados. Volte mais tarde.</p>
        </div>
        <div v-else class="auction-cards-grid">
          <div v-for="auction in filteredAuctions" :key="auction._id" class="auction-card">
            <div class="auction-card-image" @click="goToAuction(auction._id)" style="cursor: pointer;">
              <img :src="auction.imageUrl" :alt="auction.title" class="card-main-image" />
            </div>
            <div class="auction-card-content">
              <div class="card-datetime">{{ formatDate(auction.startTime) }} {{ formatTime(auction.startTime) }}</div>
              <div class="card-meta">
                <span>{{ auction.category || 'Veículos Diversos' }}</span>
                <span class="separator">|</span>
                <span>Online</span>
              </div>
              <div class="card-status">{{ auction.status === 'upcoming' ? 'Pré-lances abertos. Coloque o seu lance agora.' : 'Leilão activo.' }}</div>
              <div class="card-buttons">
                <button class="btn btn-catalogue-small" @click="goToAuction(auction._id)">Catálogo</button>
                <button class="btn btn-join-small" @click="goToAuction(auction._id)">Participar</button>
              </div>
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
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('today')
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const auctions = ref([])
const loading = ref(true)
const nextAuction = ref(null)

const tabs = computed(() => {
  const todayCount = auctions.value.filter(a => isToday(a.startTime)).length
  const tomorrowCount = auctions.value.filter(a => isTomorrow(a.startTime)).length
  const upcomingCount = auctions.value.filter(a => isUpcoming(a.startTime)).length

  return [
    { id: 'today', label: 'A Começar Hoje', count: todayCount },
    { id: 'tomorrow', label: 'Amanhã', count: tomorrowCount },
    { id: 'upcoming', label: 'Agendados', count: upcomingCount }
  ]
})

const filteredAuctions = computed(() => {
  if (activeTab.value === 'upcoming') {
    return auctions.value.filter(a => isUpcoming(a.startTime)).slice(0, 6)
  }
  if (activeTab.value === 'tomorrow') {
    return auctions.value.filter(a => isTomorrow(a.startTime))
  }
  return auctions.value.filter(a => isToday(a.startTime))
})

const isToday = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isTomorrow = (dateStr) => {
  const date = new Date(dateStr)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

const isUpcoming = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setDate(today.getDate() + 2)
  return date > today
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-MZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' MZN'
}

const goToAuction = (id) => {
  router.push(`/auction/${id}`)
}

const fetchAuctions = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:5000/api/auctions')
    const allAuctions = response.data.filter(a => a.status === 'upcoming' || a.status === 'active')
    
    auctions.value = allAuctions
    
    // Set next auction (soonest upcoming or active)
    if (allAuctions.length > 0) {
      const sorted = [...allAuctions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      nextAuction.value = sorted[0]
      
      // Update countdown target
      const targetDate = new Date(nextAuction.value.startTime)
      updateCountdown(targetDate)
    }
  } catch (error) {
    console.error('Erro ao buscar leilões:', error)
  } finally {
    loading.value = false
  }
}

let countdownInterval = null

const updateCountdown = (targetDate) => {
  const now = new Date()
  const diff = targetDate - now

  if (diff > 0) {
    countdown.value.days = Math.floor(diff / (1000 * 60 * 60 * 24))
    countdown.value.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    countdown.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    countdown.value.seconds = Math.floor((diff % (1000 * 60)) / 1000)
  } else {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
}

onMounted(() => {
  fetchAuctions().then(() => {
    if (nextAuction.value) {
      countdownInterval = setInterval(() => updateCountdown(new Date(nextAuction.value.startTime)), 1000)
    }
  })
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
  padding: 3rem 1.5rem;
  background-color: #f9fafb;
}

.next-auction-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.next-auction-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auction-label-bar {
  margin-bottom: 1rem;
}

.auction-label {
  display: inline-block;
  background: #003d1f;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auction-datetime {
  font-size: 1.1rem;
  font-weight: 600;
  color: #171a20;
  margin-bottom: 0.75rem;
}

.auction-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.separator {
  color: #d1d5db;
}

.auction-status-badge {
  background: #e8f5e9;
  color: #003d1f;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.countdown-wrapper {
  margin-bottom: 2rem;
}

.countdown-wrapper .countdown-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.countdown {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.countdown-item {
  text-align: center;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
}

.countdown-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gobid-green);
}

.countdown-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.auction-buttons {
  display: flex;
  gap: 1rem;
}

.next-auction-image {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  overflow: hidden;
}

.auction-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  border: none;
  border-bottom: 3px solid transparent;
  border-radius: 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn:hover {
  color: var(--gobid-green);
}

.tab-btn.active {
  color: var(--gobid-green);
  border-bottom-color: var(--gobid-green);
}

.tab-count {
  margin-left: 0.25rem;
  font-weight: 700;
  position: relative;
}

.tab-btn.active .tab-count {
  background: var(--gobid-green);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  padding: 0;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: 200px 1fr;
}

.auction-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.auction-card-image {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-datetime {
  font-size: 0.85rem;
  font-weight: 600;
  color: #171a20;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.card-status {
  background: #e8f5e9;
  color: #003d1f;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.card-buttons {
  display: flex;
  gap: 0.75rem;
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

/* Loading & Empty States */
.loading-state {
  text-align: center;
  padding: 4rem 1.5rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: var(--gobid-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #171a20;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-catalogue-outline {
  background: transparent;
  color: var(--gobid-green);
  border: 2px solid var(--gobid-green);
  flex: 1;
}

.btn-catalogue-outline:hover {
  background: var(--gobid-green);
  color: white;
}

.btn-join-auction {
  background: var(--gobid-green);
  color: white;
  flex: 1;
}

.btn-join-auction:hover {
  background: #008c44;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.3);
}

.btn-catalogue-small {
  background: white;
  color: #171a20;
  border: 1px solid #171a20;
  flex: 1;
}

.btn-catalogue-small:hover {
  background: #f3f4f6;
}

.btn-join-small {
  background: #171a20;
  color: white;
  flex: 1;
}

.btn-join-small:hover {
  background: #000000;
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
    order: -1;
  }

  .auction-buttons {
    flex-direction: column;
  }

  .countdown {
    grid-template-columns: repeat(3, 1fr);
  }

  .tabs-container {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    border-bottom: 2px solid #e5e7eb;
  }

  .tab-btn.active {
    border-bottom-color: var(--gobid-green);
  }

  .auction-card {
    grid-template-columns: 1fr;
  }

  .auction-card-image {
    height: 180px;
  }

  .card-buttons {
    flex-direction: column;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>