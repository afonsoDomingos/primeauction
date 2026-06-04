<template>
  <div class="auth-container">
    <div class="auth-split">
      <!-- Left decorative panel -->
      <div class="auth-visual">
        <div class="auth-visual-content">
          <h2>Junte-se à Prime Auction.</h2>
          <p>Crie a sua conta gratuitamente e comece a participar nos melhores leilões de Moçambique hoje mesmo.</p>
          <div class="visual-badges">
            <span class="v-badge">✅ Registo Gratuito</span>
            <span class="v-badge">⚡ Lances em Tempo Real</span>
            <span class="v-badge">🏆 Leilões Exclusivos</span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="auth-form-side">
        <div class="auth-form-wrap animate-fade-in">
          <div class="auth-logo">
            <router-link to="/">
              <img src="/PRIME LOGO.png" alt="PRIME AUCTION" class="auth-logo-img" />
            </router-link>
          </div>

          <h1 class="auth-title">Criar Conta</h1>
          <p class="auth-subtitle">Já tem conta? <router-link to="/login">Faça Login</router-link></p>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                v-model="name"
                class="form-input"
                placeholder="João Silva"
                autocomplete="name"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                class="form-input"
                placeholder="o-seu@email.com"
                autocomplete="email"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Senha</label>
              <div class="input-wrapper">
                <input
                  :type="showPass ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  class="form-input"
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password"
                  minlength="6"
                  required
                />
                <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
                  <svg v-if="!showPass" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <!-- Password strength indicator -->
              <div class="password-strength" v-if="password.length > 0">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-label" :class="passwordStrength.class">{{ passwordStrength.label }}</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="loading">
              <span v-if="loading" class="btn-spinner"></span>
              {{ loading ? 'A registar...' : 'Criar Conta' }}
            </button>

            <p class="terms-note">
              Ao registar-se, aceita os nossos Termos de Utilização e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToastStore } from '../stores/toastStore';

const name = ref('');
const email = ref('');
const password = ref('');
const showPass = ref(false);
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();

const passwordStrength = computed(() => {
  const len = password.value.length;
  if (len === 0) return { class: '', width: '0%', label: '' };
  if (len < 6) return { class: 'weak', width: '25%', label: 'Fraca' };
  if (len < 10) return { class: 'medium', width: '60%', label: 'Média' };
  return { class: 'strong', width: '100%', label: 'Forte' };
});

const handleRegister = async () => {
  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/auth/register`, {
      name: name.value,
      email: email.value,
      password: password.value
    });
    authStore.token = res.data.token;
    authStore.user = res.data.user;
    localStorage.setItem('token', res.data.token);
    toastStore.success('Conta criada com sucesso! ✓');
    router.push('/');
  } catch (err) {
    toastStore.error(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ── Container ── */
.auth-container {
  min-height: 100svh;
  display: flex;
}

.auth-split {
  display: flex;
  width: 100%;
  min-height: 100svh;
}

/* ── Left Visual Panel ── */
.auth-visual {
  flex: 1;
  background:
    linear-gradient(135deg, rgba(15,25,65,0.9) 0%, rgba(40,15,65,0.92) 100%),
    url('https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
  color: white;
}

.auth-visual-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.auth-visual-content p {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.72);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.visual-badges {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.v-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(4px);
  color: white;
  padding: 0.45rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  width: fit-content;
}

/* ── Right Form Panel ── */
.auth-form-side {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 2.5rem;
  background: white;
  overflow-y: auto;
}

.auth-form-wrap {
  width: 100%;
  padding: 1rem 0;
}

.auth-logo {
  margin-bottom: 2rem;
  display: flex;
}

.auth-logo-img {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.auth-subtitle a {
  color: var(--btn-primary-bg);
  font-weight: 600;
  text-decoration: none;
}

.auth-subtitle a:hover {
  text-decoration: underline;
}

/* ── Password Toggle ── */
.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  padding-right: 3rem;
}

.toggle-pass {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass:hover {
  color: var(--text-primary);
}

/* ── Password Strength ── */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex-grow: 1;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak   { background-color: var(--danger-color); }
.strength-fill.medium { background-color: #ff9800; }
.strength-fill.strong { background-color: #4caf50; }

.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
  min-width: 40px;
}

.strength-label.weak   { color: var(--danger-color); }
.strength-label.medium { color: #e65100; }
.strength-label.strong { color: #2e7d32; }

/* ── Error ── */
.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fdecea;
  border-radius: var(--radius-md);
}

/* ── Submit ── */
.submit-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Terms ── */
.terms-note {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: center;
  line-height: 1.5;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .auth-visual {
    display: none;
  }

  .auth-form-side {
    max-width: 100%;
    padding: 1.5rem 1.25rem;
    padding-top: 5rem;
    align-items: flex-start;
  }
}
</style>
