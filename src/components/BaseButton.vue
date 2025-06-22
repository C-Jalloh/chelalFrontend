<template>
  <button
    :class="[
      'base-btn',
      variantClass,
      sizeClass,
      { 'w-full': block, 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, danger, outline
  size: { type: String, default: 'md' }, // sm, md, lg
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
});
const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'btn-secondary';
    case 'danger': return 'btn-danger';
    case 'outline': return 'btn-outline';
    default: return 'btn-primary';
  }
});
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'btn-sm';
    case 'lg': return 'btn-lg';
    default: return 'btn-md';
  }
});
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background 0.18s, color 0.18s;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  gap: 0.5em;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--font-color-primary));
}
.btn-md { font-size: var(--font-size-base); }
.btn-sm { font-size: var(--font-size-sm); }
.btn-lg { font-size: var(--font-size-lg); }
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
.btn-primary:hover:not(:disabled) { background: hsl(var(--primary)); filter: brightness(0.92); }
.btn-secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--font-color-primary));
  border: 1px solid hsl(var(--border));
}
.btn-secondary:hover:not(:disabled) { background: hsl(var(--secondary)); filter: brightness(0.96); }
.btn-danger {
  background: hsl(var(--alert-error));
  color: hsl(var(--font-color-inverse));
}
.btn-danger:hover:not(:disabled) { background: hsl(var(--alert-error)); filter: brightness(0.92); }
.btn-outline {
  background: transparent;
  color: hsl(var(--primary));
  border: 1.5px solid hsl(var(--primary));
}
.btn-outline:hover:not(:disabled) {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
.w-full { width: 100%; }
</style>
