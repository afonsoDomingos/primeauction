<template>
  <div class="auctions-container">
    <div class="container animate-fade-in" style="padding-top: 105px; padding-bottom: 60px;">
      <div class="page-header">
        <h2 class="page-title">
          {{ route.query.search ? `Resultados para: "${route.query.search}"` : 'Leilões Activos' }}
        </h2>
        <p class="page-subtitle">Encontre os melhores leilões e faça o seu lance agora</p>
        
        <!-- Filtros Activos -->
        <div v-if="route.query.search || route.query.status || route.query.category || route.query.location || hasVehicleFilters" class="active-filters">
          <span v-if="route.query.search" class="filter-badge">
            Pesquisa: <strong>{{ route.query.search }}</strong>
            <button @click="clearSearch" class="clear-btn" title="Limpar pesquisa">&times;</button>
          </span>
          <span v-if="route.query.status" class="filter-badge">
            Estado: <strong>{{ route.query.status === 'active' ? 'Ativo' : 'Terminado' }}</strong>
            <button @click="clearStatus" class="clear-btn" title="Limpar estado">&times;</button>
          </span>
          <span v-if="route.query.category" class="filter-badge">
            Categoria: <strong>{{ route.query.category }}</strong>
            <button @click="clearCategory" class="clear-btn" title="Limpar categoria">&times;</button>
          </span>
          <span v-if="route.query.location" class="filter-badge">
            Província: <strong>{{ route.query.location }}</strong>
            <button @click="clearLocation" class="clear-btn" title="Limpar província">&times;</button>
          </span>
          <span v-if="route.query.make" class="filter-badge">
            Marca: <strong>{{ route.query.make }}</strong>
            <button @click="clearVehicleFilter('make')" class="clear-btn" title="Limpar marca">&times;</button>
          </span>
          <span v-if="route.query.model" class="filter-badge">
            Modelo: <strong>{{ route.query.model }}</strong>
            <button @click="clearVehicleFilter('model')" class="clear-btn" title="Limpar modelo">&times;</button>
          </span>
          <span v-if="route.query.year" class="filter-badge">
            Ano: <strong>{{ route.query.year }}</strong>
            <button @click="clearVehicleFilter('year')" class="clear-btn" title="Limpar ano">&times;</button>
          </span>
          <span v-if="route.query.fuelType" class="filter-badge">
            Combustível: <strong>{{ route.query.fuelType }}</strong>
            <button @click="clearVehicleFilter('fuelType')" class="clear-btn" title="Limpar combustível">&times;</button>
          </span>
          <span v-if="route.query.transmission" class="filter-badge">
            Câmbio: <strong>{{ route.query.transmission }}</strong>
            <button @click="clearVehicleFilter('transmission')" class="clear-btn" title="Limpar câmbio">&times;</button>
          </span>
          <span v-if="route.query.bodyType" class="filter-badge">
            Tipo: <strong>{{ route.query.bodyType }}</strong>
            <button @click="clearVehicleFilter('bodyType')" class="clear-btn" title="Limpar tipo">&times;</button>
          </span>
          <span v-if="route.query.condition" class="filter-badge">
            Estado: <strong>{{ route.query.condition }}</strong>
            <button @click="clearVehicleFilter('condition')" class="clear-btn" title="Limpar estado">&times;</button>
          </span>
          <span v-if="route.query.conditionLevel" class="filter-badge">
            Nível: <strong>{{ getConditionLevelLabel(route.query.conditionLevel) }}</strong>
            <button @click="clearVehicleFilter('conditionLevel')" class="clear-btn" title="Limpar nível">&times;</button>
          </span>
          <span v-if="route.query.maxMileage" class="filter-badge">
            Quilometragem: <strong>{{ parseInt(route.query.maxMileage).toLocaleString('pt-MZ') }} km</strong>
            <button @click="clearVehicleFilter('maxMileage')" class="clear-btn" title="Limpar quilometragem">&times;</button>
          </span>
        </div>
      </div>

      <!-- Filters Bar (Category Chips & Location Select) -->
      <div class="filters-wrapper">
        <div class="categories-bar">
          <button
            @click="selectCategory('')"
            class="category-chip"
            :class="{ active: !route.query.category }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Todos</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            @click="selectCategory(cat.name)"
            class="category-chip"
            :class="{ active: route.query.category === cat.name }"
          >
            <span v-html="getCategoryIcon(getCategoryEmoji(cat.name))"></span>
            <span>{{ cat.name }}</span>
          </button>
        </div>

        <div class="location-filter-box">
          <svg xmlns="http://www.w3.org/2000/svg" class="location-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select :value="route.query.location || ''" @change="onLocationChange" class="location-select">
            <option value="">Todas as Províncias</option>
            <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
          </select>
        </div>
      </div>

      <!-- Vehicle Filters (shown only for automotive category) -->
      <div v-if="isAutomotiveCategory" class="vehicle-filters-section">
        <div class="vehicle-filters-header">
          <h4 class="vehicle-filters-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="vehicle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 19V9a7 7 0 0114 0v10" />
            </svg>
            Filtros de Veículo
          </h4>
          <button @click="clearVehicleFilters" class="clear-vehicle-filters" v-if="hasVehicleFilters">
            Limpar Filtros
          </button>
        </div>
        
        <div class="vehicle-filters-grid">
          <!-- Make Filter -->
          <div class="filter-item">
            <label class="filter-label">Marca</label>
            <select v-model="vehicleFilters.make" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todas</option>
              <option v-for="make in availableMakes" :key="make.name" :value="make.name">
                {{ make.name }}
              </option>
            </select>
          </div>

          <!-- Model Filter -->
          <div class="filter-item">
            <label class="filter-label">Modelo</label>
            <select v-model="vehicleFilters.model" @change="applyVehicleFilters" class="filter-select" :disabled="!vehicleFilters.make">
              <option value="">Todos</option>
              <option v-for="model in availableModels" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>

          <!-- Year Filter -->
          <div class="filter-item">
            <label class="filter-label">Ano</label>
            <select v-model="vehicleFilters.year" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option v-for="year in vehicleYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <!-- Fuel Type Filter -->
          <div class="filter-item">
            <label class="filter-label">Combustível</label>
            <select v-model="vehicleFilters.fuelType" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Elétrico">Elétrico</option>
              <option value="GPL">GPL</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <!-- Transmission Filter -->
          <div class="filter-item">
            <label class="filter-label">Câmbio</label>
            <select v-model="vehicleFilters.transmission" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="Manual">Manual</option>
              <option value="Automático">Automático</option>
              <option value="CVT">CVT</option>
              <option value="DSG">DSG</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <!-- Body Type Filter -->
          <div class="filter-item">
            <label class="filter-label">Tipo</label>
            <select v-model="vehicleFilters.bodyType" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="SUV">SUV</option>
              <option value="Coupé">Coupé</option>
              <option value="Van">Van</option>
              <option value="Pickup">Pickup</option>
              <option value="Carrinha">Carrinha</option>
              <option value="Motociclo">Motociclo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <!-- Condition Filter -->
          <div class="filter-item">
            <label class="filter-label">Estado</label>
            <select v-model="vehicleFilters.condition" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="Novo">Novo</option>
              <option value="Seminovo">Seminovo</option>
              <option value="Usado">Usado</option>
              <option value="Reformado">Reformado</option>
              <option value="Para Peças">Para Peças</option>
            </select>
          </div>

          <!-- Condition Level Filter -->
          <div class="filter-item">
            <label class="filter-label">Nível</label>
            <select v-model="vehicleFilters.conditionLevel" @change="applyVehicleFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="1">⭐⭐⭐⭐ Excelente</option>
              <option value="2">⭐⭐⭐ Bom</option>
              <option value="3">⭐⭐ Regular</option>
              <option value="4">⭐ Para Peças</option>
            </select>
          </div>

          <!-- Mileage Range Filter -->
          <div class="filter-item">
            <label class="filter-label">Quilometragem Máx. (km)</label>
            <input 
              type="number" 
              v-model="vehicleFilters.maxMileage" 
              @input="debounceVehicleFilters"
              class="filter-input"
              placeholder="Ex: 50000"
            />
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card"></div>
      </div>
      <div v-else-if="auctions.length === 0" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h3>Nenhum leilão disponível</h3>
        <p>De momento não existem leilões activos. Volte mais tarde.</p>
      </div>
      <div v-else class="auction-grid">
        <div
          v-for="auction in auctions"
          :key="auction.id"
          class="card auction-card"
          @click="goToAuction(auction._id)"
        >
          <div class="card-img-wrapper">
            <img :src="auction.imageUrl" :alt="auction.title" class="card-img" loading="lazy" />
            <div class="card-status" :class="auction.status">
              {{ auction.status === 'active' ? 'Activo' : (auction.status === 'upcoming' ? 'Agendado' : 'Terminado') }}
            </div>
            <div class="card-location-tag">
              📍 {{ auction.location || 'Maputo' }}
            </div>
          </div>
          <div class="card-content">
            <h3 class="auction-title">{{ auction.title }}</h3>
            <p class="auction-description">{{ auction.description?.slice(0, 80) }}{{ auction.description?.length > 80 ? '…' : '' }}</p>
            <div class="card-footer">
              <div class="price-col">
                <span class="price-label">{{ auction.status === 'upcoming' ? 'Preço inicial' : 'Lance actual' }}</span>
                <span class="price-value">{{ formatCurrency(auction.status === 'upcoming' ? auction.startingPrice : auction.currentPrice) }}</span>
              </div>
              <div class="time-col">
                <span class="price-label">{{ auction.status === 'upcoming' ? 'Começa em' : (auction.status === 'active' ? 'Termina em' : 'Terminado') }}</span>
                <span class="time-value" :style="{ color: auction.status === 'active' ? '#ef4444' : '#6b7280', fontWeight: '600' }">
                  {{ auction.status === 'finished' ? 'Terminado' : getCountdownText(auction.status === 'upcoming' ? auction.startTime : auction.endTime) }}
                </span>
              </div>
            </div>
            <div class="card-cta">
              <span class="cta-text">Ver Leilão →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const auctions = ref([]);
const categories = ref([]);
const loading = ref(true);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Vehicle filters state
const vehicleFilters = ref({
  make: '',
  model: '',
  year: '',
  fuelType: '',
  transmission: '',
  bodyType: '',
  condition: '',
  conditionLevel: '',
  maxMileage: ''
});

let vehicleFilterTimeout = null;

const fetchCategories = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/categories`);
    categories.value = res.data.data;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

const fetchAuctions = async () => {
  loading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const searchVal = route.query.search || '';
    const statusVal = route.query.status || '';
    const categoryVal = route.query.category || '';
    const locationVal = route.query.location || '';
    
    // Vehicle filters
    const makeVal = route.query.make || '';
    const modelVal = route.query.model || '';
    const yearVal = route.query.year || '';
    const yearMaxVal = route.query.yearMax || '';
    const minPriceVal = route.query.minPrice || '';
    const maxPriceVal = route.query.maxPrice || '';
    const fuelTypeVal = route.query.fuelType || '';
    const transmissionVal = route.query.transmission || '';
    const bodyTypeVal = route.query.bodyType || '';
    const conditionVal = route.query.condition || '';
    const maxMileageVal = route.query.maxMileage || '';
    
    let url = `${apiUrl}/api/auctions`;
    const params = [];
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    if (statusVal) params.push(`status=${encodeURIComponent(statusVal)}`);
    if (categoryVal) params.push(`category=${encodeURIComponent(categoryVal)}`);
    if (locationVal) params.push(`location=${encodeURIComponent(locationVal)}`);
    if (makeVal) params.push(`make=${encodeURIComponent(makeVal)}`);
    if (modelVal) params.push(`model=${encodeURIComponent(modelVal)}`);
    if (yearVal) params.push(`year=${encodeURIComponent(yearVal)}`);
    if (yearMaxVal) params.push(`yearMax=${encodeURIComponent(yearMaxVal)}`);
    if (minPriceVal) params.push(`minPrice=${encodeURIComponent(minPriceVal)}`);
    if (maxPriceVal) params.push(`maxPrice=${encodeURIComponent(maxPriceVal)}`);
    if (fuelTypeVal) params.push(`fuelType=${encodeURIComponent(fuelTypeVal)}`);
    if (transmissionVal) params.push(`transmission=${encodeURIComponent(transmissionVal)}`);
    if (bodyTypeVal) params.push(`bodyType=${encodeURIComponent(bodyTypeVal)}`);
    if (conditionVal) params.push(`condition=${encodeURIComponent(conditionVal)}`);
    if (maxMileageVal) params.push(`maxMileage=${encodeURIComponent(maxMileageVal)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    // Pass authentication token so backend can determine if user is admin
    const headers = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    console.log('[fetchAuctions] User is admin:', authStore.isAdmin);
    console.log('[fetchAuctions] Request URL:', url);
    console.log('[fetchAuctions] Has token:', !!authStore.token);

    const res = await axios.get(url, { headers });
    auctions.value = res.data.data;
    
    // Double-check filtering on frontend for non-admin users
    if (!authStore.isAdmin) {
      const filteredAuctions = auctions.value.filter(auction => 
        auction.status !== 'finished' && auction.status !== 'ended'
      );
      console.log('[fetchAuctions] Frontend filter applied:', auctions.value.length, '->', filteredAuctions.length);
      auctions.value = filteredAuctions;
    }
    
    console.log('[fetchAuctions] Final auctions count:', auctions.value.length);
    console.log('[fetchAuctions] Auctions statuses:', auctions.value.map(a => a.status));
  } catch (err) {
    console.error('[fetchAuctions] Error:', err);
  } finally {
    loading.value = false;
  }
};

const selectCategory = (catName) => {
  const query = { ...route.query };
  if (catName) {
    query.category = catName;
  } else {
    delete query.category;
  }
  router.push({ path: '/auctions', query });
};

const clearSearch = () => {
  const query = { ...route.query };
  delete query.search;
  router.push({ path: '/auctions', query });
};

const clearStatus = () => {
  const query = { ...route.query };
  delete query.status;
  router.push({ path: '/auctions', query });
};

const clearCategory = () => {
  selectCategory('');
};

const provinces = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala (Beira)',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado (Pemba)'
];

const onLocationChange = (event) => {
  const loc = event.target.value;
  const query = { ...route.query };
  if (loc) {
    query.location = loc;
  } else {
    delete query.location;
  }
  router.push({ path: '/auctions', query });
};

const clearLocation = () => {
  const query = { ...route.query };
  delete query.location;
  router.push({ path: '/auctions', query });
};

const goToAuction = (id) => {
  router.push(`/auction/${id}`);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

// --- Countdown timer logic ---
const now = ref(new Date());
let countdownInterval = null;

const getCountdownText = (targetDateString) => {
  if (!targetDateString) return '';
  const diff = new Date(targetDateString).getTime() - now.value.getTime();
  if (diff <= 0) return 'Terminado';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

const getCategoryEmoji = (name) => {
  const norm = name.toLowerCase();
  if (norm.includes('veiculo') || norm.includes('carro') || norm.includes('moto') || norm.includes('automovel')) return 'car';
  if (norm.includes('imovel') || norm.includes('casa') || norm.includes('apartamento') || norm.includes('equipamento')) return 'home';
  if (norm.includes('eletronica') || norm.includes('tecnologia') || norm.includes('computador') || norm.includes('telemovel')) return 'electronics';
  if (norm.includes('mobiliario') || norm.includes('decoracao') || norm.includes('moveis')) return 'furniture';
  if (norm.includes('maquinaria') || norm.includes('industrial') || norm.includes('fabrica')) return 'industry';
  if (norm.includes('outro') || norm.includes('geral') || norm.includes('bens')) return 'package';
  return 'tag';
};

const getCategoryIcon = (emojiType) => {
  const icons = {
    car: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /><path stroke-linecap="round" stroke-linejoin="round" d="M5 19V9a7 7 0 0114 0v10" /></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    electronics: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
    furniture: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>',
    industry: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
    package: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>',
    tag: '<svg xmlns="http://www.w3.org/2000/svg" class="category-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>'
  };
  return icons[emojiType] || icons.tag;
};

// Vehicle filter computed properties
const isAutomotiveCategory = computed(() => {
  const selectedCategory = categories.value.find(cat => cat.name === route.query.category);
  return selectedCategory && selectedCategory.isAutomotive;
});

const availableMakes = computed(() => {
  const selectedCategory = categories.value.find(cat => cat.name === route.query.category);
  return selectedCategory && selectedCategory.makes ? selectedCategory.makes : [];
});

const availableModels = computed(() => {
  const selectedMake = availableMakes.value.find(make => make.name === vehicleFilters.value.make);
  return selectedMake ? selectedMake.popularModels : [];
});

const vehicleYears = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 1; year >= 1990; year--) {
    years.push(year);
  }
  return years;
});

const hasVehicleFilters = computed(() => {
  return Object.values(vehicleFilters.value).some(val => val !== '' && val !== null && val !== undefined);
});

// Vehicle filter functions
const applyVehicleFilters = () => {
  const query = { ...route.query };
  
  // Add vehicle filters to query
  if (vehicleFilters.value.make) query.make = vehicleFilters.value.make;
  else delete query.make;
  
  if (vehicleFilters.value.model) query.model = vehicleFilters.value.model;
  else delete query.model;
  
  if (vehicleFilters.value.year) query.year = vehicleFilters.value.year;
  else delete query.year;
  
  if (vehicleFilters.value.fuelType) query.fuelType = vehicleFilters.value.fuelType;
  else delete query.fuelType;
  
  if (vehicleFilters.value.transmission) query.transmission = vehicleFilters.value.transmission;
  else delete query.transmission;
  
  if (vehicleFilters.value.bodyType) query.bodyType = vehicleFilters.value.bodyType;
  else delete query.bodyType;
  
  if (vehicleFilters.value.condition) query.condition = vehicleFilters.value.condition;
  else delete query.condition;
  
  if (vehicleFilters.value.conditionLevel) query.conditionLevel = vehicleFilters.value.conditionLevel;
  else delete query.conditionLevel;
  
  if (vehicleFilters.value.maxMileage) query.maxMileage = vehicleFilters.value.maxMileage;
  else delete query.maxMileage;
  
  router.push({ path: '/auctions', query });
};

const debounceVehicleFilters = () => {
  if (vehicleFilterTimeout) clearTimeout(vehicleFilterTimeout);
  vehicleFilterTimeout = setTimeout(() => {
    applyVehicleFilters();
  }, 500);
};

const clearVehicleFilters = () => {
  vehicleFilters.value = {
    make: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    condition: '',
    conditionLevel: '',
    maxMileage: ''
  };
  
  const query = { ...route.query };
  delete query.make;
  delete query.model;
  delete query.year;
  delete query.fuelType;
  delete query.transmission;
  delete query.bodyType;
  delete query.condition;
  delete query.conditionLevel;
  delete query.maxMileage;
  
  router.push({ path: '/auctions', query });
};

const clearVehicleFilter = (filterKey) => {
  vehicleFilters.value[filterKey] = '';
  
  const query = { ...route.query };
  delete query[filterKey];
  
  router.push({ path: '/auctions', query });
};

const syncVehicleFiltersFromQuery = () => {
  vehicleFilters.value = {
    make: route.query.make || '',
    model: route.query.model || '',
    year: route.query.year || '',
    fuelType: route.query.fuelType || '',
    transmission: route.query.transmission || '',
    bodyType: route.query.bodyType || '',
    condition: route.query.condition || '',
    conditionLevel: route.query.conditionLevel || '',
    maxMileage: route.query.maxMileage || ''
  };
};

const getConditionLevelLabel = (level) => {
  const labels = {
    '1': 'Excelente',
    '2': 'Bom',
    '3': 'Regular',
    '4': 'Para Peças'
  };
  return labels[level] || level;
};

// Watch query parameters
watch(() => route.query.search, () => {
  fetchAuctions();
});
watch(() => route.query.status, () => {
  fetchAuctions();
});
watch(() => route.query.category, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.location, () => {
  fetchAuctions();
});
watch(() => route.query.make, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.model, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.year, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.fuelType, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.transmission, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.bodyType, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.condition, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.conditionLevel, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});
watch(() => route.query.maxMileage, () => {
  syncVehicleFiltersFromQuery();
  fetchAuctions();
});

onMounted(() => {
  fetchCategories();
  syncVehicleFiltersFromQuery();
  fetchAuctions();
  
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.auctions-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  margin-bottom: 2.5rem;
}

/* ─── Categories Bar ─── */
.categories-bar {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem 1.5rem;
  margin-bottom: 2rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.categories-bar::-webkit-scrollbar {
  display: none;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 30px;
  background-color: #ffffff;
  color: var(--text-secondary);
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.location-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  margin-right: 0.5rem;
}

.vehicle-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  margin-right: 0.5rem;
}

.category-chip:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.category-chip.active {
  background-color: #1a56db;
  color: #ffffff;
  border-color: #1a56db;
  box-shadow: 0 4px 14px rgba(26, 86, 219, 0.3);
  font-weight: 600;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--btn-secondary-bg);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #e5e7eb;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-light);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: rgba(0,0,0,0.1);
  color: var(--text-primary);
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

/* ─── Auction Grid ─── */
.auction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.auction-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auction-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

/* ─── Card Image ─── */
.card-img-wrapper {
  position: relative;
  height: 210px;
  overflow: hidden;
  background-color: #eee;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.auction-card:hover .card-img {
  transform: scale(1.05);
}

.card-status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-status.active {
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
}

.card-status.upcoming {
  background-color: rgba(255, 152, 0, 0.9);
  color: white;
}

.card-status.finished {
  background-color: rgba(0,0,0,0.5);
  color: white;
}

/* ─── Card Content ─── */
.card-content {
  padding: 1.25rem 1.5rem 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
}

.auction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.auction-description {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.55;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.price-col, .time-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-col {
  text-align: right;
}

.price-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  font-weight: 500;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--btn-primary-bg);
}

.time-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.card-cta {
  margin-top: 1rem;
}

.cta-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--btn-primary-bg);
  transition: letter-spacing 0.2s ease;
}

.auction-card:hover .cta-text {
  letter-spacing: 0.5px;
}

/* ─── Loading skeletons ─── */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 380px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Empty state ─── */
.empty-state {
  text-align: center;
  padding: 5rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9rem;
}

/* ─── Filters Wrapper & Location Select ─── */
.filters-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.categories-bar {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
  flex: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.location-filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.85rem;
  border-radius: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.location-icon {
  font-size: 1rem;
}

.location-select {
  border: none;
  background: transparent;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  padding-right: 0.5rem;
}

.card-location-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

/* ─── Mobile ─── */
@media (max-width: 580px) {
  .auction-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
  .filters-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  .location-filter-box {
    width: 100%;
    justify-content: center;
  }
  .vehicle-filters-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Vehicle Filters Section ─── */
.vehicle-filters-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.vehicle-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.vehicle-filters-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.clear-vehicle-filters {
  background: none;
  border: none;
  color: var(--btn-primary-bg);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.clear-vehicle-filters:hover {
  background: #eff6ff;
}

.vehicle-filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select,
.filter-input {
  padding: 0.6rem 0.85rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  background: #ffffff;
  transition: all 0.2s;
  outline: none;
}

.filter-select:hover,
.filter-input:hover {
  border-color: #d1d5db;
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--btn-primary-bg);
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.filter-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .vehicle-filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .vehicle-filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
