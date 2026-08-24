<template>
  <div class="auth-container">
    <div class="auth-split">
      <!-- Left decorative panel (hidden on mobile) -->
      <div class="auth-visual">
        <div class="auth-visual-content">
          <h2>Bem-vindo de volta.</h2>
          <p>Aceda à sua conta e continue a explorar os melhores leilões de Moçambique.</p>
          <div class="visual-badges">
            <span class="v-badge">⚡ Lances em Tempo Real</span>
            <span class="v-badge">🔒 100% Seguro</span>
            <span class="v-badge">🏆 Leilões Exclusivos</span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="auth-form-side">
        <div class="auth-form-wrap animate-fade-in">


          <h1 class="auth-title">Entrar</h1>
          <p class="auth-subtitle">Não tem conta? <router-link to="/register">Registe-se gratuitamente</router-link></p>

          <form @submit.prevent="handleLogin" class="auth-form">
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
              <div class="label-row">
                <label class="form-label" for="password">Senha</label>
                <router-link to="/forgot-password" class="forgot-link">Esqueceu a senha?</router-link>
              </div>
              <div class="input-wrapper">
                <input
                  :type="showPass ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  class="form-input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
                  <svg v-if="!showPass" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>


            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="authStore.loading">
              <span v-if="authStore.loading" class="btn-spinner"></span>
              {{ authStore.loading ? 'A entrar...' : 'Entrar' }}
            </button>

            <div class="divider">
              <span>ou continue com</span>
            </div>

            <button @click="handleGoogleLogin" class="btn btn-google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toastStore';

const email = ref('');
const password = ref('');
const showPass = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();

const handleLogin = async () => {
  await authStore.login(email.value, password.value);
  if (authStore.isAuthenticated) {
    toastStore.success(`Bem-vindo, ${authStore.user?.name}! ✓`);
    router.push(authStore.isAdmin ? '/admin' : '/');
  } else if (authStore.error) {
    toastStore.error(authStore.error);
  }
};

const handleGoogleLogin = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  window.location.href = `${backendUrl}/api/auth/google`;
};

// Verificar token na URL após callback do Google
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('token', token);
    authStore.fetchUser();
    toastStore.success(`Bem-vindo, ${authStore.user?.name}! ✓`);
    router.push(authStore.isAdmin ? '/admin' : '/');
    
    // Limpar token da URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
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
    linear-gradient(135deg, rgba(20,30,70,0.88) 0%, rgba(10,15,40,0.92) 100%),
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
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 2.5rem;
  background: white;
}

.auth-form-wrap {
  width: 100%;
}

.auth-logo {
  margin-bottom: 2.5rem;
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

/* ── Input Wrapper (password toggle) ── */
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

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  font-size: 0.8rem;
  color: #1a56db;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}
.forgot-link:hover { opacity: 0.75; text-decoration: underline; }

/* ── Submit Button ── */
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

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--text-light);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 1rem;
}

/* ── Google Button ── */
.btn-google {
  width: 100%;
  padding: 0.875rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50px;
  color: #374151;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-google:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.btn-google:active {
  transform: translateY(0);
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
