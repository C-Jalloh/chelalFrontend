<template>
  <nav class="base-pagination" aria-label="Pagination">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="$emit('update:modelValue', currentPage - 1)"
      aria-label="Previous page"
    >
      &laquo;
    </button>
    <button
      v-for="page in pages"
      :key="page"
      :class="['page-btn', { active: page === currentPage }]"
      @click="$emit('update:modelValue', page)"
      :aria-current="page === currentPage ? 'page' : undefined"
    >
      {{ page }}
    </button>
    <button
      class="page-btn"
      :disabled="currentPage === pageCount"
      @click="$emit('update:modelValue', currentPage + 1)"
      aria-label="Next page"
    >
      &raquo;
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
const props = defineProps({
  modelValue: { type: Number, required: true },
  pageCount: { type: Number, required: true },
});
const emit = defineEmits(['update:modelValue']);
const currentPage = computed(() => props.modelValue);
const pages = computed(() => {
  const arr = [];
  for (let i = 1; i <= props.pageCount; i++) arr.push(i);
  return arr;
});
</script>

<style scoped>
.base-pagination {
  display: flex;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  background: hsl(var(--background-alt));
  border-radius: 0.7rem;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
  padding: 0.5rem 1.2rem;
  transition:
    background 0.18s,
    box-shadow 0.18s;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
}
.dark .base-pagination {
  background: #1e293b;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.10);
}
.page-btn {
  background: hsl(var(--secondary));
  color: hsl(var(--font-color-primary));
  border: 1.5px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 0.5rem 1.1rem;
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
  outline: none;
  font-family: var(--font-family-sans);
}
.page-btn.active,
.page-btn:focus {
  background: hsl(var(--primary));
  color: hsl(var(--font-color-inverse));
  border-color: hsl(var(--primary));
  outline: none;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dark .page-btn {
  background: hsl(var(--secondary));
  color: hsl(var(--font-color-primary));
  border-color: hsl(var(--border));
}
.dark .page-btn.active,
.dark .page-btn:focus {
  background: hsl(var(--primary));
  color: hsl(var(--font-color-inverse));
  border-color: hsl(var(--primary));
}
</style>
