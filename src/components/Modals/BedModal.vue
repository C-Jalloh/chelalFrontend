<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Bed' : 'Add Bed' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Bed Information</legend>
        <div class="form-section"><span class="section-title">Bed Details</span></div>
        <div class="form-grid">
          <FormInput
            id="name"
            label="Bed Name"
            v-model="bed.name"
            :required="true"
            placeholder="Enter bed name"
            :maxlength="50"
            :errorMessage="validation.name"
            @blur="validateField('name')"
            @input="validateField('name')"
            :autofocus="true"
          />
          
          <FormSelect
            id="status"
            label="Status"
            v-model="bed.status"
            :options="statusOptions"
            :required="true"
            :errorMessage="validation.status"
            @blur="validateField('status')"
            @change="validateField('status')"
          />
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save') }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType, nextTick } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import { createBed, updateBed } from '@/services/bedService';

interface Bed {
  id?: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export default defineComponent({
  name: 'BedModal',
  components: {
    BaseAddEditModal,
    FormInput,
    FormSelect
  },
  props: {
    existingBed: {
      type: Object as PropType<Bed | null>,
      default: null,
    },
  },
  emits: ['close', 'bedCreated', 'bedUpdated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const bed = ref<Bed>({
      name: '',
      status: 'available',
    });
    
    const statusOptions = [
      { value: 'available', text: 'Available' },
      { value: 'occupied', text: 'Occupied' },
      { value: 'maintenance', text: 'Maintenance' }
    ];
    
    const validation = ref<Record<string, string | null>>({});
    
    // Autofocus first field on open
    nextTick(() => {
      const el = document.getElementById('name');
      if (el) el.focus();
    });

    watch(() => props.existingBed, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        bed.value = { ...newVal };
      } else {
        isEditing.value = false;
        bed.value = {
          name: '',
          status: 'available',
        };
      }
      validation.value = {};
      errorMessage.value = '';
      successMessage.value = '';
    }, { immediate: true });
    
    function validateField(field: string) {
      // Real-time validation for each field
      switch (field) {
        case 'name':
          validation.value.name = !bed.value.name ? 'Bed name is required.' : null;
          break;
        case 'status':
          validation.value.status = !bed.value.status ? 'Status is required.' : null;
          break;
      }
    }
    
    function validateAll() {
      validateField('name');
      validateField('status');
      // Return true if no errors
      return Object.values(validation.value).every(v => !v);
    }
    
    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      if (!validateAll()) {
        errorMessage.value = 'Please correct the highlighted errors.';
        return;
      }
      
      loading.value = true;
      
      try {
        const token = localStorage.getItem('token') || '';
        if (isEditing.value && bed.value.id) {
          const updated = await updateBed(bed.value.id, bed.value);
          emit('bedUpdated', updated.data);
          successMessage.value = 'Bed updated successfully!';
        } else {
          const created = await createBed(bed.value);
          emit('bedCreated', created.data);
          successMessage.value = 'Bed created successfully!';
        }
        setTimeout(() => { 
          successMessage.value = ''; 
          emit('close'); 
        }, 1200);
      } catch (err: any) {
        errorMessage.value = err.message || 'Failed to save bed.';
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      bed,
      errorMessage,
      successMessage,
      loading,
      statusOptions,
      validation,
      validateField,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.form-section {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0; /* Light gray border */
}

.section-title {
  font-size: 0.95rem; /* Slightly smaller than main title */
  font-weight: 600;
  color: #4a5568; /* Darker gray text */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0rem 1.8rem; /* Adjusted gap to rely on component's internal margin-bottom */
  margin-bottom: 0.2rem; /* Adjusted margin */
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #c6f6d5; /* Green-200 */
  color: #2f855a; /* Green-700 */
  border: 1px solid #9ae6b4; /* Green-300 */
  border-radius: 0.375rem; /* Rounded corners */
  text-align: center;
}

/* Ensure fieldset takes up space and legend is accessible */
fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0rem; /* Adjusted gap */
  }
}
</style>
