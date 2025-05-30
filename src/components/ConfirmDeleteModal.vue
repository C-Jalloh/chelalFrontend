<template>
  <div class="confirm-delete-modal" @mousedown.self="$emit('close')" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h3 class="modal-title">{{ title || 'Confirm Deletion' }}</h3>
      <p class="modal-message">{{ message || 'Are you sure you want to delete this item? This action cannot be undone.' }}</p>
      <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
      <div class="form-actions">
        <button class="delete-btn" @click="handleDelete" :disabled="loading">{{ loading ? 'Deleting...' : (deleteButtonText || 'Delete') }}</button>
        <button class="cancel-btn" @click="$emit('close')" :disabled="loading">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ConfirmDeleteModal',
  props: {
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    deleteButtonText: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  emits: ['confirm', 'close'],
  setup(props, { emit }) {
    const errorMessage = ref(props.error);
    function handleDelete() {
      errorMessage.value = '';
      emit('confirm');
    }
    return {
      errorMessage,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.confirm-delete-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  min-width: 340px;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-title {
  color: #e57373;
  font-weight: 600;
  margin-bottom: 1.2rem;
  text-align: center;
  font-size: 1.3rem;
}
.modal-message {
  color: #222;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-actions {
  margin-top: 1.2rem;
  display: flex;
  gap: 1.2rem;
  justify-content: center;
}
.delete-btn {
  background: #e57373;
  color: #fff;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.delete-btn:hover:not(:disabled) {
  background: #c62828;
}
.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.cancel-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.cancel-btn:hover:not(:disabled) {
  background: #b0b0b0;
}
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-message {
  color: #e57373;
  margin-bottom: 1rem;
  font-size: 0.98rem;
  text-align: center;
}
</style>
