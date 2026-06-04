<template>
  <Navbar />
  <main>
    <router-view />
  </main>

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
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/authStore';
import { useToastStore } from './stores/toastStore';

const authStore = useAuthStore();
const toastStore = useToastStore();

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser();
  }
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
</style>

