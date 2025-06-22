<template>
  <div :class="['form-group', { 'w-full': block }]">
    <label v-if="label" :for="id" class="form-label">{{ label }}<span v-if="required" class="required">*</span></label>
    <input
      :id="id"
      :type="type"
      v-model="modelValueProxy"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :aria-label="ariaLabel || label"
      :aria-required="required ? 'true' : 'false'"
      :aria-invalid="invalid ? 'true' : 'false'"
      v-bind="$attrs"
      class="base-input"
    />
    <small v-if="help" class="form-help">{{ help }}</small>
    <small v-if="error" class="form-error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: '' },
  help: { type: String, default: '' },
  error: { type: String, default: '' },
  invalid: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);
const modelValueProxy = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
});
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-label {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: hsl(var(--font-color-primary));
  margin-bottom: 0.5rem;
}
.base-input {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: hsl(var(--font-color-primary));
  background: hsl(var(--background-alt));
  border: 1px solid hsl(var(--border));
  padding: 0.6rem 0.8rem;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.2rem;
  transition: border 0.18s;
}
.base-input:focus {
  border-color: hsl(var(--primary));
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.10);
}
.form-help {
  color: hsl(var(--font-color-muted));
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  margin-top: 0.2em;
}
.form-error {
  color: hsl(var(--font-color-danger));
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  margin-top: 0.2em;
}
.required {
  color: hsl(var(--font-color-danger));
  margin-left: 0.2em;
}
.w-full { width: 100%; }
</style>
