<template>
  <div class="base-card" :class="[variant]">
    <header v-if="title" class="base-card-title">{{ title }}</header>
    <slot />
    <footer v-if="$slots.footer" class="base-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: '' }, // e.g. 'primary', 'info', 'warning', etc.
});
</script>

<style scoped>
.base-card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: 1rem;
  box-shadow: 0 6px 24px rgba(37,99,235,0.10), 0 1.5px 6px rgba(30,58,92,0.10);
  padding: 2.5rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  border: 1.5px solid hsl(var(--border));
  transition: background 0.18s, color 0.18s;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: hsl(var(--font-color-primary));
}
.base-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: hsl(var(--font-color-primary));
  font-family: var(--font-family-sans);
  margin-bottom: 1.2rem;
  letter-spacing: 0.01em;
}
.base-card-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}
.primary { border-left: 4px solid hsl(var(--primary)); }
.info { border-left: 4px solid hsl(var(--secondary)); }
.warning { border-left: 4px solid hsl(var(--tertiary)); }
.success { border-left: 4px solid hsl(var(--alert-success)); }
.danger { border-left: 4px solid hsl(var(--alert-error)); }
.dark .base-card {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
  color: hsl(var(--font-color-primary));
}
.dark .base-card-title {
  color: hsl(var(--font-color-primary));
}
</style>
