<template>
  <header class="tesla-nav" :class="{ 'scrolled': isScrolled }">
    <!-- Logo -->
    <div class="nav-brand">
      <router-link to="/" @click="closeMobileMenu">
        <img src="/logo prime.png" alt="PRIME AUCTION" class="logo-img" />
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
        <img src="/logo prime.png" alt="PRIME AUCTION" class="logo-img logo-img-drawer" />
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
      
      <!-- Nav Actions Group (Notifications, Theme, Login, Register, Profile) -->
      <div class="nav-actions">
        <!-- Notification Bell Button -->
        <button 
          type="button" 
          class="nav-notif-btn" 
          @click="toggleNotifModal" 
          aria-label="Notificações"
          title="Notificações"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span v-if="unreadNotifsCount > 0" class="notif-badge-pill">{{ unreadNotifsCount }}</span>
        </button>

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

    <!-- Notifications Pop-up Modal Overlay (Matches user reference screenshot) -->
    <Transition name="fade">
      <div v-if="showNotifModal" class="notif-overlay" @click.self="showNotifModal = false">
        <div class="notif-modal-card animate-scale-in">
          <div class="notif-modal-header">
            <h3 class="notif-title">Notificações</h3>
            <div class="notif-header-actions">
              <button @click="markAllAsRead" type="button" class="btn-mark-all-read">Marcar todas como lidas</button>
              <button @click="showNotifModal = false" type="button" class="btn-close-notif" aria-label="Fechar">✕</button>
            </div>
          </div>

          <div class="notif-list-body">
            <div v-if="notifications.length === 0" class="notif-empty-state">
              <span class="empty-icon">🔔</span>
              <p>Não tem notificações de momento.</p>
            </div>
            
            <div 
              v-for="notif in notifications" 
              :key="notif.id" 
              class="notif-item"
              :class="{ unread: !notif.read }"
              @click="markAsReadAndNavigate(notif)"
            >
              <div class="notif-item-left">
                <span v-if="!notif.read" class="unread-dot-red">🔴</span>
                <div class="notif-text-wrap">
                  <p class="notif-msg">{{ notif.message }}</p>
                  <span class="notif-date">{{ notif.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toastStore';

const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

// Notifications System
const showNotifModal = ref(false);
const notifications = ref([]);
const loadingNotifications = ref(false);

const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) {
    notifications.value = [];
    return;
  }
  loadingNotifications.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      notifications.value = res.data.data.map(n => ({
        id: n._id,
        message: n.message,
        title: n.title,
        date: new Date(n.createdAt).toLocaleDateString('pt-MZ'),
        read: n.read,
        link: n.link || '/'
      }));
    }
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
  } finally {
    loadingNotifications.value = false;
  }
};

const unreadNotifsCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const toggleNotifModal = async () => {
  showNotifModal.value = !showNotifModal.value;
  if (showNotifModal.value) {
    await fetchNotifications();
  }
};

const markAllAsRead = async () => {
  notifications.value.forEach(n => n.read = true);
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.put(`${apiUrl}/api/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    toastStore.add('Todas as notificações marcadas como lidas.', 'info');
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
  }
};

const markAsReadAndNavigate = async (notif) => {
  notif.read = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.put(`${apiUrl}/api/notifications/${notif.id}/read`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
  } catch (err) {
    console.error('Error marking notification read:', err);
  }
  if (notif.link) {
    showNotifModal.value = false;
    router.push(notif.link);
  }
};



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
  fetchNotifications();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* ─── Base Navbar ─── */
.tesla-nav {
  padding: 0 2rem;
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.dark) .tesla-nav,
.dark .tesla-nav,
html.dark .tesla-nav {
  background-color: rgba(15, 23, 42, 0.98) !important;
  border-bottom-color: rgba(30, 41, 59, 0.9) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
}

.tesla-nav.scrolled {
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  height: 64px;
}

:deep(.dark) .tesla-nav.scrolled,
.dark .tesla-nav.scrolled,
html.dark .tesla-nav.scrolled {
  background-color: rgba(15, 23, 42, 0.98) !important;
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
  color: #0f172a;
  cursor: pointer;
  z-index: 1100;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.dark .mobile-menu-btn,
html.dark .mobile-menu-btn {
  color: #f8fafc;
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
  color: #0f172a;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
}

.dark .nav-links a,
html.dark .nav-links a {
  color: #f8fafc;
}

.nav-links a svg {
  display: none; /* hide icons on desktop */
}

.nav-links a:hover {
  color: #1a56db;
  background-color: rgba(26, 86, 219, 0.08);
}

.dark .nav-links a:hover,
html.dark .nav-links a:hover {
  color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.15);
}

.nav-links a.router-link-active {
  color: #1a56db;
  background-color: rgba(26, 86, 219, 0.12);
  font-weight: 700;
}

.dark .nav-links a.router-link-active,
html.dark .nav-links a.router-link-active {
  color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.2);
}

/* ─── Nav Action Buttons ─── */
.nav-actions {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
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

/* ─── Notification Bell & Modal Styles (Matches user's screenshot reference) ─── */
.nav-notif-btn {
  position: relative;
  background: white;
  border: 1px solid var(--border-color, #e2e8f0);
  color: var(--text-primary, #334155);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-notif-btn:hover {
  background-color: #f8fafc;
  transform: scale(1.05);
}

.dark .nav-notif-btn {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}

.notif-badge-pill {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.68rem;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

/* Notification Pop-up Modal Overlay */
.notif-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.notif-modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 460px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.dark .notif-modal-card {
  background: #0f172a;
  border-color: #1e293b;
  color: white;
}

.notif-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.dark .notif-modal-header {
  border-bottom-color: #1e293b;
}

.notif-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.dark .notif-title {
  color: #ffffff;
}

.notif-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-mark-all-read {
  background: none;
  border: none;
  color: #ec4899;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-mark-all-read:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.btn-close-notif {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-notif:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.dark .btn-close-notif {
  background: #1e293b;
  color: #cbd5e1;
}

.notif-list-body {
  max-height: 380px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.notif-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.dark .notif-item {
  border-bottom-color: #1e293b;
}

.notif-item:hover {
  background: #f8fafc;
}

.dark .notif-item:hover {
  background: #1e293b;
}

.notif-item.unread {
  background: #fff5f7;
}

.dark .notif-item.unread {
  background: rgba(236, 72, 153, 0.1);
}

.notif-item-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.unread-dot-red {
  font-size: 0.6rem;
  margin-top: 4px;
}

.notif-msg {
  font-size: 0.88rem;
  color: #334155;
  margin: 0 0 0.25rem;
  line-height: 1.45;
  font-weight: 500;
}

.dark .notif-msg {
  color: #e2e8f0;
}

.notif-date {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
}
</style>
