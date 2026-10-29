<template>
  <div v-if="auction" class="auction-detail-container">
    <div class="split-layout">
      <!-- Left: Image side (Gallery) -->
      <div class="image-side-container">
        <!-- Main Image -->
        <div class="main-image-display" :style="{ backgroundImage: `url(${activeImage || auction.imageUrl})` }" @click="openLightbox(activeImage || auction.imageUrl)" style="cursor: zoom-in;">
          <div class="image-overlay">
            <div class="top-overlay-bar">
              <button class="back-btn" @click="$router.back()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Voltar
              </button>

              <!-- Image Counter Badge -->
              <div v-if="allImages.length > 1" class="image-counter-badge">
                <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ currentImageIndex + 1 }} / {{ allImages.length }}
              </div>
            </div>

            <!-- Gallery Image Navigation Arrows (Left & Right) -->
            <div v-if="allImages.length > 1" class="gallery-nav-arrows">
              <button type="button" class="gallery-arrow-btn prev-arrow" @click.stop="prevImage" title="Imagem anterior" aria-label="Imagem anterior">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button type="button" class="gallery-arrow-btn next-arrow" @click.stop="nextImage" title="Próxima imagem" aria-label="Próxima imagem">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <!-- Auto-play Control -->
            <div v-if="allImages.length > 1" class="autoplay-control">
              <button 
                type="button" 
                class="autoplay-btn"
                :class="{ playing: isAutoPlaying }"
                @click.stop="toggleAutoPlay"
                :title="isAutoPlaying ? 'Pausar slideshow' : 'Iniciar slideshow'"
              >
                <svg v-if="!isAutoPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Gallery Thumbnails -->
        <div v-if="auction.images && auction.images.length > 1" class="gallery-thumbnails">
          <div 
            v-for="(img, idx) in auction.images" 
            :key="idx" 
            class="gallery-thumb"
            :class="{ active: (activeImage || auction.imageUrl) === img }"
            @click="activeImage = img"
            :title="`Imagem ${idx + 1} de ${auction.images.length}`"
          >
            <img :src="img" alt="Miniatura do produto" />
            <div v-if="(activeImage || auction.imageUrl) === img" class="thumb-indicator"></div>
          </div>
        </div>

        <!-- Auto-play Progress Bar -->
        <div v-if="isAutoPlaying && allImages.length > 1" class="autoplay-progress">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Right: Content & Bidding -->
      <div class="content-side">
        <div class="content-wrapper animate-fade-in">

          <!-- Auction Status Bar (GoBid Style) -->
          <div class="auction-status-bar">
            <span class="status-text">Leilão Online</span>
            <span class="status-datetime">{{ new Date(auction.endTime).toLocaleDateString('pt-MZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }} {{ new Date(auction.endTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>

          <!-- Lot Title & Location -->
          <div class="lot-header">
            <h1 class="lot-title">Lote {{ auction.lotNumber || 1 }} - {{ auction.title }}</h1>
            <p class="lot-location">{{ auction.location || 'Prime Auction Maputo' }} #{{ auction.lotNumber || 'LOT001' }}</p>
          </div>

          <!-- Vehicle Details Card (Yellow Header - GoBid Style) -->
          <div class="vehicle-details-card">
            <div class="card-header yellow-header">
              <span class="card-header-title">Detalhes do Veículo</span>
            </div>
            <div class="card-body">
              <div class="detail-row">
                <span class="detail-label">Valor Estimado:</span>
                <span class="detail-value">{{ formatCurrency(auction.estimatedValue || auction.startingPrice * 1.5) }}</span>
              </div>
              <div class="detail-table">
                <div class="table-row">
                  <span class="table-label">Código</span>
                  <span class="table-value">{{ auction.code || 'Code 2' }}</span>
                </div>
                <div class="table-row">
                  <span class="table-label">Quilometragem</span>
                  <span class="table-value">{{ auction.vehicleSpecs?.mileage ? formatNumber(auction.vehicleSpecs.mileage) + ' km' : 'N/A' }}</span>
                </div>
                <div class="table-row">
                  <span class="table-label">Chave</span>
                  <span class="table-value">Sim</span>
                </div>
                <div class="table-row">
                  <span class="table-label">Origem</span>
                  <span class="table-value">Seguro</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lot Status/Bidding Card (Yellow Header - GoBid Style) -->
          <div class="bidding-card">
            <div class="card-header yellow-header">
              <span class="card-header-title">Lote {{ auction.lotNumber || 1 }} de 50</span>
            </div>
            <div class="card-body">
              <div class="bid-row">
                <span class="bid-label">Lance Mínimo:</span>
                <span class="bid-value asking-bid">{{ formatCurrency(auction.startingPrice) }}</span>
              </div>
              <div class="bid-row">
                <span class="bid-label">Lance Mais Alto:</span>
                <span class="bid-value highest-bid">{{ bids.length > 0 ? formatCurrency(bids[bids.length - 1].amount) : 'Nenhum' }}</span>
              </div>
              <div class="bid-row">
                <span class="bid-label">Incremento:</span>
                <span class="bid-value increment">{{ formatCurrency(auction.bidIncrement || 1000) }}</span>
              </div>
              
              <div class="bidding-actions">
                <div v-if="!authStore.isAuthenticated" class="auth-message">
                  <p>Faça login para colocar o seu lance.</p>
                  <div class="auth-buttons">
                    <router-link to="/login" class="btn btn-login">Login</router-link>
                    <router-link to="/register" class="btn btn-signup">Sign Up</router-link>
                  </div>
                </div>
                <div v-else class="bid-form">
                  <button class="btn btn-bid-calculator" @click="showBidCalculator = true">Calculadora de Lances</button>
                </div>
              </div>

              <div class="bid-timestamp">
                <span class="timestamp-label">Última atualização:</span>
                <span class="timestamp-value">{{ new Date().toLocaleString('pt-MZ') }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Info Metadata Grid -->
          <div class="quick-meta-grid">
            <div class="meta-item">
              <span class="meta-icon">🏷️</span>
              <div class="meta-content">
                <span class="meta-label">Categoria</span>
                <span class="meta-value">{{ auction.category || 'Geral' }}</span>
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🔨</span>
              <div class="meta-content">
                <span class="meta-label">Total Lances</span>
                <span class="meta-value">{{ bids.length }} {{ bids.length === 1 ? 'lance' : 'lances' }}</span>
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👤</span>
              <div class="meta-content">
                <span class="meta-label">Vendedor</span>
                <span class="meta-value">{{ auction.createdBy?.name || 'Prime Auction' }}</span>
                <StarRating v-if="auction.createdBy" :rating="auction.createdBy.averageRating || 0" :count="auction.createdBy.ratingsCount || 0" size="sm" />
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🛡️</span>
              <div class="meta-content">
                <span class="meta-label">Garantia</span>
                <span class="meta-value">Verificado & Protegido</span>
              </div>
            </div>
          </div>

          <p class="description">{{ auction.description }}</p>

          <!-- Bidding Information (GoBid Style) -->
          <div class="bidding-info-box">
            <div class="bidding-info-header">
              <div class="lot-info">
                <span class="lot-label">Lot</span>
                <span class="lot-number">{{ auction.lotNumber || Math.floor(Math.random() * 100) + 1 }}</span>
              </div>
              <div class="auction-date">
                <svg xmlns="http://www.w3.org/2000/svg" class="date-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ new Date(auction.endTime).toLocaleDateString('pt-MZ', { weekday: 'short', day: 'numeric', month: 'short' }) }}
              </div>
            </div>

            <div class="bidding-info-grid">
              <div class="bid-info-item">
                <span class="bid-label">Lance Mínimo</span>
                <span class="bid-value asking-bid">{{ formatCurrency(auction.startingPrice) }}</span>
              </div>
              <div class="bid-info-item">
                <span class="bid-label">Lance Mais Alto</span>
                <span class="bid-value highest-bid">{{ bids.length > 0 ? formatCurrency(bids[bids.length - 1].amount) : 'Nenhum' }}</span>
              </div>
              <div class="bid-info-item">
                <span class="bid-label">Incremento</span>
                <span class="bid-value increment">{{ formatCurrency(auction.bidIncrement || 1000) }}</span>
              </div>
            </div>
          </div>

          <!-- Price & Timer -->
          <div class="status-box">
            <div class="info-col">
              <span class="label">{{ isUpcoming ? 'Preço Inicial' : 'Lance Actual' }}</span>
              <span class="price highlight">{{ formatCurrency(isUpcoming ? auction.startingPrice : auction.currentPrice) }}</span>
              <!-- IVA Transparency breakdown -->
              <div v-if="auction.applyTax !== false" class="tax-transparency-badge">
                <template v-if="!auction.taxInclusive">
                  <span class="tax-tag">+ IVA ({{ auction.taxRate || 15 }}%): {{ formatCurrency((isUpcoming ? auction.startingPrice : auction.currentPrice) * ((auction.taxRate || 15) / 100)) }}</span>
                  <span class="tax-total">Total Estimado c/ IVA: <strong>{{ formatCurrency((isUpcoming ? auction.startingPrice : auction.currentPrice) * (1 + (auction.taxRate || 15) / 100)) }}</strong></span>
                </template>
                <template v-else>
                  <span class="tax-tag-inclusive">✓ IVA ({{ auction.taxRate || 15 }}%) incluído</span>
                  <span class="tax-subtext">Base: {{ formatCurrency((isUpcoming ? auction.startingPrice : auction.currentPrice) / (1 + (auction.taxRate || 15) / 100)) }} | IVA: {{ formatCurrency((isUpcoming ? auction.startingPrice : auction.currentPrice) - ((isUpcoming ? auction.startingPrice : auction.currentPrice) / (1 + (auction.taxRate || 15) / 100))) }}</span>
                </template>
              </div>
            </div>
            <div class="info-col info-col-right">
              <span class="label">{{ isEnded ? 'Terminado Em' : (isUpcoming ? 'Começa Em' : 'Termina Em') }}</span>
              <span class="time" :style="{ color: !isEnded ? '#ef4444' : 'inherit', fontWeight: !isEnded ? '600' : 'normal' }">
                {{ isEnded ? new Date(auction.endTime).toLocaleString('pt-MZ') : getCountdownText(isUpcoming ? auction.startTime : auction.endTime) }}
              </span>
            </div>
          </div>
          
          <!-- Bid Form -->
          <div class="bidding-section" v-if="!isEnded">
            <h3 class="section-title">Fazer Lance</h3>
            
            <div v-if="isUpcoming" class="auth-warning" style="background-color: rgba(255, 152, 0, 0.05); border: 1px solid rgba(255, 152, 0, 0.2); color: #f57c00;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f57c00; margin-right: 8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"></polyline></svg>
              Este leilão está agendado e ainda não começou. Começa em: <strong>{{ getCountdownText(auction.startTime) }} ({{ new Date(auction.startTime).toLocaleString('pt-MZ') }})</strong>.
            </div>
            <div v-else-if="!authStore.isAuthenticated" class="auth-warning">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Faça login para licitar.
              <div class="auth-buttons">
                <router-link to="/login" class="btn btn-login">Login</router-link>
                <router-link to="/register" class="btn btn-signup">Sign Up</router-link>
              </div>
            </div>
            <div v-else-if="authStore.isAdmin" class="auth-warning">
              Administradores não podem participar nos leilões.
            </div>
            <div v-else-if="isOwner" class="auth-warning owner-warning">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Você é o vendedor deste leilão. Não pode licitar no seu próprio artigo.
            </div>
            <form v-else @submit.prevent="placeBid" class="bid-form">
              <!-- User Bids Quick Shortcut Banner -->
              <div v-if="authStore.isAuthenticated && userBids.length > 0" class="user-bids-shortcut-banner animate-fade-in">
                <div class="user-bids-shortcut-info">
                  <span class="user-bids-icon">📊</span>
                  <span>Você tem <strong>{{ userBids.length }} {{ userBids.length === 1 ? 'lance' : 'lances' }}</strong> neste leilão</span>
                </div>
                <button type="button" @click="scrollToHistoryTab" class="btn-user-bids-action">
                  <span>Ver Meus Lances ({{ userBids.length }}) →</span>
                </button>
              </div>

              <!-- Real-time Intelligent Bid Validation Warning -->
              <div v-if="isBidInvalid" class="bid-validation-alert animate-fade-in">
                <span class="val-alert-icon">⚠️</span>
                <div class="val-alert-body">
                  <strong>Lance Inválido:</strong> O valor introduzido ({{ formatCurrency(bidAmount) }}) é menor ou igual ao lance atual ({{ formatCurrency(auction.currentPrice) }}).
                  O próximo lance deve ser no mínimo <strong>{{ formatCurrency(auction.currentPrice + 1) }}</strong>.
                </div>
              </div>
              <div v-else-if="bidAmount > auction.currentPrice" class="bid-validation-success animate-fade-in">
                <span class="val-success-icon">✅</span>
                <div class="val-success-body">
                  <span>Lance Válido! Proposta de <strong>+{{ formatCurrency(bidAmount - auction.currentPrice) }}</strong> acima do valor atual.</span>
                  <div v-if="auction.applyTax !== false" class="bid-tax-note">
                    <span v-if="!auction.taxInclusive">
                      Detalhamento: <strong>{{ formatCurrency(bidAmount) }}</strong> + IVA ({{ auction.taxRate || 15 }}%): <strong>{{ formatCurrency(bidAmount * ((auction.taxRate || 15) / 100)) }}</strong> = <strong>Total: {{ formatCurrency(bidAmount * (1 + (auction.taxRate || 15) / 100)) }}</strong>
                    </span>
                    <span v-else>
                      Total com IVA ({{ auction.taxRate || 15 }}%) incluído: <strong>{{ formatCurrency(bidAmount) }}</strong> (IVA: {{ formatCurrency(bidAmount - (bidAmount / (1 + (auction.taxRate || 15) / 100))) }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- Participation Fee / Active Status Banner -->
              <div v-if="auction.hasPaidFee" class="participation-banner participant-active animate-fade-in">
                <span class="banner-icon">🛡️</span>
                <div class="banner-content">
                  <span class="banner-title">Participação Habilitada</span>
                  <span class="banner-desc">Taxa de inscrição confirmada. Os seus lances são registados instantaneamente.</span>
                </div>
              </div>
              <div v-else class="participation-banner fee-required animate-fade-in">
                <span class="banner-icon">🛡️</span>
                <div class="banner-content">
                  <span class="banner-title">Garantia Reembolsável: <strong>{{ formatCurrency(auction.participationFee || 1000) }}</strong></span>
                  <span class="banner-desc">Taxa de inscrição 100% devolvida à sua carteira digital após o encerramento do leilão.</span>
                </div>
              </div>

              <div class="input-with-button">
                <span class="currency-prefix">MZN</span>
                <input 
                  type="text" 
                  v-model="displayBidAmount" 
                  @input="handleBidInput"
                  class="form-input bid-input" 
                  :class="{ 'bid-input-error': isBidInvalid }"
                  placeholder="Introduza o valor"
                  required 
                />
                <button 
                  type="submit" 
                  class="btn btn-primary btn-pill bid-submit"
                  :disabled="isBidInvalid || isOwner"
                >
                  {{ auction.hasPaidFee ? 'Licitar Agora' : 'Pagar Taxa & Licitar' }}
                </button>
              </div>

              <!-- Quick bid buttons -->
              <div class="quick-bid-suggestions">
                <span class="suggestion-label">Sugestões de incremento a partir do lance atual:</span>
                <div class="suggestion-btns">
                  <button 
                    type="button" 
                    v-for="inc in suggestedIncrements" 
                    :key="inc" 
                    class="btn-suggestion"
                    @click="setBidIncrement(inc)"
                  >
                    +{{ formatNumber(inc) }} MZN
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div v-else class="ended-section winner-celebration animate-fade-in">
            <div class="trophy-icon">🏆</div>
            <h3 class="section-title">Leilão Terminado</h3>
            <div class="winner-info" v-if="auction.winner">
              <p class="winner-label">Arrematado por</p>
              <h4 class="winner-name">{{ auction.winner.name }}</h4>
              <p class="winner-price">Valor Final (Martelo): <span>{{ formatCurrency(auction.currentPrice) }}</span></p>
              
              <!-- Winner Tax Settlement Card -->
              <div v-if="auction.applyTax !== false" class="winner-tax-settlement-card">
                <div class="settle-title">📄 Resumo de Liquidação Final (com IVA)</div>
                <div class="settle-row">
                  <span>Valor do Martelo (Lance Vencedor):</span>
                  <strong>{{ formatCurrency(auction.currentPrice) }}</strong>
                </div>
                <div class="settle-row" v-if="!auction.taxInclusive">
                  <span>IVA ({{ auction.taxRate || 15 }}%):</span>
                  <strong style="color: #0284c7;">+{{ formatCurrency(auction.currentPrice * ((auction.taxRate || 15) / 100)) }}</strong>
                </div>
                <div class="settle-row" v-else>
                  <span>IVA ({{ auction.taxRate || 15 }}% incluído):</span>
                  <strong style="color: #059669;">{{ formatCurrency(auction.currentPrice - (auction.currentPrice / (1 + (auction.taxRate || 15) / 100))) }}</strong>
                </div>
                <div class="settle-row">
                  <span>Subtotal com Impostos:</span>
                  <strong>{{ formatCurrency(auction.taxInclusive ? auction.currentPrice : (auction.currentPrice * (1 + (auction.taxRate || 15) / 100))) }}</strong>
                </div>
                <div class="settle-row settle-deduction">
                  <span>Garantia de Participação Dedutível:</span>
                  <strong style="color: #10b981;">-{{ formatCurrency(auction.participationFee || 1000) }}</strong>
                </div>
                <div class="settle-divider"></div>
                <div class="settle-row settle-total">
                  <span>Saldo Restante a Liquidar:</span>
                  <strong class="settle-final-amount">{{ formatCurrency(Math.max(0, (auction.taxInclusive ? auction.currentPrice : (auction.currentPrice * (1 + (auction.taxRate || 15) / 100))) - (auction.participationFee || 1000))) }}</strong>
                </div>
              </div>
              
              <!-- Review Action Box -->
              <div v-if="canReview" class="review-action-box" style="margin-top: 1.25rem; padding: 1rem; background: rgba(234, 179, 8, 0.08); border: 1px dashed #eab308; border-radius: 12px; text-align: center;">
                <div v-if="existingReview">
                  <span style="font-weight: 600; color: #854d0e;">Sua Avaliação Registada:</span>
                  <div style="margin-top: 0.25rem;">
                    <StarRating :rating="existingReview.rating" size="md" />
                  </div>
                  <p v-if="existingReview.comment" style="font-style: italic; font-size: 0.9rem; color: #4b5563; margin-top: 0.35rem;">"{{ existingReview.comment }}"</p>
                </div>
                <div v-else>
                  <p style="margin-bottom: 0.5rem; font-weight: 600; color: #854d0e;">
                    {{ counterpartyRole === 'vendedor' ? '⭐ Avalie a sua experiência com o vendedor!' : '⭐ Avalie a sua experiência com o comprador!' }}
                  </p>
                  <button type="button" @click="showReviewModal = true" class="btn btn-warning btn-pill btn-sm" style="background: #eab308; color: #fff; font-weight: 600; border: none; padding: 0.5rem 1.25rem; cursor: pointer;">
                    ⭐ Avaliar {{ counterpartyName }}
                  </button>
                </div>
              </div>
            </div>
            <div class="winner-info" v-else>
              <p class="ended-text">Este leilão terminou sem lances.</p>
            </div>
          </div>

          <!-- Action Buttons (GoBid Style) -->
          <div class="action-buttons">
            <button class="btn-action" @click="showBidCalculator = true">
              <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculadora de Lances
            </button>
            <button class="btn-action" @click="showHowAuctionsWork = true">
              <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Como Funcionam os Leilões?
            </button>
          </div>

          <!-- Structured Information Tabs Container -->
          <div class="details-tab-container">
            <div class="details-tab-header">
              <button 
                type="button"
                class="tab-btn" 
                :class="{ active: activeTab === 'details' }"
                @click="activeTab = 'details'"
              >
                <span class="tab-icon">📋</span>
                <span class="tab-text">Detalhes & Specs</span>
              </button>
              <button 
                type="button"
                class="tab-btn" 
                :class="{ active: activeTab === 'history' }"
                @click="activeTab = 'history'"
              >
                <span class="tab-icon">📊</span>
                <span class="tab-text">Histórico</span>
                <span class="tab-badge">{{ bids.length }}</span>
              </button>
              <button 
                type="button"
                class="tab-btn" 
                :class="{ active: activeTab === 'comments' }"
                @click="activeTab = 'comments'"
              >
                <span class="tab-icon">💬</span>
                <span class="tab-text">Comentários</span>
                <span class="tab-badge">{{ comments.length }}</span>
              </button>
              <button 
                type="button"
                class="tab-btn" 
                :class="{ active: activeTab === 'payment' }"
                @click="activeTab = 'payment'"
              >
                <span class="tab-icon">🛡️</span>
                <span class="tab-text">Pagamento & Garantia</span>
              </button>
            </div>

            <div class="details-tab-content">
              <!-- TAB 1: Detalhes & Especificações -->
              <div v-if="activeTab === 'details'" class="tab-pane animate-fade-in">
                <h3 class="pane-title">Descrição Completa</h3>
                <div class="description-card">
                  <p>{{ auction.description }}</p>
                </div>

                <h3 class="pane-title" style="margin-top: 1.5rem;">Ficha Técnica & Informações do Leilão</h3>
                <div class="specs-grid">
                  <div class="spec-card">
                    <span class="spec-label">Categoria</span>
                    <span class="spec-val">{{ auction.category || 'Geral' }}</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Estado do Item</span>
                    <span class="spec-val text-green">Excelente / Verificado</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Preço Inicial</span>
                    <span class="spec-val">{{ formatCurrency(auction.startingPrice) }}</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Total de Lances</span>
                    <span class="spec-val">{{ bids.length }} lances</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Data de Início</span>
                    <span class="spec-val">{{ new Date(auction.startTime || auction.createdAt).toLocaleString('pt-MZ') }}</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Data de Término</span>
                    <span class="spec-val">{{ new Date(auction.endTime).toLocaleString('pt-MZ') }}</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Vendedor / Leiloeiro</span>
                    <span class="spec-val">{{ auction.createdBy?.name || 'Prime Auction' }}</span>
                  </div>
                  <div class="spec-card">
                    <span class="spec-label">Estado de Reserva</span>
                    <span class="spec-val text-blue">Preço de Reserva Cumprido</span>
                  </div>
                </div>
              </div>

              <!-- TAB 2: Histórico & Gráfico de Lances -->
              <div v-else-if="activeTab === 'history'" class="tab-pane animate-fade-in">
                <div class="history-section">
                  <!-- Graphic Chart of Bids -->
                  <div v-if="chartData.length > 1" class="bid-chart-card animate-fade-in">
                    <h4 class="chart-card-title">Evolução do Preço em Tempo Real</h4>
                    <div class="chart-wrapper">
                      <div class="chart-container-relative">
                        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" width="100%" height="100%" class="price-chart-svg">
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stop-color="#1a56db" stop-opacity="0.25" />
                              <stop offset="100%" stop-color="#1a56db" stop-opacity="0.00" />
                            </linearGradient>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stop-color="#3b82f6" />
                              <stop offset="50%" stop-color="#1a56db" />
                              <stop offset="100%" stop-color="#7c3aed" />
                            </linearGradient>
                          </defs>
                          
                          <!-- Horizontal Gridlines -->
                          <g class="grid-lines">
                            <line 
                              v-for="tick in yTicks" 
                              :key="'grid-' + tick.y"
                              :x1="padding.left" 
                              :y1="tick.y" 
                              :x2="chartWidth - padding.right" 
                              :y2="tick.y" 
                              stroke="#f3f4f6" 
                              stroke-width="1"
                            />
                          </g>
                          
                          <!-- Y Axis Labels -->
                          <g class="y-axis-labels">
                            <text 
                              v-for="tick in yTicks" 
                              :key="'label-' + tick.y"
                              :x="padding.left - 10" 
                              :y="tick.y + 4" 
                              text-anchor="end" 
                              class="axis-text"
                            >
                              {{ tick.label }}
                            </text>
                          </g>
                          
                          <!-- X Axis Line -->
                          <line 
                            :x1="padding.left" 
                            :y1="chartHeight - padding.bottom" 
                            :x2="chartWidth - padding.right" 
                            :y2="chartHeight - padding.bottom" 
                            stroke="#e5e7eb" 
                            stroke-width="1.5"
                          />

                          <!-- X Axis Labels (Bid order / dates) -->
                          <g class="x-axis-labels">
                            <text 
                              v-for="tick in xTicks" 
                              :key="'x-label-' + tick.index"
                              :x="tick.x" 
                              :y="chartHeight - padding.bottom + 20" 
                              text-anchor="middle" 
                              class="axis-text x-axis-text"
                            >
                              {{ tick.index === 0 ? 'Início' : `#${tick.index}` }}
                            </text>
                          </g>
                          
                          <!-- Hover Guideline -->
                          <line 
                            v-if="hoveredPoint" 
                            :x1="hoveredPoint.x" 
                            :y1="padding.top" 
                            :x2="hoveredPoint.x" 
                            :y2="chartHeight - padding.bottom" 
                            stroke="#d1d5db" 
                            stroke-width="1" 
                            stroke-dasharray="3 3"
                          />
                          
                          <!-- Area Under Line -->
                          <path :d="areaPath" fill="url(#areaGrad)" />
                          
                          <!-- Line Chart Path -->
                          <path 
                            :d="linePath" 
                            fill="none" 
                            stroke="url(#lineGrad)" 
                            stroke-width="2.5" 
                            stroke-linecap="round" 
                            stroke-linejoin="round"
                          />
                          
                          <!-- Interactive Dots -->
                          <g class="chart-dots">
                            <g 
                              v-for="p in chartPoints" 
                              :key="'dot-' + p.index"
                              @mouseover="hoveredPoint = p"
                              @mouseleave="hoveredPoint = null"
                            >
                              <!-- Visual Circle -->
                              <circle 
                                :cx="p.x" 
                                :cy="p.y" 
                                :r="hoveredPoint && hoveredPoint.index === p.index ? 6 : 4" 
                                :fill="hoveredPoint && hoveredPoint.index === p.index ? '#1a56db' : '#3b82f6'" 
                                stroke="white" 
                                :stroke-width="hoveredPoint && hoveredPoint.index === p.index ? 2.5 : 1.5"
                                class="chart-circle"
                              />
                              <!-- Large Hover hit area -->
                              <circle 
                                :cx="p.x" 
                                :cy="p.y" 
                                r="16" 
                                fill="transparent" 
                                style="cursor: pointer;"
                              />
                            </g>
                          </g>
                        </svg>
                        
                        <!-- Tooltip -->
                        <div 
                          v-if="hoveredPoint" 
                          class="chart-tooltip"
                          :style="{ 
                            left: `${(hoveredPoint.x / chartWidth) * 100}%`, 
                            top: `${(hoveredPoint.y / chartHeight) * 100 - 8}%` 
                          }"
                        >
                          <div class="tooltip-amount">{{ hoveredPoint.label }}</div>
                          <div class="tooltip-meta">
                            <span class="tooltip-user">{{ hoveredPoint.user }}</span>
                            <span class="tooltip-date">{{ hoveredPoint.date }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul class="bid-list">
                    <li v-for="(bid, index) in bids" :key="bid._id" class="bid-item" :class="{ 'top-bid': index === 0, 'my-bid-row': isMyBid(bid) }">
                      <div class="bid-left">
                        <div class="bid-avatar">
                          <img v-if="bid.user?.profilePhoto" :src="bid.user.profilePhoto" alt="Avatar" class="bid-avatar-img" />
                          <span v-else>{{ bid.user?.name?.charAt(0)?.toUpperCase() }}</span>
                        </div>
                        <span class="bid-user">{{ bid.user?.name }}</span>
                        <span v-if="isMyBid(bid)" class="my-bid-tag">Seu Lance</span>
                        <span v-if="index === 0" class="leader-badge">Líder</span>
                      </div>
                      <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
                    </li>
                    <li v-if="bids.length === 0" class="no-bids">
                      Sem lances ainda. Seja o primeiro!
                    </li>
                  </ul>
                </div>
              </div>

              <!-- TAB 3: Perguntas & Comentários -->
              <div v-else-if="activeTab === 'comments'" class="tab-pane animate-fade-in">
                <div class="comments-section">
                  <h3 class="pane-title">Perguntas & Comentários do Leilão</h3>
                  
                  <!-- Comment Box Form -->
                  <div v-if="authStore.isAuthenticated" class="comment-input-box">
                    <textarea
                      v-model="newCommentText"
                      class="form-input comment-textarea"
                      placeholder="Faça uma pergunta ao vendedor ou deixe o seu comentário sobre este leilão..."
                      rows="3"
                      maxlength="500"
                    ></textarea>
                    <div class="comment-form-footer">
                      <span class="char-counter">{{ newCommentText.length }}/500</span>
                      <button 
                        @click="submitComment" 
                        type="button" 
                        class="btn btn-primary btn-pill btn-sm"
                        :disabled="submittingComment || !newCommentText.trim()"
                      >
                        <span v-if="submittingComment" class="spinner-inline"></span>
                        {{ submittingComment ? 'A publicar...' : '💬 Publicar Comentário' }}
                      </button>
                    </div>
                  </div>
                  <div v-else class="auth-warning" style="margin-bottom: 1.5rem;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <router-link to="/login">Faça login</router-link> para publicar um comentário ou fazer perguntas.
                  </div>

                  <!-- Comments List -->
                  <div class="comments-list">
                    <div 
                      v-for="comment in comments" 
                      :key="comment._id" 
                      class="comment-card animate-fade-in"
                    >
                      <div class="comment-header">
                        <div class="comment-user-info">
                          <div class="comment-avatar">
                            <img v-if="comment.user?.profilePhoto" :src="comment.user.profilePhoto" alt="Avatar" />
                            <span v-else>{{ comment.user?.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
                          </div>
                          <div>
                            <div class="comment-author-row">
                              <span class="comment-author-name">{{ comment.user?.name || 'Utilizador' }}</span>
                              <span v-if="isCommentAuthorOwner(comment)" class="author-badge badge-seller">Vendedor</span>
                              <span v-else-if="comment.user?.role === 'admin'" class="author-badge badge-admin">Admin</span>
                            </div>
                            <span class="comment-time">{{ formatRelativeTime(comment.createdAt) }}</span>
                          </div>
                        </div>

                        <!-- Delete option if owner or admin -->
                        <button 
                          v-if="canDeleteComment(comment)" 
                          @click="handleDeleteComment(comment._id)" 
                          class="btn-delete-comment"
                          title="Eliminar comentário"
                        >
                          🗑️
                        </button>
                      </div>

                      <p class="comment-text-content">{{ comment.text }}</p>

                      <div class="comment-footer">
                        <button 
                          @click="handleToggleCommentLike(comment)" 
                          class="btn-comment-like"
                          :class="{ liked: isCommentLikedByCurrentUser(comment) }"
                          :disabled="!authStore.isAuthenticated"
                          title="Gostar deste comentário"
                        >
                          <span class="like-icon">❤️</span>
                          <span class="like-count">{{ comment.likes?.length || 0 }}</span>
                        </button>
                      </div>
                    </div>

                    <div v-if="comments.length === 0" class="no-comments-state">
                      <span class="no-comments-icon">💬</span>
                      <h4>Sem comentários ainda</h4>
                      <p>Seja o primeiro a fazer uma pergunta ou iniciar uma conversa sobre este artigo!</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 4: Pagamento & Garantia -->
              <div v-else-if="activeTab === 'payment'" class="tab-pane animate-fade-in">
                <!-- Multimeios Payment Box (M-Pesa, eMola, Visa) -->
                <div v-if="auction" class="multimeios-pay-card animate-fade-in">
                  <div class="pay-card-header">
                    <div class="pay-logos-group">
                      <img src="/mpesa-logo.png" alt="M-Pesa" class="pay-mini-logo" />
                      <img src="/emola-logo.png" alt="eMola" class="pay-mini-logo" />
                      <img src="/visa-logo.png" alt="Visa" class="pay-mini-logo" />
                    </div>
                    <strong class="pay-card-title">Pagamento Direto do Artigo</strong>
                  </div>
                  <p class="pay-card-subtitle">Efetue a liquidação em segurança usando M-Pesa, eMola ou Cartão de Crédito.</p>
                  <button @click="handleDirectPayClick" type="button" class="btn btn-pay-royal">
                    <span>Pagar {{ formatCurrency(bidAmount > (auction?.currentPrice || 0) ? bidAmount : auction?.currentPrice) }}</span>
                  </button>
                </div>

                <!-- Guarantee & Shipping Cards Grid -->
                <div class="guarantee-grid">
                  <div class="g-card">
                    <span class="g-icon">🛡️</span>
                    <h4>Compra 100% Protegida</h4>
                    <p>Seu valor fica retido em sistema de custódia seguro até a entrega e confirmação do produto em perfeitas condições.</p>
                  </div>
                  <div class="g-card">
                    <span class="g-icon">🚚</span>
                    <h4>Entrega Nacional</h4>
                    <p>Logística integrada com envio para todas as províncias de Moçambique com rastreio ativo.</p>
                  </div>
                  <div class="g-card">
                    <span class="g-icon">💬</span>
                    <h4>Suporte Técnico 24/7</h4>
                    <p>Equipa dedicada para apoiar em todas as etapas da licitação e expedição do artigo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-full">
    <div class="spinner"></div>
  </div>

  <!-- Profile Completion Modal (Multi-Step Wizard) -->
  <Transition name="modal-fade">
    <div v-if="showProfileModal" class="custom-modal-overlay" @click.self="closeProfileModal">
      <div class="custom-modal-card wizard-card animate-scale-in">

        <!-- Header -->
        <div class="modal-header-row">
          <span class="modal-title-icon">📋</span>
          <h4>Completar Perfil</h4>
          <button type="button" class="wizard-close-btn" @click="closeProfileModal" aria-label="Fechar">✕</button>
        </div>

        <!-- Step Dots -->
        <div class="wizard-steps">
          <div v-for="n in 4" :key="n" class="wizard-dot" :class="{ active: profileStep === n, done: profileStep > n }"></div>
        </div>
        <p class="wizard-step-label">Passo {{ profileStep }} de 4</p>

        <!-- Steps Content -->
        <div class="wizard-body">

          <!-- Step 1: Nome -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="profileStep === 1" key="step1">
              <label class="form-label">👤 Nome Completo</label>
              <input
                type="text"
                v-model="profileForm.name"
                class="form-input wizard-input"
                placeholder="Ex: João Silva"
                autofocus
                @keyup.enter="nextStep"
              />
            </div>

            <!-- Step 2: Telefone -->
            <div v-else-if="profileStep === 2" key="step2">
              <label class="form-label">📞 Contacto Telefónico</label>
              <input
                type="text"
                v-model="profileForm.phone"
                class="form-input wizard-input"
                placeholder="Ex: +258 84 123 4567"
                @keyup.enter="nextStep"
              />
            </div>

            <!-- Step 3: Província -->
            <div v-else-if="profileStep === 3" key="step3">
              <label class="form-label">📍 Província</label>
              <select v-model="profileForm.province" class="form-input wizard-input">
                <option value="" disabled>Seleccione a sua província</option>
                <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
              </select>
            </div>

            <!-- Step 4: Sexo + Idade -->
            <div v-else-if="profileStep === 4" key="step4">
              <label class="form-label">⚧ Sexo</label>
              <div class="wizard-gender-group">
                <label
                  v-for="g in ['Masculino', 'Feminino', 'Outro']"
                  :key="g"
                  class="wizard-gender-btn"
                  :class="{ selected: profileForm.gender === g }"
                >
                  <input type="radio" v-model="profileForm.gender" :value="g" style="display:none" />
                  {{ g === 'Masculino' ? '♂ Masculino' : g === 'Feminino' ? '♀ Feminino' : '⊕ Outro' }}
                </label>
              </div>
              <label class="form-label" style="margin-top:1.25rem;">🎂 Idade</label>
              <input
                type="number"
                v-model="profileForm.age"
                class="form-input wizard-input"
                min="1"
                max="120"
                placeholder="Ex: 28"
              />
            </div>
          </Transition>

          <!-- Error message -->
          <p v-if="wizardError" class="wizard-error">{{ wizardError }}</p>
        </div>

        <!-- Footer Navigation -->
        <div class="wizard-footer">
          <button
            v-if="profileStep > 1"
            type="button"
            class="btn btn-secondary btn-pill btn-sm"
            @click="prevStep"
          >← Anterior</button>
          <button
            v-else
            type="button"
            class="btn btn-secondary btn-pill btn-sm"
            @click="closeProfileModal"
          >Cancelar</button>

          <button
            v-if="profileStep < 4"
            type="button"
            class="btn btn-primary btn-pill btn-sm"
            @click="nextStep"
          >Próximo →</button>
          <button
            v-else
            type="button"
            class="btn btn-primary btn-pill btn-sm"
            :disabled="submittingProfile"
            @click="submitProfileDetails"
          >
            <span v-if="submittingProfile" class="btn-spinner"></span>
            {{ submittingProfile ? 'A processar...' : '✓ Confirmar & Licitar' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>

  <!-- M-Pesa Payment Modal -->
  <MpesaModal
    v-if="auction"
    :isOpen="isMpesaModalOpen"
    :auctionId="auction._id"
    :auctionTitle="auction.title"
    :amount="auction.participationFee !== undefined && auction.participationFee !== null ? auction.participationFee : 1000"
    :proposedBidAmount="bidAmount"
    paymentType="participation_fee"
    @close="isMpesaModalOpen = false"
    @success="handleMpesaSuccess"
  />

  <!-- Review / Rating Modal -->
  <Transition name="modal-fade">
    <div v-if="showReviewModal" class="custom-modal-overlay" @click.self="showReviewModal = false">
      <div class="custom-modal-card animate-scale-in" style="max-width: 450px;">
        <div class="modal-header-row">
          <span class="modal-title-icon">⭐</span>
          <h4>Avaliar {{ counterpartyName }}</h4>
          <button type="button" class="wizard-close-btn" @click="showReviewModal = false">✕</button>
        </div>

        <div style="padding: 1.25rem 0; text-align: center;">
          <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem;">
            Como avalia a transação referente ao leilão <strong>"{{ auction?.title }}"</strong>?
          </p>
          
          <StarRating
            :rating="reviewRating"
            :isInteractive="true"
            size="lg"
            :showText="true"
            @update:rating="val => reviewRating = val"
          />

          <div style="margin-top: 1.25rem; text-align: left;">
            <label class="form-label">Comentário (opcional)</label>
            <textarea
              v-model="reviewComment"
              class="form-input"
              rows="3"
              placeholder="Escreva sobre a comunicação, estado do artigo ou pontualidade..."
              maxlength="500"
            ></textarea>
          </div>
        </div>

        <div class="wizard-footer" style="margin-top: 0.5rem;">
          <button type="button" class="btn btn-secondary btn-pill btn-sm" @click="showReviewModal = false">Cancelar</button>
          <button
            type="button"
            class="btn btn-primary btn-pill btn-sm"
            :disabled="submittingReview"
            @click="submitReview"
          >
            {{ submittingReview ? 'A enviar...' : '⭐ Submeter Avaliação' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Bid Calculator Modal (GoBid Style) -->
  <Transition name="modal-fade">
    <div v-if="showBidCalculator" class="custom-modal-overlay" @click.self="showBidCalculator = false">
      <div class="custom-modal-card animate-scale-in" style="max-width: 500px;">
        <div class="modal-header-row">
          <span class="modal-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
          <h4>Calculadora de Lances</h4>
          <button type="button" class="wizard-close-btn" @click="showBidCalculator = false">✕</button>
        </div>

        <div style="padding: 1.5rem;">
          <div class="calculator-info">
            <p style="margin-bottom: 1rem; color: #6b7280;">Use esta calculadora para determinar o valor do seu próximo lance:</p>
            <div class="calc-row">
              <span class="calc-label">Lance Actual:</span>
              <span class="calc-value">{{ formatCurrency(auction.currentPrice) }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Incremento:</span>
              <span class="calc-value">{{ formatCurrency(auction.bidIncrement || 1000) }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Próximo Lance Mínimo:</span>
              <span class="calc-value highlight">{{ formatCurrency(auction.currentPrice + (auction.bidIncrement || 1000)) }}</span>
            </div>
            <div v-if="auction.applyTax !== false && !auction.taxInclusive" class="calc-row">
              <span class="calc-label">+ IVA ({{ auction.taxRate || 15 }}%):</span>
              <span class="calc-value" style="color: #0284c7; font-weight: 600;">+{{ formatCurrency((auction.currentPrice + (auction.bidIncrement || 1000)) * ((auction.taxRate || 15) / 100)) }}</span>
            </div>
            <div v-if="auction.applyTax !== false && !auction.taxInclusive" class="calc-row">
              <span class="calc-label">Total c/ IVA Estimado:</span>
              <span class="calc-value highlight" style="color: #10b981; font-weight: 700;">{{ formatCurrency((auction.currentPrice + (auction.bidIncrement || 1000)) * (1 + (auction.taxRate || 15) / 100)) }}</span>
            </div>
            <div v-else-if="auction.applyTax !== false && auction.taxInclusive" class="calc-row">
              <span class="calc-label">Regime de IVA:</span>
              <span class="calc-value" style="color: #059669; font-size: 13px;">✓ IVA ({{ auction.taxRate || 15 }}%) incluído no lance</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-pill btn-sm" @click="showBidCalculator = false" style="width: 100%; margin-top: 1rem;">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- How Auctions Work Modal (GoBid Style) -->
  <Transition name="modal-fade">
    <div v-if="showHowAuctionsWork" class="custom-modal-overlay" @click.self="showHowAuctionsWork = false">
      <div class="custom-modal-card animate-scale-in" style="max-width: 600px;">
        <div class="modal-header-row">
          <span class="modal-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h4>Como Funcionam os Leilões</h4>
          <button type="button" class="wizard-close-btn" @click="showHowAuctionsWork = false">✕</button>
        </div>

        <div style="padding: 1.5rem;">
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h5 style="font-weight: 700; margin-bottom: 0.25rem;">Registre-se</h5>
                <p style="color: #6b7280; font-size: 0.9rem;">Crie uma conta gratuita para participar nos leilões.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h5 style="font-weight: 700; margin-bottom: 0.25rem;">Verifique o Perfil</h5>
                <p style="color: #6b7280; font-size: 0.9rem;">Complete o seu perfil para aumentar a confiança.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h5 style="font-weight: 700; margin-bottom: 0.25rem;">Faça o Login</h5>
                <p style="color: #6b7280; font-size: 0.9rem;">Faça login para poder licitar nos leilões.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h5 style="font-weight: 700; margin-bottom: 0.25rem;">Licite</h5>
                <p style="color: #6b7280; font-size: 0.9rem;">Coloque o seu lance e siga o leilão em tempo real.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">5</div>
              <div class="step-content">
                <h5 style="font-weight: 700; margin-bottom: 0.25rem;">Ganhe</h5>
                <p style="color: #6b7280; font-size: 0.9rem;">Se for o maior lance no final, você ganha o leilão!</p>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-pill btn-sm" @click="showHowAuctionsWork = false" style="width: 100%; margin-top: 1.5rem;">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Lightbox for full-screen image viewing -->
  <Transition name="lightbox">
    <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox" @keydown.esc="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox" aria-label="Fechar">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <button v-if="allImages.length > 1" class="lightbox-nav lightbox-prev" @click.stop="lightboxPrevImage" aria-label="Imagem anterior">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <img :src="lightboxImage" class="lightbox-image" @click.stop alt="Imagem em tela cheia" />

      <button v-if="allImages.length > 1" class="lightbox-nav lightbox-next" @click.stop="lightboxNextImage" aria-label="Próxima imagem">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div class="lightbox-counter">
        {{ allImages.indexOf(lightboxImage) + 1 }} / {{ allImages.length }}
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import MpesaModal from '../components/MpesaModal.vue';
import StarRating from '../components/StarRating.vue';

const route = useRoute();
const authStore = useAuthStore();
const toastStore = useToastStore();
const auction = ref(null);
const bids = ref([]);
const bidAmount = ref(0);
const displayBidAmount = ref('');
const activeImage = ref('');
const showLightbox = ref(false);
const lightboxImage = ref('');
let socket = null;
const activeTab = ref('details');
const autoPlayInterval = ref(null);
const isAutoPlaying = ref(false);

// --- Review System Logic ---
const showReviewModal = ref(false);
const reviewRating = ref(5);
const reviewComment = ref('');
const submittingReview = ref(false);
const existingReview = ref(null);

// --- GoBid Style Modals ---
const showBidCalculator = ref(false);
const showHowAuctionsWork = ref(false);

// --- Related Auctions ---
const relatedAuctions = ref([]);

const fetchRelatedAuctions = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/auctions`, {
      params: { limit: 5, exclude: auction.value?._id }
    });
    relatedAuctions.value = res.data.filter(a => a._id !== auction.value?._id).slice(0, 3);
  } catch (err) {
    console.error('Error fetching related auctions:', err);
  }
};

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const canReview = computed(() => {
  if (!auction.value || !authStore.isAuthenticated || !authStore.user || !auction.value.winner) {
    return false;
  }
  const ended = auction.value.status === 'finished' || Date.now() > new Date(auction.value.endTime).getTime();
  if (!ended) return false;

  const myId = String(authStore.user._id || authStore.user.id);
  const winnerId = String(auction.value.winner._id || auction.value.winner.id || auction.value.winner);
  const sellerId = String(auction.value.createdBy._id || auction.value.createdBy.id || auction.value.createdBy);
  return (myId === winnerId || myId === sellerId);
});

const counterpartyName = computed(() => {
  if (!auction.value || !authStore.user) return '';
  const myId = String(authStore.user._id || authStore.user.id);
  const winnerId = String(auction.value.winner?._id || auction.value.winner?.id || auction.value.winner || '');
  if (myId === winnerId) {
    return auction.value.createdBy?.name || 'Vendedor';
  }
  return auction.value.winner?.name || 'Vencedor';
});

const counterpartyRole = computed(() => {
  if (!auction.value || !authStore.user) return '';
  const myId = String(authStore.user._id || authStore.user.id);
  const winnerId = String(auction.value.winner?._id || auction.value.winner?.id || auction.value.winner || '');
  return myId === winnerId ? 'vendedor' : 'comprador';
});

const fetchExistingReview = async () => {
  if (!canReview.value || !auction.value) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/reviews/auction/${auction.value._id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    existingReview.value = res.data.data;
  } catch (err) {
    console.error('Error fetching auction review:', err);
  }
};

const submitReview = async () => {
  if (!reviewRating.value) {
    toastStore.error('Por favor selecione uma nota de 1 a 5 estrelas.');
    return;
  }
  submittingReview.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/reviews`, {
      auctionId: auction.value._id,
      rating: reviewRating.value,
      comment: reviewComment.value
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (res.data && res.data.success) {
      existingReview.value = res.data.data;
      showReviewModal.value = false;
      toastStore.success('Avaliação submetida com sucesso! ⭐');
      fetchAuctionData();
    }
  } catch (err) {
    console.error('Error submitting review:', err);
    toastStore.error(err.response?.data?.error || 'Erro ao submeter avaliação.');
  } finally {
    submittingReview.value = false;
  }
};

const userBids = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) return [];
  const myId = authStore.user._id || authStore.user.id;
  return bids.value.filter(b => {
    const bUser = b.user?._id || b.user?.id || b.user;
    return bUser === myId;
  });
});

const isMyBid = (bid) => {
  if (!authStore.isAuthenticated || !authStore.user) return false;
  const myId = authStore.user._id || authStore.user.id;
  const bUser = bid.user?._id || bid.user?.id || bid.user;
  return bUser === myId;
};

const scrollToHistoryTab = () => {
  activeTab.value = 'history';
  nextTick(() => {
    const el = document.querySelector('.details-tab-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

// Image Gallery Helper Methods
const allImages = computed(() => {
  if (!auction.value) return [];
  if (auction.value.images && auction.value.images.length > 0) {
    return auction.value.images;
  }
  return auction.value.imageUrl ? [auction.value.imageUrl] : [];
});

const currentImageIndex = computed(() => {
  if (!auction.value || allImages.value.length === 0) return 0;
  const current = activeImage.value || auction.value.imageUrl;
  const idx = allImages.value.indexOf(current);
  return idx >= 0 ? idx : 0;
});

const progressPercentage = computed(() => {
  if (allImages.value.length <= 1) return 100;
  return ((currentImageIndex.value + 1) / allImages.value.length) * 100;
});

const prevImage = () => {
  if (allImages.value.length <= 1) return;
  let newIdx = currentImageIndex.value - 1;
  if (newIdx < 0) newIdx = allImages.value.length - 1;
  activeImage.value = allImages.value[newIdx];
};

const nextImage = () => {
  if (allImages.value.length <= 1) return;
  let newIdx = currentImageIndex.value + 1;
  if (newIdx >= allImages.value.length) newIdx = 0;
  activeImage.value = allImages.value[newIdx];
};

// Lightbox functionality
const openLightbox = (image) => {
  lightboxImage.value = image;
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  showLightbox.value = false;
  lightboxImage.value = '';
  document.body.style.overflow = '';
};

const lightboxNextImage = () => {
  if (allImages.value.length <= 1) return;
  const currentIdx = allImages.value.indexOf(lightboxImage.value);
  let newIdx = currentIdx + 1;
  if (newIdx >= allImages.value.length) newIdx = 0;
  lightboxImage.value = allImages.value[newIdx];
};

const lightboxPrevImage = () => {
  if (allImages.value.length <= 1) return;
  const currentIdx = allImages.value.indexOf(lightboxImage.value);
  let newIdx = currentIdx - 1;
  if (newIdx < 0) newIdx = allImages.value.length - 1;
  lightboxImage.value = allImages.value[newIdx];
};

// Auto-play functionality
const startAutoPlay = () => {
  if (allImages.value.length <= 1) return;
  stopAutoPlay(); // Clear any existing interval
  isAutoPlaying.value = true;
  autoPlayInterval.value = setInterval(() => {
    nextImage();
  }, 3000); // Change image every 3 seconds
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
  isAutoPlaying.value = false;
};

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
};

// Keyboard navigation
const handleKeydown = (e) => {
  // Lightbox keyboard navigation
  if (showLightbox.value) {
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        lightboxPrevImage();
        break;
      case 'ArrowRight':
        lightboxNextImage();
        break;
    }
    return;
  }

  // Gallery keyboard navigation
  if (allImages.value.length <= 1) return;

  switch(e.key) {
    case 'ArrowLeft':
      prevImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case ' ':
      e.preventDefault();
      toggleAutoPlay();
      break;
  }
};

const isMpesaModalOpen = ref(false);
const isDirectPaymentAttempt = ref(false);

const openMpesaModal = () => {
  if (!authStore.isAuthenticated) {
    toastStore.add('Por favor, faça login para efetuar o pagamento M-Pesa.', 'warning');
    return;
  }
  isMpesaModalOpen.value = true;
};

const handleDirectPayClick = () => {
  if (!authStore.isAuthenticated) {
    toastStore.warning('Por favor, faça login para efetuar o pagamento.');
    return;
  }
  isDirectPaymentAttempt.value = true;
  openProfileWizard();
};
const handleMpesaSuccess = async (receipt) => {
  if (auction.value) {
    auction.value.hasPaidFee = true;
  }
  toastStore.success('Taxa de participação confirmada e lance registado com sucesso! 🎉');
  await fetchAuctionData();
};

const userWatchlist = ref([]);
const fetchUserWatchlist = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/users/watchlist`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    userWatchlist.value = res.data.data.map(item => item._id || item.id);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
  }
};

const isLiked = computed(() => {
  if (!auction.value) return false;
  return userWatchlist.value.includes(auction.value._id || auction.value.id);
});

const toggleWatchlist = async () => {
  if (!auction.value) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/users/watchlist/${auction.value._id}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success) {
      if (res.data.isAdded) {
        userWatchlist.value.push(auction.value._id);
        toastStore.success('Adicionado aos favoritos! ❤️');
      } else {
        userWatchlist.value = userWatchlist.value.filter(id => id !== auction.value._id);
        toastStore.success('Removido dos favoritos.');
      }
      auction.value.likesCount = res.data.count;
    }
  } catch (err) {
    console.error('Error toggling watchlist:', err);
    toastStore.error('Erro ao atualizar favoritos.');
  }
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

// Utility functions for bid input formatting (thousands: dot, decimals: comma)
const parseFormattedNumber = (str) => {
  if (!str) return 0;
  let normalized = str.replace(/[\s.]/g, '').replace(',', '.');
  let num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

const formatInputString = (str) => {
  if (typeof str !== 'string') str = String(str);
  let clean = str.replace(/[^0-9,.]/g, '');
  let parts = clean.split(/[.,]/);
  let integerPart = parts[0];
  let decimalPart = parts.slice(1).join('');
  
  if (integerPart) {
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '') || '0';
    }
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  let result = integerPart;
  if (clean.includes(',') || clean.includes('.')) {
    result += ',' + decimalPart.slice(0, 2);
  }
  return result;
};

// Input event handler preserving cursor position
const handleBidInput = (e) => {
  const input = e.target;
  const originalValue = input.value;
  const originalSelectionStart = input.selectionStart;
  
  const formatted = formatInputString(originalValue);
  const digitsBeforeCursor = originalValue.substring(0, originalSelectionStart).replace(/[^0-9]/g, '').length;
  
  displayBidAmount.value = formatted;
  bidAmount.value = parseFormattedNumber(formatted);
  
  nextTick(() => {
    let newCursorPosition = 0;
    let digitsFound = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9]/.test(formatted[i])) {
        digitsFound++;
      }
      newCursorPosition = i + 1;
      if (digitsFound === digitsBeforeCursor) {
        break;
      }
    }
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};


const showProfileModal = ref(false);
const submittingProfile = ref(false);
const profileStep = ref(1);
const wizardError = ref('');
const provinces = [
  'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala',
  'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
];
const profileForm = ref({
  name: '',
  phone: '',
  province: '',
  gender: '',
  age: null
});

const nextStep = () => {
  wizardError.value = '';
  if (profileStep.value === 1 && !profileForm.value.name.trim()) {
    wizardError.value = 'Por favor, preencha o seu nome completo.';
    return;
  }
  if (profileStep.value === 2 && !profileForm.value.phone.trim()) {
    wizardError.value = 'Por favor, preencha o contacto telefónico.';
    return;
  }
  if (profileStep.value === 3 && !profileForm.value.province) {
    wizardError.value = 'Por favor, seleccione a sua província.';
    return;
  }
  profileStep.value++;
};

const prevStep = () => {
  wizardError.value = '';
  profileStep.value--;
};

const isEnded = computed(() => {
  if (!auction.value) return true;
  return new Date() > new Date(auction.value.endTime) || auction.value.status === 'finished';
});

const isUpcoming = computed(() => {
  if (!auction.value) return false;
  return auction.value.status === 'upcoming' || (auction.value.startTime && new Date() < new Date(auction.value.startTime));
});

const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0,00 MZN';
  const valNum = Number(value);
  const formatted = valNum.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} MZN`;
};

// --- SVG Chart Logic ---
const chartWidth = 500;
const chartHeight = 220;
const padding = { top: 25, bottom: 40, left: 65, right: 25 };
const hoveredPoint = ref(null);

const formatShortCurrency = (val) => {
  if (val === undefined || val === null) return '0 MZN';
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1).replace('.', ',')}M MZN`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(0)}k MZN`;
  }
  return `${val.toFixed(0)} MZN`;
};

const chartData = computed(() => {
  if (!auction.value) return [];
  
  const points = [{
    amount: auction.value.startingPrice,
    label: formatCurrency(auction.value.startingPrice),
    date: auction.value.startTime ? new Date(auction.value.startTime).toLocaleString('pt-MZ') : '',
    user: 'Preço Inicial'
  }];
  
  const chronoBids = [...bids.value].reverse();
  chronoBids.forEach(bid => {
    points.push({
      amount: bid.amount,
      label: formatCurrency(bid.amount),
      date: bid.createdAt ? new Date(bid.createdAt).toLocaleString('pt-MZ') : '',
      user: bid.user?.name || 'Licitante'
    });
  });
  
  return points;
});

const chartMinVal = computed(() => {
  if (!chartData.value.length) return 0;
  return Math.min(...chartData.value.map(p => p.amount));
});

const chartMaxVal = computed(() => {
  if (!chartData.value.length) return 100;
  const max = Math.max(...chartData.value.map(p => p.amount));
  const min = chartMinVal.value;
  return max === min ? max + 1000 : max;
});

const chartPoints = computed(() => {
  const data = chartData.value;
  if (!data.length) return [];
  
  const minX = padding.left;
  const maxX = chartWidth - padding.right;
  const minY = chartHeight - padding.bottom;
  const maxY = padding.top;
  
  const minVal = chartMinVal.value;
  const maxVal = chartMaxVal.value;
  const valRange = maxVal - minVal || 1;
  const xRange = maxX - minX;
  const yRange = minY - maxY;
  
  const n = data.length;
  
  return data.map((d, i) => {
    const x = n > 1 ? minX + (i / (n - 1)) * xRange : (minX + maxX) / 2;
    const y = minY - ((d.amount - minVal) / valRange) * yRange;
    return {
      x,
      y,
      amount: d.amount,
      label: d.label,
      date: d.date,
      user: d.user,
      index: i
    };
  });
});

const linePath = computed(() => {
  const points = chartPoints.value;
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
});

const areaPath = computed(() => {
  const points = chartPoints.value;
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  const bottomY = chartHeight - padding.bottom;
  return `${linePath.value} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
});

const yTicks = computed(() => {
  const minVal = chartMinVal.value;
  const maxVal = chartMaxVal.value;
  const diff = maxVal - minVal;
  
  const ticks = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const val = minVal + (diff * (i / (count - 1)));
    const y = (chartHeight - padding.bottom) - (i / (count - 1)) * (chartHeight - padding.bottom - padding.top);
    ticks.push({
      value: val,
      label: formatShortCurrency(val),
      y
    });
  }
  return ticks;
});

const xTicks = computed(() => {
  const points = chartPoints.value;
  if (points.length === 0) return [];
  if (points.length <= 5) return points;
  
  const indices = [
    0,
    Math.floor((points.length - 1) * 0.25),
    Math.floor((points.length - 1) * 0.5),
    Math.floor((points.length - 1) * 0.75),
    points.length - 1
  ];
  const uniqueIndices = [...new Set(indices)];
  return uniqueIndices.map(idx => points[idx]);
});

// Smart Bidding Logic
const isOwner = computed(() => {
  if (!auction.value || !authStore.user) return false;
  const owner = auction.value.createdBy;
  const ownerId = typeof owner === 'object' ? (owner?._id || owner?.id) : owner;
  const currentUserId = authStore.user?.id || authStore.user?._id;
  return ownerId && currentUserId && (ownerId.toString() === currentUserId.toString());
});

const isLeader = computed(() => {
  if (!bids.value.length || !authStore.user) return false;
  const topBidder = bids.value[0]?.user;
  const topBidderId = typeof topBidder === 'object' ? (topBidder?._id || topBidder?.id) : topBidder;
  const currentUserId = authStore.user?.id || authStore.user?._id;
  return topBidderId && currentUserId && (topBidderId.toString() === currentUserId.toString());
});

const isBidInvalid = computed(() => {
  if (!auction.value) return false;
  return bidAmount.value <= auction.value.currentPrice;
});

const minIncrement = computed(() => {
  if (!auction.value) return 100;
  const price = auction.value.currentPrice;
  if (price < 5000) return 100;
  if (price < 20000) return 500;
  if (price < 100000) return 1000;
  return 5000;
});

const suggestedBidAmount = computed(() => {
  if (!auction.value) return 0;
  return auction.value.currentPrice + minIncrement.value;
});

const suggestedIncrements = computed(() => {
  const inc = minIncrement.value;
  return [inc, inc * 2, inc * 5];
});

const formatNumber = (val) => {
  return new Intl.NumberFormat('pt-MZ').format(val);
};

const setBidIncrement = (increment) => {
  if (auction.value) {
    const newAmount = auction.value.currentPrice + increment;
    bidAmount.value = newAmount;
    displayBidAmount.value = formatInputString(newAmount.toString());
  }
};

const fetchAuctionData = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const headers = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {};
    const [auctionRes, bidsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/auctions/${route.params.id}`, { headers }),
      axios.get(`${apiUrl}/api/bids/${route.params.id}`)
    ]);
    auction.value = auctionRes.data.data;
    bids.value = bidsRes.data.data;
    const suggested = suggestedBidAmount.value;
    bidAmount.value = suggested;
    displayBidAmount.value = formatInputString(suggested.toString());
    activeImage.value = auction.value.imageUrl;
    await fetchExistingReview();
  } catch (err) {
    console.error(err);
  }
};

const closeProfileModal = () => {
  showProfileModal.value = false;
  profileStep.value = 1;
  wizardError.value = '';
};

const submitProfileDetails = async () => {
  wizardError.value = '';
  if (!profileForm.value.gender) {
    wizardError.value = 'Por favor, seleccione o seu sexo.';
    return;
  }
  if (!profileForm.value.age) {
    wizardError.value = 'Por favor, indique a sua idade.';
    return;
  }
  submittingProfile.value = true;
  try {
    const res = await authStore.updateProfile({
      name: profileForm.value.name,
      phone: profileForm.value.phone,
      province: profileForm.value.province,
      gender: profileForm.value.gender,
      age: profileForm.value.age
    });

    if (res.success) {
      toastStore.success('Perfil actualizado com sucesso! ✓');
      showProfileModal.value = false;
      profileStep.value = 1;

      if (isDirectPaymentAttempt.value || (auction.value && !auction.value.hasPaidFee)) {
        isDirectPaymentAttempt.value = false;
        openMpesaModal();
      } else {
        await executePlaceBid();
      }
    } else {
      toastStore.error(res.error || 'Erro ao actualizar o perfil.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro ao salvar o perfil.');
  } finally {
    submittingProfile.value = false;
  }
};

const isProfileComplete = computed(() => {
  const user = authStore.user;
  if (!user) return false;
  return Boolean(
    user.name && String(user.name).trim().length > 0 &&
    user.phone && String(user.phone).trim().length > 0 &&
    user.province && String(user.province).trim().length > 0 &&
    user.gender && String(user.gender).trim().length > 0 &&
    user.age && Number(user.age) > 0
  );
});

const openProfileWizard = () => {
  const user = authStore.user || {};
  profileForm.value = {
    name: user.name || '',
    phone: user.phone || '',
    province: user.province || '',
    gender: user.gender || '',
    age: user.age || null
  };
  profileStep.value = 1;
  wizardError.value = '';
  showProfileModal.value = true;
};

const placeBid = async () => {
  if (!authStore.isAuthenticated) {
    toastStore.warning('Por favor, faça login para licitar.');
    return;
  }

  if (isOwner.value) {
    toastStore.error('Você é o vendedor deste leilão e não pode licitar no seu próprio artigo.');
    return;
  }

  // Validate bid amount is strictly greater than currentPrice
  const minBid = auction.value ? auction.value.currentPrice + 1 : 1;
  if (bidAmount.value < minBid) {
    toastStore.error(`O valor do lance (${formatCurrency(bidAmount.value)}) deve ser estritamente superior ao valor atual (${formatCurrency(auction.value.currentPrice)}).`);
    return;
  }

  isDirectPaymentAttempt.value = false;
  
  if (!isProfileComplete.value) {
    openProfileWizard();
    return;
  }

  // If user has not yet paid the participation fee, open payment modal to pay fee
  if (auction.value && !auction.value.hasPaidFee) {
    openMpesaModal();
    return;
  }

  // User already paid participation fee, execute bid directly
  await executePlaceBid();
};

const executePlaceBid = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const bidVal = bidAmount.value;
    const res = await axios.post(
      `${apiUrl}/api/bids/${route.params.id}`,
      { amount: bidVal },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );

    if (res.data && res.data.success) {
      toastStore.success(`Lance de ${formatCurrency(bidVal)} registado com sucesso! 🔨`);
      
      // Update local price and bid history immediately
      if (auction.value) {
        auction.value.currentPrice = bidVal;
        const newSuggested = bidVal + minIncrement.value;
        bidAmount.value = newSuggested;
        displayBidAmount.value = formatInputString(newSuggested.toString());
      }
      
      // Re-fetch auction data to ensure 100% sync with server populate
      await fetchAuctionData();
    }
  } catch (err) {
    const errData = err.response?.data;
    if (errData?.requiresFee) {
      toastStore.warning(errData.error || 'É necessário pagar a taxa de participação para licitar.');
      if (auction.value) auction.value.hasPaidFee = false;
      openMpesaModal();
    } else {
      toastStore.error(errData?.error || 'Erro ao registar lance');
    }
  }
};

// --- Comments System State & Logic ---
const comments = ref([]);
const newCommentText = ref('');
const submittingComment = ref(false);

const fetchComments = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/comments/${route.params.id}`);
    comments.value = res.data.data;
  } catch (err) {
    console.error('Error fetching comments:', err);
  }
};

const submitComment = async () => {
  if (!newCommentText.value.trim()) return;
  submittingComment.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(
      `${apiUrl}/api/comments/${route.params.id}`,
      { text: newCommentText.value.trim() },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    if (res.data && res.data.success) {
      toastStore.success('Comentário publicado com sucesso! 💬');
      newCommentText.value = '';
    }
  } catch (err) {
    toastStore.error(err.response?.data?.error || 'Erro ao publicar comentário');
  } finally {
    submittingComment.value = false;
  }
};

const handleDeleteComment = async (commentId) => {
  if (!confirm('Tem a certeza que deseja eliminar este comentário?')) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.delete(`${apiUrl}/api/comments/item/${commentId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    toastStore.success('Comentário eliminado');
  } catch (err) {
    toastStore.error(err.response?.data?.error || 'Erro ao eliminar comentário');
  }
};

const handleToggleCommentLike = async (comment) => {
  if (!authStore.isAuthenticated) {
    toastStore.warning('Faça login para gostar de comentários');
    return;
  }
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(
      `${apiUrl}/api/comments/item/${comment._id}/like`,
      {},
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    if (res.data && res.data.success) {
      comment.likes = res.data.data.likes;
    }
  } catch (err) {
    toastStore.error('Erro ao actualizar gosto do comentário');
  }
};

const isCommentLikedByCurrentUser = (comment) => {
  if (!authStore.user || !comment.likes) return false;
  const currentUserId = authStore.user?.id || authStore.user?._id;
  return comment.likes.some(id => (typeof id === 'object' ? (id._id || id.id) : id).toString() === currentUserId.toString());
};

const isCommentAuthorOwner = (comment) => {
  if (!auction.value || !comment.user) return false;
  const owner = auction.value.createdBy;
  const ownerId = typeof owner === 'object' ? (owner?._id || owner?.id) : owner;
  const author = comment.user;
  const authorId = typeof author === 'object' ? (author?._id || author?.id) : author;
  return ownerId && authorId && ownerId.toString() === authorId.toString();
};

const canDeleteComment = (comment) => {
  if (!authStore.user || !comment.user) return false;
  const currentUserId = authStore.user?.id || authStore.user?._id;
  const author = comment.user;
  const authorId = typeof author === 'object' ? (author?._id || author?.id) : author;
  return authStore.isAdmin || (authorId && currentUserId && authorId.toString() === currentUserId.toString());
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 60) return 'Agora mesmo';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour} h`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `há ${diffDays} d`;
  return date.toLocaleDateString('pt-MZ');
};

onMounted(() => {
  fetchAuctionData();
  fetchUserWatchlist();
  fetchComments();
  fetchRelatedAuctions();
  
  // Add keyboard event listener for gallery navigation
  window.addEventListener('keydown', handleKeydown);
  
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  socket = io(apiUrl);
  socket.emit('join_auction', route.params.id);

  socket.on('new_bid', (data) => {
    if (auction.value) {
      auction.value.currentPrice = data.currentPrice;
      if (data.endTime) {
        auction.value.endTime = data.endTime;
      }
      if (data.wasExtended) {
        toastStore.add('⏱️ Leilão prorrogado por +3 minutos devido a um lance nos momentos finais!', 'info');
      }
      if (bidAmount.value <= data.currentPrice) {
        const newAmount = data.currentPrice + minIncrement.value;
        bidAmount.value = newAmount;
        displayBidAmount.value = formatInputString(newAmount.toString());
      }
    }
    bids.value.unshift(data.bid);
  });

  socket.on('new_comment', (comment) => {
    if (!comments.value.some(c => c._id === comment._id)) {
      comments.value.unshift(comment);
    }
  });

  socket.on('comment_deleted', ({ commentId }) => {
    comments.value = comments.value.filter(c => c._id !== commentId);
  });

  socket.on('comment_like_updated', ({ commentId, likes }) => {
    const c = comments.value.find(item => item._id === commentId);
    if (c) c.likes = likes;
  });

  socket.on('auction_ended', (data) => {
    if (auction.value) {
      auction.value.status = 'finished';
      auction.value.winner = data.winner;
      if (data.winningBid) {
        auction.value.currentPrice = data.winningBid;
      }
    }
  });
});

onUnmounted(() => {
  if (socket) {
    socket.emit('leave_auction', route.params.id);
    socket.disconnect();
  }
  if (countdownInterval) clearInterval(countdownInterval);
  
  // Clean up gallery auto-play and keyboard listeners
  stopAutoPlay();
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* ─── IVA & Tax Transparency Styles ─── */
.tax-transparency-badge {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tax-tag {
  display: inline-block;
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.tax-total {
  font-size: 12px;
  color: #475569;
}

.tax-tag-inclusive {
  display: inline-block;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.tax-subtext {
  font-size: 11px;
  color: #64748b;
}

.bid-tax-note {
  margin-top: 4px;
  font-size: 12px;
  color: #1e3a8a;
  background: rgba(59, 130, 246, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.winner-tax-settlement-card {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-align: left;
}

.settle-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #475569;
  padding: 3px 0;
}

.settle-deduction {
  color: #059669;
}

.settle-divider {
  height: 1px;
  background: #cbd5e1;
  margin: 8px 0;
}

.settle-total {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.settle-final-amount {
  font-size: 16px;
  color: #1e40af;
}

/* ─── Container ─── */
.auction-detail-container {
  min-height: 100vh;
  width: 100%;
}

.split-layout {
  display: flex;
  min-height: 100vh;
}

/* ─── Image Side & Gallery ─── */
.image-side-container {
  flex: 6;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
}

.main-image-display {
  flex-grow: 1;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: background-image 0.3s ease-in-out;
}

.gallery-thumbnails {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  overflow-x: auto;
  flex-shrink: 0;
}

.gallery-thumb {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.65;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumb:hover,
.gallery-thumb.active {
  opacity: 1;
  border-color: #3e6ae1;
  transform: translateY(-2px);
}

.thumb-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #3e6ae1;
  border-radius: 50%;
  border: 2px solid white;
}

/* Auto-play Progress Bar */
.autoplay-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3e6ae1, #5b8def);
  transition: width 0.3s ease;
}

.image-overlay {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%, rgba(0,0,0,0.2) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 90px 1.5rem 1.5rem;
}

.top-overlay-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-1px);
}

.image-counter-badge {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.gallery-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  pointer-events: none;
}

.gallery-arrow-btn {
  pointer-events: auto;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gallery-arrow-btn:hover {
  background: rgba(0, 0, 0, 0.75);
  transform: scale(1.1);
}

.gallery-arrow-btn:active {
  transform: scale(0.95);
}

/* Auto-play Control */
.autoplay-control {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 10;
}

.autoplay-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.autoplay-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.autoplay-btn.playing {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}

.autoplay-btn:active {
  transform: scale(0.95);
}

.gallery-arrow-btn:hover {
  background: #0284c7;
  border-color: #0284c7;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.gallery-arrow-btn:active {
  transform: scale(0.95);
}

/* ─── Content Side ─── */
.content-side {
  flex: 4;
  background-color: #ffffff;
  overflow-y: auto;
  padding: 90px 2.5rem 3rem;
  box-shadow: -8px 0 30px rgba(0,0,0,0.05);
}

/* ─── Status Badge ─── */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.12);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.upcoming {
  background-color: rgba(255, 152, 0, 0.12);
  color: #f57c00;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-badge.ended {
  background-color: rgba(0,0,0,0.06);
  color: #5c5e62;
}

/* ─── Title & Description ─── */
.title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #171a20;
  line-height: 1.2;
}

.description {
  color: #393c41;
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* ─── Vehicle Details Grid (GoBid Style) ─── */
.vehicle-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(0, 166, 81, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  border: 1px solid rgba(0, 166, 81, 0.2);
  border-radius: 12px;
}

.vehicle-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #171a20;
}

/* ─── Bidding Info Box (GoBid Style) ─── */
.bidding-info-box {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 2px solid var(--gobid-green);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.1);
}

.bidding-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.lot-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lot-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lot-number {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--gobid-green);
}

.auction-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.date-icon {
  width: 16px;
  height: 16px;
  color: var(--gobid-green);
}

.bidding-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.bid-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.bid-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bid-value {
  font-size: 1rem;
  font-weight: 700;
  color: #171a20;
}

.bid-value.asking-bid {
  color: var(--gobid-green);
}

.bid-value.highest-bid {
  color: #ef4444;
}

.bid-value.increment {
  color: #3b82f6;
}

/* ─── Action Buttons (GoBid Style) ─── */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: 2px solid var(--gobid-green);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--gobid-green);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: var(--gobid-green);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.3);
}

.action-icon {
  width: 18px;
  height: 18px;
}

/* ─── Auth Buttons (GoBid Style) ─── */
.auth-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-login {
  background: var(--gobid-green);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #008c44;
}

.btn-signup {
  background: transparent;
  color: var(--gobid-green);
  border: 2px solid var(--gobid-green);
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-signup:hover {
  background: var(--gobid-green);
  color: white;
}

/* ─── Calculator & How Auctions Work Styles ─── */
.calculator-info {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.calc-row:last-child {
  border-bottom: none;
}

.calc-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
}

.calc-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #171a20;
}

.calc-value.highlight {
  color: var(--gobid-green);
  font-size: 1.1rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gobid-green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

/* ─── Status Box ─── */
.status-box {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border: 1px solid #ebebeb;
  gap: 1rem;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-col-right {
  text-align: right;
}

.label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #5c5e62;
  font-weight: 600;
}

.price {
  font-size: 1.65rem;
  font-weight: 700;
  color: #3e6ae1;
  line-height: 1;
}

.time {
  font-size: 0.9rem;
  font-weight: 500;
  color: #393c41;
}

/* ─── Section Titles ─── */
.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #171a20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bid-count {
  background-color: #3e6ae1;
  color: white;
  border-radius: 20px;
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  font-weight: 700;
}

/* ─── Bid Form ─── */
.bid-form {
  margin-bottom: 2rem;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.currency-prefix {
  font-weight: 600;
  color: #393c41;
  font-size: 0.9rem;
  white-space: nowrap;
}

.bid-input {
  flex-grow: 1;
  min-width: 0;
}

.bid-submit {
  white-space: nowrap;
  flex-shrink: 0;
}

.success-msg {
  color: #2e7d32;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

.error-msg {
  color: #ed4e50;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.auth-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: #fff8e6;
  color: #856404;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #fceab0;
}

.auth-warning a {
  color: #3e6ae1;
  font-weight: 600;
}

/* ─── Ended Section ─── */
.ended-section {
  margin-bottom: 2rem;
}

.ended-text {
  color: #5c5e62;
  font-size: 0.9rem;
}

/* ─── Winner Celebration ─── */
.winner-celebration {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(255, 215, 0, 0.05) 100%);
  border: 1px dashed rgba(76, 175, 80, 0.35);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.winner-celebration .section-title {
  margin-bottom: 0.5rem;
  color: #2e7d32;
}

.trophy-icon {
  font-size: 3rem;
  margin-bottom: 0.25rem;
  animation: float 2.5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.winner-info {
  margin-top: 0.25rem;
}

.winner-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #5c5e62;
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.winner-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 0.4rem;
}

.winner-price {
  font-size: 0.9rem;
  color: #393c41;
}

.winner-price span {
  font-weight: 700;
  color: #3e6ae1;
}

/* ─── Bid List ─── */
.history-section {
  margin-top: 1.5rem;
}

.bid-list {
  list-style: none;
}

.bid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.bid-item:hover {
  background-color: #fafafa;
}

.bid-item.top-bid {
  background-color: #f0f5ff;
}

.bid-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bid-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #3e6ae1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.bid-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bid-user {
  font-weight: 500;
  font-size: 0.9rem;
}

.leader-badge {
  background-color: #ffd700;
  color: #7a5a00;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.bid-amount {
  font-weight: 700;
  color: #3e6ae1;
  font-size: 0.95rem;
}

.no-bids {
  color: #5c5e62;
  font-style: italic;
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.9rem;
}

/* ─── Loading ─── */
.loading-full {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #3e6ae1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Tablet ─── */
@media (max-width: 992px) {
  .split-layout {
    flex-direction: column;
    min-height: auto;
  }

  .image-side-container {
    height: 50vh;
    min-height: 350px;
    position: relative;
    top: auto;
    flex: none;
  }

  .main-image-display {
    height: 75%;
    flex-grow: 0;
  }

  .gallery-thumbnails {
    height: 25%;
    padding: 0.5rem;
  }

  .content-side {
    flex: none;
    padding: 2rem 1.5rem 3rem;
    box-shadow: none;
  }
}

/* ─── Mobile ─── */
@media (max-width: 480px) {
  .status-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .info-col-right {
    text-align: left;
  }

  .input-with-button {
    flex-wrap: wrap;
  }

  .bid-input {
    width: 100%;
  }

  .bid-submit {
    width: 100%;
  }
}

/* ─── Profile Modal Custom Styles ─── */
.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.custom-modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 1.75rem 1.75rem 1.5rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.modal-title-icon {
  font-size: 1.5rem;
}

.modal-header-row h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #171a20;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #5c5e62;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.25rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #393c41;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
  margin-right: 4px;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ─── Wizard Card ─── */
.wizard-card {
  max-width: 380px;
}

.modal-header-row {
  position: relative;
}

.wizard-close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1rem;
  color: #5c5e62;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.2s;
  margin-left: auto;
}
.wizard-close-btn:hover {
  color: #171a20;
}

.wizard-steps {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 1rem 0 0.25rem;
}

.wizard-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
  transition: all 0.3s ease;
}
.wizard-dot.active {
  background-color: #1a56db;
  width: 22px;
  border-radius: 4px;
}
.wizard-dot.done {
  background-color: #10b981;
}

.wizard-step-label {
  text-align: center;
  font-size: 0.72rem;
  color: #5c5e62;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.wizard-body {
  min-height: 110px;
  margin-bottom: 1.25rem;
}

.wizard-input {
  margin-bottom: 0;
}

.wizard-gender-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.wizard-gender-btn {
  flex: 1;
  min-width: 80px;
  padding: 0.6rem 0.5rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #393c41;
  transition: all 0.2s ease;
  user-select: none;
}
.wizard-gender-btn:hover {
  border-color: #1a56db;
  color: #1a56db;
}
.wizard-gender-btn.selected {
  border-color: #1a56db;
  background-color: rgba(26, 86, 219, 0.07);
  color: #1a56db;
  font-weight: 600;
}

.wizard-error {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.wizard-error::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

/* Step transition animation */
.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.2s ease;
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

/* ─── Smart Bidding Incentive & Quick Bids ─── */
.bid-incentive-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: rgba(26, 86, 219, 0.06);
  color: #1a56db;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.88rem;
  border: 1px solid rgba(26, 86, 219, 0.15);
  font-weight: 500;
  transition: all 0.3s ease;
}

.bid-incentive-msg.leader {
  background-color: rgba(16, 185, 129, 0.08);
  color: #065f46;
  border-color: rgba(16, 185, 129, 0.2);
}

.quick-bid-suggestions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.suggestion-label {
  font-size: 0.75rem;
  color: #5c5e62;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-suggestion {
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #393c41;
  padding: 0.45rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.btn-suggestion:hover {
  border-color: #1a56db;
  color: #1a56db;
  background-color: rgba(26, 86, 219, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(26, 86, 219, 0.08);
}

.btn-suggestion:active {
  transform: translateY(0);
}

/* ── Watchlist Detail Heart Button ── */
.btn-detail-heart {
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #9ca3af;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  flex-shrink: 0;
  position: relative;
}

.btn-detail-heart:hover {
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.06);
  background-color: #ffebee;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15);
}

.btn-detail-heart.liked {
  border-color: #ef4444;
  color: #ef4444;
  background-color: #ffebee;
}

.heart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.1rem 0.35rem;
  border: 1.5px solid white;
}

/* ─── Bid Price Evolution Chart ─── */
.bid-chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.chart-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #171a20;
  margin-bottom: 1rem;
}

.chart-wrapper {
  position: relative;
  width: 100%;
}

.chart-container-relative {
  position: relative;
  width: 100%;
}

.price-chart-svg {
  display: block;
  overflow: visible;
}

.axis-text {
  font-size: 0.65rem;
  fill: #9ca3af;
  font-weight: 500;
  font-family: inherit;
  user-select: none;
}

.x-axis-text {
  fill: #6b7280;
}

.chart-circle {
  transition: r 0.2s ease, stroke-width 0.2s ease, fill 0.2s ease;
}

/* Tooltip Container */
.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: white;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
  transition: left 0.1s ease, top 0.1s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Arrow for the tooltip */
.chart-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: rgba(17, 24, 39, 0.95) transparent transparent transparent;
}

.tooltip-amount {
  font-size: 0.85rem;
  font-weight: 700;
  color: #60a5fa;
}

.tooltip-meta {
  display: flex;
  flex-direction: column;
  font-size: 0.7rem;
  color: #d1d5db;
}

.tooltip-user {
  font-weight: 600;
  color: white;
}

.tooltip-date {
  color: #9ca3af;
}

/* Multimeios Payment Card (Royal Blue & Mobile Responsive) */
.multimeios-pay-card {
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1.5px solid #bfdbfe;
  padding: 1.25rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.06);
}

.dark .multimeios-pay-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.pay-card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 0.5rem;
}

.pay-logos-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pay-mini-logo {
  height: 22px;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
  background: #ffffff;
  padding: 2px 5px;
  border: 1px solid #e2e8f0;
}

.pay-card-title {
  color: #1e3a8a;
  font-size: 1.05rem;
  font-weight: 800;
}

.dark .pay-card-title {
  color: #60a5fa;
}

.pay-card-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
  line-height: 1.45;
}

.dark .pay-card-subtitle {
  color: #94a3b8;
}

.btn-pay-royal {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  color: #ffffff;
  width: 100%;
  font-weight: 800;
  border-radius: 12px;
  padding: 0.85rem;
  font-size: clamp(0.85rem, 3.5vw, 0.95rem);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25);
}

.btn-pay-royal:hover {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.35);
}

@media (max-width: 480px) {
  .multimeios-pay-card {
    padding: 1rem 0.85rem;
  }
  .pay-card-header {
    flex-direction: column;
    gap: 6px;
  }
}

/* ─── Quick Info Metadata Grid ─── */
.quick-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  transition: all 0.2s ease;
}

.dark .meta-item {
  background-color: #1e293b;
  border-color: #334155;
}

.meta-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.meta-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.meta-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
}

.dark .meta-label {
  color: #94a3b8;
}

.meta-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .meta-value {
  color: #f8fafc;
}

/* ─── Intelligent Bid Validation Banners ─── */
.bid-validation-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  background-color: #fef2f2;
  border: 1.5px solid #fca5a5;
  border-radius: 12px;
  color: #991b1b;
  margin-bottom: 0.85rem;
  font-size: 0.875rem;
  line-height: 1.45;
}

.dark .bid-validation-alert {
  background-color: rgba(153, 27, 27, 0.2);
  border-color: #b91c1c;
  color: #fca5a5;
}

.val-alert-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.bid-validation-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  color: #166534;
  margin-bottom: 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.dark .bid-validation-success {
  background-color: rgba(22, 101, 52, 0.2);
  border-color: #15803d;
  color: #86efac;
}

.bid-input-error {
  border-color: #ef4444 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}

.owner-warning {
  background-color: #eff6ff !important;
  border-color: #93c5fd !important;
  color: #1e40af !important;
}

/* ─── Structured Information Tabs ─── */
.details-tab-container {
  margin-top: 2rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.dark .details-tab-container {
  background-color: #0f172a;
  border-color: #1e293b;
}

.details-tab-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  background-color: #f1f5f9;
  padding: 0.4rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .details-tab-header {
  background-color: #0f172a;
  border-bottom-color: #1e293b;
}

.tab-btn {
  width: 100%;
  padding: 0.75rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.dark .tab-btn {
  color: #94a3b8;
}

.tab-btn:hover {
  color: #1e293b;
  background-color: rgba(255, 255, 255, 0.7);
}

.dark .tab-btn:hover {
  color: #f8fafc;
  background-color: rgba(30, 41, 59, 0.7);
}

.tab-btn.active {
  color: #1d4ed8;
  background-color: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.dark .tab-btn.active {
  color: #60a5fa;
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.tab-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.tab-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-badge {
  background-color: #1d4ed8;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 850px) {
  .details-tab-header {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .details-tab-header::-webkit-scrollbar {
    display: none;
  }
  .tab-btn {
    flex: 0 0 auto;
    min-width: max-content;
    padding: 0.65rem 0.85rem;
  }
}

.details-tab-content {
  padding: 1.5rem;
}

.pane-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.85rem;
}

.dark .pane-title {
  color: #f8fafc;
}

.description-card {
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  color: #334155;
  line-height: 1.7;
  font-size: 0.95rem;
}

.dark .description-card {
  background-color: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
}

.spec-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dark .spec-card {
  background-color: #1e293b;
  border-color: #334155;
}

.spec-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
}

.dark .spec-label {
  color: #94a3b8;
}

.spec-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.dark .spec-val {
  color: #f8fafc;
}

.spec-val.text-green {
  color: #16a34a;
}

.spec-val.text-blue {
  color: #2563eb;
}

.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.g-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.1rem;
  text-align: center;
}

.dark .g-card {
  background-color: #1e293b;
  border-color: #334155;
}

.g-icon {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.g-card h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.dark .g-card h4 {
  color: #f8fafc;
}

.g-card p {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
}

.dark .g-card p {
  color: #94a3b8;
}

/* ─── Comments System Styles ─── */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.comment-input-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dark .comment-input-box {
  background-color: #1e293b;
  border-color: #334155;
}

.comment-textarea {
  width: 100%;
  resize: vertical;
  min-height: 80px;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
}

.dark .comment-textarea {
  background-color: #0f172a;
  border-color: #475569;
  color: #f8fafc;
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-counter {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.comment-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.dark .comment-card {
  background-color: #1e293b;
  border-color: #334155;
}

.comment-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  overflow: hidden;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-author-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-author-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
}

.dark .comment-author-name {
  color: #f8fafc;
}

.author-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-seller {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.badge-admin {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
}

.btn-delete-comment {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 4px;
}

.btn-delete-comment:hover {
  opacity: 1;
}

.comment-text-content {
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 0.85rem;
}

.dark .comment-text-content {
  color: #cbd5e1;
}

.comment-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px dashed #f1f5f9;
  padding-top: 0.6rem;
}

.dark .comment-footer {
  border-top-color: #334155;
}

.btn-comment-like {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .btn-comment-like {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.btn-comment-like:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: translateY(-1px);
}

.btn-comment-like.liked {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.dark .btn-comment-like.liked {
  background: rgba(220, 38, 38, 0.2);
  border-color: #b91c1c;
  color: #fca5a5;
}

.no-comments-state {
  text-align: center;
  padding: 2.5rem 1rem;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
}

.dark .no-comments-state {
  background-color: #1e293b;
  border-color: #334155;
}

.no-comments-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.no-comments-state h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.dark .no-comments-state h4 {
  color: #f8fafc;
}

.no-comments-state p {
  font-size: 0.85rem;
  color: #64748b;
}

/* User Bids Shortcut Banner & My-Bid Tags */
.user-bids-shortcut-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
  margin-bottom: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dark .user-bids-shortcut-banner {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(30, 64, 175, 0.3) 100%);
  border-color: #1e40af;
}

.user-bids-shortcut-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #1e40af;
}

.dark .user-bids-shortcut-info {
  color: #93c5fd;
}

.user-bids-icon {
  font-size: 1.1rem;
}

.btn-user-bids-action {
  background: #1d4ed8;
  color: #ffffff;
  border: none;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
}

.btn-user-bids-action:hover {
  background: #1e40af;
  transform: translateY(-1px);
}

.my-bid-row {
  background-color: #f0fdf4 !important;
  border-left: 3px solid #22c55e;
}

.dark .my-bid-row {
  background-color: rgba(34, 197, 94, 0.12) !important;
}

.my-bid-tag {
  background: #dcfce7;
  color: #15803d;
  font-weight: 800;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  margin-left: 6px;
  text-transform: uppercase;
}

.dark .my-bid-tag {
  background: rgba(34, 197, 94, 0.25);
  color: #86efac;
}

.anti-snipe-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 99px;
  cursor: help;
  transition: all 0.2s ease;
}

.anti-snipe-badge:hover {
  background: rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.dark .anti-snipe-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.4);
}

/* Participation Fee & Status Banners */
.participation-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.participation-banner .banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.participation-banner .banner-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.participation-banner .banner-title {
  font-size: 0.92rem;
  font-weight: 700;
}

.participation-banner .banner-desc {
  font-size: 0.8rem;
  opacity: 0.85;
}

.participation-banner.participant-active {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.participation-banner.fee-required {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.dark .participation-banner.participant-active {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.35);
  color: #86efac;
}

.dark .participation-banner.fee-required {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fcd34d;
}

/* ─── Lightbox Styles ─── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: 1.5rem;
}

.lightbox-next {
  right: 1.5rem;
}

.lightbox-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* ─── GoBid Style Auction Detail ─── */
.auction-status-bar {
  background: var(--gobid-green);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.lot-header {
  margin-bottom: 1.5rem;
}

.lot-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #171a20;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.lot-location {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.vehicle-details-card,
.bidding-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.card-header {
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.yellow-header {
  background: var(--gobid-yellow);
  color: #171a20;
}

.card-body {
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #171a20;
  font-weight: 700;
}

.detail-table {
  margin-top: 0.5rem;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.85rem;
}

.table-row:last-child {
  border-bottom: none;
}

.table-label {
  color: #6b7280;
  font-weight: 500;
}

.table-value {
  color: #171a20;
  font-weight: 600;
}

.bid-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.bid-row:last-child {
  border-bottom: none;
}

.bid-label {
  color: #6b7280;
  font-weight: 500;
}

.bid-value {
  color: #171a20;
  font-weight: 700;
}

.bid-value.asking-bid {
  color: var(--gobid-green);
}

.bid-value.highest-bid {
  color: #ef4444;
}

.bid-value.increment {
  color: #3b82f6;
}

.bidding-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.auth-message {
  text-align: center;
  padding: 1rem;
}

.auth-message p {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-login {
  background: var(--gobid-green);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #008c44;
}

.btn-signup {
  background: transparent;
  color: var(--gobid-green);
  border: 2px solid var(--gobid-green);
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-signup:hover {
  background: var(--gobid-green);
  color: white;
}

.btn-bid-calculator {
  width: 100%;
  background: transparent;
  color: var(--gobid-green);
  border: 2px solid var(--gobid-green);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-bid-calculator:hover {
  background: var(--gobid-green);
  color: white;
}

.bid-timestamp {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
}

.timestamp-label {
  font-weight: 500;
}

.timestamp-value {
  font-weight: 600;
}

.coming-up-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #171a20;
}

.coming-up-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coming-up-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.coming-up-image {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.coming-up-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coming-up-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coming-up-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #171a20;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.coming-up-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gobid-green);
  margin-bottom: 0.5rem;
}

.btn-view {
  background: #171a20;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-view:hover {
  background: #000000;
}
</style>
