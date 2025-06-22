<template>
  <div class="base-spinner" :style="{ width: size, height: size }" role="status" aria-label="Loading">
    <svg class="spinner-svg" viewBox="0 0 50 50">
      <circle class="spinner-bg" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
      <circle class="spinner-fg" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps({
  size: { type: String, default: '2.5rem' },
});
</script>

<style scoped>
.base-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background-alt));
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(37,99,235,0.08);
  padding: 0.3em;
  transition: background 0.18s, box-shadow 0.18s;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: hsl(var(--font-color-primary));
}
.dark .base-spinner {
  background: hsl(var(--background-alt));
  box-shadow: 0 2px 8px rgba(96,165,250,0.10);
}
.spinner-svg {
  animation: spinner-rotate 1s linear infinite;
  width: 100%;
  height: 100%;
  display: block;
}
.spinner-bg {
  stroke: hsl(var(--border));
}
.spinner-fg {
  stroke: hsl(var(--primary));
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: spinner-dash 1.5s ease-in-out infinite;
}
.dark .spinner-bg {
  stroke: hsl(var(--border));
}
.dark .spinner-fg {
  stroke: hsl(var(--primary));
}
@keyframes spinner-rotate {
  100% { transform: rotate(360deg); }
}
@keyframes spinner-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
