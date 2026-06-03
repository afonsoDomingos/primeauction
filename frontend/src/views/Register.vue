<template>
  <div class="login-container">
    <div class="login-card animate-fade-in">
      <h2 class="login-title">Criar Conta</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="name">Nome Completo</label>
          <input type="text" id="name" v-model="name" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" v-model="email" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Senha</label>
          <input type="password" id="password" v-model="password" class="form-input" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-pill full-width" :disabled="loading">
            {{ loading ? 'A Registar...' : 'Registar' }}
          </button>
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p class="switch-auth">
          Já tem conta? <router-link to="/login">Faça Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/auth/register`, { 
      name: name.value, 
      email: email.value, 
      password: password.value 
    });
    authStore.token = res.data.token;
    authStore.user = res.data.user;
    localStorage.setItem('token', res.data.token);
    router.push('/');
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Erro ao registar';
  } finally {
    loading.value = false;
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
  padding-top: 60px;
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
.switch-auth {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}
.switch-auth a {
  color: var(--btn-primary-bg);
  text-decoration: none;
}
</style>
