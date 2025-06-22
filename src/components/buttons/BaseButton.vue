<!-- TODO: Use this as the base for all button components for visual consistency. -->
<template>
  <button
    :class="['base-btn', variant, { 'full-width': fullWidth }]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">

const props = defineProps({
  variant: { type: String, default: 'primary' }, // 'primary', 'secondary', 'danger', etc.
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
});
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: none;
  border-radius: 10%;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.15s,
    transform 0.08s;
  box-shadow: 0 1px 2px rgba(30, 58, 92, 0.06);
}
.base-btn.primary {
  background: #1e3a8a;
  color: #fff;
}
.base-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 16px rgba(30, 58, 92, 0.12);
  transform: translateY(-2px) scale(1.03);
}
.base-btn.primary:active:not(:disabled) {
  background: #1e40af;
  box-shadow: 0 2px 8px rgba(30, 58, 92, 0.10);
  transform: scale(0.97);
}
.base-btn.secondary {
  background: #f1f5f9;
  color: #1e3a8a;
  border: 1px solid #cbd5e1;
}
.base-btn.secondary:hover:not(:disabled) {
  background: #e0e7ef;
  box-shadow: 0 4px 16px rgba(30, 58, 92, 0.10);
  transform: translateY(-2px) scale(1.03);
}
.base-btn.secondary:active:not(:disabled) {
  background: #cbd5e1;
  box-shadow: 0 2px 8px rgba(30, 58, 92, 0.08);
  transform: scale(0.97);
}
.base-btn.danger {
  background: #dc2626;
  color: #fff;
}
.base-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.12);
  transform: translateY(-2px) scale(1.03);
}
.base-btn.danger:active:not(:disabled) {
  background: #991b1b;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.10);
  transform: scale(0.97);
}
.base-btn:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
.base-btn.full-width {
  width: 100%;
}
</style>
