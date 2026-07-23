<template>
  <div class="home-container">
    <!-- Welcome Pop-up Card -->
    <Transition name="fade">
      <div v-if="showWelcomeCard" class="welcome-overlay" @click.self="closeWelcomeCard">
        <div class="welcome-popup-card animate-scale-in">
          <button class="welcome-close-btn" @click="closeWelcomeCard" aria-label="Fechar">✕</button>
          <div class="welcome-header">
            <div class="welcome-badge">🎉 Novo por aqui?</div>
            <div class="welcome-emoji">👋</div>
          </div>
          <h2 class="welcome-popup-title">Bem-vindo à Prime Auctions!</h2>
          <p class="welcome-popup-text">A maior e melhor plataforma de leilões online em Moçambique.</p>
          <div class="welcome-features">
            <div class="welcome-feature">
              <span class="feature-icon">🚗</span>
              <span class="feature-text">Veículos</span>
            </div>
            <div class="welcome-feature">
              <span class="feature-icon">🏠</span>
              <span class="feature-text">Imóveis</span>
            </div>
            <div class="welcome-feature">
              <span class="feature-icon">💻</span>
              <span class="feature-text">Eletrónicos</span>
            </div>
            <div class="welcome-feature">
              <span class="feature-icon">🪑</span>
              <span class="feature-text">Mobiliário</span>
            </div>
          </div>
          <p class="welcome-popup-sub">Leilões em tempo real. Licite rápido ou proponha os seus artigos!</p>
          <div class="welcome-footer-row">
            <button @click="closeWelcomeCard" class="btn btn-primary btn-pill btn-welcome-action">Começar a Explorar</button>
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
        <!-- Glowing Live Badge -->
        <div class="hero-live-pill animate-fade-in">
          <span class="pulse-green-dot"></span>
          <span>Leilões ao Vivo em Moçambique &bull; 100% Verificados</span>
        </div>

        <h1 class="hero-title hero-title-glowing">{{ heroTitle }}</h1>
        <p class="hero-subtitle">{{ heroSubtitle }}</p>
      </div>
      
      <div class="hero-actions animate-fade-in" style="animation-delay: 0.3s; z-index: 2; position: relative;">
        <a @click.prevent="scrollDown" href="#search-section" class="btn btn-primary btn-pill hero-btn">Explore os Leilões</a>
        <router-link to="/register" class="btn btn-secondary btn-pill hero-btn">Criar Conta Grátis</router-link>
      </div>

      <!-- Floating Ribbon Bar at the bottom of Hero -->
      <div class="hero-floating-ribbon animate-fade-in">
        <div class="ribbon-item">
          <span class="ribbon-icon">⚡</span>
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
        <h2 class="search-section-title">Pesquisar Leilões</h2>
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
        <div class="quick-categories">
          <span class="quick-categories-label">Pesquisa rápida:</span>
          <router-link to="/auctions?category=Veículos" class="quick-cat-btn">🚗 Veículos</router-link>
          <router-link to="/auctions?category=Imóveis%20e%20Equipamentos" class="quick-cat-btn">🏠 Imóveis</router-link>
          <router-link to="/auctions?category=Electrónica%20e%20Tecnologia" class="quick-cat-btn">💻 Tecnologia</router-link>
          <router-link to="/auctions?category=Mobiliário%20e%20Decoração" class="quick-cat-btn">🪑 Mobiliário</router-link>
          <router-link to="/auctions?category=Maquinaria%20Industrial" class="quick-cat-btn">🏭 Maquinaria</router-link>
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
            v-for="auction in featuredAuctions" 
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
            <div class="empty-icon-pulse">
              <span class="icon-pulse-shadow" style="background-color: rgba(26, 86, 219, 0.2);"></span>
              <span class="icon-pulse-core">📅</span>
            </div>
            <h3 class="empty-title">Sem Leilões Agendados</h3>
            <p class="empty-text">Não há novos leilões agendados para os próximos dias. Acompanhe o nosso calendário para ficar a par das novidades!</p>
            <div class="empty-actions">
              <router-link to="/calendario" class="btn btn-empty-action">Ver Calendário</router-link>
            </div>
          </div>
        </div>

        <div v-else class="upcoming-scroll-container">
          <div class="upcoming-scroll">
            <div 
              v-for="auction in upcomingAuctions" 
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


    <!-- What others are interested in Section (Mais Procurados / Próximos) -->
    <section class="interests-section">
      <div class="container">
        <h2 class="section-title-premium">Mais Procurados</h2>
        
        <div v-if="loadingAuctions" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <p>A carregar mais procurados...</p>
        </div>
        
        <div v-else-if="comingSoonItems.length === 0" class="empty-state-card" style="text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb; color: var(--text-light); margin-bottom: 2rem;">
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
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ getLikesCount(item._id) }}</span>
              </button>
            </div>
            
            <div class="interest-info">
              <h3 class="interest-title">{{ item.title }}</h3>
              <p class="interest-sub">🔨 {{ item.bids?.length || 0 }} Lances &bull; Lance Atual: <strong>{{ formatCurrency(item.currentPrice) }}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section (Minimalist Redesign at the Bottom) -->
    <section class="how-it-works-section-minimal">
      <div class="container">
        <div class="section-header-center" style="margin-bottom: 2.5rem;">
          <span class="section-badge-minimal">PLANO DE AÇÃO</span>
          <h2 class="section-title-premium">Como Funciona</h2>
          <p class="section-subtitle">A forma mais transparente e rápida de participar em leilões em Moçambique</p>
        </div>

        <div class="steps-container-minimal">
          <div class="step-card-minimal">
            <div class="step-num-badge">01</div>
            <h3 class="step-title-minimal">Registe-se</h3>
            <p class="step-desc-minimal">Crie a sua conta de forma gratuita e rápida em menos de 1 minuto.</p>
          </div>

          <div class="step-card-minimal">
            <div class="step-num-badge">02</div>
            <h3 class="step-title-minimal">Explore</h3>
            <p class="step-desc-minimal">Navegue pelas oportunidades e artigos ativos em todo o país.</p>
          </div>

          <div class="step-card-minimal">
            <div class="step-num-badge">03</div>
            <h3 class="step-title-minimal">Licite</h3>
            <p class="step-desc-minimal">Faça o seu lance em tempo real com total transparência e histórico.</p>
          </div>

          <div class="step-card-minimal">
            <div class="step-num-badge">04</div>
            <h3 class="step-title-minimal">Liquide via M-Pesa</h3>
            <p class="step-desc-minimal">Confirme o pagamento seguro com PIN diretamente no telemóvel.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats/Trust Section (Minimalist Dark Glass Banner at the Bottom) -->
    <section class="stats-section-minimal">
      <div class="container">
        <div class="stats-grid-minimal">
          <div class="stat-card-minimal">
            <div class="stat-num-bold">{{ formatNumber(stats.totalAuctions) }}</div>
            <div class="stat-lbl-sub">Leilões Realizados</div>
          </div>
          <div class="stat-card-minimal">
            <div class="stat-num-bold">{{ formatNumber(stats.totalUsers) }}</div>
            <div class="stat-lbl-sub">Utilizadores Ativos</div>
          </div>
          <div class="stat-card-minimal">
            <div class="stat-num-bold">{{ formatNumber(stats.totalBids) }}</div>
            <div class="stat-lbl-sub">Lances Colocados</div>
          </div>
          <div class="stat-card-minimal">
            <div class="stat-num-bold highlight-revenue">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div class="stat-lbl-sub">Volume Transacionado</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section">
      <div class="newsletter-container">
        <div class="newsletter-content">
          <div class="newsletter-icon">📧</div>
          <h2 class="newsletter-title">Não perca nenhum leilão!</h2>
          <p class="newsletter-subtitle">Receba alertas exclusivos de novos leilões e ofertas especiais diretamente no seu e-mail. Junte-se a +2.500 utilizadores.</p>
        </div>
        <form @submit.prevent="handleNewsletterSubscribe" class="newsletter-form">
          <div class="newsletter-input-group">
            <input 
              type="email" 
              v-model="newsletterEmail" 
              placeholder="Digite o seu melhor e-mail..." 
              class="newsletter-input"
              required
              :disabled="subscribingNewsletter"
            />
            <button type="submit" class="btn btn-newsletter-submit" :disabled="subscribingNewsletter">
              <span v-if="subscribingNewsletter" class="spinner-inline"></span>
              {{ subscribingNewsletter ? 'A processar...' : '🔔 Subscrever Grátis' }}
            </button>
          </div>
          <p class="newsletter-disclaimer">🔒 Respeitamos a sua privacidade. Sem spam, pode cancelar a qualquer momento.</p>
        </form>
      </div>
    </section>

    <!-- Features Section (Porquê escolher) -->
    <section class="features-section" id="features">
      <div class="container">
        <h2 class="features-title">Porquê escolher a Prime Auction?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-number">01</div>
            <h3>Lances em Tempo Real</h3>
            <p>Tecnologia WebSocket garante que todos vêem os lances instantaneamente, sem necessidade de atualizar a página.</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">02</div>
            <h3>Segurança Garantida</h3>
            <p>Autenticação JWT robusta e gestão completa de utilizadores pelo administrador da plataforma.</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">03</div>
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

const newsletterEmail = ref('');
const subscribingNewsletter = ref(false);

const handleNewsletterSubscribe = async () => {
  if (!newsletterEmail.value.trim()) return;
  subscribingNewsletter.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/newsletter/subscribe`, {
      email: newsletterEmail.value.trim()
    });
    if (res.data && res.data.success) {
      toastStore.add('Subscrição efetuada com sucesso! Obrigado.', 'success');
      newsletterEmail.value = '';
    }
  } catch (err) {
    console.error('Failed to subscribe newsletter:', err);
    const msg = err.response?.data?.error || 'Ocorreu um erro ao efetuar a subscrição. Por favor, tente novamente.';
    toastStore.add(msg, 'error');
  } finally {
    subscribingNewsletter.value = false;
  }
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
  // pt-PT style: "seg, 8 de jun"
  let formatted = date.toLocaleDateString('pt-PT', options);
  // capitalize first letters
  return formatted.replace(/\b[a-z]/g, char => char.toUpperCase()).replace(' De ', ' ');
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('pt-MZ').format(value);
};

// Stats data
const stats = ref({
  totalAuctions: 0,
  totalUsers: 0,
  totalBids: 0,
  totalRevenue: 0
});

const fetchStats = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/analytics/overview`);
    if (res.data && res.data.data) {
      stats.value = {
        totalAuctions: res.data.data.totals.auctions || 0,
        totalUsers: res.data.data.totals.users || 0,
        totalBids: res.data.data.totals.bids || 0,
        totalRevenue: res.data.data.revenue.total || 0
      };
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    // Set to 0 if API fails, to ensure only real data is shown
    stats.value = {
      totalAuctions: 0,
      totalUsers: 0,
      totalBids: 0,
      totalRevenue: 0
    };
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

const fetchActiveAuctions = async () => {
  loadingAuctions.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/auctions?status=active`);
    if (res.data && res.data.success) {
      const activeData = res.data.data;

      // 1. Vendas em Destaque: Slice top 4
      featuredAuctions.value = activeData.slice(0, 4);

      // 2. Leilões ao Vivo: Map active auctions to event structure
      liveEvents.value = activeData.map((auction) => {
        const date = new Date(auction.endTime);
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dateText = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} — ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return {
          id: auction._id,
          title: auction.title,
          dateText: dateText,
          image: auction.imageUrl,
          lots: auction.images?.length || 1,
          location: 'Nacional',
          code: `Lote #${auction._id.substring(auction._id.length - 4).toUpperCase()}`,
          type: 'Apenas Online',
          hasPreBid: auction.bids && auction.bids.length > 0,
          badge: auction.startingPrice > 500000 ? 'Veículo Premium' : ''
        };
      });

      // 3. Mais Procurados: Sort by bids count descending and slice top 4
      const sortedByBids = [...activeData].sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
      comingSoonItems.value = sortedByBids.slice(0, 4);
    }

    // Load upcoming auctions
    try {
      const resUpcoming = await axios.get(`${apiUrl}/api/auctions?status=upcoming`);
      if (resUpcoming.data && resUpcoming.data.success) {
        upcomingAuctions.value = resUpcoming.data.data;
      }
    } catch (errUpcoming) {
      console.error('Failed to load upcoming auctions:', errUpcoming);
    }


  } catch (err) {
    console.error('Failed to load active auctions:', err);
  } finally {
    loadingAuctions.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('resize', onResize);
  await fetchWatchlist();
  await fetchStats();

  // Setup ticking countdown interval
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);

  // Check welcome popup status
  if (!sessionStorage.getItem('hasSeenWelcome')) {
    showWelcomeCard.value = true;
    sessionStorage.setItem('hasSeenWelcome', 'true');
    welcomeTimeoutId = setTimeout(() => {
      showWelcomeCard.value = false;
    }, 6000);
  }

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

  // Load partners custom settings
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const resPartners = await axios.get(`${apiUrl}/api/settings/partners`);
    if (resPartners.data && resPartners.data.success && Array.isArray(resPartners.data.data)) {
      partners.value = resPartners.data.data;
    }
  } catch (err) {
    console.warn('Failed to load partners settings, using default fallback.', err);
  }

  // Load active auctions
  await fetchActiveAuctions();

  // Start slideshow after settings are loaded
  restartSlideshow();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (intervalId) clearInterval(intervalId);
  if (countdownInterval) clearInterval(countdownInterval);
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

.hero-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.4rem 1rem;
  border-radius: 99px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.pulse-green-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-green 1.8s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.hero-mpesa-mini-logo {
  height: 18px;
  width: auto;
  object-fit: contain;
  border-radius: 3px;
  background: white;
  padding: 1px 4px;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -1.5px;
  color: #ffffff;
  line-height: 1.08;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.hero-title-glowing {
  background: linear-gradient(135deg, #ffffff 30%, #fecaca 70%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(0.95rem, 2.5vw, 1.2rem);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  max-width: 540px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

/* Floating Ribbon Bar */
.hero-floating-ribbon {
  position: relative;
  z-index: 3;
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.85rem 1.75rem;
  border-radius: 99px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  max-width: 92%;
  width: auto;
}

@media (max-width: 768px) {
  .hero-floating-ribbon {
    display: none;
  }
}

.ribbon-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ribbon-icon {
  font-size: 1.25rem;
}

.ribbon-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.ribbon-text strong {
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
}

.ribbon-text span {
  color: #94a3b8;
  font-size: 0.72rem;
}

.ribbon-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
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
  background-color: #1a56db;
  color: white;
}
.btn-primary.hero-btn:hover {
  background-color: #171a20;
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

/* ─── Search Section (Blue Banner) ─── */
.search-section {
  background-color: #1a56db;
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
  color: #1a56db;
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
  color: #1a56db;
}

.quick-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1.5rem;
}

.quick-categories-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  margin-right: 0.25rem;
}

.quick-cat-btn {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.quick-cat-btn:hover {
  background-color: #ffffff;
  color: #1a56db;
  transform: translateY(-1px);
}

/* ─── Partners Section (Infinite Marquee) ─── */
.partners-section {
  background-color: #ffffff;
  padding: 1.25rem 0;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
}

/* Fade mask on left and right edges */
.partners-marquee-wrapper {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
}

/* The scrolling track — two groups side by side */
.partners-marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 22s linear infinite;
}

.partners-marquee-track:hover {
  animation-play-state: paused;
}

/* Each group holds one full set of logos */
.partners-marquee-group {
  display: flex;
  align-items: center;
  gap: 3.5rem;
  padding: 0 3.5rem;
  flex-shrink: 0;
}

@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.partner-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.65;
  transition: opacity 0.3s;
  user-select: none;
  flex-shrink: 0;
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

.partner-logo-img-dynamic {
  max-height: 38px;
  max-width: 140px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.85;
  transition: all 0.3s ease;
}

.partner-logo:hover .partner-logo-img-dynamic {
  filter: grayscale(0%);
  opacity: 1;
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

.event-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 0.65rem;
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card-title:hover {
  color: #006643;
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
.card-mpesa-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.25rem 0.55rem;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.card-mpesa-icon {
  height: 14px;
  width: auto;
  object-fit: contain;
  border-radius: 2px;
  background: white;
  padding: 1px 3px;
}

.card-mpesa-tag span {
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

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

/* ─── Upcoming Auctions Section ─── */
.upcoming-auctions-section {
  padding: 5rem 1.5rem;
  background-color: #ffffff;
}

.upcoming-scroll-container {
  position: relative;
  width: 100%;
}

.upcoming-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.5rem 0 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.upcoming-scroll::-webkit-scrollbar {
  height: 6px;
}

.upcoming-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.upcoming-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}

.upcoming-card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.upcoming-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.upcoming-img-wrapper {
  height: 160px;
  position: relative;
  overflow: hidden;
  background-color: #f3f4f6;
}

.upcoming-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.upcoming-card:hover .upcoming-img {
  transform: scale(1.05);
}

.upcoming-badge-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background-color: rgba(23, 26, 32, 0.85);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
}

.upcoming-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.upcoming-category {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #f57c00;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 0.35rem;
}

.upcoming-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.upcoming-price-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.6rem;
  margin-top: auto;
}

.upcoming-price-label {
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.upcoming-price-val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.upcoming-footer {
  padding: 0 1.25rem 1.25rem;
}

.btn-upcoming-detail {
  width: 100%;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  color: var(--text-primary);
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.upcoming-card:hover .btn-upcoming-detail {
  background-color: var(--text-primary);
  color: white;
  border-color: var(--text-primary);
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

/* ─── Minimalist How It Works Section ─── */
.how-it-works-section-minimal {
  padding: 5rem 1.5rem;
  background: #f8fafc;
}

.section-badge-minimal {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #e60000;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: block;
}

.steps-container-minimal {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .steps-container-minimal {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .steps-container-minimal {
    grid-template-columns: 1fr;
  }
}

.step-card-minimal {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: left;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.step-card-minimal:hover {
  border-color: #e60000;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(230, 0, 0, 0.08);
}

.step-num-badge {
  font-size: 1.15rem;
  font-weight: 900;
  color: #e60000;
  background: #fee2e2;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.step-title-minimal {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.4rem;
}

.step-desc-minimal {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

/* ─── Minimalist Dark Stats Banner ─── */
.stats-section-minimal {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 4.5rem 1.5rem;
  color: white;
}

.stats-grid-minimal {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
}

@media (max-width: 992px) {
  .stats-grid-minimal {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-grid-minimal {
    grid-template-columns: 1fr;
  }
}

.stat-card-minimal {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2.25rem 1.25rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card-minimal:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.stat-num-bold {
  font-size: clamp(1.8rem, 3.5vw, 2.75rem);
  font-weight: 900;
  letter-spacing: -1px;
  color: #ffffff;
  margin-bottom: 0.4rem;
}

.highlight-revenue {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-lbl-sub {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ─── Features Section (Original) ─── */
.features-section {
  padding: clamp(80px, 12vw, 120px) 1.5rem;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  position: relative;
  overflow: hidden;
}

.features-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  text-align: center;
  margin-bottom: clamp(3rem, 6vw, 4.5rem);
  color: #171a20;
  letter-spacing: -0.8px;
  position: relative;
  z-index: 1;
}

.features-title::after {
  content: '';
  display: block;
  width: 48px;
  height: 4px;
  background: #006643;
  border-radius: 2px;
  margin: 0.85rem auto 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 3rem 2rem 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  transition: background-color 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 102, 67, 0.25);
}

.feature-card:hover::before {
  background: #006643;
}

.feature-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #006643;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 102, 67, 0.05);
}

.feature-card:hover .feature-number {
  background-color: #006643;
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 102, 67, 0.2);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #171a20;
  letter-spacing: -0.3px;
}

.feature-card p {
  font-size: 0.92rem;
  color: #6b7280;
  line-height: 1.65;
  margin: 0;
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

/* ─── Newsletter Section ─── */
.newsletter-section {
  padding: clamp(60px, 8vw, 90px) 1.5rem;
  background: linear-gradient(135deg, #1a56db 0%, #7c3aed 50%, #ec4899 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.newsletter-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: pulse-glow 8s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.newsletter-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 2;
}

.newsletter-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.newsletter-title {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 800;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.newsletter-subtitle {
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 500;
}

.newsletter-form {
  width: 100%;
  max-width: 600px;
}

.newsletter-input-group {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 6px;
  transition: focus-within 0.3s ease, border-color 0.3s ease;
}

.newsletter-input-group:focus-within {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.newsletter-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.75rem 1.5rem;
  color: white;
  font-size: 0.95rem;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.btn-newsletter-submit {
  background-color: white;
  color: #1a56db;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-newsletter-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.25);
  background-color: #f3f4f6;
}

.btn-newsletter-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.newsletter-disclaimer {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 600px) {
  .newsletter-input-group {
    flex-direction: column;
    background: transparent;
    border: none;
    padding: 0;
    gap: 0.75rem;
    border-radius: 0;
  }
  
  .newsletter-input {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 0.85rem 1.5rem;
    width: 100%;
  }

  .newsletter-input-group:focus-within .newsletter-input {
    border-color: rgba(255, 255, 255, 0.6);
  }
  
  .btn-newsletter-submit {
    border-radius: 50px;
    padding: 0.85rem 2rem;
    width: 100%;
  }
  .stats-row .stat-card:last-child {
    grid-column: auto;
  }
}

/* ── Welcome Pop-up Card Styles ── */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.welcome-popup-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem 2rem 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  position: relative;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.welcome-popup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(90deg, #1a56db, #7c3aed);
}

.welcome-close-btn {
  position: absolute;
  right: 1.25rem;
  top: 1.25rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.welcome-close-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-primary);
}

.welcome-emoji {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: inline-block;
  animation: wave 1.5s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.welcome-popup-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.welcome-popup-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a56db;
  margin-bottom: 0.75rem;
}

.welcome-popup-sub {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

.btn-welcome-action {
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Premium Empty State Styles ── */
.premium-empty-state {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.7);
  border-radius: 20px;
  padding: 3.5rem 2rem;
  text-align: center;
  overflow: hidden;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.premium-empty-state:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.empty-state-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(26, 86, 219, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 1;
  pointer-events: none;
}

.empty-state-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-pulse {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon-pulse-shadow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.15);
  animation: pulse-ring 2.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

.icon-pulse-core {
  font-size: 2.2rem;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.75);
    opacity: 0.8;
  }
  80%, 100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 460px;
  line-height: 1.6;
  margin-bottom: 1.75rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-empty-action {
  background-color: var(--btn-primary-bg);
  color: white;
  padding: 0.65rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.15);
}

.btn-empty-action:hover {
  background-color: #1a56db;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(26, 86, 219, 0.25);
  color: white;
}

.btn-empty-action-outline {
  background-color: white;
  color: var(--text-primary);
  border: 1px solid #e5e7eb;
  padding: 0.65rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-empty-action-outline:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* ─── Stats/Trust Section ─── */
.stats-section {
  background: linear-gradient(135deg, #1a56db 0%, #3e6ae1 100%);
  padding: 4rem 1.5rem;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, background 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.9;
}

/* ─── How It Works Section ─── */
.how-it-works-section {
  padding: 5rem 1.5rem;
  background: #f9fafb;
}

.section-header-center {
  text-align: center;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.section-header-center .section-title-premium {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.05rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.25rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  max-width: 1200px;
  margin: 3rem auto;
  position: relative;
}

.step-item {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3e6ae1, #1a56db);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(62, 106, 225, 0.3);
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #3e6ae1, #e5e7eb);
  margin-top: 2rem;
  position: relative;
}

.step-connector::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #3e6ae1;
  border-radius: 50%;
}

.how-it-works-cta {
  text-align: center;
  margin-top: 3rem;
}

.btn-lg {
  padding: 1rem 2.5rem;
  font-size: 1rem;
}

/* ── Mobile Responsiveness Enhancements ── */
@media (max-width: 768px) {
  .hero-section {
    padding: 85px 1.25rem 2.5rem;
    min-height: auto;
  }

  .hero-eyebrow {
    font-size: 0.8rem;
    padding: 0.35rem 0.75rem;
    margin-bottom: 0.75rem;
    max-width: 100%;
    white-space: normal;
    text-align: center;
  }

  .hero-title {
    font-size: 1.8rem;
    line-height: 1.25;
    margin-bottom: 0.75rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
    padding: 0 0.5rem;
  }

  .hero-btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  .search-section {
    padding: 2rem 1.25rem;
  }

  .search-section-title {
    font-size: 1.35rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .search-bar-form {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .btn-advanced-search {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 0.8rem 1rem;
  }

  .quick-categories {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-top: 1rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .quick-categories::-webkit-scrollbar {
    display: none;
  }

  .quick-cat-btn {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .section-header {
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
  }

  .section-title-premium {
    font-size: 1.35rem;
  }

  .section-header-center {
    margin-bottom: 1.75rem;
  }

  .section-header-center .section-title-premium {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
    padding: 0 0.5rem;
  }

  .how-it-works-section {
    padding: 2.5rem 1.25rem;
  }

  .steps-container {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 1.75rem auto 1.5rem;
  }

  .step-item {
    width: 100%;
    max-width: 340px;
    background: #ffffff;
    padding: 1.5rem 1.25rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f0f0;
  }

  .step-number {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .step-icon {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .step-title {
    font-size: 1.05rem;
  }

  .step-description {
    font-size: 0.85rem;
  }

  .step-connector {
    width: 2px;
    height: 24px;
    background: linear-gradient(180deg, #3e6ae1, #cbd5e1);
    margin: -0.25rem auto;
    position: relative;
  }

  .step-connector::after {
    display: none;
  }

  .how-it-works-cta {
    margin-top: 2rem;
  }

  .how-it-works-cta .btn-lg {
    width: 100%;
    max-width: 340px;
    padding: 0.875rem 1.5rem;
  }

  .stats-section {
    padding: 2rem 1.25rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .stat-item {
    padding: 1rem 0.75rem;
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0.35rem;
  }

  .stat-number {
    font-size: 1.35rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}

/* ── Finished Auctions Styles ── */
.finished-auctions-section {
  padding: 3.5rem 1.5rem;
  background-color: #f9fafb;
}

.finished-card {
  border-color: #e5e7eb;
}

.finished-img-wrapper {
  background-color: #111;
}

.sales-card-img.dimmed {
  opacity: 0.65;
  filter: grayscale(40%);
}

.finished-overlay-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(17, 24, 39, 0.85);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
}

.finished-price {
  color: #4b5563 !important;
}
</style>
