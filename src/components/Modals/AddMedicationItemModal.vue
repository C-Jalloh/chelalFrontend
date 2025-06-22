<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>
      {{ isEditing ? 'Edit Medication Item' : 'Add Medication Item' }}
    </template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Medication Item Information</legend>
        <div class="form-section"><span class="section-title">Basic Information</span></div>
        <div class="form-grid">
          <FormInput
            id="name"
            label="Medication Name"
            v-model="item.name"
            :required="true"
            placeholder="Enter medication name"
            :maxlength="100"
            :errorMessage="validation.name"
            @blur="validateField('name')"
            @input="validateField('name')"
            :autofocus="true"
          />

          <FormInput
            id="generic_name"
            label="Generic Name"
            v-model="item.generic_name"
            placeholder="Enter generic name"
            :maxlength="100"
            :errorMessage="validation.generic_name"
            @blur="validateField('generic_name')"
            @input="validateField('generic_name')"
          />

          <FormSelect
            id="category"
            label="Category"
            v-model="item.category_id"
            :options="categoryOptions"
            :required="true"
            placeholder="Select Category"
            :errorMessage="validation.category_id"
            @blur="validateField('category_id')"
            @change="validateField('category_id')"
          />

          <FormSelect
            id="supplier"
            label="Supplier"
            v-model="item.supplier_id"
            :options="supplierOptions"
            placeholder="None"
            :errorMessage="validation.supplier_id"
            @blur="validateField('supplier_id')"
            @change="validateField('supplier_id')"
          />

          <FormSelect
            id="form"
            label="Form"
            v-model="item.form"
            :options="formOptions"
            :required="true"
            placeholder="Select Form"
            :errorMessage="validation.form"
            @blur="validateField('form')"
            @change="validateField('form')"
          />

          <FormInput
            id="strength"
            label="Strength (e.g., 250mg)"
            v-model="item.strength"
            placeholder="Enter strength"
            :maxlength="50"
            :errorMessage="validation.strength"
            @blur="validateField('strength')"
            @input="validateField('strength')"
          />

          <FormSelect
            id="unit_of_measure"
            label="Unit of Measure"
            v-model="item.unit_of_measure"
            :options="unitOptions"
            :required="true"
            placeholder="Select Unit"
            :errorMessage="validation.unit_of_measure"
            @blur="validateField('unit_of_measure')"
            @change="validateField('unit_of_measure')"
          />

          <FormInput
            id="reorder_level"
            label="Reorder Level"
            type="number"
            v-model="item.reorder_level"
            :errorMessage="validation.reorder_level"
            @blur="validateField('reorder_level')"
            @input="validateField('reorder_level')"
          />
        </div>
        
        <div class="form-section"><span class="section-title">Additional Information <span class="optional">(optional)</span></span></div>
        <div class="form-group full-width-group">
          <FormTextarea
            id="notes"
            label="Notes"
            v-model="item.notes"
            placeholder="Enter additional information about this medication"
            :maxlength="500"
            :rows="3"
            :errorMessage="validation.notes"
            helpText="Optional. Max 500 characters."
            @blur="validateField('notes')"
            @input="validateField('notes')"
          />
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save') }} Item</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import {
  type MedicationItem, type MedicationCategory, type Supplier,
  createMedicationItem, updateMedicationItem,
  fetchSuppliers
} from '@/services/pharmacyService';
import store from '@/store';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';

interface MedicationItemFormData extends Omit<MedicationItem, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'supplier_name' | 'current_stock_level'> {
  // any additional form-specific fields can be added here if needed
}

export default defineComponent({
  name: 'AddMedicationItemModal',
  props: {
    existingItem: {
      type: Object as PropType<MedicationItem | null>,
      default: null,
    },
  },
  emits: ['close', 'itemAdded', 'itemUpdated'],
  components: { 
    BaseAddEditModal,
    FormInput,
    FormSelect,
    FormTextarea
  },
  setup(props, { emit }) {
    const item = ref<MedicationItemFormData>({
      name: '',
      generic_name: '',
      category_id: '',
      supplier_id: '',
      form: 'Tablet', // Default form
      strength: '',
      unit_of_measure: 'Each', // Default unit
      reorder_level: 0,
      notes: '',
    });

    const categories = ref<MedicationCategory[]>([]);
    const suppliers = ref<Supplier[]>([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const isEditing = ref(false);
    const validation = ref<Record<string, string | null>>({});

    const categoryOptions = computed(() => {
      return categories.value.map(cat => ({
        value: cat.id,
        text: cat.name
      }));
    });

    const supplierOptions = computed(() => {
      return [
        { value: '', text: 'None' },
        ...suppliers.value.map(sup => ({
          value: sup.id,
          text: sup.name
        }))
      ];
    });

    const formOptions = [
      { value: 'Tablet', text: 'Tablet' },
      { value: 'Capsule', text: 'Capsule' },
      { value: 'Syrup', text: 'Syrup' },
      { value: 'Injection', text: 'Injection' },
      { value: 'Ointment', text: 'Ointment' },
      { value: 'Cream', text: 'Cream' },
      { value: 'Drops', text: 'Drops' },
      { value: 'Other', text: 'Other' }
    ];

    const unitOptions = [
      { value: 'mg', text: 'mg' },
      { value: 'ml', text: 'ml' },
      { value: 'g', text: 'g' },
      { value: 'IU', text: 'IU' },
      { value: 'mcg', text: 'mcg' },
      { value: 'Each', text: 'Each' }
    ];

    function validateField(field: string) {
      switch (field) {
        case 'name':
          validation.value.name = !item.value.name.trim() ? 'Medication Name is required.' : null;
          break;
        case 'category_id':
          validation.value.category_id = !item.value.category_id ? 'Category is required.' : null;
          break;
        case 'form':
          validation.value.form = !item.value.form ? 'Form is required.' : null;
          break;
        case 'unit_of_measure':
          validation.value.unit_of_measure = !item.value.unit_of_measure ? 'Unit of Measure is required.' : null;
          break;
        case 'generic_name':
          if (item.value.generic_name && item.value.generic_name.length > 100)
            validation.value.generic_name = 'Generic name is too long.';
          else validation.value.generic_name = null;
          break;
        case 'strength':
          if (item.value.strength && item.value.strength.length > 50)
            validation.value.strength = 'Strength is too long.';
          else validation.value.strength = null;
          break;
        case 'reorder_level':
          if (item.value.reorder_level < 0)
            validation.value.reorder_level = 'Reorder level cannot be negative.';
          else validation.value.reorder_level = null;
          break;
        case 'notes':
          if (item.value.notes && item.value.notes.length > 500)
            validation.value.notes = 'Notes are too long (max 500 characters).';
          else validation.value.notes = null;
          break;
      }
    }

    function validateAll() {
      validateField('name');
      validateField('category_id');
      validateField('form');
      validateField('unit_of_measure');
      validateField('generic_name');
      validateField('strength');
      validateField('reorder_level');
      validateField('notes');
      return Object.values(validation.value).every(v => !v);
    }

    // Dummy categories for demo
    const DUMMY_CATEGORIES = [
      { id: 1, name: 'Analgesics', description: 'Pain relievers' },
      { id: 2, name: 'Antibiotics', description: 'Antibacterial drugs' },
      { id: 3, name: 'Antipyretics', description: 'Fever reducers' },
      { id: 4, name: 'Antimalarials', description: 'Malaria treatment' },
      { id: 5, name: 'Vitamins', description: 'Nutritional supplements' },
      { id: 6, name: 'Antihypertensives', description: 'Blood pressure control' },
    ];

    const loadCategoriesAndSuppliers = async () => {
      // Always use dummy categories for demo
      categories.value = DUMMY_CATEGORIES;
      try {
        suppliers.value = await fetchSuppliers();
      } catch (error) {
        suppliers.value = [];
        console.error('Failed to load suppliers:', error);
      }
    };

    onMounted(() => {
      loadCategoriesAndSuppliers();
    });

    watch(() => props.existingItem, (newItemData) => {
      if (newItemData) {
        isEditing.value = true;
        // Map existingItem to the form model, excluding non-form fields
        const { id, created_at, updated_at, category_name, supplier_name, current_stock_level, ...formData } = newItemData;
        item.value = { ...formData };
      } else {
        isEditing.value = false;
        // Reset form for new item
        item.value = {
          name: '',
          generic_name: '',
          category_id: '',
          supplier_id: '',
          form: 'Tablet',
          strength: '',
          unit_of_measure: 'Each',
          reorder_level: 0,
          notes: '',
        };
      }
      validation.value = {};
      errorMessage.value = '';
      successMessage.value = '';
    }, { immediate: true, deep: true });

    async function handleSubmit() {
      errorMessage.value = '';
      successMessage.value = '';
      
      if (!validateAll()) {
        errorMessage.value = 'Please correct the highlighted errors.';
        return;
      }

      loading.value = true;
      try {
        errorMessage.value = '';
        successMessage.value = '';
        if (isEditing.value && props.existingItem) {
          const updated = await updateMedicationItem(props.existingItem.id, item.value);
          emit('itemUpdated', updated);
          successMessage.value = 'Medication item updated successfully!';
        } else {
          const newItem = await createMedicationItem(item.value);
          emit('itemAdded', newItem);
          successMessage.value = 'Medication item added successfully!';
        }
        setTimeout(() => emit('close'), 1200);
      } catch (error: any) {
        errorMessage.value = error.message || 'Failed to save medication item.';
      } finally {
        loading.value = false;
      }
    }

    return {
      item,
      categoryOptions,
      supplierOptions,
      formOptions,
      unitOptions,
      errorMessage,
      successMessage,
      loading,
      handleSubmit,
      isEditing,
      validation,
      validateField,
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

.optional {
  font-size: 0.8rem;
  font-weight: normal;
  color: #718096; /* Medium gray text */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0rem 1.8rem; /* Adjusted gap to rely on component's internal margin-bottom */
  margin-bottom: 0.2rem; /* Adjusted margin */
}

.full-width-group {
  grid-column: 1 / -1;
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

/* Add some breathing room at the bottom of the modal content */
form > div:last-child {
  margin-bottom: 1rem;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0rem; /* Adjusted gap */
  }
}
</style>
