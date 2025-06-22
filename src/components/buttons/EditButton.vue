// TODO: Use this for all edit actions for visual consistency.

<template>
  <BaseButton :class="'edit-btn'" variant="primary" @click="$emit('click')">
    <slot>Edit</slot>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';
</script>

<style scoped>
.edit-btn {
  border-radius: 10%;
}
</style>
