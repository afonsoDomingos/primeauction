<template>
  <Navbar />
  <main>
    <router-view />
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<style>
/* Global styles can also go here if needed, but we use main.css */
</style>
