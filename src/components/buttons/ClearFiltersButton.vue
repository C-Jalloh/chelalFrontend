<template>
  <BaseButton variant="secondary" @click="$emit('click')">
    <FunnelIcon style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <slot>Clear Filters</slot>
  </BaseButton>
</template>
<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { FunnelIcon } from '@heroicons/vue/24/outline';
</script>
