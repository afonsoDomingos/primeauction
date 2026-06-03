<template>
  <Navbar />
  <main>
    <router-view />
  </main>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>

<style>
/* Global styles can also go here if needed, but we use main.css */
</style>
