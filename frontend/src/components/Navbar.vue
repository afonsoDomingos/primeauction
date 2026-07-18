<template>
  <header class="tesla-nav" :class="{ 'scrolled': isScrolled }">
    <!-- Logo -->
    <div class="nav-brand">
      <router-link to="/" @click="closeMobileMenu">
        <img src="/PRIME LOGO.png" alt="PRIME AUCTION" class="logo-img" />
      </router-link>
    </div>
    
    <!-- Mobile Menu Toggle Button -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu" :aria-expanded="isMobileMenuOpen">
      <svg v-if="!isMobileMenuOpen" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Overlay -->
    <div class="nav-overlay" :class="{ 'active': isMobileMenuOpen }" @click="closeMobileMenu"></div>
    
    <!-- Desktop & Mobile Navigation -->
    <div class="nav-content" :class="{ 'mobile-open': isMobileMenuOpen }">
      <!-- Mobile header inside drawer -->
      <div class="nav-drawer-header">
        <img src="/PRIME LOGO.png" alt="PRIME AUCTION" class="logo-img logo-img-drawer" />
      </div>

      <nav class="nav-links">
        <router-link to="/" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Início
        </router-link>
        <router-link to="/auctions" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Leilões Activos
        </router-link>
        <router-link to="/calendario" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Calendário
        </router-link>
        <router-link to="/vender" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Vender
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Painel Admin
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/analytics" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Analytics
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          O Meu Perfil
        </router-link>
      </nav>
      
      <div class="nav-actions">
        <!-- Theme Toggle Button -->
        <button class="theme-toggle-btn" @click="toggleTheme" aria-label="Alterar tema" :title="theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'">
          <svg v-if="theme === 'light'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-btn nav-btn-ghost" @click="closeMobileMenu">Login</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="nav-btn nav-btn-solid" @click="closeMobileMenu">Registar</router-link>

        <!-- User chip (shows when logged in) -->
        <router-link
          v-if="authStore.isAuthenticated"
          to="/profile"
          class="nav-user-chip"
          @click="closeMobileMenu"
          :title="`Perfil de ${authStore.user?.name}`"
        >
          <img
            v-if="authStore.user?.profilePhoto"
            :src="authStore.user.profilePhoto"
            :alt="authStore.user?.name"
            class="nav-avatar-img"
          />
          <span v-else class="nav-avatar-initial">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
          </span>
          <span class="nav-user-name">{{ authStore.user?.name?.split(' ')[0] }}</span>
        </router-link>

        <a v-if="authStore.isAuthenticated" @click.prevent="handleLogout" class="nav-btn nav-btn-ghost" style="cursor:pointer">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toastStore';

const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  applyThemeClass();
  localStorage.setItem('theme', theme.value); // Save user's manual preference
};

const applyThemeClass = () => {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

const handleLogout = () => {
  authStore.logout();
  toastStore.success('Sessão terminada com sucesso! ✓');
  closeMobileMenu();
  router.push('/');
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    // If user has manually selected a theme, respect it
    theme.value = savedTheme;
  } else {
    // Otherwise, check current hour
    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour >= 18; // Night is 18:00 (6 PM) to 6:00 AM
    theme.value = isNight ? 'dark' : 'light';
  }
  applyThemeClass(); // Apply without writing to localStorage

  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* ─── Base Navbar ─── */
.tesla-nav {
  padding: 0 3rem;
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: transparent;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
}

.tesla-nav.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.08);
  height: 64px;
}

/* ─── Logo ─── */
.nav-brand a {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-img {
  height: 42px;
  width: auto;
  object-fit: contain;
  transition: height 0.3s ease;
}

.tesla-nav.scrolled .logo-img {
  height: 34px;
}

.logo-img-drawer {
  height: 36px;
}

/* ─── Mobile Toggle Button ─── */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  z-index: 1100;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background-color: rgba(0,0,0,0.05);
}

/* ─── Overlay ─── */
.nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-overlay.active {
  opacity: 1;
}

/* ─── Nav Content (Desktop) ─── */
.nav-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: space-between;
  margin-left: 3rem;
}

/* ─── Mobile Drawer Header (hidden on desktop) ─── */
.nav-drawer-header {
  display: none;
}

/* ─── Nav Links ─── */
.nav-links {
  display: flex;
  gap: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text-primary);
  transition: color 0.2s ease, background-color 0.2s ease;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
}

.nav-links a svg {
  display: none; /* hide icons on desktop */
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background-color: rgba(0, 0, 0, 0.06);
}

/* ─── Nav Action Buttons ─── */
.nav-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.1rem;
  border-radius: var(--radius-pill);
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.nav-btn-ghost {
  color: var(--text-primary);
  background-color: transparent;
}

.nav-btn-ghost:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.nav-btn-solid {
  background-color: var(--btn-primary-bg);
  color: white;
}

.nav-btn-solid:hover {
  background-color: #3457b2;
}

/* ─── User Avatar Chip ─── */
.nav-user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: var(--radius-pill);
  border: 1.5px solid rgba(0,0,0,0.08);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(8px);
}

.nav-user-chip:hover {
  border-color: var(--btn-primary-bg);
  background: rgba(255,255,255,0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.nav-avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.nav-avatar-initial {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--btn-primary-bg), #7c3aed);
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Tablet breakpoint ─── */
@media (max-width: 1024px) {
  .tesla-nav {
    padding: 0 2rem;
  }
  .nav-content {
    margin-left: 2rem;
  }
}

/* ─── Mobile breakpoint ─── */
@media (max-width: 768px) {
  .tesla-nav {
    padding: 0 1.25rem;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-overlay {
    display: block;
    pointer-events: none;
  }

  .nav-overlay.active {
    pointer-events: auto;
  }

  /* Slide-in drawer from right */
  .nav-content {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(320px, 85vw);
    background-color: var(--bg-color);
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 0;
    margin-left: 0;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1050;
    box-shadow: -4px 0 24px rgba(0,0,0,0.12);
    overflow-y: auto;
  }

  .nav-content.mobile-open {
    transform: translateX(0);
  }

  /* Drawer header */
  .nav-drawer-header {
    display: flex;
    align-items: center;
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid var(--border-color, #f0f0f0);
    margin-bottom: 0.5rem;
  }

  /* Nav links vertical */
  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 0;
    padding: 0.5rem 0;
  }

  .nav-links a {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border-radius: 0;
    border-bottom: 1px solid var(--border-color, #f7f7f7);
    gap: 10px;
  }

  .nav-links a svg {
    display: block; /* show icons on mobile */
    flex-shrink: 0;
  }

  .nav-links a:hover,
  .nav-links a.router-link-active {
    background-color: var(--nav-link-hover, #f5f8ff);
    color: var(--btn-primary-bg);
  }

  /* Action buttons at bottom of drawer */
  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
    gap: 0.75rem;
    margin-top: auto;
    border-top: 1px solid var(--border-color, #f0f0f0);
  }

  .nav-btn {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
    border-radius: var(--radius-md);
    justify-content: center;
  }

  .nav-btn-ghost {
    border: 1px solid var(--border-color, #e5e7eb);
  }
}

/* ─── Theme Toggle Button ─── */
.theme-toggle-btn {
  background: none;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  outline: none;
}

.theme-toggle-btn:hover {
  background-color: var(--nav-link-hover, rgba(0, 0, 0, 0.06));
  border-color: var(--border-color, rgba(0, 0, 0, 0.15));
  transform: scale(1.05);
}

.dark .theme-toggle-btn {
  border-color: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}

.dark .theme-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .theme-toggle-btn {
    width: 48px;
    height: 48px;
    background-color: var(--btn-secondary-bg);
    border-color: var(--border-color, rgba(0,0,0,0.1));
    color: var(--text-primary) !important;
    align-self: center;
    margin-bottom: 1.25rem;
    box-shadow: var(--shadow-sm);
  }

  .dark .theme-toggle-btn {
    background-color: #1f2937;
    border-color: #30363d;
    color: #f3f4f6 !important;
  }
}
</style>
