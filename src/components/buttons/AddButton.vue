<!-- TODO: Use this for all add actions for visual consistency. -->
<template>
  <BaseButton variant="primary" @click="$emit('click')">
    <component :is="icon" v-if="icon" style="width:1.1em;height:1.1em;margin-right:0.5em;" />
    <span>{{ label }}</span>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { defineProps } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: [Object, Function], default: null },
});
</script>
