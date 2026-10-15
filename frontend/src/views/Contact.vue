<template>
  <div class="contact-container">
    <!-- Contact Banner -->
    <section class="contact-banner">
      <div class="container">
        <h1 class="contact-title">Contact Prime Auction</h1>
        <p class="contact-subtitle">Entre em contacto connosco para assistência ou visite uma das nossas filiais em Moçambique</p>
      </div>
    </section>

    <!-- Contact Information -->
    <section class="contact-info-section">
      <div class="container">
        <div class="contact-info-grid">
          <div class="contact-info-item">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="contact-text">
              <h3>Perguntas Frequentes</h3>
              <router-link to="/faq" class="contact-link">Ver FAQ's</router-link>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="contact-text">
              <h3>Email</h3>
              <a href="mailto:info@primeauction.mz" class="contact-link">info@primeauction.mz</a>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 001.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 9c0-5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="contact-text">
              <h3>Telefone</h3>
              <a href="tel:+258841234567" class="contact-link">+258 84 123 4567</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Branch Locator Section -->
    <section class="branch-locator-section">
      <div class="container">
        <h2 class="section-title">LOCALIZE A SUA FILIAL PRIME AUCTION MAIS PRÓXIMA</h2>
        
        <!-- Province Filters -->
        <div class="province-filters">
          <button 
            v-for="province in provinces" 
            :key="province.id"
            class="province-btn"
            :class="{ active: selectedProvince === province.id }"
            @click="selectedProvince = province.id"
          >
            {{ province.name }}
          </button>
        </div>

        <!-- Branch Listings -->
        <div class="branch-listings">
          <div v-for="province in filteredProvinces" :key="province.id" class="province-section">
            <h3 class="province-title">{{ province.name }}</h3>
            <div class="branch-cards">
              <div v-for="branch in province.branches" :key="branch.id" class="branch-card">
                <div class="branch-map">
                  <svg xmlns="http://www.w3.org/2000/svg" class="map-pin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 10c0 7-6 13-13 13-13S1 3 1 10 7 10 13 13 0 7 6 13 13 13zm0-15a6 6 0 11-12 0 6 6 0 0112 0 6 6 0 0112 0zm-9 5a2 2 0 11-4 0 2 2 0 014 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="branch-info">
                  <h4 class="branch-name">{{ branch.name }}</h4>
                  <p class="branch-address">{{ branch.address }}</p>
                  <p class="branch-phone">
                    <svg xmlns="http://www.w3.org/2000/svg" class="phone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 001.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 9c0-5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {{ branch.phone }}
                  </p>
                  <p class="branch-hours">{{ branch.hours }}</p>
                  <a :href="branch.mapUrl" target="_blank" class="btn-map" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="map-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const provinces = ref([
  { id: 'maputo', name: 'Maputo', branches: [
    { id: 1, name: 'Prime Auction Maputo Centro', address: 'Av. 25 de Setembro, 1234', phone: '+258 84 123 4567', hours: 'Seg-Sex: 8h-17h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Maputo' },
    { id: 2, name: 'Prime Auction Maputo Sul', address: 'Av. Marginal, 5678', phone: '+258 84 123 4568', hours: 'Seg-Sex: 8h-17h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Maputo+Sul' },
    { id: 3, name: 'Prime Auction Matola', address: 'Rua da Liberdade, 234', phone: '+258 84 123 4569', hours: 'Seg-Sex: 9h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Matola' }
  ]},
  { id: 'gaza', name: 'Gaza', branches: [
    { id: 4, name: 'Prime Auction Xai-Xai', address: 'Av. da Independência, 456', phone: '+258 84 123 4570', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Xai-Xai' }
  ]},
  { id: 'inhambane', name: 'Inhambane', branches: [
    { id: 5, name: 'Prime Auction Beira', address: 'Rua da Mozambique, 789', phone: '+258 84 123 4571', hours: 'Seg-Sex: 8h-17h', mapUrl: 'https://maps.mapUrl/?q=Prime+Auction+Beira' }
  ]},
  { 'id': 'manica', name: 'Manica', branches: [
    { id: 6, name: 'Prime Auction Chimoio', address: 'Av. Eduardo Mondlane, 123', phone: '+258 84 123 4572', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Chimoio' }
  ]},
  { id: 'nampula', name: 'Nampula', branches: [
    { id: 7, name: 'Prime Auction Nampula', address: 'Rua da Frequentação, 345', phone: '+258 84 123 4573', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Nampula' }
  ]},
  { id: 'niassa', name: 'Niassa', branches: [
    { id: 8, name: 'Prime Auction Nampula', address: 'Av. 25 de Setembro, 567', phone: '+258 84 123 4574', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Nampula' }
  ]},
  { id: 'sofala', name: 'Sofala', branches: [
    { id: 9, name: 'Prime Auction Beira', address: 'Rua da Mozambique, 789', phone: '+258 84 123 4571', hours: 'Seg-Sex: 8h-17h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Beira' }
  ]},
  { id: 'tete', name: 'Tete', branches: [
    { id: 10, name: 'Prime Auction Tete', address: 'Av. Samora Machel, 234', phone: '+258 84 123 4575', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Tete' }
  ]},
  { id: 'zambezia', name: 'Zambézia', branches: [
    { id: 11, name: 'Prime Auction Quelimane', address: 'Av. da FRELIMO, 1234', phone: '+258 84 123 4576', hours: 'Seg-Sex: 8h-16h', mapUrl: 'https://maps.google.com/?q=Prime+Auction+Quelimane' }
  ]}
])

const selectedProvince = ref('all')

const filteredProvinces = computed(() => {
  if (selectedProvince.value === 'all') {
    return provinces.value
  }
  return provinces.value.filter(p => p.id === selectedProvince.value)
})
</script>

<style scoped>
.contact-container {
  min-height: 100vh;
  background-color: #ffffff;
}

/* Contact Banner */
.contact-banner {
  background-color: var(--gobid-green);
  padding: 3rem 1.5rem;
  text-align: center;
  color: white;
}

.contact-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #ffffff;
}

.contact-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Contact Info Section */
.contact-info-section {
  padding: 3rem 1.5rem;
  background-color: #f9fafb;
}

.contact-info-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.contact-info-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  width: 48px;
  height: 48px;
  background: var(--gobid-green);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon svg {
  width: 24px;
  height: 24px;
}

.contact-text h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #171a20;
}

.contact-link {
  color: var(--gobid-green);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #008c44;
  text-decoration: underline;
}

/* Branch Locator Section */
.branch-locator-section {
  padding: 4rem 1.5rem;
  background-color: #ffffff;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #171a20;
}

.province-filters {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.province-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.province-btn:hover {
  border-color: var(--gobid-green);
  color: var(--gobid-green);
}

.province-btn.active {
  background: var(--gobid-green);
  color: white;
  border-color: var(--gobid-green);
}

.branch-listings {
  max-width: 1200px;
  margin: 0 auto;
}

.province-section {
  margin-bottom: 3rem;
}

.province-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #171a20;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--gobid-green);
}

.branch-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.branch-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.branch-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.branch-map {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.map-pin {
  width: 32px;
  height: 32px;
  color: #ef4444;
}

.branch-info {
  flex: 1;
}

.branch-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #171a20;
}

.branch-address,
.branch-phone,
.branch-hours {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.branch-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phone-icon {
  width: 16px;
  height: 16px;
  color: var(--gobid-green);
}

.btn-map {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--gobid-green);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gobid-green);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-map:hover {
  background: var(--gobid-green);
  color: white;
}

.map-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .contact-info-grid {
    grid-template-columns: 1fr;
  }

  .province-filters {
    flex-direction: column;
  }

  .province-btn {
    width: 100%;
  }

  .branch-cards {
    grid-template-columns: 1fr;
  }

  .branch-card {
    flex-direction: column;
  }
}
</style>