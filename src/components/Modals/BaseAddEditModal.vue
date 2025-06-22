<template>
  <div class="base-modal-bg" @mousedown.self="$emit('close')">
    <div class="base-modal-content" :class="{ 'edit-appointment-modal': $slots.title?.toString().includes('Edit Appointment') }" tabindex="0">
      <h3 class="base-modal-title">
        <slot name="title">Add / Edit</slot>
      </h3>
      <form @submit.prevent="$emit('submit')" class="base-modal-form">
        <slot />
        <div v-if="errorMessage" class="base-modal-error">{{ errorMessage }}</div>
        <div class="base-modal-actions">
          <button type="button" @click="$emit('close')" class="base-cancel-btn">Cancel</button>
          <button type="submit" class="base-submit-btn">
            <slot name="submit-label">Save</slot>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'BaseAddEditModal',
  props: {
    errorMessage: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'submit'],
});
</script>

<style scoped>
.base-modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.base-modal-content {
  background: var(--white);
  color: var(--text-dark);
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  padding: 2rem;
  outline: none;
}
html.dark .base-modal-content,
:root.dark .base-modal-content {
  background: var(--primary-blue);
  color: var(--text-contrast);
  box-shadow: 0 4px 16px rgba(30,58,92,0.45);
}

.base-modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}
html.dark .base-modal-title,
:root.dark .base-modal-title {
  color: var(--teal);
}

.base-modal-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}
.base-modal-error {
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  text-align: center;
}
.base-modal-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.base-cancel-btn {
  background: #6b7280;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}
html.dark .base-cancel-btn {
  background: #374151;
  color: var(--text-contrast);
}
.base-cancel-btn:hover {
  background: #4b5563;
}
.base-submit-btn {
  background: #1e3a8a;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}
html.dark .base-submit-btn {
  background: var(--teal);
  color: var(--text-contrast-inverse);
}
.base-submit-btn:hover {
  background: #2563eb;
}
</style>
