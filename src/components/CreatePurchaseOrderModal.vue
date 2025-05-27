<template>
  <div class="create-po-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit" class="po-form">
        <div class="form-scrollable-content">
          <div class="form-grid top-grid">
            <div class="form-group">
              <label for="supplier">Supplier *</label>
              <select id="supplier" v-model="purchaseOrder.supplier_id" required>
                <option disabled value="">Select Supplier</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" v-model="purchaseOrder.status" required>
                <option value="Draft">Draft</option>
                <option value="Ordered">Ordered</option>
                <!-- Other statuses might be set via different actions -->
              </select>
            </div>
            <div class="form-group">
              <label for="order_date">Order Date *</label>
              <input type="date" id="order_date" v-model="purchaseOrder.order_date" required />
            </div>
            <div class="form-group">
              <label for="expected_delivery_date">Expected Delivery Date</label>
              <input type="date" id="expected_delivery_date" v-model="purchaseOrder.expected_delivery_date" />
            </div>
          </div>

          <h4 class="section-title">Order Items</h4>
          <div v-for="(item, index) in purchaseOrder.items" :key="index" class="po-item-row">
            <div class="form-group item-medication">
              <label :for="`medication-${index}`">Medication Item *</label>
              <select :id="`medication-${index}`" v-model="item.medication_item_id" @change="updatePOItemDetails(index)" required>
                <option disabled value="">Select Medication</option>
                <option v-for="med in medicationItems" :key="med.id" :value="med.id">
                  {{ med.name }} ({{ med.strength || 'N/A' }})
                </option>
              </select>
            </div>
            <div class="form-group item-qty">
              <label :for="`qty-${index}`">Qty Ordered *</label>
              <input type="number" :id="`qty-${index}`" v-model.number="item.quantity_ordered" @input="updatePOItemDetails(index)" min="1" required />
            </div>
            <div class="form-group item-cost">
              <label :for="`cost-${index}`">Est. Unit Cost</label>
              <input type="number" step="0.01" :id="`cost-${index}`" v-model.number="item.unit_cost_estimated" @input="updatePOItemDetails(index)" />
            </div>
            <div class="form-group item-total">
              <label>Est. Line Total</label>
              <input type="text" :value="formatCurrency(item.total_cost_estimated)" disabled />
            </div>
            <button type="button" @click="removePOItem(index)" class="remove-item-btn">&times;</button>
          </div>
          <button type="button" @click="addPOItem" class="add-item-btn">+ Add Medication Item</button>

          <div class="total-amount-section">
            <strong>Total Estimated Cost: {{ formatCurrency(calculatedTotalEstimatedCost) }}</strong>
          </div>

          <div class="form-group notes-group">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="purchaseOrder.notes" rows="2"></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Create' }} Purchase Order</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import {
  type PurchaseOrder, type PurchaseOrderItem, type MedicationItem, type Supplier, // Added type keyword
  createPurchaseOrder, updatePurchaseOrder, 
  fetchSuppliers, fetchMedicationItems
} from '@/services/pharmacyService';
import store from '@/store';

// Type for form data for a single PO item
interface POItemFormData extends Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'medication_name' | 'total_cost_estimated'> {
  unit_cost_estimated?: number;
  total_cost_estimated?: number; // Calculated client-side
}

// Type for the main PO form data
interface POFormData extends Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'created_by_user_name' | 'total_estimated_cost' | 'items'> {
  items: POItemFormData[];
}

export default defineComponent({
  name: 'CreatePurchaseOrderModal',
  props: {
    existingPO: {
      type: Object as PropType<PurchaseOrder | null>,
      default: null,
    },
  },
  emits: ['close', 'poCreated', 'poUpdated'],
  setup(props, { emit }) {
    const purchaseOrder = ref<POFormData>({
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      status: 'Draft',
      notes: '',
      items: [],
      // created_by_user_id will be set from store or backend
    });

    const suppliers = ref<Supplier[]>([]);
    const medicationItems = ref<MedicationItem[]>([]); // For item selection
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Create New Purchase Order');

    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };

    const calculatedTotalEstimatedCost = computed(() => {
      return purchaseOrder.value.items.reduce((sum, item) => sum + (item.total_cost_estimated || 0), 0);
    });

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        suppliers.value = await fetchSuppliers(token);
        medicationItems.value = await fetchMedicationItems(token); // Fetch all medication items
      } catch (error: any) { errorMessage.value = `Failed to load data: ${error.message}`; }
    };

    const addPOItem = () => {
      purchaseOrder.value.items.push({
        medication_item_id: '',
        quantity_ordered: 1,
        unit_cost_estimated: 0,
        total_cost_estimated: 0,
      });
    };

    const removePOItem = (index: number) => {
      purchaseOrder.value.items.splice(index, 1);
    };

    const updatePOItemDetails = (index: number) => {
      const item = purchaseOrder.value.items[index];
      // If medication_item_id changes, you might want to fetch its default price or info here
      // For now, we assume unit_cost_estimated is manually entered or pre-filled if editing
      item.total_cost_estimated = (item.quantity_ordered || 0) * (item.unit_cost_estimated || 0);
    };

    watch(() => props.existingPO, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Purchase Order';
        const { items, supplier_name, created_by_user_name, total_estimated_cost, ...poData } = newVal;
        purchaseOrder.value = {
            ...poData,
            items: items.map(i => ({ 
                medication_item_id: i.medication_item_id, 
                quantity_ordered: i.quantity_ordered, 
                unit_cost_estimated: i.unit_cost_estimated, 
                total_cost_estimated: i.total_cost_estimated 
            })),
        };
      } else {
        isEditing.value = false;
        formTitle.value = 'Create New Purchase Order';
        purchaseOrder.value = {
          supplier_id: '',
          order_date: new Date().toISOString().split('T')[0],
          expected_delivery_date: '',
          status: 'Draft',
          notes: '',
          items: [],
        };
      }
    }, { immediate: true, deep: true });

    onMounted(() => {
      loadInitialData();
      if (!props.existingPO && purchaseOrder.value.items.length === 0) {
        addPOItem(); // Start with one empty item row for new POs
      }
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!purchaseOrder.value.supplier_id) {
        errorMessage.value = 'Please select a supplier.'; return;
      }
      if (purchaseOrder.value.items.length === 0) {
        errorMessage.value = 'Please add at least one item to the purchase order.'; return;
      }
      if (purchaseOrder.value.items.some(item => !item.medication_item_id || item.quantity_ordered <= 0)) {
        errorMessage.value = 'All items must have a medication selected and quantity greater than 0.'; return;
      }

      const token = store.state.token;
      if (!token) { errorMessage.value = 'User not authenticated.'; return; }

      // Prepare data for submission, ensuring created_by_user_id is handled
      const poToSubmit: POFormData & { created_by_user_id?: string | number } = {
        ...purchaseOrder.value,
        created_by_user_id: store.state.user?.id || 'user_placeholder', // Get actual user ID if available
      };

      try {
        if (isEditing.value && props.existingPO?.id) {
          const updated = await updatePurchaseOrder(props.existingPO.id, poToSubmit, token);
          emit('poUpdated', updated);
        } else {
          const newPO = await createPurchaseOrder(poToSubmit, token);
          emit('poCreated', newPO);
        }
        emit('close');
      } catch (error: any) { errorMessage.value = `Failed to save purchase order: ${error.message}`; }
    };

    return {
      purchaseOrder,
      suppliers,
      medicationItems,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
      addPOItem,
      removePOItem,
      updatePOItemDetails,
      formatCurrency,
      calculatedTotalEstimatedCost,
    };
  },
});
</script>

<style scoped>
.create-po-modal {
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
  max-width: 900px; /* Wider for PO items */
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
.po-form {
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
}
.top-grid {
  margin-bottom: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
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
.section-title {
  font-size: 1.1rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e0e0e0;
}
.po-item-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1.5fr 1.5fr auto;
  gap: 0.8rem;
  align-items: flex-end;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #eee;
}
.po-item-row:last-of-type {
  border-bottom: none;
}
.item-medication { grid-column: 1 / 2; }
.item-qty { grid-column: 2 / 3; }
.item-cost { grid-column: 3 / 4; }
.item-total { grid-column: 4 / 5; }
.remove-item-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  height: fit-content;
  margin-bottom: 0.6rem;
}
.add-item-btn {
  background: var(--teal);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  width: fit-content;
}
.total-amount-section {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--primary-blue);
  text-align: right;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
}
.notes-group textarea {
  min-height: 60px;
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
