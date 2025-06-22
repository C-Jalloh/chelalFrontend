<template>
  <button class="clear-btn" type="button" @click="$emit('click')">
    <slot>Clear</slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ClearButton',
  emits: ['click'],
});
</script>

<style scoped>
.clear-btn {
  background-color: var(--primary-blue);
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: background-color 0.3s;
  font-size: 1rem;
  font-weight: 500;
}
.clear-btn:hover {
  background-color: #163052;
}
</style>
