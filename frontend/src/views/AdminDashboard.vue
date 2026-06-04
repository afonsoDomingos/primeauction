<template>
  <div class="admin-container">
    <div class="container animate-fade-in" style="padding-top: 100px; padding-bottom: 80px;">
      <div class="page-header">
        <h2 class="page-title">Painel de Administração</h2>
        <p class="page-subtitle">Gerencie leilões, utilizadores e toda a plataforma</p>
      </div>

      <!-- Alert -->
      <div v-if="alertMsg" class="alert-banner" :class="alertType">
        {{ alertMsg }}
      </div>

      <div class="dashboard-grid">

        <!-- ── Criar Leilão ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">➕</span>
            <h3 class="section-title">Criar Novo Leilão</h3>
          </div>
          <form @submit.prevent="handleCreate" class="create-form">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Título</label>
                <input type="text" v-model="form.title" class="form-input" placeholder="Nome do item" required />
              </div>
              <div class="form-group half">
                <label class="form-label">Preço Inicial (MZN)</label>
                <input type="number" v-model="form.startingPrice" class="form-input" placeholder="0" min="0" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Imagens do Produto (Capa e Galeria)</label>
              <div class="image-upload-wrapper">
                <div class="upload-dropzone" @click="triggerImageUpload" title="Clique para carregar múltiplas imagens">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem; color: var(--text-light)">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Clique para carregar imagens (pode selecionar várias)</span>
                  <input type="file" ref="fileInput" multiple accept="image/*" style="display: none" @change="handleImagesUpload" />
                </div>
                
                <div v-if="uploadingImages" class="upload-progress-bar">
                  <div class="spinner-sm"></div>
                  <span>A enviar imagens para o Cloudinary...</span>
                </div>
              </div>
              
              <div style="margin-top: 0.75rem;">
                <label class="form-label-secondary" style="font-size:0.75rem; color:var(--text-light); display:block; margin-bottom:0.25rem;">Ou introduza a URL da capa manualmente:</label>
                <input type="url" v-model="form.imageUrl" class="form-input" placeholder="https://... (URL da imagem principal)" />
              </div>

              <!-- Uploaded Thumbnails list -->
              <div v-if="form.images && form.images.length > 0" class="uploaded-thumbnails-grid">
                <div 
                  v-for="(imgUrl, idx) in form.images" 
                  :key="idx" 
                  class="thumb-wrapper"
                  :class="{ 'is-cover': form.imageUrl === imgUrl }"
                >
                  <img :src="imgUrl" class="thumb-img" alt="Miniatura" />
                  <button type="button" class="btn-remove-thumb" @click="removeImage(idx)" title="Remover imagem">×</button>
                  <button type="button" class="btn-set-cover" @click="setCoverImage(imgUrl)" title="Definir como imagem de capa">
                    {{ form.imageUrl === imgUrl ? '★ Principal' : 'Definir Capa' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea v-model="form.description" class="form-input" rows="3" placeholder="Descreva o item..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Data e Hora de Fim</label>
              <input type="datetime-local" v-model="form.endTime" class="form-input" required />
            </div>

            <button type="submit" class="btn btn-primary btn-pill" :disabled="creating">
              {{ creating ? 'A criar...' : '✓ Criar Leilão' }}
            </button>
          </form>
        </div>

        <!-- ── Utilizadores ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">👥</span>
            <h3 class="section-title">Gerir Utilizadores</h3>
            <span class="record-count">{{ users.length }}</span>
          </div>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acção</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="users.length === 0">
                  <td colspan="4" class="empty-row">Nenhum utilizador encontrado.</td>
                </tr>
                <tr v-for="user in users" :key="user._id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
                      <div>
                        <span class="user-name">{{ user.name }}</span>
                        <span v-if="user.role === 'admin'" class="badge badge-admin">Admin</span>
                      </div>
                    </div>
                  </td>
                  <td class="email-cell">{{ user.email }}</td>
                  <td>
                    <span :class="['badge', user.status === 'active' ? 'badge-active' : 'badge-blocked']">
                      {{ user.status === 'active' ? 'Activo' : 'Bloqueado' }}
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="user._id !== authStore.user?.id"
                      @click="toggleBlock(user._id)"
                      :class="['btn', 'btn-sm', user.status === 'active' ? 'btn-danger' : 'btn-primary']"
                    >
                      {{ user.status === 'active' ? 'Bloquear' : 'Desbloquear' }}
                    </button>
                    <span v-else class="you-badge">Você</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Leilões ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">🏷️</span>
            <h3 class="section-title">Gerir Leilões</h3>
            <span class="record-count">{{ auctions.length }}</span>
          </div>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Lance Actual</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="auctions.length === 0">
                  <td colspan="4" class="empty-row">Nenhum leilão encontrado.</td>
                </tr>
                <tr v-for="auction in auctions" :key="auction._id">
                  <td class="auction-title-cell">{{ auction.title }}</td>
                  <td>
                    <span :class="['badge', auction.status === 'active' ? 'badge-active' : 'badge-ended']">
                      {{ auction.status === 'active' ? 'Activo' : 'Terminado' }}
                    </span>
                  </td>
                  <td class="price-cell">{{ formatCurrency(auction.currentPrice) }}</td>
                  <td>
                    <div class="action-btns">
                      <button
                        v-if="auction.status === 'active'"
                        @click="endAuction(auction._id)"
                        class="btn btn-sm btn-warning"
                      >Terminar</button>
                      <button
                        @click="deleteAuction(auction._id)"
                        class="btn btn-sm btn-danger"
                      >Apagar</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Custom Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="showConfirmModal" class="custom-modal-overlay" @click.self="closeConfirm">
        <div class="custom-modal-card animate-scale-in">
          <div class="modal-header-row">
            <span class="modal-title-icon">⚠️</span>
            <h4>{{ confirmTitle }}</h4>
          </div>
          <div class="modal-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeConfirm" class="btn btn-secondary btn-pill btn-sm">Cancelar</button>
            <button type="button" @click="executeConfirm" class="btn btn-pill btn-sm" :class="confirmBtnClass">
              {{ confirmBtnText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const users = ref([]);
const auctions = ref([]);
const creating = ref(false);
const alertMsg = ref('');
const alertType = ref('success');

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  images: [],
  startingPrice: 0,
  endTime: ''
});

const fileInput = ref(null);
const uploadingImages = ref(false);

const triggerImageUpload = () => {
  fileInput.value.click();
};

const handleImagesUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  uploadingImages.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.success) {
      const urls = res.data.imageUrls;
      form.value.images = [...form.value.images, ...urls];
      if (!form.value.imageUrl && form.value.images.length > 0) {
        form.value.imageUrl = form.value.images[0];
      }
      showAlert('Imagens carregadas com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar imagens: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    uploadingImages.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const removeImage = (index) => {
  const removedUrl = form.value.images[index];
  form.value.images.splice(index, 1);
  if (form.value.imageUrl === removedUrl) {
    form.value.imageUrl = form.value.images.length > 0 ? form.value.images[0] : '';
  }
};

const setCoverImage = (url) => {
  form.value.imageUrl = url;
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const showAlert = (msg, type = 'success') => {
  alertMsg.value = msg;
  alertType.value = type;
  setTimeout(() => { alertMsg.value = ''; }, 4000);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
};

const fetchData = async () => {
  try {
    const [usersRes, auctionsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${apiUrl}/api/auctions`)
    ]);
    users.value = usersRes.data.data;
    auctions.value = auctionsRes.data.data;
  } catch (err) {
    console.error('Error fetching admin data:', err);
  }
};

onMounted(() => { fetchData(); });

const handleCreate = async () => {
  creating.value = true;
  try {
    if (form.value.imageUrl && !form.value.images.includes(form.value.imageUrl)) {
      form.value.images.unshift(form.value.imageUrl);
    }
    
    await axios.post(`${apiUrl}/api/auctions`, form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    form.value = { title: '', description: '', imageUrl: '', images: [], startingPrice: 0, endTime: '' };
    showAlert('Leilão criado com sucesso! ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro ao criar leilão: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    creating.value = false;
  }
};

const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref(null);
const confirmBtnText = ref('Confirmar');
const confirmBtnClass = ref('btn-primary');

const openConfirm = (options) => {
  confirmTitle.value = options.title;
  confirmMessage.value = options.message;
  confirmBtnText.value = options.btnText || 'Confirmar';
  confirmBtnClass.value = options.btnClass || 'btn-primary';
  confirmAction.value = options.action;
  showConfirmModal.value = true;
};

const closeConfirm = () => {
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const executeConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  closeConfirm();
};

const toggleBlock = (userId) => {
  const user = users.value.find(u => u._id === userId);
  const actionText = user?.status === 'active' ? 'bloquear' : 'desbloquear';
  const modalTitle = user?.status === 'active' ? 'Bloquear Utilizador' : 'Desbloquear Utilizador';
  const btnClass = user?.status === 'active' ? 'btn-danger' : 'btn-primary';
  
  openConfirm({
    title: modalTitle,
    message: `Tem a certeza que deseja ${actionText} o utilizador "${user?.name}"?`,
    btnText: user?.status === 'active' ? 'Bloquear' : 'Desbloquear',
    btnClass: btnClass,
    action: async () => {
      try {
        await axios.put(`${apiUrl}/api/users/${userId}/block`, {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Estado do utilizador actualizado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const endAuction = (auctionId) => {
  const item = auctions.value.find(a => a._id === auctionId);
  openConfirm({
    title: 'Terminar Leilão',
    message: `Tem a certeza que deseja terminar o leilão "${item?.title}" imediatamente? O vencedor será determinado com base no lance mais alto actual.`,
    btnText: 'Terminar',
    btnClass: 'btn-warning',
    action: async () => {
      try {
        await axios.put(`${apiUrl}/api/auctions/${auctionId}`, { status: 'finished' }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Leilão terminado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro ao terminar leilão: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const deleteAuction = (auctionId) => {
  const item = auctions.value.find(a => a._id === auctionId);
  openConfirm({
    title: 'Apagar Leilão',
    message: `Tem a certeza que deseja apagar permanentemente o leilão "${item?.title}"? Esta acção não pode ser desfeita e removerá todos os lances associados.`,
    btnText: 'Apagar',
    btnClass: 'btn-danger',
    action: async () => {
      try {
        await axios.delete(`${apiUrl}/api/auctions/${auctionId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Leilão apagado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro ao apagar: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: clamp(1.6rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-light);
}

/* ── Alert Banner ── */
.alert-banner {
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.alert-banner.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.alert-banner.error {
  background-color: #fdecea;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* ── Grid ── */
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Card ── */
.admin-card {
  padding: 1.75rem;
  border-radius: 12px;
  overflow: visible;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex-grow: 1;
}

.record-count {
  background-color: #f0f0f0;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
}

/* ── Form ── */
.create-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Table ── */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-md);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 520px;
}

.admin-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  background-color: #f9fafb;
  border-bottom: 1px solid #eee;
}

.admin-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background-color: #fafafa;
}

.empty-row {
  text-align: center;
  color: var(--text-light);
  padding: 2rem !important;
  font-style: italic;
}

/* ── User Cell ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--btn-primary-bg);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
}

.email-cell {
  color: var(--text-secondary);
  font-size: 0.83rem;
}

.auction-title-cell {
  font-weight: 500;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-cell {
  font-weight: 600;
  color: var(--btn-primary-bg);
  white-space: nowrap;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-admin   { background-color: #e3eafe; color: #3e6ae1; }
.badge-active  { background-color: #e8f5e9; color: #2e7d32; }
.badge-blocked { background-color: #fdecea; color: #c62828; }
.badge-ended   { background-color: #f0f0f0; color: #666;    }

.you-badge {
  font-size: 0.75rem;
  color: var(--text-light);
  font-style: italic;
}

/* ── Action buttons ── */
.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
}

.btn-warning {
  background-color: #ff9800;
  color: white;
}

.btn-warning:hover {
  background-color: #e65100;
}

.action-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .admin-card {
    padding: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

/* ── Image Upload & Thumbnails ── */
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: var(--radius-md);
  padding: 1.25rem;
  text-align: center;
  background-color: #f9fafb;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  user-select: none;
}

.upload-dropzone:hover {
  border-color: var(--btn-primary-bg);
  background-color: #f5f8ff;
}

.upload-progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--btn-primary-bg);
  margin-top: 0.5rem;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.uploaded-thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.thumb-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background-color: #f3f4f6;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.thumb-wrapper.is-cover {
  border-color: var(--btn-primary-bg);
  box-shadow: 0 0 0 2px rgba(62, 106, 225, 0.15);
}

.thumb-img {
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.btn-remove-thumb {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s;
  z-index: 2;
}

.btn-remove-thumb:hover {
  background: rgba(220, 38, 38, 0.9);
}

.btn-set-cover {
  width: 100%;
  height: 30%;
  background: white;
  border: none;
  border-top: 1px solid #e5e7eb;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-set-cover:hover {
  background: #f9fafb;
}

.thumb-wrapper.is-cover .btn-set-cover {
  background: var(--btn-primary-bg);
  color: white;
  border-top-color: var(--btn-primary-bg);
}

/* ── Custom Modal Confirmation ── */
.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.custom-modal-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 1.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.modal-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-title-icon {
  font-size: 1.5rem;
}

.custom-modal-card h4 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-body p {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-scale-in {
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
