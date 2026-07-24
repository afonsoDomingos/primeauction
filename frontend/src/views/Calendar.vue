<template>
  <div class="calendar-page-container">
    <div class="container animate-fade-in" style="padding-top: 105px; padding-bottom: 60px;">
      <div class="page-header">
        <h2 class="page-title">Calendário de Leilões</h2>
        <p class="page-subtitle">Acompanhe as datas de início e encerramento para planear os seus lances</p>
      </div>

      <div class="calendar-layout-grid">
        <!-- ── Calendário Mensal ── -->
        <div class="calendar-card card">
          <div class="calendar-header">
            <button @click="prevMonth" class="month-nav-btn" title="Mês Anterior">&larr;</button>
            <h3 class="month-title">{{ monthLabel }}</h3>
            <button @click="nextMonth" class="month-nav-btn" title="Mês Seguinte">&rarr;</button>
          </div>

          <div class="weekday-row">
            <div v-for="w in weekdayNames" :key="w" class="weekday-header">{{ w }}</div>
          </div>

          <div class="days-grid">
            <div 
              v-for="(cell, index) in calendarCells" 
              :key="index"
              class="day-cell"
              :class="{ 
                'empty': !cell.day, 
                'today': cell.isToday, 
                'selected': cell.isSelected,
                'has-events': cell.day && (getEventsForDay(cell.date).starts.length > 0 || getEventsForDay(cell.date).ends.length > 0)
              }"
              @click="selectDay(cell)"
            >
              <span v-if="cell.day" class="day-number">{{ cell.day }}</span>
              <div v-if="cell.day" class="dot-indicators">
                <span v-if="getEventsForDay(cell.date).starts.length > 0" class="dot dot-start" title="Leilão a começar"></span>
                <span v-if="getEventsForDay(cell.date).ends.length > 0" class="dot dot-end" title="Leilão a terminar"></span>
              </div>
            </div>
          </div>

          <!-- Legenda -->
          <div class="legend-row">
            <span class="legend-item"><span class="dot dot-start inline-dot"></span> Começa no dia</span>
            <span class="legend-item"><span class="dot dot-end inline-dot"></span> Termina no dia</span>
          </div>
        </div>

        <!-- ── Painel de Eventos do Dia Selecionado ── -->
        <div class="events-panel card">
          <div class="panel-header">
            <span class="panel-icon">📅</span>
            <div>
              <h3 class="panel-title">Leilões para o Dia</h3>
              <p class="panel-subtitle">{{ selectedDate.toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
            </div>
          </div>

          <div v-if="loading" class="events-loading">
            <div class="spinner"></div>
            <p>A carregar leilões...</p>
          </div>

          <div v-else-if="selectedDateEvents.total === 0" class="empty-panel">
            <div class="empty-state-icon">🏷️</div>
            <h4>Sem eventos para este dia</h4>
            <p>Selecione um dia no calendário que contenha marcadores de cores (🟢 ou 🔴) para ver os leilões correspondentes.</p>
          </div>

          <div v-else class="events-lists">
            <!-- Começam neste dia -->
            <div v-if="selectedDateEvents.starts.length > 0" class="event-group">
              <h4 class="group-title starts-title">🟢 Começam Hoje ({{ selectedDateEvents.starts.length }})</h4>
              <div class="event-items">
                <div 
                  v-for="a in selectedDateEvents.starts" 
                  :key="a._id" 
                  class="event-item-card"
                  @click="goToAuction(a._id)"
                >
                  <img :src="a.imageUrl" :alt="a.title" class="event-item-img" />
                  <div class="event-item-info">
                    <h5 class="event-item-title">{{ a.title }}</h5>
                    <span class="event-item-cat">{{ a.category }}</span>
                    <div class="event-item-footer">
                      <span class="event-item-price">Preço Inicial: <strong>{{ formatCurrency(a.startingPrice) }}</strong></span>
                      <span class="event-item-time">Inicia às {{ new Date(a.startTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Terminam neste dia -->
            <div v-if="selectedDateEvents.ends.length > 0" class="event-group">
              <h4 class="group-title ends-title">🔴 Terminam Hoje ({{ selectedDateEvents.ends.length }})</h4>
              <div class="event-items">
                <div 
                  v-for="a in selectedDateEvents.ends" 
                  :key="a._id" 
                  class="event-item-card"
                  @click="goToAuction(a._id)"
                >
                  <img :src="a.imageUrl" :alt="a.title" class="event-item-img" />
                  <div class="event-item-info">
                    <h5 class="event-item-title">{{ a.title }}</h5>
                    <span class="event-item-cat">{{ a.category }}</span>
                    <div class="event-item-footer">
                      <span class="event-item-price">Lance Atual: <strong>{{ formatCurrency(a.currentPrice) }}</strong></span>
                      <span class="event-item-time">Encerra às {{ new Date(a.endTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const auctions = ref([]);
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(new Date());

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const monthLabel = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const fetchAuctions = async () => {
  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/auctions`);
    auctions.value = res.data.data;
  } catch (err) {
    console.error('Error loading auctions for calendar:', err);
  } finally {
    loading.value = false;
  }
};

const calendarCells = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const cells = [];
  
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, date: null });
  }
  
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    cells.push({
      day: d,
      date: date,
      isToday: date.toDateString() === new Date().toDateString(),
      isSelected: date.toDateString() === selectedDate.value.toDateString()
    });
  }
  
  return cells;
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDay = (cell) => {
  if (cell.date) {
    selectedDate.value = cell.date;
  }
};

const getEventsForDay = (date) => {
  if (!date) return { starts: [], ends: [] };
  const dStr = date.toDateString();
  
  const starts = auctions.value.filter(a => new Date(a.startTime).toDateString() === dStr);
  const ends = auctions.value.filter(a => new Date(a.endTime).toDateString() === dStr);
  
  return { starts, ends };
};

const selectedDateEvents = computed(() => {
  const { starts, ends } = getEventsForDay(selectedDate.value);
  return {
    starts,
    ends,
    total: starts.length + ends.length
  };
});

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

onMounted(() => {
  fetchAuctions();
});
</script>

<style scoped>
.calendar-page-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-light);
}

.calendar-layout-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 992px) {
  .calendar-layout-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Calendário Mensal ─── */
.calendar-card {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-nav-btn {
  background: #f3f4f6;
  border: none;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.month-nav-btn:hover {
  background-color: #e5e7eb;
  transform: scale(1.05);
}

.month-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: capitalize;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #fff;
}

.day-cell:not(.empty):hover {
  border-color: #1a56db;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.08);
}

.day-cell.empty {
  background-color: transparent;
  border-color: transparent;
  cursor: default;
  pointer-events: none;
}

.day-cell.today {
  border-color: #1a56db;
  background-color: rgba(26, 86, 219, 0.03);
}

.day-cell.today .day-number {
  color: #1a56db;
  font-weight: 700;
}

.day-cell.selected {
  background-color: #1a56db;
  border-color: #1a56db;
  color: white !important;
  box-shadow: 0 4px 14px rgba(26, 86, 219, 0.3);
}

.day-cell.selected .day-number {
  color: white;
  font-weight: 700;
}

.day-number {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.dot-indicators {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  position: absolute;
  bottom: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-start {
  background-color: #10b981;
}

.dot-end {
  background-color: #ef4444;
}

.inline-dot {
  width: 8px;
  height: 8px;
  margin-right: 6px;
  transform: translateY(-1px);
}

.legend-row {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
}

/* ─── Painel de Eventos do Dia ─── */
.events-panel {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.panel-icon {
  font-size: 2rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.panel-subtitle {
  font-size: 0.85rem;
  color: var(--text-light);
  text-transform: capitalize;
}

.events-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: var(--text-light);
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #1a56db;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-panel {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-panel h4 {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.empty-panel p {
  font-size: 0.85rem;
  line-height: 1.5;
  max-width: 320px;
}

.events-lists {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 4px;
  border-bottom: 2px solid;
}

.starts-title {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.ends-title {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.event-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item-card {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.event-item-card:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.event-item-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #eee;
  flex-shrink: 0;
}

.event-item-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  min-width: 0;
}

.event-item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item-cat {
  font-size: 0.75rem;
  color: var(--text-light);
}

.event-item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 4px;
  flex-wrap: wrap;
  gap: 4px;
}

.event-item-price strong {
  color: var(--text-primary);
}

.event-item-time {
  color: var(--text-light);
}
</style>
