<template>
  <div class="base-avatar" :style="avatarStyle">
    <img v-if="src" :src="src" :alt="alt" class="avatar-img" />
    <span v-else class="avatar-fallback">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'Avatar' },
  name: { type: String, default: '' },
  size: { type: [String, Number], default: 48 },
  bg: { type: String, default: '#e0e7ef' },
  color: { type: String, default: '#2563eb' },
});
const initials = computed(() => {
  if (!props.name) return '?';
  return props.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});
const avatarStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  background: props.bg,
  color: props.color,
}));
</script>

<style scoped>
.base-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: hsl(var(--font-color-primary));
  user-select: none;
  border: 2.5px solid hsl(var(--border));
  box-shadow: 0 2px 8px rgba(37,99,235,0.08);
  transition: box-shadow 0.18s, background 0.18s, color 0.18s, border 0.18s;
}
.base-avatar:hover {
  box-shadow: 0 4px 16px rgba(37,99,235,0.16);
}
.dark .base-avatar {
  color: hsl(var(--font-color-primary));
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--font-color-primary));
  letter-spacing: 0.02em;
}
</style>
