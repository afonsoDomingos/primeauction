<template>
  <Navbar />
  <main>
    <router-view />
  </main>

  <ChatAssistant />

  <!-- Scroll to Top Button -->
  <Transition name="scroll-top">
    <button
      v-if="showScrollTop"
      id="scroll-top-btn"
      class="scroll-top-btn"
      @click="scrollToTop"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  </Transition>

  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-brand">
          <img src="/logo prime.png" alt="Prime Auction" class="footer-logo-img" />
          <h3>Prime Auction</h3>
          <p>A melhor plataforma de leilões em Moçambique</p>
        </div>
      </div>

      <div class="footer-section">
        <h4>Leilões</h4>
        <ul class="footer-links">
          <li><router-link to="/auctions" class="footer-link">Leilões Activos</router-link></li>
          <li><router-link to="/calendario" class="footer-link">Calendário</router-link></li>
          <li><router-link to="/vender" class="footer-link">Vender Connosco</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Suporte</h4>
        <ul class="footer-links">
          <li><a href="#" class="footer-link">FAQ</a></li>
          <li><a href="#" class="footer-link">Contacto</a></li>
          <li><a href="#" class="footer-link">Termos e Condições</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Contacto</h4>
        <ul class="footer-links">
          <li><a href="tel:+258841234567" class="footer-link">+258 84 123 4567</a></li>
          <li><a href="mailto:info@primeauction.mz" class="footer-link">info@primeauction.mz</a></li>
          <li>Maputo, Moçambique</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} Prime Auctions. Todos os direitos reservados.</p>
      <p class="footer-attribution">
        Powered by <a href="https://www.wehosthere.com/" target="_blank" rel="noopener noreferrer" class="footer-link">
          Wehosthere <img src="/wehosthere.png" alt="Wehosthere" class="footer-logo" />
        </a>
      </p>
    </div>
  </footer>

  <!-- Global Toast Notifications -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast-item"
          :class="toast.type"
          @click="toastStore.remove(toast.id)"
        >
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="toastStore.remove(toast.id)">×</button>
          <div class="toast-progress"><div class="toast-progress-bar" :style="{ animationDuration: toast.duration + 'ms' }"></div></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar from './components/Navbar.vue';
import ChatAssistant from './components/ChatAssistant.vue';
import { useAuthStore } from './stores/authStore';
import { useToastStore } from './stores/toastStore';

const authStore = useAuthStore();
const toastStore = useToastStore();

const showScrollTop = ref(false);

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser();
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex-grow: 1;
}

.app-footer {
  background-color: #000000;
  color: #ffffff;
  padding: 3rem 2rem 1.5rem;
  border-top: 3px solid #00a651;
  font-size: 0.9rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: #00a651;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-brand {
  text-align: left;
}

.footer-brand h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.footer-brand p {
  color: #a3a3a3;
  font-size: 0.85rem;
  line-height: 1.5;
}

.footer-logo-img {
  height: 40px;
  width: auto;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  border-top: 1px solid #2a2d36;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.footer-attribution {
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #00a651;
  text-decoration: underline;
}

.footer-logo {
  height: 24px;
  width: auto;
  vertical-align: middle;
  display: inline-block;
  transition: opacity 0.2s ease;
}

.footer-link:hover .footer-logo {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}

/* ─── Scroll to Top Button (GoBid Style) ─── */
.scroll-top-btn {
  position: fixed;
  bottom: 5.5rem;
  right: 2rem;
  z-index: 998;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #00a651;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 166, 81, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scroll-top-btn:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
}

.scroll-top-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .scroll-top-btn {
    right: 1.25rem;
    bottom: 5.25rem;
    width: 42px;
    height: 42px;
  }
}

/* Transition animation */
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.85);
}
</style>
