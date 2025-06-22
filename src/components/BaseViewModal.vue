<template>
  <div class="view-modal-overlay" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ title }}</h3>
      <div class="form-section" v-if="sectionTitle">
        <span class="section-title">{{ sectionTitle }}</span>
      </div>
      <div class="form-grid">
        <div v-for="col in columns" :key="col.key" class="form-group">
          <label class="modal-label">{{ col.label }}</label>
          <div class="modal-value">{{ entry[col.key] }}</div>
        </div>
      </div>
      <div class="form-actions">
        <button class="close-btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'BaseViewModal',
  props: {
    entry: { type: Object, required: true },
    columns: { type: Array as PropType<any[]>, required: true },
    title: { type: String, default: 'Entry Details' },
    sectionTitle: { type: String, default: '' },
  },
  emits: ['close'],
});
</script>

<style scoped>
.view-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: hsl(var(--font-color-primary));
  background: hsl(var(--background));
  padding: 2rem 2.5rem;
  border-radius: 12px;
  min-width: 520px;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-title {
  color: hsl(var(--primary));
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xl);
  margin-bottom: 2rem;
  text-align: center;
}
.form-section {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--font-color-secondary));
  font-family: var(--font-family-sans);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0rem 1.8rem;
  margin-bottom: 0.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}
.modal-label {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: hsl(var(--font-color-primary));
  margin-bottom: 0.5rem;
}
.modal-value {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: hsl(var(--font-color-primary));
  background: hsl(var(--background-alt));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.close-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  background: #6c757d;
  color: white;
  border: none;
  transition: background-color 0.2s;
}
.close-btn:hover {
  background: #5a6268;
}
@media (max-width: 700px) {
  .modal-content {
    min-width: 95vw;
    max-width: 99vw;
    padding: 1rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0rem;
  }
}
</style>
