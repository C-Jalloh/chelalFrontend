<template>
  <nav class="base-tabs" role="tablist">
    <button
      v-for="(tab, i) in tabs"
      :key="tab.value"
      :class="['tab-btn', { active: tab.value === modelValue } ]"
      @click="$emit('update:modelValue', tab.value)"
      :aria-selected="tab.value === modelValue ? 'true' : 'false'"
      :tabindex="tab.value === modelValue ? 0 : -1"
      role="tab"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps({
  tabs: { type: Array, required: true }, // [{ label, value }]
  modelValue: { type: [String, Number], required: true },
});
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid hsl(var(--border));
  margin-bottom: 1.2rem;
  background: transparent;
  transition: border 0.18s, background 0.18s;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
}
.tab-btn {
  background: none;
  border: none;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  color: hsl(var(--font-color-primary));
  border-bottom: 2.5px solid transparent;
  cursor: pointer;
  transition: border 0.18s, color 0.18s;
}
.tab-btn.active {
  border-bottom: 2.5px solid hsl(var(--primary));
  color: hsl(var(--font-color-primary));
}
.dark .tab-btn {
  color: hsl(var(--font-color-primary));
}
.dark .tab-btn.active {
  border-bottom: 2.5px solid hsl(var(--primary));
  color: hsl(var(--font-color-primary));
}
.tab-btn:focus {
  outline: 2px solid hsl(var(--primary));
}
.dark .tab-btn:focus {
  outline: 2px solid hsl(var(--primary));
}
</style>
