<template>
  <BaseButton variant="primary" type="submit">
    <ArrowRightOnRectangleIcon style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <slot>Login</slot>
  </BaseButton>
</template>
<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
</script>
