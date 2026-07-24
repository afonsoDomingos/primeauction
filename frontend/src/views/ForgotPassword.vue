<template>
  <div class="auth-container">
    <div class="auth-split">
      <!-- Left decorative panel -->
      <div class="auth-visual fp-visual">
        <div class="auth-visual-content">
          <div class="fp-icon-wrap">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.12)"/>
              <path d="M16 22V18a8 8 0 0 1 16 0v4" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <rect x="11" y="22" width="26" height="18" rx="4" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="2"/>
              <circle cx="24" cy="31" r="3" fill="white"/>
              <line x1="24" y1="31" x2="24" y2="35" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h2>Esqueceu a senha?</h2>
          <p>Sem preocupações. Enviaremos um link seguro para redefinir a sua senha.</p>
          <div class="visual-badges">
            <span class="v-badge">🔒 Link Seguro</span>
            <span class="v-badge">⏱️ Expira em 30 min</span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="auth-form-side">
        <div class="auth-form-wrap animate-fade-in">

          <!-- Success state -->
          <div v-if="sent" class="fp-success">
            <div class="success-icon">
              <svg viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#dcfce7"/>
                <path d="M16 28l8 8 16-16" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="auth-title">Email enviado!</h2>
            <p class="auth-subtitle success-msg">
              {{ successMessage }}
            </p>
            <div v-if="devResetUrl" class="dev-link-box">
              <span class="dev-label">🛠️ Modo Dev — Link directo:</span>
              <a :href="devResetUrl" class="dev-reset-link">Clique aqui para redefinir</a>
            </div>
            <div class="fp-actions">
              <router-link to="/login" class="btn btn-primary btn-pill">Voltar ao Login</router-link>
              <button class="btn btn-outline btn-pill" @click="tryAgain">Tentar com outro email</button>
            </div>
          </div>

          <!-- Form state -->
          <template v-else>
            <h1 class="auth-title">Recuperar Senha</h1>
            <p class="auth-subtitle">
              Lembrou? <router-link to="/login">Entrar na conta</router-link>
            </p>

            <div v-if="error" class="alert-error">{{ error }}</div>

            <form @submit.prevent="handleForgot" class="auth-form">
              <div class="form-group">
                <label class="form-label" for="email">Email da conta</label>
                <div class="input-icon-wrap">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    v-model="email"
                    class="form-input with-icon"
                    placeholder="o-seu@email.com"
                    autocomplete="email"
                    required
                    :disabled="loading"
                  />
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                {{ loading ? 'A enviar...' : 'Enviar link de recuperação' }}
              </button>
            </form>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const email = ref('');
const loading = ref(false);
const error = ref('');
const sent = ref(false);
const successMessage = ref('');
const devResetUrl = ref('');

const handleForgot = async () => {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post('/auth/forgot-password', { email: email.value });
    successMessage.value = res.data.message;
    if (res.data.resetUrl) {
      devResetUrl.value = res.data.resetUrl;
    }
    sent.value = true;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ocorreu um erro. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

const tryAgain = () => {
  sent.value = false;
  email.value = '';
  error.value = '';
  successMessage.value = '';
  devResetUrl.value = '';
};
</script>

<style scoped>
/* Reuse auth-container styles from Login.vue */
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

/* Left visual */
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

.fp-icon-wrap {
  margin-bottom: 28px;
}
.fp-icon-wrap svg {
  width: 72px;
  height: 72px;
}

.auth-visual-content h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 14px;
  line-height: 1.25;
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

/* Right form */
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
  margin-bottom: 32px;
}

.auth-subtitle a {
  color: #1a56db;
  font-weight: 600;
  text-decoration: none;
}
.auth-subtitle a:hover { text-decoration: underline; }

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

.input-icon-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 18px;
  height: 18px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 13px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input.with-icon {
  padding-left: 44px;
}

.form-input:focus {
  outline: none;
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26,86,219,0.12);
  background: white;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.btn-outline {
  background: transparent;
  color: #1a56db;
  border: 1.5px solid #1a56db;
}
.btn-outline:hover { background: #eff6ff; }

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

/* Success state */
.fp-success {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeInUp 0.5s ease both;
}

.success-icon {
  margin-bottom: 8px;
}
.success-icon svg {
  width: 72px;
  height: 72px;
}

.success-msg {
  text-align: center;
  line-height: 1.6;
  max-width: 300px;
}

.dev-link-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 20px;
  text-align: center;
  font-size: 0.85rem;
}
.dev-label {
  display: block;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 8px;
}
.dev-reset-link {
  color: #d97706;
  font-weight: 700;
  text-decoration: underline;
}

.fp-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .auth-visual { display: none; }
  .auth-form-side { width: 100%; padding: 40px 24px; }
}
</style>
