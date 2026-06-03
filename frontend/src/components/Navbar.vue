<template>
  <header class="tesla-nav" :class="{ 'scrolled': isScrolled }">
    <div class="nav-brand">
      <router-link to="/">
        <span class="logo-text">PRIME AUCTION</span>
      </router-link>
    </div>
    
    <nav class="nav-links">
      <router-link to="/">Vehicles</router-link>
      <router-link to="/">Energy</router-link>
      <router-link to="/">Charging</router-link>
      <router-link to="/">Discover</router-link>
      <router-link to="/">Shop</router-link>
    </nav>
    
    <div class="nav-actions">
      <router-link to="/login" class="nav-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);

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
