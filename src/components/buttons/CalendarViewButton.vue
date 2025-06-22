<template>
  <BaseButton variant="secondary" @click="$emit('click')">
    <CalendarDaysIcon style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <slot>Calendar View</slot>
  </BaseButton>
</template>
<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { CalendarDaysIcon } from '@heroicons/vue/24/outline';
</script>
