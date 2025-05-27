<template>
  <div class="add-medication-item-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit" class="medication-item-form">
        <div class="form-scrollable-content">
          <div class="form-grid">
            <div class="form-group full-span">
              <label for="name">Medication Name *</label>
              <input type="text" id="name" v-model="item.name" required />
            </div>
            <div class="form-group">
              <label for="generic_name">Generic Name</label>
              <input type="text" id="generic_name" v-model="item.generic_name" />
            </div>
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" v-model="item.category_id" required>
                <option disabled value="">Select Category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="supplier">Supplier</label>
              <select id="supplier" v-model="item.supplier_id">
                <option value="">None</option>
                <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="form">Form *</label>
              <select id="form" v-model="item.form" required>
                <option disabled value="">Select Form</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Cream">Cream</option>
                <option value="Drops">Drops</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="strength">Strength (e.g., 250mg)</label>
              <input type="text" id="strength" v-model="item.strength" />
            </div>
            <div class="form-group">
              <label for="unit_of_measure">Unit of Measure *</label>
              <select id="unit_of_measure" v-model="item.unit_of_measure" required>
                <option disabled value="">Select Unit</option>
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="IU">IU</option>
                <option value="mcg">mcg</option>
                <option value="Each">Each</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reorder_level">Reorder Level</label>
              <input type="number" id="reorder_level" v-model.number="item.reorder_level" min="0" />
            </div>
          </div>

          <div class="form-group notes-group full-span">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="item.notes" rows="3"></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Save' }} Item</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch } from 'vue';
import {
  type MedicationItem, type MedicationCategory, type Supplier, // Added type keyword
  createMedicationItem, updateMedicationItem, 
  fetchMedicationCategories, fetchSuppliers
} from '@/services/pharmacyService';
import store from '@/store';

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
    const isEditing = ref(false);
    const formTitle = ref('Add New Medication Item');

    const loadDropdownData = async () => {
      try {
        // Assuming token might be needed for these in a real app, though dummy service doesn't use it
        const token = store.state.token;
        categories.value = await fetchMedicationCategories(token);
        suppliers.value = await fetchSuppliers(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load categories/suppliers: ${error.message}`;
      }
    };

    watch(() => props.existingItem, (newItemData) => {
      if (newItemData) {
        isEditing.value = true;
        formTitle.value = 'Edit Medication Item';
        // Map existingItem to the form model, excluding non-form fields
        const { id, created_at, updated_at, category_name, supplier_name, current_stock_level, ...formData } = newItemData;
        item.value = { ...formData };
      } else {
        isEditing.value = false;
        formTitle.value = 'Add New Medication Item';
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
    }, { immediate: true, deep: true });

    onMounted(loadDropdownData);

    const handleSubmit = async () => {
      errorMessage.value = '';
      // Basic Validation
      if (!item.value.name.trim()) {
        errorMessage.value = 'Medication Name is required.';
        return;
      }
      if (!item.value.category_id) {
        errorMessage.value = 'Category is required.';
        return;
      }
      if (!item.value.form) {
        errorMessage.value = 'Form is required.';
        return;
      }
      if (!item.value.unit_of_measure) {
        errorMessage.value = 'Unit of Measure is required.';
        return;
      }

      const token = store.state.token;
      if (!token) {
        errorMessage.value = 'User not authenticated.';
        return;
      }

      try {
        if (isEditing.value && props.existingItem?.id) {
          const updated = await updateMedicationItem(props.existingItem.id, item.value, token);
          emit('itemUpdated', updated);
        } else {
          const newItem = await createMedicationItem(item.value, token);
          emit('itemAdded', newItem);
        }
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to save medication item: ${error.message}`;
      }
    };

    return {
      item,
      categories,
      suppliers,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
    };
  },
});
</script>

<style scoped>
.add-medication-item-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 750px; 
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.medication-item-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}
.form-scrollable-content {
  overflow-y: auto;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  margin-right: -1rem;
  flex-grow: 1;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-group.full-span {
  grid-column: 1 / -1;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.notes-group textarea {
  min-height: 80px;
  resize: vertical;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.submit-btn, .cancel-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
.submit-btn { background: var(--primary-blue); color: var(--white); }
.submit-btn:hover { background: var(--teal); }
.cancel-btn { background: #ccc; color: #333; }
.cancel-btn:hover { background: #b0b0b0; }
.error-message { color: red; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
