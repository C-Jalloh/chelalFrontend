<!-- TODO: Ensure all forms use this component for textarea fields for visual consistency. -->

<template>
  <div class="form-group">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
      <span v-if="helpText" class="help-text" :title="helpText">?</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :autocomplete="autocomplete"
      :aria-required="required"
      :aria-invalid="!!errorMessage"
      @blur="$emit('blur')"
    ></textarea>
    <small v-if="errorMessage" class="field-error">{{ errorMessage }}</small>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'FormTextarea',
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
      type: String as PropType<string | undefined>,
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
    rows: {
      type: Number,
      default: 3,
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

.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: #fff !important;
  color: #111 !important;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
}

.form-group textarea:focus {
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
