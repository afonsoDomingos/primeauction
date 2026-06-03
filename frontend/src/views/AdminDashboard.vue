<template>
  <div class="admin-container">
    <div class="container animate-fade-in" style="padding-top: 100px;">
      <h2 class="page-title">Admin Dashboard</h2>
      
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
            <small class="hint">Upload the image to Cloudinary and paste the URL here for now.</small>
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

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  startingPrice: 0,
  endTime: ''
});

const handleCreate = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    await axios.post(`${apiUrl}/api/auctions`, form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('Auction created successfully!');
    // Reset form
    form.value = { title: '', description: '', imageUrl: '', startingPrice: 0, endTime: '' };
  } catch (err) {
    alert('Error creating auction: ' + (err.response?.data?.error || err.message));
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
.create-card {
  padding: 2rem;
  max-width: 800px;
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
.hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-light);
}
</style>
