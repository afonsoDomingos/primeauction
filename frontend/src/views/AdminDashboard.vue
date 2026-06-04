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
              <label class="form-label">URL da Imagem</label>
              <input type="url" v-model="form.imageUrl" class="form-input" placeholder="https://..." required />
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
  startingPrice: 0,
  endTime: ''
});

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
    await axios.post(`${apiUrl}/api/auctions`, form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    form.value = { title: '', description: '', imageUrl: '', startingPrice: 0, endTime: '' };
    showAlert('Leilão criado com sucesso! ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro ao criar leilão: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    creating.value = false;
  }
};

const toggleBlock = async (userId) => {
  try {
    await axios.put(`${apiUrl}/api/users/${userId}/block`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    showAlert('Estado do utilizador actualizado. ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro: ' + (err.response?.data?.error || err.message), 'error');
  }
};

const endAuction = async (auctionId) => {
  try {
    await axios.put(`${apiUrl}/api/auctions/${auctionId}`, { status: 'finished' }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    showAlert('Leilão terminado. ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro ao terminar leilão: ' + (err.response?.data?.error || err.message), 'error');
  }
};

const deleteAuction = async (auctionId) => {
  if (!confirm('Tem a certeza que quer apagar este leilão?')) return;
  try {
    await axios.delete(`${apiUrl}/api/auctions/${auctionId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    showAlert('Leilão apagado. ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro ao apagar: ' + (err.response?.data?.error || err.message), 'error');
  }
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
</style>
