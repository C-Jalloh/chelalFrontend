<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Supplier' : 'Add Supplier' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Supplier Information</legend>
        <div class="form-section"><span class="section-title">Supplier Details</span></div>
        <div class="form-container">
          <FormInput
            id="name"
            label="Supplier Name"
            v-model="supplier.name"
            :required="true"
            placeholder="Enter supplier name"
            :maxlength="50"
            :errorMessage="validation.name"
            @blur="validateField('name')"
            @input="validateField('name')"
            :autofocus="true"
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
import { createSupplier, updateSupplier } from '@/services/pharmacyService';

interface Supplier {
  id?: number;
  name: string;
}

export default defineComponent({
  name: 'SupplierModal',
  components: {
    BaseAddEditModal,
    FormInput
  },
  props: {
    existingSupplier: {
      type: Object as PropType<Supplier | null>,
      default: null,
    },
  },
  emits: ['close', 'supplierCreated', 'supplierUpdated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const supplier = ref<Supplier>({
      name: '',
    });
    const validation = ref<Record<string, string | null>>({});
    
    // Autofocus first field on open
    nextTick(() => {
      const el = document.getElementById('name');
      if (el) el.focus();
    });

    watch(() => props.existingSupplier, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        supplier.value = { ...newVal };
      } else {
        isEditing.value = false;
        supplier.value = {
          name: '',
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
          validation.value.name = !supplier.value.name ? 'Supplier name is required.' : null;
          break;
      }
    }
    
    function validateAll() {
      validateField('name');
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
        if (isEditing.value && supplier.value.id) {
          const updated = await updateSupplier(supplier.value.id, supplier.value, token);
          emit('supplierUpdated', updated.data);
          successMessage.value = 'Supplier updated successfully!';
        } else {
          const created = await createSupplier(supplier.value, token);
          emit('supplierCreated', created.data);
          successMessage.value = 'Supplier created successfully!';
        }
        setTimeout(() => { 
          successMessage.value = ''; 
          emit('close'); 
        }, 1200);
      } catch (err: any) {
        errorMessage.value = err.message || 'Failed to save supplier.';
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      supplier,
      errorMessage,
      successMessage,
      loading,
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

.form-container {
  margin-bottom: 1rem;
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
</style>
