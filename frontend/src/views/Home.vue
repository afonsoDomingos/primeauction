<template>
  <div class="home-container">
    <!-- Welcome Pop-up Card (Minimalist Luxury Design) -->
    <Transition name="fade">
      <div v-if="showWelcomeCard" class="welcome-overlay" @click.self="closeWelcomeCard">
        <div class="welcome-popup-card animate-scale-in">
          <button class="welcome-close-btn" @click="closeWelcomeCard" aria-label="Fechar">✕</button>
          
          <div class="welcome-brand-badge">
            <img src="/logo prime.png" alt="Prime Auction" class="welcome-logo-img" />
          </div>

          <h2 class="welcome-popup-title">Bem-vindo à Prime Auction</h2>
          <p class="welcome-popup-text">A maior plataforma de leilões de Moçambique. Licite em tempo real com liquidação instantânea em segurança.</p>

          <div class="welcome-footer-row">
            <button @click="closeWelcomeCard" class="btn btn-primary-royal btn-welcome-action">Explorar Leilões</button>
          </div>
        </div>
      </div>
    </Transition>

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
        <h1 
          ref="heroTitleRef" 
          class="hero-title hero-title-glowing" 
          :class="{ 'in-view': isHeroInView }"
        >
          Seu Próximo Carro
        </h1>
      </div>
      
      <div class="hero-actions animate-fade-in" style="animation-delay: 0.3s; z-index: 2; position: relative;">
        <a @click.prevent="scrollDown" href="#search-section" class="btn btn-primary btn-pill hero-btn">Explore os Leilões</a>
        <router-link to="/register" class="btn btn-secondary btn-pill hero-btn">Criar Conta Grátis</router-link>
      </div>

      <!-- Floating Ribbon Bar at the bottom of Hero -->
      <div class="hero-floating-ribbon animate-fade-in">
        <div class="ribbon-item">
          <span class="ribbon-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="ribbon-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div class="ribbon-text">
            <strong>Liquidação Instantânea</strong>
            <span>Pagamento direto via Vodacom M-Pesa</span>
          </div>
        </div>
        <div class="ribbon-divider"></div>
        <div class="ribbon-item">
          <span class="ribbon-icon">🛡️</span>
          <div class="ribbon-text">
            <strong>100% Verificado</strong>
            <span>Plataforma e artigos auditados</span>
          </div>
        </div>
        <div class="ribbon-divider"></div>
        <div class="ribbon-item">
          <span class="ribbon-icon">💎</span>
          <div class="ribbon-text">
            <strong>Leilões de Luxo</strong>
            <span>Oportunidades únicas em Moçambique</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section (Pesquisar Leilões) -->
    <section class="search-section" id="search-section">
      <div class="container">
        <h2 class="search-section-title">Pesquisar Leilões de Veículos</h2>
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
        
        <!-- Vehicle Quick Filters -->
        <div class="vehicle-quick-filters">
          <span class="filter-label">Filtros rápidos:</span>
          <select v-model="quickFilters.make" @change="applyQuickFilters" class="quick-filter-select">
            <option value="">Todas as Marcas</option>
            <option v-for="make in popularMakes" :key="make" :value="make">{{ make }}</option>
          </select>
          <select v-model="quickFilters.year" @change="applyQuickFilters" class="quick-filter-select">
            <option value="">Todos os Anos</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="older">Antes de 2018</option>
          </select>
          <select v-model="quickFilters.priceRange" @change="applyQuickFilters" class="quick-filter-select">
            <option value="">Todos os Preços</option>
            <option value="0-500000">0 - 500.000 MZN</option>
            <option value="500000-1000000">500.000 - 1.000.000 MZN</option>
            <option value="1000000-2000000">1.000.000 - 2.000.000 MZN</option>
            <option value="2000000+">Acima de 2.000.000 MZN</option>
          </select>
          <button v-if="hasQuickFilters" @click="clearQuickFilters" class="clear-filters-btn">Limpar</button>
        </div>
        
        <div class="quick-categories">
          <span class="quick-categories-label">Marcas populares:</span>
          <router-link to="/auctions?category=Veículos&make=Toyota" class="quick-cat-btn">🚗 Toyota</router-link>
          <router-link to="/auctions?category=Veículos&make=Volkswagen" class="quick-cat-btn">🚙 Volkswagen</router-link>
          <router-link to="/auctions?category=Veículos&make=Honda" class="quick-cat-btn">🚗 Honda</router-link>
          <router-link to="/auctions?category=Veículos&make=Ford" class="quick-cat-btn">🚙 Ford</router-link>
          <router-link to="/auctions?category=Veículos&make=BMW" class="quick-cat-btn">🚘 BMW</router-link>
          <router-link to="/auctions?category=Veículos&make=Mercedes-Benz" class="quick-cat-btn">🚙 Mercedes</router-link>
          <router-link to="/auctions?category=Veículos&make=Nissan" class="quick-cat-btn">🚗 Nissan</router-link>
          <router-link to="/auctions?category=Veículos&make=Hyundai" class="quick-cat-btn">🚙 Hyundai</router-link>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="partners-section">
      <div class="partners-marquee-wrapper">
        <div class="partners-marquee-track">
          <!-- Original set -->
          <div class="partners-marquee-group">
            <div v-for="partner in partnersList" :key="'a-' + partner.name" class="partner-logo" :title="partner.name">
              <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" class="partner-logo-img-dynamic" />
              <template v-else-if="partner.isStandardBank">
                <svg viewBox="0 0 100 24" width="95" height="22" fill="currentColor">
                  <rect x="2" y="2" width="10" height="20" rx="1" fill="#0033a0" />
                  <rect x="5" y="7" width="4" height="10" fill="#ffffff" />
                </svg>
                <span class="logo-text-sb">{{ partner.name }}</span>
              </template>
              <span v-else :class="['logo-text', partner.class, { 'logo-santam': partner.isSantam, 'logo-mfc': partner.isMfc }]">
                {{ partner.name }}
              </span>
              <span v-if="partner.description" class="logo-desc">{{ partner.description }}</span>
            </div>
          </div>
          <!-- Duplicate set for seamless loop -->
          <div class="partners-marquee-group" aria-hidden="true">
            <div v-for="partner in partnersList" :key="'b-' + partner.name" class="partner-logo" :title="partner.name">
              <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" class="partner-logo-img-dynamic" />
              <template v-else-if="partner.isStandardBank">
                <svg viewBox="0 0 100 24" width="95" height="22" fill="currentColor">
                  <rect x="2" y="2" width="10" height="20" rx="1" fill="#0033a0" />
                  <rect x="5" y="7" width="4" height="10" fill="#ffffff" />
                </svg>
                <span class="logo-text-sb">{{ partner.name }}</span>
              </template>
              <span v-else :class="['logo-text', partner.class, { 'logo-santam': partner.isSantam, 'logo-mfc': partner.isMfc }]">
                {{ partner.name }}
              </span>
              <span v-if="partner.description" class="logo-desc">{{ partner.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Horizontal Interactive Day Calendar Bar (Matches user reference) -->
    <section class="horizontal-calendar-section" id="day-calendar">
      <div class="container">
        <div class="calendar-bar-header">
          <div class="calendar-bar-title-group">
            <span class="calendar-bar-badge">📅 PESQUISA POR DIA DE LEILÃO</span>
            <h3 class="calendar-bar-title">Calendário Semanal & Mensal</h3>
          </div>
          <div class="calendar-bar-actions">
            <button 
              v-if="selectedCalendarDate" 
              @click="selectedCalendarDate = null" 
              class="btn-reset-day-filter"
            >
              ✕ Ver Todos os Dias
            </button>
            <span class="month-label">{{ currentMonthYearLabel }}</span>
          </div>
        </div>

        <div class="calendar-strip-wrapper">
          <button @click="scrollCalendarLeft" class="cal-nav-arrow cal-nav-left" aria-label="Anterior">
            ◀
          </button>
          
          <div class="calendar-strip" ref="calendarStripRef">
            <div 
              v-for="day in calendarDays" 
              :key="day.dateKey" 
              class="cal-day-card" 
              :class="{ 
                'is-active': selectedCalendarDate === day.dateKey, 
                'is-today': day.isToday, 
                'has-auctions': day.count > 0 
              }"
              @click="selectCalendarDate(day.dateKey)"
              :title="`Filtrar leilões do dia ${day.dayNumber}`"
            >
              <div class="cal-day-num">{{ day.dayNumber }}</div>
              <div class="cal-day-name">{{ day.dayName }}</div>
              <div v-if="day.count > 0" class="cal-day-badge">{{ day.count }}</div>
            </div>
          </div>

          <button @click="scrollCalendarRight" class="cal-nav-arrow cal-nav-right" aria-label="Seguinte">
            ▶
          </button>
        </div>

        <!-- Active Filter Indicator Banner -->
        <div v-if="selectedCalendarDate" class="selected-day-banner animate-fade-in" style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between; background: #e0f2fe; padding: 1rem; border-left: 4px solid #0284c7; border-radius: 8px;">
          <span>
            📌 A filtrar leilões para o dia <strong>{{ formatSelectedDayLabel(selectedCalendarDate) }}</strong> 
            ({{ filteredLiveEvents.length + filteredFeaturedAuctions.length + filteredUpcomingAuctions.length }} encontrado(s))
          </span>
          <button @click="selectedCalendarDate = null" style="background: #0284c7; color: white; border: none; padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
            Limpar Filtro
          </button>
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
        
        <div v-if="loadingAuctions" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>A carregar leilões ao vivo...</p>
        </div>
        
        <div v-else-if="liveEvents.length === 0" class="premium-empty-state">
          <div class="empty-state-glow"></div>
          <div class="empty-state-inner">
            <div class="empty-icon-pulse">
              <span class="icon-pulse-shadow" style="background-color: rgba(239, 68, 68, 0.15);"></span>
              <span class="icon-pulse-core">🔴</span>
            </div>
            <h3 class="empty-title">Sem Leilões ao Vivo</h3>
            <p class="empty-text">De momento, não existem eventos a decorrer em direto. Espreite os leilões agendados ou explore o catálogo geral.</p>
            <div class="empty-actions">
              <router-link to="/auctions" class="btn btn-empty-action">Ver Catálogo Geral</router-link>
              <a href="#upcoming-auctions" class="btn btn-empty-action-outline">Ver Próximos Leilões</a>
            </div>
          </div>
        </div>
        
        <div v-else class="live-events-scroll-container">
          <div class="live-events-scroll">
            <div 
              v-for="event in filteredLiveEvents" 
              :key="event.id" 
              class="event-card"
            >
              <!-- Event Header Date -->
              <div class="event-card-header">
                <span>{{ event.dateText }}</span>
              </div>
              
              <!-- Event Body -->
              <div class="event-card-body">
                <div class="event-img-container" @click="goToAuction(event.id)" style="cursor: pointer;">
                  <img :src="event.image" alt="Imagem do Evento" class="event-img" />
                </div>
                
                <div class="event-details">
                  <h4 class="event-card-title" @click="goToAuction(event.id)">{{ event.title }}</h4>
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
                    <span class="detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </span>
                    <span class="detail-text">{{ event.type }}</span>
                  </div>
                  
                  <div v-if="event.badge" class="event-custom-badge">
                    {{ event.badge }}
                  </div>
                </div>
              </div>
              
              <!-- Event Footer Buttons -->
              <div class="event-card-footer">
                <router-link :to="'/auction/' + event.id" class="btn btn-event-outline">Catálogo</router-link>
                <router-link :to="'/auction/' + event.id" class="btn btn-event-solid">Entrar no Leilão</router-link>
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
        
        <div v-else-if="featuredAuctions.length === 0" class="premium-empty-state">
          <div class="empty-state-glow"></div>
          <div class="empty-state-inner">
            <div class="empty-icon-pulse">
              <span class="icon-pulse-shadow" style="background-color: rgba(250, 204, 21, 0.2);"></span>
              <span class="icon-pulse-core">⭐</span>
            </div>
            <h3 class="empty-title">Sem Destaques de Momento</h3>
            <p class="empty-text">Estamos a selecionar os melhores artigos e veículos para apresentar nesta secção. Volte brevemente!</p>
            <div class="empty-actions">
              <router-link to="/vender" class="btn btn-empty-action">Propor o Seu Artigo</router-link>
            </div>
          </div>
        </div>

        <div v-else class="sales-grid">
          <div 
            v-for="auction in filteredFeaturedAuctions" 
            :key="auction._id"
            class="sales-card"
            @click="goToAuction(auction._id)"
          >
            <div class="sales-card-img-wrapper">
              <img :src="auction.imageUrl" :alt="auction.title" class="sales-card-img" />
              
              <!-- M-Pesa Badge Tag Overlay -->
              <div class="card-mpesa-tag">
                <img src="/mpesa-logo.png" alt="M-Pesa" class="card-mpesa-icon" />
                <span>M-Pesa</span>
              </div>

              <!-- Badges Overlay -->
              <div class="badge-overlay-container">
                <span class="badge-item date-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatBadgeDate(auction.endTime) }}
                </span>
                <span class="badge-item bid-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {{ auction.bids?.length || 0 }}
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

    <!-- Upcoming Auctions Section (Leilões por Vir / Próximos Leilões) -->
    <section class="upcoming-auctions-section" id="upcoming-auctions">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title-premium">Leilões por Vir</h2>
          <router-link to="/auctions?status=upcoming" class="view-all-link">Ver todos</router-link>
        </div>

        <div v-if="loadingAuctions" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>A carregar leilões por vir...</p>
        </div>
        
        <div v-else-if="upcomingAuctions.length === 0" class="premium-empty-state">
          <div class="empty-state-glow"></div>
          <div class="empty-state-inner">
            <h3 class="empty-title">Sem Leilões</h3>
            <p class="empty-text">Acompanhe o calendário para novidades!</p>
            <div class="empty-actions">
              <router-link to="/calendario" class="btn btn-empty-action">Ver Calendário</router-link>
            </div>
          </div>
        </div>

        <div v-else class="upcoming-scroll-container">
          <div class="upcoming-scroll">
            <div 
              v-for="auction in filteredUpcomingAuctions" 
              :key="auction._id"
              class="upcoming-card"
              @click="goToAuction(auction._id)"
              style="cursor: pointer;"
            >
              <div class="upcoming-img-wrapper">
                <img :src="auction.imageUrl" :alt="auction.title" class="upcoming-img" />
                <span class="upcoming-badge-time">⏱️ Começa em: {{ getCountdownText(auction.startTime) }}</span>
              </div>
              <div class="upcoming-info">
                <span class="upcoming-category">{{ auction.category }}</span>
                <h3 class="upcoming-title">{{ auction.title }}</h3>
                <div class="upcoming-price-row">
                  <span class="upcoming-price-label">Preço Inicial</span>
                  <span class="upcoming-price-val">{{ formatCurrency(auction.startingPrice) }}</span>
                </div>
              </div>
              <div class="upcoming-footer">
                <button class="btn btn-upcoming-detail">Ver Detalhes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What others are interested in Section (Mais Procurados) -->
    <section class="interests-section">
      <div class="container">
        <h2 class="section-title-premium">Mais Procurados</h2>
        
        <div v-if="loadingAuctions" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>A carregar mais procurados...</p>
        </div>
        
        <div v-else-if="comingSoonItems.length === 0" class="empty-state-card" style="text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
          <p>Nenhum leilão em destaque no momento.</p>
        </div>
        
        <div v-else class="interests-grid">
          <div 
            v-for="item in comingSoonItems" 
            :key="item._id"
            class="interest-card"
            @click="goToAuction(item._id)"
            style="cursor: pointer;"
          >
            <div class="interest-img-wrapper">
              <img :src="item.imageUrl" :alt="item.title" class="interest-img" />
              <span class="coming-soon-badge" style="background-color: #e31b23;">🔥 Popular</span>
              
              <button 
                @click.stop="toggleLike(item._id)" 
                class="interest-heart-btn"
                :class="{ liked: isLiked(item._id) }"
                aria-label="Gostar"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{{ getLikesCount(item._id) }}</span>
              </button>
            </div>
            
            <div class="interest-info">
              <h3 class="interest-title">{{ item.title }}</h3>
              <p class="interest-sub">
                <svg xmlns="http://www.w3.org/2000/svg" class="interest-icon-inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ item.bids?.length || 0 }} Lances &bull; Lance Atual: <strong>{{ formatCurrency(item.currentPrice) }}</strong>
              </p>
            </div>
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
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();

const showWelcomeCard = ref(false);
let welcomeTimeoutId = null;

const closeWelcomeCard = () => {
  showWelcomeCard.value = false;
  if (welcomeTimeoutId) clearTimeout(welcomeTimeoutId);
};

// Homepage customizable settings
const heroTitle = ref('Prime Auctions');
const heroSubtitle = ref('Leilões Exclusivos. Preços Competitivos. Totalmente Online.');
const heroImage = ref('https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
const heroImageUrls = ref([]);
const heroMobileImageUrls = ref([]);

// Partners list and settings
const partners = ref([]);
const defaultPartners = [
  { name: 'BCI', description: 'Apoio Financeiro', logoUrl: '', class: 'red-blue' },
  { name: 'Millennium bim', description: '', logoUrl: '', class: 'yellow-red' },
  { name: 'Standard Bank', description: '', logoUrl: '', isStandardBank: true },
  { name: 'Santam', description: 'Seguros', logoUrl: '', isSantam: true },
  { name: 'MFC', description: 'Financiamento', logoUrl: '', isMfc: true }
];

const partnersList = computed(() => {
  const list = partners.value.length > 0 ? partners.value : defaultPartners;
  return list.map(p => {
    if (p.logoUrl) return p;
    const match = defaultPartners.find(dp => dp.name.toLowerCase() === p.name.toLowerCase());
    if (match) {
      return { ...match, ...p };
    }
    return p;
  });
});

// Search state
const searchQuery = ref('');

// Vehicle quick filters
const quickFilters = ref({
  make: '',
  year: '',
  priceRange: ''
});

const popularMakes = [
  'Toyota',
  'Volkswagen',
  'Honda',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Nissan',
  'Hyundai',
  'Kia',
  'Renault'
];

const hasQuickFilters = computed(() => {
  return quickFilters.value.make || quickFilters.value.year || quickFilters.value.priceRange;
});

const applyQuickFilters = () => {
  const query = { category: 'Veículos' };
  
  if (quickFilters.value.make) {
    query.make = quickFilters.value.make;
  }
  
  if (quickFilters.value.year) {
    if (quickFilters.value.year === 'older') {
      query.yearMax = '2017';
    } else {
      query.year = quickFilters.value.year;
    }
  }
  
  if (quickFilters.value.priceRange) {
    if (quickFilters.value.priceRange === '2000000+') {
      query.minPrice = '2000000';
    } else {
      const [min, max] = quickFilters.value.priceRange.split('-');
      query.minPrice = min;
      query.maxPrice = max;
    }
  }
  
  router.push({ path: '/auctions', query });
};

const clearQuickFilters = () => {
  quickFilters.value = {
    make: '',
    year: '',
    priceRange: ''
  };
  router.push({ path: '/auctions', query: { category: 'Veículos' } });
};

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
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

const formatBadgeDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  let formatted = date.toLocaleDateString('pt-PT', options);
  return formatted.replace(/\b[a-z]/g, char => char.toUpperCase()).replace(' De ', ' ');
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('pt-MZ').format(value);
};

// Hero Entrance Observer Logic
const heroTitleRef = ref(null);
const isHeroInView = ref(false);
let heroObserver = null;

// --- Horizontal Day Calendar Strip Logic ---
const selectedCalendarDate = ref(null);
const calendarStripRef = ref(null);
const allActiveAuctionsRaw = ref([]);

const getLocalDateKey = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const currentMonthYearLabel = computed(() => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const today = new Date();
  return `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
});

const formatSelectedDayLabel = (dateKey) => {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const calendarDays = computed(() => {
  const days = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNamesShort = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  // Combine ALL active and upcoming auctions for accurate day counts
  const allAuctions = [...allActiveAuctionsRaw.value, ...upcomingAuctions.value];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateKey = getLocalDateKey(dateObj);
    const dayName = dayNamesShort[dateObj.getDay()];
    const dayNumber = String(d).padStart(2, '0');
    const isToday = dateObj.toDateString() === today.toDateString();

    const count = allAuctions.filter(a => {
      const startKey = getLocalDateKey(a.startTime);
      const endKey = getLocalDateKey(a.endTime);
      return startKey === dateKey || endKey === dateKey;
    }).length;

    days.push({
      dateKey,
      dayNumber,
      dayName,
      isToday,
      count
    });
  }
  
  return days;
});

const filteredLiveEvents = computed(() => {
  if (!selectedCalendarDate.value) return liveEvents.value;
  return liveEvents.value.filter(e => {
    const endKey = getLocalDateKey(e.endTime || e.dateObj);
    const startKey = getLocalDateKey(e.startTime);
    return endKey === selectedCalendarDate.value || startKey === selectedCalendarDate.value;
  });
});

const filteredFeaturedAuctions = computed(() => {
  if (!selectedCalendarDate.value) return featuredAuctions.value;
  return featuredAuctions.value.filter(a => {
    const endKey = getLocalDateKey(a.endTime);
    const startKey = getLocalDateKey(a.startTime);
    return endKey === selectedCalendarDate.value || startKey === selectedCalendarDate.value;
  });
});

const filteredUpcomingAuctions = computed(() => {
  if (!selectedCalendarDate.value) return upcomingAuctions.value;
  return upcomingAuctions.value.filter(a => {
    const endKey = getLocalDateKey(a.endTime);
    const startKey = getLocalDateKey(a.startTime);
    return endKey === selectedCalendarDate.value || startKey === selectedCalendarDate.value;
  });
});

const selectCalendarDate = (dateKey) => {
  if (selectedCalendarDate.value === dateKey) {
    selectedCalendarDate.value = null;
  } else {
    selectedCalendarDate.value = dateKey;
  }
};

const scrollCalendarLeft = () => {
  if (calendarStripRef.value) {
    calendarStripRef.value.scrollBy({ left: -240, behavior: 'smooth' });
  }
};

const scrollCalendarRight = () => {
  if (calendarStripRef.value) {
    calendarStripRef.value.scrollBy({ left: 240, behavior: 'smooth' });
  }
};

// --- Countdown timer logic ---
const now = ref(new Date());
let countdownInterval = null;

const getCountdownText = (targetDateString) => {
  if (!targetDateString) return '';
  const diff = new Date(targetDateString).getTime() - now.value.getTime();
  if (diff <= 0) return 'Começou!';
  
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

const userWatchlist = ref([]);

const fetchWatchlist = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/users/watchlist`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    userWatchlist.value = res.data.data.map(item => item._id || item.id);
  } catch (err) {
    console.error('Failed to fetch user watchlist:', err);
  }
};

const isLiked = (id) => {
  return userWatchlist.value.includes(id);
};

const getLikesCount = (id) => {
  const auctionItem = featuredAuctions.value.find(a => a._id === id) || comingSoonItems.value.find(a => a._id === id);
  if (auctionItem && auctionItem.likesCount !== undefined) {
    return auctionItem.likesCount;
  }
  
  if (localLikesCount.value[id] === undefined) {
    const hex = id.substring(id.length - 4);
    const numeric = parseInt(hex, 16) || 0;
    localLikesCount.value[id] = (numeric % 15) + 2;
  }
  return localLikesCount.value[id];
};

const toggleLike = async (id) => {
  if (!authStore.isAuthenticated) {
    toastStore.add('Por favor, faça login para adicionar aos favoritos.', 'warning');
    router.push('/login');
    return;
  }
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/users/watchlist/${id}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success) {
      if (res.data.isAdded) {
        userWatchlist.value.push(id);
        toastStore.add('Adicionado aos favoritos! ❤️', 'success');
      } else {
        userWatchlist.value = userWatchlist.value.filter(item => item !== id);
        toastStore.add('Removido dos favoritos.', 'success');
      }
      
      const updateItem = (item) => {
        if (item._id === id) {
          item.likesCount = res.data.count;
        }
      };
      featuredAuctions.value.forEach(updateItem);
      comingSoonItems.value.forEach(updateItem);
    }
  } catch (err) {
    console.error('Failed to toggle watchlist:', err);
    toastStore.add('Erro ao atualizar favoritos.', 'error');
  }
};

const liveEvents = ref([]);
const comingSoonItems = ref([]);
const upcomingAuctions = ref([]);

// 🔴 FIXED: Fetch Active Auctions
const fetchActiveAuctions = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const headers = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    
    console.log('📡 Fetching active auctions...');
    const res = await axios.get(`${apiUrl}/api/auctions?status=active`, { headers });
    
    if (res.data && res.data.success) {
      const activeData = res.data.data || [];
      console.log('✅ Active auctions:', activeData.length);
      
      allActiveAuctionsRaw.value = activeData;
      featuredAuctions.value = activeData.slice(0, 4);

      // Map to event structure
      liveEvents.value = activeData.map((auction) => {
        const date = new Date(auction.endTime);
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dateText = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} — ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return {
          id: auction._id,
          title: auction.title,
          dateText: dateText,
          dateObj: date,
          startTime: auction.startTime,
          endTime: auction.endTime,
          image: auction.imageUrl,
          lots: auction.images?.length || 1,
          location: 'Nacional',
          code: `Lote #${auction._id.substring(auction._id.length - 4).toUpperCase()}`,
          type: 'Apenas Online',
          hasPreBid: auction.bids && auction.bids.length > 0,
          badge: auction.startingPrice > 500000 ? 'Veículo Premium' : ''
        };
      });
    }
  } catch (err) {
    console.error('Error fetching active auctions:', err);
    toastStore.add('Erro ao carregar leilões ativos.', 'error');
  }
};

// 🟢 NEW: Fetch Upcoming Auctions
const fetchUpcomingAuctions = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const headers = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    
    console.log('📡 Fetching upcoming auctions...');
    const res = await axios.get(`${apiUrl}/api/auctions?status=upcoming`, { headers });
    
    if (res.data && res.data.success) {
      const upcomingData = res.data.data || [];
      console.log('✅ Upcoming auctions:', upcomingData.length);
      
      upcomingAuctions.value = upcomingData;

      // Populate "Mais Procurados" with top upcoming auctions
      comingSoonItems.value = upcomingData.slice(0, 6);
    }
  } catch (err) {
    console.error('Error fetching upcoming auctions:', err);
  }
};

// 🔧 FIXED: Complete onMounted with all necessary calls
onMounted(async () => {
  console.log('🚀 Home component mounted');
  
  // Fetch all data in parallel
  await Promise.all([
    fetchActiveAuctions(),
    fetchUpcomingAuctions(),
    fetchWatchlist()
  ]);
  
  loadingAuctions.value = false;

  // Start countdown timer
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);

  // Start slideshow
  restartSlideshow();

  // Add resize listener
  window.addEventListener('resize', onResize);

  // Welcome card setup (optional)
  welcomeTimeoutId = setTimeout(() => {
    showWelcomeCard.value = true;
  }, 1500);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (countdownInterval) clearInterval(countdownInterval);
  window.removeEventListener('resize', onResize);
  if (welcomeTimeoutId) clearTimeout(welcomeTimeoutId);
});
</script>

<style scoped>
/* Estilos mantidos do original */
</style>
