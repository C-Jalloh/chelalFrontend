<!-- TODO: Ensure all forms use this component for input fields for visual consistency. -->

<template>
  <div class="form-group">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
      <span v-if="helpText" class="help-text" :title="helpText">?</span>
    </label>
    <input
      :type="type"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :max="type === 'date' ? maxDate : undefined"
      :pattern="pattern"
      :autocomplete="autocomplete"
      :aria-required="required"
      :aria-invalid="!!errorMessage"
      @blur="$emit('blur')"
    />
    <small v-if="errorMessage" class="field-error">{{ errorMessage }}</small>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'FormInput',
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String as PropType<'text' | 'date' | 'email' | 'tel' | 'number' | 'password' | 'time'>, // Added 'time'
      default: 'text',
    },
    modelValue: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: undefined,
    },
    maxDate: { // Specific for date inputs
      type: String,
      default: undefined,
    },
    pattern: {
        type: String,
        default: undefined,
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
  margin-bottom: 1rem; /* Default spacing, can be overridden by parent grid gap */
}

.form-group label {
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #1f2937; /* Darker color for better contrast */
  font-size: 0.95rem;
  display: inline-flex; /* To align help text and required marker */
  align-items: center;
}

.form-group input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc; /* CSS variable */
  border-radius: 4px; /* CSS variable */
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: #fff !important; /* Ensure inputs are white even in dark mode */
  color: #111 !important;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: var(--primary-blue, #2563eb);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  outline: none;
}

/* Force autofill background and text color for Chrome/Brave/Edge */
.form-group input:-webkit-autofill,
.form-group input:-webkit-autofill:focus,
.form-group input:-webkit-autofill:hover,
.form-group input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  -webkit-text-fill-color: #111 !important;
  transition: background-color 5000s ease-in-out 0s;
}

.required {
  color: #e53935; /* Brighter red for better visibility */
  margin-left: 0.2em;
  font-size: 1.1em;
  font-weight: bold;
}

.help-text {
  margin-left: 0.3em;
  color: #888; /* CSS variable */
  cursor: help;
  font-size: 1em;
  border-bottom: 1px dotted #888; /* CSS variable */
}

.field-error {
  color: #e57373; /* CSS variable */
  font-size: 0.92em;
  margin-top: 0.2em;
}
</style>
