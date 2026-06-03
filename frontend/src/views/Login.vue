<template>
  <div class="login-container">
    <div class="login-card animate-fade-in">
      <h2 class="login-title">Sign In</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" v-model="email" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input type="password" id="password" v-model="password" class="form-input" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-pill full-width" :disabled="authStore.loading">
            {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </div>
        <p v-if="authStore.error" class="error-msg">{{ authStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  await authStore.login(email.value, password.value);
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  padding-top: 60px; /* Offset for navbar */
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: var(--text-primary);
  text-align: left;
}

.full-width {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  margin-top: 1rem;
}

.error-msg {
  color: var(--danger-color);
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
}
</style>
