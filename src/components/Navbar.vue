<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img
        :src="isDarkMode ? '/chelal-logo-dark.svg' : '/chelal-logo-light.svg'"
        alt="Chelal HMS Logo"
        class="navbar-logo"
      />
      <span class="navbar-title">Chelal HMS</span>
    </div>
    <div class="navbar-right">
      <button class="navbar-icon-btn" title="Notifications" @click="showNotificationModal = true">
        <svg class="navbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </button>
      <NotificationModal :show="showNotificationModal" @close="showNotificationModal = false" />
      <button class="navbar-icon-btn" title="Profile" @click="openProfileModal">
        <img src="/placeholder-user.png" alt="Profile" class="navbar-profile-avatar" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { defineEmits } from 'vue';
import NotificationModal from './NotificationModal.vue';

const store = useStore();
const isDarkMode = computed(() => store.state.isDarkMode ?? document.documentElement.classList.contains('dark'));
const emit = defineEmits(['show-profile-modal']);
const showNotificationModal = ref(false);

function openProfileModal() {
  emit('show-profile-modal');
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  background: #fff;
  /* fallback for light mode */
  background: hsl(var(--background));
  border-bottom: 1.5px solid hsl(var(--border));
  min-height: 64px;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navbar-logo {
  height: 2.5rem;
  width: 2.5rem;
  margin-right: 0.5rem;
}
.navbar-title {
  font-family: var(--font-family-sans);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-contrast);
  letter-spacing: 0.01em;
  line-height: 1.1;
  transition: color 0.2s;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.navbar-icon-btn {
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.15s;
}
.navbar-icon-btn:hover {
  background: hsl(var(--background-alt));
}
.navbar-icon {
  width: 1.7rem;
  height: 1.7rem;
  color: hsl(var(--font-color-primary));
}
.navbar-profile-avatar {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid hsl(var(--border));
}
.dark .navbar-title {
  color: var(--text-contrast);
}
</style>
