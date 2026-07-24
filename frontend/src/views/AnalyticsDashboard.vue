<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h1>Analytics Dashboard</h1>
      <div class="period-selector">
        <select v-model="selectedPeriod" @change="fetchAnalytics" class="period-select">
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="year">Último Ano</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando analytics...</p>
    </div>

    <div v-else-if="overview" class="dashboard-content">
      <!-- Overview Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totals.users }}</div>
            <div class="stat-label">Total Users</div>
            <div class="stat-change positive">+{{ overview.thisMonth.newUsers }} este mês</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon auctions-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totals.auctions }}</div>
            <div class="stat-label">Total Leilões</div>
            <div class="stat-change positive">+{{ overview.thisMonth.newAuctions }} este mês</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bids-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totals.bids }}</div>
            <div class="stat-label">Total Lances</div>
            <div class="stat-change positive">+{{ overview.thisWeek.bids }} esta semana</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency(overview.revenue.total) }}</div>
            <div class="stat-label">Receita Estimada</div>
            <div class="stat-change">Média: {{ formatCurrency(overview.revenue.averageBid) }}/lance</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Auction Status Chart -->
        <div class="chart-card">
          <h3>Status dos Leilões</h3>
          <div class="pie-chart-container">
            <div class="pie-chart">
              <div 
                class="pie-segment active" 
                :style="{ 
                  '--percentage': (overview.auctionStatus.active / overview.totals.auctions * 100) + '%',
                  '--color': '#3e6ae1'
                }"
              ></div>
              <div 
                class="pie-segment upcoming" 
                :style="{ 
                  '--percentage': (overview.auctionStatus.upcoming / overview.totals.auctions * 100) + '%',
                  '--color': '#f59e0b'
                }"
              ></div>
              <div 
                class="pie-segment finished" 
                :style="{ 
                  '--percentage': (overview.auctionStatus.finished / overview.totals.auctions * 100) + '%',
                  '--color': '#10b981'
                }"
              ></div>
            </div>
            <div class="pie-legend">
              <div class="legend-item">
                <div class="legend-color" style="background: #3e6ae1"></div>
                <span>Ativos ({{ overview.auctionStatus.active }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #f59e0b"></div>
                <span>Por Começar ({{ overview.auctionStatus.upcoming }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #10b981"></div>
                <span>Terminados ({{ overview.auctionStatus.finished }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Chart -->
        <div class="chart-card">
          <h3>Categorias Populares</h3>
          <div class="bar-chart">
            <div 
              v-for="cat in overview.categories.slice(0, 6)" 
              :key="cat._id" 
              class="bar-item"
            >
              <div class="bar-label">{{ cat._id }}</div>
              <div class="bar-track">
                <div 
                  class="bar-fill" 
                  :style="{ 
                    width: (cat.count / Math.max(...overview.categories.map(c => c.count)) * 100) + '%' 
                  }"
                ></div>
              </div>
              <div class="bar-value">{{ cat.count }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats -->
      <div class="detailed-stats">
        <div class="stats-row">
          <div class="stat-box">
            <h4>Propostas Pendentes</h4>
            <div class="stat-number">{{ overview.totals.proposals }}</div>
          </div>
          <div class="stat-box">
            <h4>Mensagens Trocadas</h4>
            <div class="stat-number">{{ overview.totals.messages }}</div>
          </div>
          <div class="stat-box">
            <h4>Utilizadores Ativos (30 dias)</h4>
            <div class="stat-number">{{ overview.activeUsers }}</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>Atividade Recente</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ overview.thisMonth.newUsers }} novos utilizadores este mês</div>
              <div class="activity-time">Este mês</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ overview.thisMonth.newAuctions }} novos leilões criados</div>
              <div class="activity-time">Este mês</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ overview.thisMonth.bids }} lances colocados este mês</div>
              <div class="activity-time">Este mês</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

const authStore = useAuthStore();
const loading = ref(true);
const overview = ref(null);
const selectedPeriod = ref('month');

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${apiUrl}/api/analytics/overview`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    overview.value = res.data.data;
  } catch (err) {
    console.error('Error fetching analytics:', err);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
.analytics-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 105px 2rem 3rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.period-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  outline: none;
}

.period-select:focus {
  border-color: #3e6ae1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3e6ae1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.users-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.auctions-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.bids-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.revenue-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.pie-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    var(--active-color, #3e6ae1) 0% var(--percentage, 33%),
    var(--upcoming-color, #f59e0b) var(--percentage, 33%) calc(var(--percentage, 33%) + var(--upcoming-percentage, 33%)),
    var(--finished-color, #10b981) calc(var(--percentage, 33%) + var(--upcoming-percentage, 33%)) 100%
  );
  position: relative;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  width: 120px;
  font-size: 0.875rem;
  color: #4b5563;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3e6ae1, #5b8def);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.bar-value {
  width: 40px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.detailed-stats {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-box {
  text-align: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-box h4 {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.activity-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e0e7ff;
  color: #3e6ae1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #1f2937;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .pie-chart-container {
    flex-direction: column;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
