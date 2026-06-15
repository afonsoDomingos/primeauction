<template>
  <div v-if="auction" class="auction-detail-container">
    <div class="split-layout">
      <!-- Left: Image side (Gallery) -->
      <div class="image-side-container">
        <!-- Main Image -->
        <div class="main-image-display" :style="{ backgroundImage: `url(${activeImage || auction.imageUrl})` }">
          <div class="image-overlay">
            <button class="back-btn" @click="$router.back()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Voltar
            </button>
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

          <h1 class="title">{{ auction.title }}</h1>
          <p class="description">{{ auction.description }}</p>
          
          <!-- Price & Timer -->
          <div class="status-box">
            <div class="info-col">
              <span class="label">{{ isUpcoming ? 'Preço Inicial' : 'Lance Actual' }}</span>
              <span class="price highlight">{{ formatCurrency(isUpcoming ? auction.startingPrice : auction.currentPrice) }}</span>
            </div>
            <div class="info-col info-col-right">
              <span class="label">{{ isUpcoming ? 'Começa Em' : 'Termina Em' }}</span>
              <span class="time">
                {{ isUpcoming ? new Date(auction.startTime).toLocaleString('pt-MZ') : new Date(auction.endTime).toLocaleString('pt-MZ') }}
              </span>
            </div>
          </div>
          
          <!-- Bid Form -->
          <div class="bidding-section" v-if="!isEnded">
            <h3 class="section-title">Fazer Lance</h3>
            <div v-if="isUpcoming" class="auth-warning" style="background-color: rgba(255, 152, 0, 0.05); border: 1px solid rgba(255, 152, 0, 0.2); color: #f57c00;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f57c00; margin-right: 8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"></polyline></svg>
              Este leilão está agendado e ainda não começou. Começa em <strong>{{ new Date(auction.startTime).toLocaleString('pt-MZ') }}</strong>.
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

          <!-- Bids History -->
          <div class="history-section">
            <h3 class="section-title">Histórico de Lances <span class="bid-count">{{ bids.length }}</span></h3>
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const route = useRoute();
const authStore = useAuthStore();
const toastStore = useToastStore();
const auction = ref(null);
const bids = ref([]);
const bidAmount = ref(0);
const displayBidAmount = ref('');
const activeImage = ref('');
let socket = null;

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
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%);
  display: flex;
  align-items: flex-start;
  padding: 90px 2rem 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.35);
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.28);
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
</style>
