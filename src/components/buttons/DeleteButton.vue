<!-- TODO: Use this for all delete actions for visual consistency. -->
<template>
  <BaseButton variant="danger" @click="$emit('click')" :class="'delete-btn'">
    <TrashIcon style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <slot>Delete</slot>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { TrashIcon } from '@heroicons/vue/24/outline';
</script>

<style scoped>
.delete-btn {
  border-radius: 10%;
}
</style>
