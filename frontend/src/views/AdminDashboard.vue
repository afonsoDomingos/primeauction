<template>
  <div class="admin-container">
    <div class="container animate-fade-in" style="padding-top: 100px; padding-bottom: 100px;">
      <h2 class="page-title">Admin Dashboard</h2>
      
      <div class="dashboard-grid">
        <!-- Criar Leilão -->
        <div class="card create-card">
          <h3 class="section-title">Create New Auction</h3>
          <form @submit.prevent="handleCreate">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Title</label>
                <input type="text" v-model="form.title" class="form-input" required />
              </div>
              <div class="form-group half">
                <label class="form-label">Starting Price (MZN)</label>
                <input type="number" v-model="form.startingPrice" class="form-input" required />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Image URL (Cloudinary)</label>
              <input type="url" v-model="form.imageUrl" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-input" rows="3" required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">End Time</label>
              <input type="datetime-local" v-model="form.endTime" class="form-input" required />
            </div>

            <button type="submit" class="btn btn-primary btn-pill">Create Auction</button>
          </form>
        </div>

        <!-- Gestão de Utilizadores -->
        <div class="card users-card">
          <h3 class="section-title">Manage Users</h3>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user._id">
                  <td>{{ user.name }} <span v-if="user.role === 'admin'" class="badge badge-admin">Admin</span></td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', user.status === 'active' ? 'badge-active' : 'badge-blocked']">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>
                    <button 
                      v-if="user._id !== authStore.user.id"
                      @click="toggleBlock(user._id)" 
                      :class="['btn', 'btn-sm', user.status === 'active' ? 'btn-danger' : 'btn-primary']"
                    >
                      {{ user.status === 'active' ? 'Block' : 'Unblock' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gestão de Leilões -->
        <div class="card auctions-card">
          <h3 class="section-title">Manage Auctions</h3>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Current Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="auction in auctions" :key="auction._id">
                  <td>{{ auction.title }}</td>
                  <td>{{ auction.status }}</td>
                  <td>{{ auction.currentPrice }}</td>
                  <td>
                    <button v-if="auction.status === 'active'" @click="endAuction(auction._id)" class="btn btn-sm btn-danger">End Now</button>
                    <button @click="deleteAuction(auction._id)" class="btn btn-sm btn-secondary" style="margin-left: 5px;">Delete</button>
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

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  startingPrice: 0,
  endTime: ''
});

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

onMounted(() => {
  fetchData();
});

const handleCreate = async () => {
  try {
    await axios.post(`${apiUrl}/api/auctions`, form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('Auction created successfully!');
    form.value = { title: '', description: '', imageUrl: '', startingPrice: 0, endTime: '' };
    fetchData(); // Refresh list
  } catch (err) {
    alert('Error creating auction: ' + (err.response?.data?.error || err.message));
  }
};

const toggleBlock = async (userId) => {
  try {
    await axios.put(`${apiUrl}/api/users/${userId}/block`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchData(); // Refresh list
  } catch (err) {
    alert('Error toggling block: ' + (err.response?.data?.error || err.message));
  }
};

const endAuction = async (auctionId) => {
  try {
    await axios.put(`${apiUrl}/api/auctions/${auctionId}`, { status: 'finished' }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchData();
  } catch (err) {
    alert('Error ending auction: ' + (err.response?.data?.error || err.message));
  }
};

const deleteAuction = async (auctionId) => {
  if(!confirm('Are you sure you want to delete this auction?')) return;
  try {
    await axios.delete(`${apiUrl}/api/auctions/${auctionId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchData();
  } catch (err) {
    alert('Error deleting auction: ' + (err.response?.data?.error || err.message));
  }
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f9fafb;
}
.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.card {
  padding: 2rem;
}
.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.half {
  flex: 1;
}
.table-container {
  overflow-x: auto;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
}
.admin-table th, .admin-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.admin-table th {
  font-weight: 500;
  color: var(--text-secondary);
  background-color: #f9fafb;
}
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.badge-admin { background-color: #3e6ae1; color: white; margin-left: 0.5rem; }
.badge-active { background-color: #4caf50; color: white; }
.badge-blocked { background-color: #ed4e50; color: white; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.75rem; }
</style>
