<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Service' : 'Add Service' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Service Information</legend>
        <div class="form-section"><span class="section-title">Service Details</span></div>
        <div class="form-grid">
          <FormInput
            id="name"
            label="Name"
            v-model="service.name"
            :required="true"
            placeholder="Enter service name"
            :maxlength="50"
            :errorMessage="validation.name"
            @blur="validateField('name')"
            @input="validateField('name')"
            :autofocus="true"
          />
          <FormInput
            id="price"
            label="Price"
            type="number"
            v-model="service.price"
            :required="true"
            placeholder="0.00"
            :errorMessage="validation.price"
            @blur="validateField('price')"
            @input="validateField('price')"
          />
          <div class="form-group full-width-group">
            <FormTextarea
              id="description"
              label="Description"
              v-model="service.description"
              placeholder="Service description"
              :maxlength="200"
              :errorMessage="validation.description"
              helpText="Optional description of the service"
              @blur="validateField('description')"
              @input="validateField('description')"
            />
          </div>
          
          <!-- Custom checkbox styling since we don't have a FormCheckbox component -->
          <div class="checkbox-container">
            <label for="is_active" class="checkbox-label">
              <input 
                type="checkbox" 
                id="is_active" 
                v-model="service.is_active" 
                class="checkbox-input"
              />
              <span class="checkbox-text">Active</span>
            </label>
          </div>
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save') }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType, nextTick } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';
import { createServiceCatalog, updateServiceCatalog } from '@/services/serviceCatalogService';

interface ServiceCatalog {
  id?: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
}

export default defineComponent({
  name: 'ServiceCatalogModal',
  components: {
    BaseAddEditModal,
    FormInput,
    FormTextarea
  },
  props: {
    existingService: {
      type: Object as PropType<ServiceCatalog | null>,
      default: null,
    },
  },
  emits: ['close', 'serviceCreated', 'serviceUpdated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const service = ref<ServiceCatalog>({
      name: '',
      description: '',
      price: 0,
      is_active: true,
    });
    const validation = ref<Record<string, string | null>>({});
    
    // Autofocus first field on open
    nextTick(() => {
      const el = document.getElementById('name');
      if (el) el.focus();
    });

    watch(() => props.existingService, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        service.value = { ...newVal };
      } else {
        isEditing.value = false;
        service.value = {
          name: '',
          description: '',
          price: 0,
          is_active: true,
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
          validation.value.name = !service.value.name ? 'Name is required.' : null;
          break;
        case 'price':
          if (service.value.price === undefined || service.value.price === null) {
            validation.value.price = 'Price is required.';
          } else if (service.value.price < 0) {
            validation.value.price = 'Price cannot be negative.';
          } else {
            validation.value.price = null;
          }
          break;
        case 'description':
          validation.value.description = service.value.description && service.value.description.length > 200 ? 
            'Description is too long (max 200 characters).' : null;
          break;
      }
    }
    
    function validateAll() {
      validateField('name');
      validateField('price');
      validateField('description');
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
        if (isEditing.value && service.value.id) {
          const updated = await updateServiceCatalog(service.value.id, service.value, token);
          emit('serviceUpdated', updated.data);
          successMessage.value = 'Service updated successfully!';
        } else {
          const created = await createServiceCatalog(service.value, token);
          emit('serviceCreated', created.data);
          successMessage.value = 'Service created successfully!';
        }
        setTimeout(() => { 
          successMessage.value = ''; 
          emit('close'); 
        }, 1200);
      } catch (err: any) {
        errorMessage.value = err.message || 'Failed to save service.';
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      service,
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0rem 1.8rem; /* Adjusted gap to rely on component's internal margin-bottom */
  margin-bottom: 0.2rem; /* Adjusted margin */
}

.full-width-group {
  grid-column: 1 / -1;
  /* margin-top: 1.2rem; */ /* May not be needed if form-group has margin-bottom */
}

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

.success-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #c6f6d5; /* Green-200 */
  color: #2f855a; /* Green-700 */
  border: 1px solid #9ae6b4; /* Green-300 */
  border-radius: 0.375rem; /* Rounded corners */
  text-align: center;
}

/* Custom checkbox styling */
.checkbox-container {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.checkbox-input {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
}

.checkbox-text {
  margin-top: 1px; /* Subtle alignment adjustment */
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
