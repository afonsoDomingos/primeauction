<template>
  <div class="user-container">
    <div class="container animate-fade-in" style="padding-top: 100px;">
      <h2 class="page-title">My Dashboard</h2>
      
      <div class="dashboard-content">
        <div class="profile-section card">
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {{ authStore.user?.name }}</p>
          <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
          <p><strong>Status:</strong> <span class="badge">{{ authStore.user?.status }}</span></p>
          <button @click="logout" class="btn btn-danger mt-4">Logout</button>
        </div>

        <div class="bids-section card">
          <h3>My Recent Bids</h3>
          <p class="text-muted">Currently, you can see all your bids on the specific auction pages.</p>
          <router-link to="/auctions" class="btn btn-primary mt-4">Explore Auctions</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background-color: #f9fafb;
}
.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
}
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}
.card {
  padding: 2rem;
}
.badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.mt-4 {
  margin-top: 1.5rem;
}
.text-muted {
  color: var(--text-light);
}
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
