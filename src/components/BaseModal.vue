<template>
  <div class="base-modal-overlay" @mousedown.self="onClose" aria-modal="true" role="dialog">
    <div class="base-modal-content">
      <header v-if="title" class="modal-title">{{ title }}</header>
      <slot />
      <footer v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </footer>
      <BaseButton variant="secondary" class="close-btn mt-4" @click="onClose" aria-label="Close modal">Close</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  title: { type: String, default: '' },
});
const emit = defineEmits(['close']);
function onClose() { emit('close'); }
</script>

<style scoped>
.base-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.base-modal-content {
  background: #fff;
  color: #111;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.modal-title {
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.3rem;
}
.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.close-btn {
  align-self: flex-end;
}
</style>
