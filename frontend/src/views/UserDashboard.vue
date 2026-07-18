<template>
  <div class="dashboard-container">
    <div class="container animate-fade-in" style="padding-top: 100px; padding-bottom: 80px;">

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-container" @click="triggerPhotoUpload" title="Clique para alterar a foto de perfil">
          <img v-if="authStore.user?.profilePhoto" :src="authStore.user.profilePhoto" alt="Foto de Perfil" class="profile-avatar-img" />
          <div v-else class="profile-avatar">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</div>
          
          <div class="avatar-overlay">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div v-if="photoLoading" class="avatar-spinner-wrap">
            <div class="spinner-sm"></div>
          </div>
          <input type="file" ref="photoInput" style="display: none" accept="image/*" @change="handlePhotoUpload" />
        </div>

        <div class="profile-info">
          <h2 class="page-title" style="margin-bottom: 0.25rem; font-size: 1.75rem;">{{ authStore.user?.name }}</h2>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <p v-if="authStore.user?.phone" class="profile-phone">📞 {{ authStore.user.phone }}</p>
          <p v-if="authStore.user?.bio" class="profile-bio">“{{ authStore.user.bio }}”</p>
          <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span class="status-badge" :class="authStore.user?.status">
              {{ authStore.user?.status === 'active' ? 'Activo' : 'Bloqueado' }}
            </span>
            <span class="status-badge role-badge">
              {{ authStore.user?.role === 'admin' ? 'Administrador' : 'Cliente' }}
            </span>
            <span v-if="authStore.user?.province" class="status-badge province-badge">📍 {{ authStore.user.province }}</span>
            <span v-if="authStore.user?.gender" class="status-badge gender-badge">{{ authStore.user.gender === 'Masculino' ? '♂' : authStore.user.gender === 'Feminino' ? '♀' : '⚥' }} {{ authStore.user.gender }}</span>
            <span v-if="authStore.user?.age" class="status-badge age-badge">🎂 {{ authStore.user.age }} anos</span>
          </div>
        </div>
        <button @click="logout" class="btn btn-logout">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'activity' }" 
          @click="activeTab = 'activity'"
        >
          🏷️ Actividade & Lances
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'watchlist' }" 
          @click="changeTab('watchlist')"
        >
          ❤️ Favoritos (Watchlist)
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'proposals' }" 
          @click="changeTab('proposals')"
        >
          📦 Minhas Vendas
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'chat' }" 
          @click="activeTab = 'chat'"
        >
          💬 Mensagens
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'edit-profile' }" 
          @click="activeTab = 'edit-profile'"
        >
          ⚙️ Editar Perfil
        </button>
      </div>

      <!-- TAB Content: Activity -->
      <div v-if="activeTab === 'activity'">
        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ bids.length }}</span>
            <span class="stat-label">Lances Dados</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ uniqueAuctions }}</span>
            <span class="stat-label">Leilões Activos</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ formatCurrencyCompact(totalBid) }}</span>
            <span class="stat-label">Total Licitado</span>
          </div>
        </div>

        <!-- Bid History -->
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Histórico de Lances</h3>
            <router-link v-if="bids.length > 0" to="/auctions" class="btn btn-primary btn-pill btn-sm">
              Explorar Mais
            </router-link>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar lances...</p>
          </div>

          <div v-else-if="bids.length === 0" class="empty-state">
            <div class="empty-icon">🏷️</div>
            <h4>Ainda não fez nenhum lance</h4>
            <p>Explore os leilões activos e faça o seu primeiro lance!</p>
            <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Ver Leilões Activos
            </router-link>
          </div>

          <ul v-else class="bid-list">
            <li v-for="bid in bids" :key="bid._id" class="bid-item">
              <div class="bid-img-wrap" v-if="bid.auction?.imageUrl">
                <img :src="bid.auction.imageUrl" :alt="bid.auction.title" class="bid-img" />
              </div>
              <div class="bid-img-wrap placeholder-img" v-else>🏷️</div>

              <div class="bid-details">
                <strong class="bid-auction-title">{{ bid.auction?.title || 'Leilão Removido' }}</strong>
                <span class="bid-date">{{ new Date(bid.createdAt).toLocaleString('pt-MZ') }}</span>
              </div>

              <div class="bid-right">
                <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
                <router-link
                  v-if="bid.auction"
                  :to="`/auction/${bid.auction._id}`"
                  class="btn btn-secondary btn-sm btn-pill"
                >Ver</router-link>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB Content: Watchlist -->
      <div v-else-if="activeTab === 'watchlist'">
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Os Meus Favoritos</h3>
          </div>

          <div v-if="loadingWatchlist" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar favoritos...</p>
          </div>

          <div v-else-if="watchlist.length === 0" class="empty-state">
            <div class="empty-icon">❤️</div>
            <h4>Sem leilões nos favoritos</h4>
            <p>Clique no coração dos leilões que deseja acompanhar para os ver aqui!</p>
            <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Explorar Leilões
            </router-link>
          </div>

          <ul v-else class="bid-list">
            <li v-for="item in watchlist" :key="item._id" class="bid-item">
              <div class="bid-img-wrap" v-if="item.imageUrl">
                <img :src="item.imageUrl" :alt="item.title" class="bid-img" />
              </div>
              
              <div class="bid-details">
                <strong class="bid-auction-title">{{ item.title }}</strong>
                <span class="bid-date">
                  Estado: 
                  <strong :style="{ color: item.status === 'active' ? '#10b981' : (item.status === 'upcoming' ? '#f57c00' : '#6b7280') }">
                    {{ item.status === 'active' ? 'Activo' : (item.status === 'upcoming' ? 'Agendado' : 'Terminado') }}
                  </strong>
                </span>
              </div>

              <div class="bid-right">
                <span class="bid-amount">{{ formatCurrency(item.currentPrice) }}</span>
                <div style="display: flex; gap: 0.25rem;">
                  <router-link :to="`/auction/${item._id}`" class="btn btn-primary btn-sm btn-pill">
                    Licitar
                  </router-link>
                  <button @click="removeFromWatchlist(item._id)" class="btn btn-logout" style="padding: 0.25rem 0.5rem; border-radius: 50%;">
                    ✕
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB Content: Proposals -->
      <div v-else-if="activeTab === 'proposals'">
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Minhas Propostas de Venda</h3>
            <router-link to="/vender" class="btn btn-primary btn-pill btn-sm">
              + Nova Proposta
            </router-link>
          </div>

          <div v-if="loadingProposals" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar propostas...</p>
          </div>

          <div v-else-if="proposals.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h4>Nenhuma proposta enviada</h4>
            <p>Tem artigos ou viaturas que gostaria de leiloar? Envie-nos já uma proposta!</p>
            <router-link to="/vender" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Vender Connosco
            </router-link>
          </div>

          <div v-else class="table-responsive">
            <table class="proposal-table">
              <thead>
                <tr>
                  <th>Artigo</th>
                  <th>Categoria</th>
                  <th>Valor Estimado</th>
                  <th>Estado</th>
                  <th>Data</th>
                  <th>Notas Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prop in proposals" :key="prop._id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img v-if="prop.images && prop.images[0]" :src="prop.images[0]" class="prop-table-img" />
                      <div class="prop-table-title-wrap">
                        <span class="prop-table-title">{{ prop.title }}</span>
                        <span class="prop-table-condition">{{ prop.condition }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ prop.category }}</td>
                  <td><strong>{{ formatCurrency(prop.estimatedValue) }}</strong></td>
                  <td>
                    <span class="status-badge" :class="prop.status">
                      {{ prop.status === 'pending' ? 'Pendente' : (prop.status === 'approved' ? 'Aprovado' : 'Rejeitado') }}
                    </span>
                  </td>
                  <td>{{ new Date(prop.createdAt).toLocaleDateString('pt-MZ') }}</td>
                  <td class="admin-notes-cell">{{ prop.adminNotes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB Content: Edit Profile -->
      <div v-else-if="activeTab === 'edit-profile'" class="edit-profile-layout">
        <!-- Profile Info Form -->
        <div class="card edit-card">
          <h3 class="edit-title">📋 Informações Pessoais</h3>
          
          <form @submit.prevent="handleUpdateProfile" class="edit-form">
            <div class="form-group">
              <label class="form-label" for="edit-name">Nome Completo</label>
              <input type="text" id="edit-name" v-model="profileForm.name" class="form-input" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-email">Endereço de Email</label>
              <input type="email" id="edit-email" v-model="profileForm.email" class="form-input" required />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="edit-province">Província</label>
                <select id="edit-province" v-model="profileForm.province" class="form-input">
                  <option value="">— Selecionar Província —</option>
                  <option>Maputo Cidade</option>
                  <option>Maputo Província</option>
                  <option>Gaza</option>
                  <option>Inhambane</option>
                  <option>Sofala</option>
                  <option>Manica</option>
                  <option>Tete</option>
                  <option>Zambézia</option>
                  <option>Nampula</option>
                  <option>Cabo Delgado</option>
                  <option>Niassa</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-gender">Sexo</label>
                <select id="edit-gender" v-model="profileForm.gender" class="form-input">
                  <option value="">— Selecionar Sexo —</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-age">Idade</label>
                <input type="number" id="edit-age" v-model.number="profileForm.age" class="form-input" min="16" max="120" placeholder="Ex: 30" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-phone">Contacto Telefónico</label>
              <input type="text" id="edit-phone" v-model="profileForm.phone" class="form-input" placeholder="Ex: +258 84 123 4567" />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-bio">Biografia / Nota</label>
              <textarea id="edit-bio" v-model="profileForm.bio" class="form-input" rows="3" placeholder="Escreva algo sobre si (máx. 200 caracteres)..." maxlength="200"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="updatingProfile">
              <span v-if="updatingProfile" class="btn-spinner"></span>
              {{ updatingProfile ? 'A guardar...' : 'Guardar Alterações' }}
            </button>
          </form>
        </div>

        <!-- Security Form -->
        <div class="card edit-card">
          <h3 class="edit-title">🔒 Segurança & Palavra-passe</h3>
          
          <form @submit.prevent="handleUpdatePassword" class="edit-form">
            <div class="form-group">
              <label class="form-label" for="edit-curr-pass">Palavra-passe Actual</label>
              <input type="password" id="edit-curr-pass" v-model="securityForm.currentPassword" class="form-input" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-new-pass">Nova Palavra-passe</label>
              <input type="password" id="edit-new-pass" v-model="securityForm.newPassword" class="form-input" minlength="6" placeholder="Mínimo 6 caracteres" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-conf-pass">Confirmar Nova Palavra-passe</label>
              <input type="password" id="edit-conf-pass" v-model="securityForm.confirmPassword" class="form-input" minlength="6" required />
            </div>
            
            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="updatingSecurity">
              <span v-if="updatingSecurity" class="btn-spinner"></span>
              {{ updatingSecurity ? 'A alterar...' : 'Actualizar Palavra-passe' }}
            </button>
          </form>
        </div>
      </div>

      <!-- TAB Content: Chat -->
      <div v-else-if="activeTab === 'chat'">
        <Chat />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToastStore } from '../stores/toastStore';
import Chat from '../components/Chat.vue';

const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const bids = ref([]);
const loading = ref(true);
const activeTab = ref('activity');

const watchlist = ref([]);
const loadingWatchlist = ref(false);
const proposals = ref([]);
const loadingProposals = ref(false);

const changeTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'watchlist') {
    fetchWatchlist();
  } else if (tab === 'proposals') {
    fetchMyProposals();
  }
};

const fetchWatchlist = async () => {
  loadingWatchlist.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/users/watchlist`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    watchlist.value = res.data.data;
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    toastStore.error('Erro ao carregar favoritos.');
  } finally {
    loadingWatchlist.value = false;
  }
};

const removeFromWatchlist = async (auctionId) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/users/watchlist/${auctionId}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success) {
      toastStore.success('Removido dos favoritos. ✓');
      fetchWatchlist();
    }
  } catch (err) {
    console.error('Failed to remove from watchlist:', err);
    toastStore.error('Erro ao remover dos favoritos.');
  }
};

const fetchMyProposals = async () => {
  loadingProposals.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/proposals/myproposals`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    proposals.value = res.data.data;
  } catch (err) {
    console.error('Error fetching proposals:', err);
    toastStore.error('Erro ao carregar propostas.');
  } finally {
    loadingProposals.value = false;
  }
};

// Edit Forms State
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  bio: '',
  province: '',
  gender: '',
  age: null
});

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const updatingProfile = ref(false);
const updatingSecurity = ref(false);
const photoLoading = ref(false);

const photoInput = ref(null);

// Populate fields when user details load
watch(() => authStore.user, (newVal) => {
  if (newVal) {
    profileForm.value = {
      name: newVal.name || '',
      email: newVal.email || '',
      phone: newVal.phone || '',
      bio: newVal.bio || '',
      province: newVal.province || '',
      gender: newVal.gender || '',
      age: newVal.age || null
    };
  }
}, { immediate: true });

const uniqueAuctions = computed(() => {
  const ids = new Set(bids.value.map(b => b.auction?._id).filter(Boolean));
  return ids.size;
});

const totalBid = computed(() => {
  return bids.value.reduce((sum, b) => sum + (b.amount || 0), 0);
});

const fetchMyBids = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/bids/mybids`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    bids.value = res.data.data;
  } catch (err) {
    console.error('Error fetching bids:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { 
  fetchMyBids(); 
});

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

const formatCurrencyCompact = (value) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M MZN';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { maximumFractionDigits: 0 }).format(value);
  return `${formatted} MZN`;
};

const logout = () => {
  authStore.logout();
  toastStore.success('Sessão terminada com sucesso! ✓');
  router.push('/');
};

// Update profile logic
const handleUpdateProfile = async () => {
  updatingProfile.value = true;
  
  try {
    const res = await authStore.updateProfile({
      name: profileForm.value.name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      bio: profileForm.value.bio,
      province: profileForm.value.province || null,
      gender: profileForm.value.gender || null,
      age: profileForm.value.age || null
    });
    
    if (res.success) {
      toastStore.success('Perfil actualizado com sucesso! ✓');
    } else {
      toastStore.error(res.error || 'Erro ao actualizar o perfil.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro no servidor.');
  } finally {
    updatingProfile.value = false;
  }
};

// Update password logic
const handleUpdatePassword = async () => {
  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    toastStore.error('As palavras-passe novas não coincidem.');
    return;
  }
  
  updatingSecurity.value = true;
  
  try {
    const res = await authStore.updateProfile({
      currentPassword: securityForm.value.currentPassword,
      newPassword: securityForm.value.newPassword
    });
    
    if (res.success) {
      toastStore.success('Palavra-passe alterada com sucesso! ✓');
      securityForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } else {
      toastStore.error(res.error || 'Erro ao alterar a palavra-passe.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro no servidor.');
  } finally {
    updatingSecurity.value = false;
  }
};

const triggerPhotoUpload = () => {
  photoInput.value.click();
};

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toastStore.error('Por favor seleccione um ficheiro de imagem válido.');
    return;
  }
  
  const formData = new FormData();
  formData.append('photo', file);
  
  photoLoading.value = true;
  
  try {
    const res = await authStore.uploadProfilePhoto(formData);
    if (res.success) {
      toastStore.success('Fotografia de perfil actualizada com sucesso! ✓');
    } else {
      toastStore.error(res.error || 'Erro ao carregar a imagem.');
    }
  } catch (err) {
    toastStore.error('Erro ao carregar a imagem no servidor.');
  } finally {
    photoLoading.value = false;
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* ── Profile Header ── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.avatar-container {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  border: 3px solid white;
  outline: 2px solid #e2e8f0;
  transition: transform 0.2s ease, outline-color 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.02);
  outline-color: var(--btn-primary-bg);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--btn-primary-bg), #7b5ea7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 700;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-spinner-wrap {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.profile-info {
  flex-grow: 1;
}

.profile-email {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.profile-phone {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.profile-bio {
  font-size: 0.875rem;
  color: var(--text-light);
  font-style: italic;
  margin-top: 0.5rem;
  max-width: 500px;
  line-height: 1.4;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.blocked {
  background-color: #fdecea;
  color: #c62828;
}

.role-badge {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: #fdecea;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* ── Navigation Tabs ── */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--btn-primary-bg);
  border-bottom-color: var(--btn-primary-bg);
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.stat-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  color: var(--btn-primary-bg);
  line-height: 1;
  margin-bottom: 0.4rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ── Bids Card ── */
.bids-card {
  padding: 1.75rem;
  border-radius: 12px;
}

.bids-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ── Loading / Spinners ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-light);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
}

/* ── Bid List ── */
.bid-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bid-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.bid-item:hover {
  background-color: #fafafa;
}

.bid-img-wrap {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.bid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.bid-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.bid-auction-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bid-date {
  font-size: 0.75rem;
  color: var(--text-light);
}

.bid-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.bid-amount {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--btn-primary-bg);
  white-space: nowrap;
}

.btn-sm {
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
}

/* ── Edit Profile Tab Layout ── */
.edit-profile-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.edit-card {
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.edit-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
}

/* 3-column row for province / gender / age */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

/* make select look like the other inputs */
.form-input select,
select.form-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 2rem;
  cursor: pointer;
}

/* Province / gender / age badge colours */
.province-badge { background-color: #e8f4fd; color: #1565c0; }
.gender-badge   { background-color: #f3e8fd; color: #6a1b9a; }
.age-badge      { background-color: #fff8e1; color: #e65100; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}


.submit-btn {
  margin-top: 1rem;
  font-weight: 600;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Alerts inside form */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.error-alert {
  background-color: #fdecea;
  color: #c62828;
  border: 1px solid #fcdad7;
}

.success-alert {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #d4edda;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Mobile Responsive ── */
@media (max-width: 768px) {
  .edit-profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.25rem;
  }

  .profile-bio {
    margin-left: auto;
    margin-right: auto;
  }

  .btn-logout {
    width: 100%;
    justify-content: center;
  }

  .tabs-nav {
    justify-content: center;
  }

  .tab-btn {
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }

  .stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem 0.25rem;
  }

  .bids-card {
    padding: 1.25rem;
  }

  .bid-item {
    flex-wrap: wrap;
  }

  .bid-right {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    margin-top: 0.5rem;
    margin-left: 68px;
  }
}

@media (max-width: 500px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-row .stat-card:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 380px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .stats-row .stat-card:last-child {
    grid-column: auto;
  }
}

/* ── Proposal Table ── */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.proposal-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.proposal-table th,
.proposal-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.88rem;
}

.proposal-table th {
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  background-color: #fafafa;
}

.prop-table-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.prop-table-title-wrap {
  display: flex;
  flex-direction: column;
}

.prop-table-title {
  font-weight: 600;
  color: var(--text-primary);
}

.prop-table-condition {
  font-size: 0.75rem;
  color: var(--text-light);
}

.admin-notes-cell {
  color: var(--text-secondary);
  font-style: italic;
  max-width: 250px;
  white-space: normal;
  word-break: break-word;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #b78103;
}

.status-badge.approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background-color: #ffebee;
  color: #c62828;
}
</style>
