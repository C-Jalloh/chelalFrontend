<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Bed' : 'Add New Bed' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Bed Information</legend>
        <div class="form-section"><span class="section-title">Bed Info</span></div>
        <div class="form-grid">
          <FormInput
            id="bed_name"
            label="Bed Name/Number"
            v-model="formBed.bed_name"
            :required="true"
            placeholder="Enter bed name or number"
            :maxlength="30"
            :errorMessage="validation.bed_name"
            @blur="validateField('bed_name')"
            @input="validateField('bed_name')"
            :autofocus="true"
          />
          <FormSelect
            id="ward_id"
            label="Ward"
            v-model="formBed.ward_id"
            :options="wardOptions"
            :required="true"
            placeholder="Select Ward"
            :errorMessage="validation.ward_id"
            @blur="validateField('ward_id')"
            @change="validateField('ward_id')"
          />
          <FormSelect
            id="status"
            label="Status"
            v-model="formBed.status"
            :options="statusOptions"
            :required="true"
            placeholder="Select Status"
            :errorMessage="validation.status"
            @blur="validateField('status')"
            @change="validateField('status')"
          />
        </div>
      </fieldset>
    </template>
    <template #submit-label>{{ isEditing ? 'Save Changes' : 'Add Bed' }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import type { PropType } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '../FormElements/FormInput.vue';
import FormSelect from '../FormElements/FormSelect.vue';

type BedForm = {
  bed_name: string;
  ward_id: string;
  status: string;
  [key: string]: any;
};
type Validation = {
  bed_name: string;
  ward_id: string;
  status: string;
  [key: string]: string;
};

type SelectOption = { value: string; text: string };

export default defineComponent({
  name: 'AddEditBedModal',
  components: { BaseAddEditModal, FormInput, FormSelect },
  props: {
    bed: { type: Object, default: null },
    wardOptions: { type: Array as PropType<SelectOption[]>, default: () => [] },
    loading: { type: Boolean, default: false },
    errorMessage: { type: String, default: '' },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.bed && !!props.bed.id);
    const formBed = ref<BedForm>({
      bed_name: props.bed?.bed_name || '',
      ward_id: props.bed?.ward_id || '',
      status: props.bed?.status || '',
    });
    const statusOptions: SelectOption[] = [
      { value: 'Available', text: 'Available' },
      { value: 'Occupied', text: 'Occupied' },
      { value: 'Maintenance', text: 'Maintenance' },
      { value: 'Inactive', text: 'Inactive' },
    ];
    const validation = ref<Validation>({
      bed_name: '',
      ward_id: '',
      status: '',
    });
    function validateField(field: string) {
      if (!formBed.value[field]) {
        validation.value[field] = 'This field is required.';
      } else {
        validation.value[field] = '';
      }
    }
    function handleSubmit() {
      Object.keys(validation.value).forEach(validateField);
      const hasError = Object.values(validation.value).some(msg => msg);
      if (!hasError) {
        emit('submit', { ...formBed.value });
      }
    }
    return {
      isEditing,
      formBed,
      statusOptions,
      validation,
      validateField,
      handleSubmit,
    };
  },
});
</script>
