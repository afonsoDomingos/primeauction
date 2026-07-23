<template>
  <div v-if="auction" class="auction-detail-container">
    <div class="split-layout">
      <!-- Left: Image side (Gallery) -->
      <div class="image-side-container">
        <!-- Main Image -->
        <div class="main-image-display" :style="{ backgroundImage: `url(${activeImage || auction.imageUrl})` }">
          <div class="image-overlay">
            <div class="top-overlay-bar">
              <button class="back-btn" @click="$router.back()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                Voltar
              </button>

              <!-- Image Counter Badge -->
              <div v-if="allImages.length > 1" class="image-counter-badge">
                🖼️ {{ currentImageIndex + 1 }} / {{ allImages.length }}
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
          >
            <img :src="img" alt="Miniatura do produto" />
          </div>
        </div>
      </div>

      <!-- Right: Content & Bidding -->
      <div class="content-side">
        <div class="content-wrapper animate-fade-in">

          <!-- Status badge -->
          <span class="status-badge" :class="isEnded ? 'ended' : (isUpcoming ? 'upcoming' : 'active')">
            {{ isEnded ? 'Terminado' : (isUpcoming ? 'Agendado' : 'Activo') }}
          </span>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; margin-bottom: 1rem;">
            <h1 class="title" style="margin-bottom: 0;">{{ auction.title }}</h1>
            <button 
              v-if="authStore.isAuthenticated && !authStore.isAdmin"
              @click="toggleWatchlist" 
              class="btn-detail-heart"
              :class="{ liked: isLiked }"
              title="Adicionar aos favoritos"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="heart-count" v-if="auction.likesCount > 0">{{ auction.likesCount }}</span>
            </button>
          </div>
          <p class="description">{{ auction.description }}</p>
          
          <!-- Price & Timer -->
          <div class="status-box">
            <div class="info-col">
              <span class="label">{{ isUpcoming ? 'Preço Inicial' : 'Lance Actual' }}</span>
              <span class="price highlight">{{ formatCurrency(isUpcoming ? auction.startingPrice : auction.currentPrice) }}</span>
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
              <router-link to="/login">Faça login</router-link> para licitar.
            </div>
            <div v-else-if="authStore.isAdmin" class="auth-warning">
              Administradores não podem participar nos leilões.
            </div>
            <form v-else @submit.prevent="placeBid" class="bid-form">
              <!-- Smart bid incentive message -->
              <div v-if="bids.length > 0" class="bid-incentive-msg" :class="{ leader: isLeader }">
                <span v-if="isLeader">🎉 Você é o licitante mais alto de momento! (Líder)</span>
                <span v-else>💡 Dica: Licite pelo menos <strong>{{ formatCurrency(suggestedBidAmount) }}</strong> para assumir a liderança!</span>
              </div>
              <div v-else class="bid-incentive-msg">
                <span>💡 Dica: Seja o primeiro a licitar! Comece com o valor mínimo de <strong>{{ formatCurrency(auction.currentPrice + 1) }}</strong>.</span>
              </div>

              <div class="input-with-button">
                <span class="currency-prefix">MZN</span>
                <input 
                  type="text" 
                  v-model="displayBidAmount" 
                  @input="handleBidInput"
                  class="form-input bid-input" 
                  placeholder="Introduza o valor"
                  required 
                />
                <button type="submit" class="btn btn-primary btn-pill bid-submit">Lance!</button>
              </div>

              <!-- Quick bid buttons -->
              <div class="quick-bid-suggestions">
                <span class="suggestion-label">Sugestões de incremento:</span>
                <div class="suggestion-btns">
                  <button 
                    type="button" 
                    v-for="inc in suggestedIncrements" 
                    :key="inc" 
                    class="btn-suggestion"
                    @click="setBidIncrement(inc)"
                  >
                    +{{ formatNumber(inc) }}
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
              <p class="winner-price">Valor Final: <span>{{ formatCurrency(auction.currentPrice) }}</span></p>
            </div>
            <div class="winner-info" v-else>
              <p class="ended-text">Este leilão terminou sem lances.</p>
            </div>
          </div>

          <!-- M-Pesa Payment Box -->
          <div v-if="auction" class="mpesa-pay-card animate-fade-in" style="margin-top: 1.5rem; background: linear-gradient(135deg, #fff5f5, #ffffff); border: 1.5px solid #fca5a5; padding: 1.25rem; border-radius: 16px; text-align: center; box-shadow: 0 4px 12px rgba(230, 0, 0, 0.05);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 0.5rem;">
              <img src="/mpesa-logo.png" alt="Vodacom M-Pesa" style="height: 26px; width: auto; object-fit: contain; border-radius: 4px; background: white; padding: 2px 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.12);" />
              <strong style="color: #990000; font-size: 1rem;">Pagamento Direto via M-Pesa</strong>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; line-height: 1.4;">Efetue a liquidação deste artigo instantaneamente via Vodacom M-Pesa no seu telemóvel.</p>
            <button @click="openMpesaModal" type="button" class="btn" style="background: #e60000; color: white; width: 100%; font-weight: 700; border-radius: 12px; padding: 0.85rem; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(230, 0, 0, 0.25);">
              <img src="/mpesa-logo.png" alt="M-Pesa" style="height: 22px; width: auto; object-fit: contain; border-radius: 4px; background: white; padding: 2px 5px;" />
              <span>Pagar {{ formatCurrency(auction.currentPrice) }} com M-Pesa</span>
            </button>
          </div>

          <!-- Bids History -->
          <div class="history-section">
            <h3 class="section-title">Histórico de Lances <span class="bid-count">{{ bids.length }}</span></h3>
            
            <!-- Graphic Chart of Bids -->
            <div v-if="chartData.length > 1" class="bid-chart-card animate-fade-in">
              <h4 class="chart-card-title">Evolução do Preço</h4>
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
              <li v-for="(bid, index) in bids" :key="bid._id" class="bid-item" :class="{ 'top-bid': index === 0 }">
                <div class="bid-left">
                  <div class="bid-avatar">
                    <img v-if="bid.user?.profilePhoto" :src="bid.user.profilePhoto" alt="Avatar" class="bid-avatar-img" />
                    <span v-else>{{ bid.user?.name?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <span class="bid-user">{{ bid.user?.name }}</span>
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
    :amount="auction.currentPrice"
    @close="isMpesaModalOpen = false"
    @success="handleMpesaSuccess"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import MpesaModal from '../components/MpesaModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const toastStore = useToastStore();
const auction = ref(null);
const bids = ref([]);
const bidAmount = ref(0);
const displayBidAmount = ref('');
const activeImage = ref('');
let socket = null;

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

const isMpesaModalOpen = ref(false);
const openMpesaModal = () => {
  if (!authStore.isAuthenticated) {
    toastStore.add('Por favor, faça login para efetuar o pagamento M-Pesa.', 'warning');
    return;
  }
  isMpesaModalOpen.value = true;
};
const handleMpesaSuccess = (receipt) => {
  toastStore.add('Pagamento M-Pesa registado com sucesso! ✓', 'success');
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
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
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
const isLeader = computed(() => {
  if (!bids.value.length || !authStore.user) return false;
  const topBidderId = bids.value[0].user?._id || bids.value[0].user?.id;
  const currentUserId = authStore.user?.id || authStore.user?._id;
  return topBidderId === currentUserId;
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
    const [auctionRes, bidsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/auctions/${route.params.id}`),
      axios.get(`${apiUrl}/api/bids/${route.params.id}`)
    ]);
    auction.value = auctionRes.data.data;
    bids.value = bidsRes.data.data;
    const suggested = suggestedBidAmount.value;
    bidAmount.value = suggested;
    displayBidAmount.value = formatInputString(suggested.toString());
    activeImage.value = auction.value.imageUrl;
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
      await executePlaceBid();
    } else {
      toastStore.error(res.error || 'Erro ao actualizar o perfil.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro ao salvar o perfil.');
  } finally {
    submittingProfile.value = false;
  }
};

const placeBid = async () => {
  // Validate bid amount is greater than currentPrice
  const minBid = auction.value ? auction.value.currentPrice + 1 : 1;
  if (bidAmount.value < minBid) {
    toastStore.error(`O valor do lance deve ser no mínimo ${formatCurrency(minBid)}`);
    return;
  }

  const user = authStore.user;
  if (!user.name || !user.phone || !user.province || !user.gender || !user.age) {
    profileForm.value = {
      name: user.name || '',
      phone: user.phone || '',
      province: user.province || '',
      gender: user.gender || '',
      age: user.age || null
    };
    showProfileModal.value = true;
    return;
  }

  await executePlaceBid();
};

const executePlaceBid = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const bidVal = bidAmount.value;
    await axios.post(
      `${apiUrl}/api/bids/${route.params.id}`,
      { amount: bidVal },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    toastStore.success(`Lance de ${formatCurrency(bidVal)} registado! ✓`);
  } catch (err) {
    toastStore.error(err.response?.data?.error || 'Erro ao registar lance');
  }
};

onMounted(() => {
  fetchAuctionData();
  fetchUserWatchlist();
  
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  socket = io(apiUrl);
  socket.emit('join_auction', route.params.id);

  socket.on('new_bid', (data) => {
    if (auction.value) {
      auction.value.currentPrice = data.currentPrice;
      if (bidAmount.value <= data.currentPrice) {
        const newAmount = data.currentPrice + minIncrement.value;
        bidAmount.value = newAmount;
        displayBidAmount.value = formatInputString(newAmount.toString());
      }
    }
    bids.value.unshift(data.bid);
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
});
</script>

<style scoped>
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
  border-color: var(--btn-primary-bg);
  transform: translateY(-2px);
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
  background: var(--btn-primary-bg, #0284c7);
  border-color: var(--btn-primary-bg, #0284c7);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.gallery-arrow-btn:active {
  transform: scale(0.95);
}

/* ─── Content Side ─── */
.content-side {
  flex: 4;
  background-color: var(--bg-color);
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
  color: var(--text-light);
}

/* ─── Title & Description ─── */
.title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  line-height: 1.2;
}

.description {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 0.95rem;
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
  color: var(--text-light);
  font-weight: 600;
}

.price {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--btn-primary-bg);
  line-height: 1;
}

.time {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* ─── Section Titles ─── */
.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bid-count {
  background-color: var(--btn-primary-bg);
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
  color: var(--text-secondary);
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
  color: var(--danger-color);
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
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #fceab0;
}

.auth-warning a {
  color: var(--btn-primary-bg);
  font-weight: 600;
}

/* ─── Ended Section ─── */
.ended-section {
  margin-bottom: 2rem;
}

.ended-text {
  color: var(--text-light);
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
  color: var(--text-light);
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
  color: var(--text-secondary);
}

.winner-price span {
  font-weight: 700;
  color: var(--btn-primary-bg);
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
  background-color: var(--btn-primary-bg);
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
  color: var(--btn-primary-bg);
  font-size: 0.95rem;
}

.no-bids {
  color: var(--text-light);
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
  border-top-color: var(--btn-primary-bg);
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
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--text-light);
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
  color: var(--text-secondary);
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
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.2s;
  margin-left: auto;
}
.wizard-close-btn:hover {
  color: var(--text-primary);
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
  background-color: var(--btn-primary-bg, #1a56db);
  width: 22px;
  border-radius: 4px;
}
.wizard-dot.done {
  background-color: #10b981;
}

.wizard-step-label {
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-light);
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
  color: var(--text-secondary);
  transition: all 0.2s ease;
  user-select: none;
}
.wizard-gender-btn:hover {
  border-color: var(--btn-primary-bg, #1a56db);
  color: var(--btn-primary-bg, #1a56db);
}
.wizard-gender-btn.selected {
  border-color: var(--btn-primary-bg, #1a56db);
  background-color: rgba(26, 86, 219, 0.07);
  color: var(--btn-primary-bg, #1a56db);
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
  color: var(--text-light);
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
  color: var(--text-secondary);
  padding: 0.45rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.btn-suggestion:hover {
  border-color: var(--btn-primary-bg, #1a56db);
  color: var(--btn-primary-bg, #1a56db);
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
  color: var(--text-primary);
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
</style>
