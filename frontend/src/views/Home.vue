<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content animate-fade-in">
        <h1 class="hero-title">Prime Auctions</h1>
        <p class="hero-subtitle">Leilões Exclusivos em Moçambique.</p>
      </div>
      
      <div class="hero-actions animate-fade-in" style="animation-delay: 0.3s;">
        <router-link to="/auctions" class="btn btn-primary btn-pill">Ver Leilões</router-link>
        <router-link to="/about" class="btn btn-secondary btn-pill">Saber Mais</router-link>
      </div>
    </section>

    <!-- Content Sections below would go here -->
    <div class="down-arrow">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  position: relative;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
}

.hero-section {
  height: 100vh;
  width: 100%;
  background-image: url('https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); /* Sample Tesla-like abstract or car background */
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 15vh 2rem 5vh;
  scroll-snap-align: start;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
  color: var(--text-primary);
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-actions .btn {
  min-width: 260px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
  padding: 0.75rem 1.5rem;
}

.btn-primary {
  background-color: var(--text-primary);
  color: white;
}
.btn-primary:hover {
  background-color: var(--text-secondary);
}

.btn-secondary {
  background-color: rgba(244, 244, 244, 0.65);
  backdrop-filter: blur(5px);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.down-arrow {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  color: var(--text-primary);
  cursor: pointer;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
  40% { transform: translateY(-10px) translateX(-50%); }
  60% { transform: translateY(-5px) translateX(-50%); }
}

@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
    gap: 1rem;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
