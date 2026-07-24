<template>
  <div class="auth-container">
    <div class="auth-split">
      <!-- Left visual -->
      <div class="auth-visual">
        <div class="auth-visual-content">
          <div class="rp-icon-wrap">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.12)"/>
              <path d="M30 17l-12 7 12 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="24" cy="24" r="10" stroke="white" stroke-width="2"/>
            </svg>
          </div>
          <h2>Nova senha</h2>
          <p>Escolha uma senha forte e memorável para proteger a sua conta Prime Auction.</p>
          <div class="visual-badges">
            <span class="v-badge">✅ Link verificado</span>
            <span class="v-badge">🔐 Encriptado</span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="auth-form-side">
        <div class="auth-form-wrap animate-fade-in">

          <!-- Success -->
          <div v-if="success" class="rp-success">
            <div class="success-icon">
              <svg viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#dcfce7"/>
                <path d="M16 28l8 8 16-16" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="auth-title">Senha redefinida!</h2>
            <p class="auth-subtitle">A sua senha foi atualizada com sucesso. Pode entrar agora.</p>
            <router-link to="/login" class="btn btn-primary btn-pill submit-btn">Ir para Login</router-link>
          </div>

          <!-- Invalid token -->
          <div v-else-if="invalidToken" class="rp-error-state">
            <div class="error-icon">
              <svg viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#fef2f2"/>
                <path d="M20 20l16 16M36 20l-16 16" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="auth-title">Link inválido</h2>
            <p class="auth-subtitle">Este link de recuperação expirou ou é inválido.</p>
            <router-link to="/forgot-password" class="btn btn-primary btn-pill submit-btn">Solicitar novo link</router-link>
          </div>

          <!-- Form -->
          <template v-else>
            <h1 class="auth-title">Redefinir Senha</h1>
            <p class="auth-subtitle">
              Crie uma senha nova e segura para a conta:
              <strong v-if="email">{{ email }}</strong>
            </p>

            <div v-if="error" class="alert-error">{{ error }}</div>

            <form @submit.prevent="handleReset" class="auth-form">
              <div class="form-group">
                <label class="form-label" for="newPassword">Nova senha</label>
                <div class="input-wrapper">
                  <input
                    :type="showPass ? 'text' : 'password'"
                    id="newPassword"
                    v-model="newPassword"
                    class="form-input"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minlength="6"
                    :disabled="loading"
                  />
                  <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
                    <svg v-if="!showPass" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <!-- Strength bar -->
                <div class="strength-bar-wrap" v-if="newPassword.length > 0">
                  <div class="strength-bar">
                    <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
                  </div>
                  <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirmar nova senha</label>
                <input
                  :type="showPass ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  class="form-input"
                  :class="{ 'input-mismatch': confirmPassword && newPassword !== confirmPassword }"
                  placeholder="Repita a senha"
                  required
                  :disabled="loading"
                />
                <span class="mismatch-msg" v-if="confirmPassword && newPassword !== confirmPassword">
                  As senhas não coincidem
                </span>
              </div>

              <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="loading || newPassword !== confirmPassword">
                <span v-if="loading" class="btn-spinner"></span>
                {{ loading ? 'A guardar...' : 'Guardar nova senha' }}
              </button>
            </form>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const token = ref('');
const email = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPass = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref(false);
const invalidToken = ref(false);

onMounted(() => {
  token.value = route.query.token || '';
  email.value = route.query.email || '';
  if (!token.value || !email.value) {
    invalidToken.value = true;
  }
});

// Password strength
const strengthPercent = computed(() => {
  const p = newPassword.value;
  let score = 0;
  if (p.length >= 6) score += 25;
  if (p.length >= 10) score += 25;
  if (/[A-Z]/.test(p)) score += 25;
  if (/[^a-zA-Z0-9]/.test(p)) score += 25;
  return score;
});

const strengthClass = computed(() => {
  const s = strengthPercent.value;
  if (s <= 25) return 'weak';
  if (s <= 50) return 'fair';
  if (s <= 75) return 'good';
  return 'strong';
});

const strengthLabel = computed(() => {
  const map = { weak: 'Fraca', fair: 'Razoável', good: 'Boa', strong: 'Excelente' };
  return map[strengthClass.value];
});

const handleReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.';
    return;
  }
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post('/auth/reset-password', {
      token: token.value,
      email: email.value,
      newPassword: newPassword.value
    });
    if (res.data.token) {
      authStore.token = res.data.token;
      authStore.user = res.data.user;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
    }
    success.value = true;
  } catch (err) {
    const msg = err.response?.data?.error || 'Erro ao redefinir senha.';
    if (msg.includes('inválido') || msg.includes('expirado')) {
      invalidToken.value = true;
    } else {
      error.value = msg;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}

.auth-split {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.auth-visual {
  flex: 1;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a56db 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  overflow: hidden;
}
.auth-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/car-bg.jpg') center/cover no-repeat;
  opacity: 0.15;
}

.auth-visual-content {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 360px;
}

.rp-icon-wrap {
  margin-bottom: 28px;
}
.rp-icon-wrap svg {
  width: 72px;
  height: 72px;
}

.auth-visual-content h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 14px;
}
.auth-visual-content p {
  color: rgba(255,255,255,0.75);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.visual-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.v-badge {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.auth-form-side {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  background: #ffffff;
}

.auth-form-wrap {
  width: 100%;
  max-width: 380px;
}

.animate-fade-in {
  animation: fadeInUp 0.5s ease-out both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.auth-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 28px;
  line-height: 1.6;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  margin-bottom: 20px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 13px 44px 13px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26,86,219,0.12);
  background: white;
}
.form-input:disabled { opacity: 0.6; cursor: not-allowed; }
.form-input.input-mismatch { border-color: #f87171; }

.mismatch-msg {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 500;
}

.toggle-pass {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  line-height: 1;
}
.toggle-pass:hover { color: #475569; }

/* Strength bar */
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.strength-bar {
  flex: 1;
  height: 5px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease, background 0.3s;
}
.strength-fill.weak   { background: #ef4444; }
.strength-fill.fair   { background: #f59e0b; }
.strength-fill.good   { background: #3b82f6; }
.strength-fill.strong { background: #10b981; }
.strength-label {
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 60px;
}
.strength-label.weak   { color: #ef4444; }
.strength-label.fair   { color: #f59e0b; }
.strength-label.good   { color: #3b82f6; }
.strength-label.strong { color: #10b981; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-decoration: none;
}
.btn-pill { border-radius: 50px; padding: 13px 28px; }
.btn-primary {
  background: linear-gradient(135deg, #1a56db, #3b82f6);
  color: white;
  box-shadow: 0 4px 14px rgba(26,86,219,0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(26,86,219,0.4);
}
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Success / Error states */
.rp-success, .rp-error-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeInUp 0.5s ease both;
}
.success-icon, .error-icon {
  margin-bottom: 8px;
}
.success-icon svg, .error-icon svg {
  width: 72px;
  height: 72px;
}

@media (max-width: 768px) {
  .auth-visual { display: none; }
  .auth-form-side { width: 100%; padding: 40px 24px; }
}
</style>
