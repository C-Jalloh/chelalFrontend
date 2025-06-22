<template>
  <div :class="['base-alert', type]">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'BaseAlert',
  props: {
    type: {
      type: String as PropType<'success' | 'error' | 'info' | 'warning'>,
      default: 'info',
    },
  },
});
</script>

<style scoped>
.base-alert {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: hsl(var(--font-color-primary));
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.base-alert.success {
  background: hsl(var(--alert-success-bg));
  color: hsl(var(--font-color-success));
  border: 1px solid hsl(var(--alert-success));
}
.base-alert.error {
  background: hsl(var(--alert-error-bg));
  color: hsl(var(--font-color-danger));
  border: 1px solid hsl(var(--alert-error));
}
.base-alert.info {
  background: hsl(var(--alert-info-bg));
  color: hsl(var(--font-color-link));
  border: 1px solid hsl(var(--alert-info));
}
.base-alert.warning {
  background: hsl(var(--alert-warning-bg));
  color: hsl(var(--font-color-warning));
  border: 1px solid hsl(var(--alert-warning));
}
</style>
