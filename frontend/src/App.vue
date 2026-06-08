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
      <p>&copy; {{ new Date().getFullYear() }} Prime Auctions. Todos os direitos reservados.</p>
      <p class="footer-attribution">
        Powered by <a href="https://linkedin.com/in/afonso-domingos-6b59361a5/" target="_blank" rel="noopener noreferrer" class="footer-link">Vibe</a>
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
  background-color: #171a20;
  color: #a3a3a3;
  padding: 1.5rem 2rem;
  border-top: 1px solid #2a2d36;
  font-size: 0.85rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
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
  font-weight: 600;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #3e6ae1;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

/* ─── Scroll to Top Button ─── */
.scroll-top-btn {
  position: fixed;
  bottom: 5.5rem;
  right: 1.5rem;
  z-index: 998;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3e6ae1 0%, #1a56db 100%);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(62, 106, 225, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scroll-top-btn:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 8px 24px rgba(62, 106, 225, 0.55);
}

.scroll-top-btn:active {
  transform: scale(0.95);
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
