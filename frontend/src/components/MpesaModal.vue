<template>
  <Transition name="mpesa-fade">
    <div v-if="isOpen" class="mpesa-modal-overlay" @click.self="closeModal">
      <div class="mpesa-modal-card animate-scale-in">
        <!-- Close Button -->
        <button class="mpesa-close-btn" @click="closeModal" aria-label="Fechar">✕</button>

        <!-- Brand Header (Prime Auction Checkout Multimeios) -->
        <div class="mpesa-brand-header">
          <div class="mpesa-logo-wrap">
            <img src="/logo prime.png" alt="Prime Auction" class="checkout-brand-logo" />
            <span class="mpesa-sub-tag">Checkout Seguro</span>
          </div>
          <p class="mpesa-merchant">Pagamento seguro de leilão para <strong>Prime Auction</strong></p>
        </div>

        <!-- STEP 1: Phone / Payment Entry -->
        <div v-if="step === 'phone'" class="mpesa-step-content">
          
          <!-- Payment Method Selector Tabs: M-Pesa | eMola | Visa -->
          <div class="method-selector-section">
            <label class="method-section-title">Método de Pagamento</label>
            <div class="method-tabs-grid">
              <!-- M-Pesa Tab -->
              <button 
                type="button" 
                class="method-tab-btn" 
                :class="{ active: selectedMethod === 'mpesa' }"
                @click="selectedMethod = 'mpesa'"
              >
                <div class="method-badge mpesa-bg">
                  <img src="/mpesa-logo.png" alt="M-Pesa" class="method-logo-img" />
                </div>
                <span class="method-tab-label">M-Pesa</span>
              </button>

              <!-- eMola Tab -->
              <button 
                type="button" 
                class="method-tab-btn" 
                :class="{ active: selectedMethod === 'emola' }"
                @click="selectedMethod = 'emola'"
              >
                <div class="method-badge emola-bg">
                  <img src="/emola-logo.png" alt="eMola" class="method-logo-img" />
                </div>
                <span class="method-tab-label">eMola</span>
              </button>

              <!-- Visa / Credit Card Tab -->
              <button 
                type="button" 
                class="method-tab-btn" 
                :class="{ active: selectedMethod === 'visa' }"
                @click="selectedMethod = 'visa'"
              >
                <div class="method-badge visa-bg">
                  <img src="/visa-logo.png" alt="Visa" class="method-logo-img" />
                </div>
                <span class="method-tab-label">Cartão de Crédito</span>
              </button>
            </div>
          </div>

          <!-- M-PESA FORM -->
          <form v-if="selectedMethod === 'mpesa'" @submit.prevent="handleInitiatePayment" class="mpesa-form">
            <label class="input-label-clean">Número de telefone (9 dígitos)</label>
            <div class="phone-input-group">
              <span class="country-code">🇲🇿 +258</span>
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="84XXXXXXX / 85XXXXXXX"
                class="phone-input"
                maxlength="9"
                required
                :disabled="loading"
              />
            </div>
            <p v-if="phoneError" class="input-error-msg">{{ phoneError }}</p>

            <!-- Order Summary -->
            <div class="checkout-summary-box">
              <h5 class="summary-box-title">Resumo da compra</h5>
              <div class="summary-line">
                <span>{{ auctionTitle }}</span>
                <span>{{ formatCurrency(customAmount) }}</span>
              </div>
              <div class="summary-line total-line">
                <strong>Total</strong>
                <strong class="total-amount">{{ formatCurrency(customAmount) }}</strong>
              </div>
            </div>

            <p class="banking-security-note">
              Nós protegemos seus dados de pagamento com criptografia para garantir segurança em nível bancário.
            </p>

            <button type="submit" class="btn btn-vibrant-pay" :disabled="loading || !phoneNumber || !customAmount || customAmount <= 0">
              <span v-if="loading" class="spinner-inline"></span>
              <span>{{ loading ? 'A enviar pedido STK Push...' : 'Comprar agora' }}</span>
            </button>
          </form>

          <!-- EMOLA FORM -->
          <form v-else-if="selectedMethod === 'emola'" @submit.prevent="handleInitiatePayment" class="mpesa-form">
            <label class="input-label-clean">Número de telefone eMola (9 dígitos)</label>
            <div class="phone-input-group">
              <span class="country-code">🇲🇿 +258</span>
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="86XXXXXXX / 87XXXXXXX"
                class="phone-input"
                maxlength="9"
                required
                :disabled="loading"
              />
            </div>

            <!-- Order Summary -->
            <div class="checkout-summary-box">
              <h5 class="summary-box-title">Resumo da compra</h5>
              <div class="summary-line">
                <span>{{ auctionTitle }}</span>
                <span>{{ formatCurrency(customAmount) }}</span>
              </div>
              <div class="summary-line total-line">
                <strong>Total</strong>
                <strong class="total-amount">{{ formatCurrency(customAmount) }}</strong>
              </div>
            </div>

            <p class="banking-security-note">
              Nós protegemos seus dados de pagamento com criptografia para garantir segurança em nível bancário.
            </p>

            <button type="submit" class="btn btn-vibrant-pay emola-btn-style" :disabled="loading || !phoneNumber || !customAmount || customAmount <= 0">
              <span v-if="loading" class="spinner-inline"></span>
              <span>{{ loading ? 'A enviar...' : 'Comprar agora via eMola' }}</span>
            </button>
          </form>

          <!-- VISA FORM -->
          <form v-else-if="selectedMethod === 'visa'" @submit.prevent="handleInitiatePayment" class="mpesa-form">
            <label class="input-label-clean">Número do Cartão de Crédito</label>
            <input
              type="text"
              placeholder="4532 •••• •••• ••••"
              class="phone-input"
              style="width: 100%; border-radius: 12px; margin-bottom: 0.75rem;"
            />
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
              <input type="text" placeholder="MM/AA" class="phone-input" style="flex: 1; border-radius: 12px;" />
              <input type="text" placeholder="CVV" class="phone-input" style="flex: 1; border-radius: 12px;" />
            </div>

            <!-- Order Summary -->
            <div class="checkout-summary-box">
              <h5 class="summary-box-title">Resumo da compra</h5>
              <div class="summary-line">
                <span>{{ auctionTitle }}</span>
                <span>{{ formatCurrency(customAmount) }}</span>
              </div>
              <div class="summary-line total-line">
                <strong>Total</strong>
                <strong class="total-amount">{{ formatCurrency(customAmount) }}</strong>
              </div>
            </div>

            <p class="banking-security-note">
              Nós protegemos seus dados de pagamento com criptografia para garantir segurança em nível bancário.
            </p>

            <button type="submit" class="btn btn-vibrant-pay visa-btn-style" :disabled="loading">
              <span>Comprar agora com Cartão</span>
            </button>
          </form>
        </div>

        <!-- STEP 2: Simulated USSD Push on Mobile Phone -->
        <div v-else-if="step === 'ussd'" class="mpesa-step-content ussd-step">
          <div class="mobile-phone-mockup">
            <div class="phone-header">
              <span class="signal">📶 Vodacom M-Pesa</span>
              <span class="time">Agora</span>
            </div>
            <div class="ussd-alert-box">
              <div class="ussd-icon">
                <img src="/mpesa-logo.png" alt="M-Pesa" class="mpesa-ussd-logo" />
              </div>
              <h5 class="ussd-title">Confirmação M-Pesa</h5>
              <p class="ussd-prompt">
                Deseja confirmar o pagamento de <strong>{{ formatCurrency(customAmount) }}</strong> para <strong>Prime Auction</strong> (Ref: {{ paymentData?.reference }})?
              </p>
              
              <div class="pin-entry-wrap">
                <label class="pin-label">Introduza o seu PIN do M-Pesa (4 dígitos):</label>
                <input
                  type="password"
                  v-model="pinInput"
                  class="pin-input"
                  placeholder="••••"
                  maxlength="4"
                  ref="pinInputRef"
                  @keyup.enter="handleConfirmPayment"
                  :disabled="loading"
                />
              </div>

              <div class="ussd-actions">
                <button type="button" @click="cancelPayment" class="btn-ussd-cancel" :disabled="loading">
                  Cancelar
                </button>
                <button type="button" @click="handleConfirmPayment" class="btn-ussd-confirm" :disabled="loading || pinInput.length !== 4">
                  <span v-if="loading" class="spinner-inline"></span>
                  {{ loading ? 'A processar...' : 'Confirmar PIN' }}
                </button>
              </div>
            </div>
          </div>
          <p class="sandbox-tip">💡 <strong>Modo Sandbox:</strong> Insira qualquer PIN de 4 dígitos (ex: 1234) para simular a autorização no seu telemóvel.</p>
        </div>

        <!-- STEP 3: Success Receipt -->
        <div v-else-if="step === 'success'" class="mpesa-step-content success-step">
          <div class="receipt-success-icon">
            <span class="check-core">✓</span>
          </div>
          <h3 class="success-title">Pagamento Concluído!</h3>
          <p class="success-sub">A sua transação M-Pesa foi processada com sucesso.</p>

          <div class="mpesa-receipt-ticket">
            <div class="receipt-header">
              <span class="ticket-brand">VODACOM M-PESA</span>
              <span class="ticket-status-badge">COMPLETADO</span>
            </div>
            <div class="receipt-body">
              <div class="receipt-item">
                <span class="item-lbl">Transação M-Pesa ID:</span>
                <strong class="item-val code-val">{{ receiptData?.mpesaTransactionId }}</strong>
              </div>
              <div class="receipt-item">
                <span class="item-lbl">Referência:</span>
                <span class="item-val">{{ receiptData?.reference }}</span>
              </div>
              <div class="receipt-item">
                <span class="item-lbl">Número Pagador:</span>
                <span class="item-val">{{ receiptData?.phoneNumber }}</span>
              </div>
              <div class="receipt-item">
                <span class="item-lbl">Valor Pago:</span>
                <strong class="item-val highlight-val">{{ formatCurrency(receiptData?.amount) }}</strong>
              </div>
              <div class="receipt-item">
                <span class="item-lbl">Data & Hora:</span>
                <span class="item-val">{{ formatDate(receiptData?.date) }}</span>
              </div>
            </div>
            <div class="receipt-footer">
              🔒 Autenticado digitalmente por Prime Auction & Vodacom
            </div>
          </div>

          <div class="receipt-actions">
            <button @click="printReceipt" class="btn btn-outline-print">
              🖨️ Imprimir Recibo
            </button>
            <button @click="closeModal" class="btn btn-mpesa-done">
              Concluir
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  auctionId: { type: String, required: true },
  auctionTitle: { type: String, default: 'Leilão Prime' },
  amount: { type: Number, required: true }
});

const emit = defineEmits(['close', 'success']);

const toastStore = useToastStore();
const authStore = useAuthStore();

const step = ref('phone'); // 'phone' | 'ussd' | 'success'
const selectedMethod = ref('mpesa'); // 'mpesa' | 'emola' | 'visa'
const phoneNumber = ref('');
const phoneError = ref('');
const loading = ref(false);
const customAmount = ref(props.amount);

const paymentData = ref(null);
const pinInput = ref('');
const receiptData = ref(null);
const pinInputRef = ref(null);

watch(() => props.amount, (newVal) => {
  if (newVal) customAmount.value = newVal;
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    customAmount.value = props.amount || 0;
    step.value = 'phone';
    phoneError.value = '';
    pinInput.value = '';
    paymentData.value = null;
    receiptData.value = null;
    
    // Auto fill user phone if present
    if (authStore.user?.phone) {
      const raw = authStore.user.phone.replace(/\D/g, '');
      if (raw.length >= 9) {
        phoneNumber.value = raw.slice(-9);
      }
    }
  }
});

const addAmount = (inc) => {
  customAmount.value = (Number(customAmount.value) || 0) + inc;
};

const formatCurrency = (val) => {
  if (!val) return '0,00 MZN';
  return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2 }).format(val) + ' MZN';
};

const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleString('pt-MZ');
  return new Date(dateStr).toLocaleString('pt-MZ');
};

const handleInitiatePayment = async () => {
  phoneError.value = '';
  const cleaned = phoneNumber.value.replace(/\D/g, '');
  if (!/^(84|85)\d{7}$/.test(cleaned)) {
    phoneError.value = 'Insira um número Vodacom M-Pesa válido de Moçambique (começando por 84 ou 85).';
    return;
  }

  if (!customAmount.value || customAmount.value <= 0) {
    phoneError.value = 'Por favor, insira um valor válido a pagar.';
    return;
  }

  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/payments/mpesa/initiate`, {
      auctionId: props.auctionId,
      amount: customAmount.value,
      phoneNumber: cleaned
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (res.data && res.data.success) {
      paymentData.value = res.data.data;
      step.value = 'ussd';
      toastStore.add('Notificação STK Push enviada para o seu telemóvel!', 'info');
      nextTick(() => {
        if (pinInputRef.value) pinInputRef.value.focus();
      });
    }
  } catch (err) {
    console.error('Failed to initiate M-Pesa payment:', err);
    const msg = err.response?.data?.error || 'Erro ao comunicar com o servidor M-Pesa.';
    phoneError.value = msg;
    toastStore.add(msg, 'error');
  } finally {
    loading.value = false;
  }
};

const handleConfirmPayment = async () => {
  if (!pinInput.value || pinInput.value.length !== 4) {
    toastStore.add('Introduza o PIN M-Pesa de 4 dígitos.', 'warning');
    return;
  }

  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/payments/mpesa/confirm`, {
      paymentId: paymentData.value.paymentId,
      pin: pinInput.value
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (res.data && res.data.success) {
      receiptData.value = res.data.data.receipt;
      step.value = 'success';
      toastStore.add('Pagamento M-Pesa efetuado com sucesso! 🎉', 'success');
      emit('success', receiptData.value);
    }
  } catch (err) {
    console.error('Failed to confirm M-Pesa payment:', err);
    const msg = err.response?.data?.error || 'Erro ao confirmar PIN M-Pesa.';
    toastStore.add(msg, 'error');
  } finally {
    loading.value = false;
  }
};

const cancelPayment = () => {
  step.value = 'phone';
  pinInput.value = '';
  toastStore.add('Transação cancelada no telemóvel.', 'info');
};

const printReceipt = () => {
  window.print();
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.mpesa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.mpesa-modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 420px;
  max-height: 88vh;
  overflow-y: auto;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  position: relative;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.mpesa-close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mpesa-close-btn:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Payment Method Tabs Selector Grid */
.method-selector-section {
  margin-bottom: 1.25rem;
}

.method-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.6rem;
  display: block;
}

.method-tabs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.method-tab-btn {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-tab-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.method-tab-btn.active {
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.15);
  background: #fff5f5;
}

.method-badge {
  width: 44px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2px 4px;
}

.method-logo-img {
  height: 26px;
  width: 100%;
  object-fit: contain;
}

.visa-bg {
  background: #ffffff;
}

.visa-badge-text {
  font-size: 1.1rem;
}

.method-tab-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #334155;
}

.input-label-clean {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
  display: block;
}

/* Purchase Summary Box */
.checkout-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin: 1rem 0 0.85rem;
}

.summary-box-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #334155;
  padding: 0.2rem 0;
}

.summary-line.total-line {
  border-top: 1px dashed #cbd5e1;
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  font-size: 0.95rem;
}

.total-amount {
  color: #0f172a;
  font-weight: 900;
}

.banking-security-note {
  font-size: 0.72rem;
  color: #64748b;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 1rem;
}

/* Vibrant Action Button inspired by green checkout button */
.btn-vibrant-pay {
  width: 100%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border: none;
  padding: 0.9rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-vibrant-pay:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(34, 197, 94, 0.4);
}

.emola-btn-style {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
}

.visa-btn-style {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

/* Brand Header */
.mpesa-brand-header {
  background: linear-gradient(135deg, #e60000 0%, #b30000 100%);
  color: white;
  padding: 1rem 1.25rem;
  text-align: center;
}

.mpesa-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 0.35rem;
}

.checkout-brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.mpesa-official-logo {
  height: 38px;
  max-width: 150px;
  object-fit: contain;
  border-radius: 6px;
  background: #ffffff;
  padding: 3px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.mpesa-ussd-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
  background: #ffffff;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.mpesa-brand-badge {
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: -1px;
  color: #ffffff;
  text-transform: lowercase;
  font-family: system-ui, -apple-system, sans-serif;
}

.mpesa-sub-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mpesa-merchant {
  font-size: 0.85rem;
  opacity: 0.92;
}

/* Summary Card */
.mpesa-summary-card {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.85rem 1.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  margin-bottom: 0.25rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #64748b;
}

.summary-val {
  color: #1e293b;
  font-weight: 600;
  max-width: 220px;
}

.title-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: #e60000;
}

/* Step Content */
.mpesa-step-content {
  padding: 1.5rem;
}

.step-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.step-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

.phone-input-group {
  display: flex;
  align-items: center;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
  margin-bottom: 0.5rem;
}

.phone-input-group:focus-within {
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.12);
}

.country-code {
  background: #f1f5f9;
  padding: 0.85rem 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
  border-right: 1px solid #cbd5e1;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.85rem 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #0f172a;
}

.input-error-msg {
  color: #dc2626;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.btn-mpesa-submit {
  width: 100%;
  background: #e60000;
  color: white;
  border: none;
  padding: 0.95rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-mpesa-submit:hover:not(:disabled) {
  background: #cc0000;
}

.btn-mpesa-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Step 2: USSD Phone Mockup */
.ussd-step {
  background: #f8fafc;
}

.mobile-phone-mockup {
  background: #000000;
  border-radius: 16px;
  padding: 1rem;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  margin-bottom: 1rem;
}

.phone-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.ussd-alert-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.ussd-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.ussd-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.ussd-prompt {
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.pin-entry-wrap {
  margin-bottom: 1.25rem;
}

.pin-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.pin-input {
  width: 140px;
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 12px;
  padding: 0.5rem;
  border-radius: 8px;
  border: 2px solid #e60000;
  outline: none;
  background: #0f172a;
  color: white;
  font-weight: 700;
}

.ussd-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-ussd-cancel {
  flex: 1;
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-ussd-confirm {
  flex: 1;
  background: #e60000;
  border: none;
  color: white;
  padding: 0.65rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-ussd-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sandbox-tip {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  margin-top: 0.5rem;
}

/* Step 3: Success Receipt */
.success-step {
  text-align: center;
}

.receipt-success-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 auto 0.75rem;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.success-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

.mpesa-receipt-ticket {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: left;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
  margin-bottom: 0.85rem;
}

.ticket-brand {
  font-size: 0.85rem;
  font-weight: 900;
  color: #e60000;
  letter-spacing: 0.5px;
}

.ticket-status-badge {
  background: #dcfce7;
  color: #15803d;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.receipt-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.receipt-item {
  display: flex;
  justify-content: space-between;
}

.item-lbl {
  color: #64748b;
}

.item-val {
  color: #0f172a;
  font-weight: 600;
}

.code-val {
  font-family: monospace;
  color: #e60000;
}

.highlight-val {
  color: #16a34a;
  font-size: 1rem;
}

.receipt-footer {
  border-top: 1px solid #f1f5f9;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
}

.receipt-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-outline-print {
  flex: 1;
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-mpesa-done {
  flex: 1;
  background: #0f172a;
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* Custom amount & quick increments styles */
.summary-amount-edit-wrap {
  margin-top: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.summary-label-bold {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  transition: border-color 0.2s ease;
}

.amount-input-group:focus-within {
  border-color: #e60000;
}

.amount-currency-tag {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.65rem 0.85rem;
  border-right: 1px solid #fecaca;
}

.custom-amount-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.65rem 0.85rem;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  background: transparent;
}

.mpesa-quick-increments {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.quick-inc-label {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

.quick-inc-btns {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.btn-quick-inc {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-quick-inc:hover {
  background: #e60000;
  color: white;
  border-color: #e60000;
  transform: translateY(-1px);
}

.mpesa-fade-enter-active,
.mpesa-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mpesa-fade-enter-from,
.mpesa-fade-leave-to {
  opacity: 0;
}
</style>
