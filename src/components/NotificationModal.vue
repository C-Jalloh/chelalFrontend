<template>
  <div v-if="show" class="notification-modal-overlay" @mousedown.self="close">
    <div class="notification-modal-content">
      <div class="notification-modal-header">
        <router-link to="/notifications" class="notification-modal-title-link">
          <h2>Notifications</h2>
        </router-link>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="notification-modal-body">
        <slot>
          <p class="empty">No notifications.</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  show: { type: Boolean, required: true }
});
const emit = defineEmits(['close']);
function close() {
  emit('close');
}
</script>

<style scoped>
.notification-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 3000;
}
.notification-modal-content {
  background: #fff;
  color: #18181b;
  margin: 1.5rem 2rem 0 0;
  border-radius: 1rem;
  min-width: 340px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}
.notification-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.notification-modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #888;
  cursor: pointer;
  padding: 0 0.2em;
  line-height: 1;
}
.notification-modal-body {
  padding: 1.2rem 1.5rem;
  overflow-y: auto;
}
.empty {
  color: #888;
  text-align: center;
  margin: 2rem 0;
}
.notification-modal-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.15s;
}
.notification-modal-title-link:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>
