<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content animate-fade-in">
        <p class="hero-eyebrow">Plataforma de Leilões #1 em Moçambique</p>
        <h1 class="hero-title">Prime Auctions</h1>
        <p class="hero-subtitle">Leilões Exclusivos. Preços Competitivos. Totalmente Online.</p>
      </div>
      
      <div class="hero-actions animate-fade-in" style="animation-delay: 0.3s;">
        <router-link to="/auctions" class="btn btn-primary btn-pill hero-btn">Ver Leilões Activos</router-link>
        <router-link to="/register" class="btn btn-secondary btn-pill hero-btn">Criar Conta</router-link>
      </div>

      <div class="down-arrow" @click="scrollDown">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" id="features">
      <div class="container">
        <h2 class="features-title">Porquê escolher a Prime Auction?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lances em Tempo Real</h3>
            <p>Tecnologia WebSocket garante que todos vêem os lances instantaneamente, sem necessidade de atualizar a página.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Segurança Garantida</h3>
            <p>Autenticação JWT robusta e gestão completa de utilizadores pelo administrador da plataforma.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Leilões Exclusivos</h3>
            <p>Produtos de alta qualidade curados pela nossa equipa, garantindo leilões de prestígio e valor real.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const scrollDown = () => {
  const features = document.getElementById('features');
  if (features) {
    features.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
}

/* ─── Hero ─── */
.hero-section {
  height: 100svh;
  min-height: 600px;
  width: 100%;
  background-image:
    linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%),
    url('https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: clamp(100px, 18vh, 160px) 1.5rem clamp(40px, 6vh, 80px);
  position: relative;
}

.hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  margin-bottom: 1rem;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  color: #ffffff;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: clamp(0.9rem, 2.5vw, 1.15rem);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 560px;
}

.hero-btn {
  min-width: 200px;
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  max-width: 260px;
}

.btn-primary.hero-btn {
  background-color: #171a20;
  color: white;
}
.btn-primary.hero-btn:hover {
  background-color: #2a2d36;
}

.btn-secondary.hero-btn {
  background-color: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.4);
}
.btn-secondary.hero-btn:hover {
  background-color: rgba(255, 255, 255, 0.28);
}

/* Down arrow */
.down-arrow {
  position: absolute;
  bottom: clamp(20px, 4vh, 40px);
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2.5s ease-in-out infinite;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  padding: 0.5rem;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

/* ─── Features Section ─── */
.features-section {
  padding: clamp(60px, 10vw, 100px) 1.5rem;
  background-color: #f9fafb;
}

.features-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 600;
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem 1.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 2.25rem;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.65;
}

/* ─── Mobile adjustments ─── */
@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-btn {
    width: 100%;
    max-width: 100%;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
