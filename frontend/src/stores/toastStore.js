import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  actions: {
    add(message, type = 'success', duration = 4000) {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      this.toasts.push({ id, message, type, duration });
      
      if (duration > 0) {
        setTimeout(() => {
          this.remove(id);
        }, duration);
      }
      return id;
    },
    remove(id) {
      const idx = this.toasts.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.toasts.splice(idx, 1);
      }
    },
    success(message, duration) {
      return this.add(message, 'success', duration);
    },
    error(message, duration) {
      return this.add(message, 'error', duration);
    },
    warning(message, duration) {
      return this.add(message, 'warning', duration);
    },
    info(message, duration) {
      return this.add(message, 'info', duration);
    }
  }
})
