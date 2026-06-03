<template>
  <header class="tesla-nav" :class="{ 'scrolled': isScrolled }">
    <div class="nav-brand">
      <router-link to="/">
        <span class="logo-text">PRIME AUCTION</span>
      </router-link>
    </div>
    
    <nav class="nav-links">
      <router-link to="/">Início</router-link>
      <router-link to="/auctions">Leilões Activos</router-link>
      <router-link v-if="authStore.isAdmin" to="/admin">Painel Admin</router-link>
      <router-link v-if="authStore.isAuthenticated" to="/profile">O Meu Perfil</router-link>
    </nav>
    
    <div class="nav-actions">
      <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-icon">Login</router-link>
      <router-link v-if="!authStore.isAuthenticated" to="/register" class="nav-icon">Registar</router-link>
      <a v-if="authStore.isAuthenticated" @click.prevent="logout" class="nav-icon" style="cursor:pointer">Sair</a>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isScrolled = ref(false);

const logout = () => {
  authStore.logout();
  router.push('/');
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.tesla-nav {
  padding: 1.25rem 3rem;
}

.logo-text {
  font-weight: 700;
  letter-spacing: 5px;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-primary);
  transition: color 0.3s ease;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
}

.nav-links a:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-icon {
  color: var(--text-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.nav-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
