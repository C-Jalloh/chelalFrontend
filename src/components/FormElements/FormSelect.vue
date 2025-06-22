<!-- TODO: Ensure all forms use this component for select fields for visual consistency. -->

<template>
  <div class="form-group">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
      <span v-if="helpText" class="help-text" :title="helpText">?</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :required="required"
      :autocomplete="autocomplete"
      :aria-required="required"
      :aria-invalid="!!errorMessage"
      @blur="$emit('blur')"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.text }}
      </option>
    </select>
    <small v-if="errorMessage" class="field-error">{{ errorMessage }}</small>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface SelectOption {
  value: string | number;
  text: string;
}

export default defineComponent({
  name: 'FormSelect',
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: '',
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: { // For the default disabled option
      type: String,
      default: 'Select an option',
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    errorMessage: {
      type: String as PropType<string | null>,
      default: null,
    },
    helpText: {
      type: String,
      default: '',
    }
  },
  emits: ['update:modelValue', 'blur'],
});
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #1f2937; /* Darker color for better contrast */
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
}

.form-group select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: #fff !important;
  color: #111 !important;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group select:focus {
  border-color: var(--primary-blue, #2563eb);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  outline: none;
}

.required {
  color: #e53935; /* Brighter red for better visibility */
  margin-left: 0.2em;
  font-size: 1.1em;
  font-weight: bold;
}

.help-text {
  margin-left: 0.3em;
  color: #888;
  cursor: help;
  font-size: 1em;
  border-bottom: 1px dotted #888;
}

.field-error {
  color: #e57373;
  font-size: 0.92em;
  margin-top: 0.2em;
}
</style>
