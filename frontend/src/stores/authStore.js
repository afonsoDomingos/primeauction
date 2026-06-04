import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('token', this.token);
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed';
      } finally {
        this.loading = false;
      }
    },
    async fetchUser() {
      if (!this.token) return;
      this.loading = true;
      this.error = null;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const user = res.data.data;
        this.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profilePhoto: user.profilePhoto || null,
          phone: user.phone || null,
          bio: user.bio || null,
          province: user.province || null,
          gender: user.gender || null,
          age: user.age || null
        };
      } catch (err) {
        console.error('Failed to fetch user:', err);
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    async updateProfile(profileData) {
      this.loading = true;
      this.error = null;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.put(`${apiUrl}/api/auth/updateprofile`, profileData, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.error || 'Erro ao actualizar perfil';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    async uploadProfilePhoto(formData) {
      this.loading = true;
      this.error = null;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.put(`${apiUrl}/api/auth/uploadphoto`, formData, {
          headers: { 
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.error || 'Erro ao carregar fotografia';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    }
  }
})
