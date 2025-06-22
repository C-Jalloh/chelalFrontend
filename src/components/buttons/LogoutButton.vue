<template>
  <BaseButton variant="danger" @click="$emit('click')">
    <ArrowLeftOnRectangleIcon style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <slot>Logout</slot>
  </BaseButton>
</template>
<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline';
</script>
