<template>
  <div class="create-grn-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit" class="grn-form">
        <div class="form-scrollable-content">
          <div class="form-grid top-grid">
            <div class="form-group">
              <label for="supplier">Supplier *</label>
              <select id="supplier" v-model="grn.supplier_id" @change="handleSupplierChange" required>
                <option disabled value="">Select Supplier</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="po">Link to Purchase Order (Optional)</label>
              <select id="po" v-model="grn.purchase_order_id" @change="handlePOSelection">
                <option value="">None (Direct GRN)</option>
                <option v-for="order in purchaseOrdersForSupplier" :key="order.id" :value="order.id">
                  PO #{{ order.id }} - {{ order.order_date }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="grn_date">GRN Date *</label>
              <input type="date" id="grn_date" v-model="grn.grn_date" required />
            </div>
            <div class="form-group">
              <label for="invoice_number">Supplier Invoice No.</label>
              <input type="text" id="invoice_number" v-model="grn.invoice_number" />
            </div>
          </div>

          <h4 class="section-title">Received Items</h4>
          <div v-for="(item, index) in grn.items" :key="index" class="grn-item-row">
            <div class="form-group item-medication">
              <label :for="`medication-${index}`">Medication Item *</label>
              <select :id="`medication-${index}`" v-model="item.medication_item_id" required :disabled="!!grn.purchase_order_id">
                <option disabled value="">Select Medication</option>
                <option v-for="med in medicationItems" :key="med.id" :value="med.id">
                  {{ med.name }} ({{ med.strength || 'N/A' }})
                </option>
              </select>
            </div>
            <div class="form-group item-batch">
              <label :for="`batch-${index}`">Batch Number *</label>
              <input type="text" :id="`batch-${index}`" v-model="item.batch_number" required />
            </div>
            <div class="form-group item-expiry">
              <label :for="`expiry-${index}`">Expiry Date *</label>
              <input type="date" :id="`expiry-${index}`" v-model="item.expiry_date" required />
            </div>
            <div class="form-group item-qty">
              <label :for="`qty-${index}`">Qty Received *</label>
              <input type="number" :id="`qty-${index}`" v-model.number="item.quantity_received" min="1" required @input="updateItemTotalCost(index)"/>
            </div>
            <div class="form-group item-cost">
              <label :for="`cost-${index}`">Unit Cost *</label>
              <input type="number" step="0.01" :id="`cost-${index}`" v-model.number="item.unit_cost" min="0" required @input="updateItemTotalCost(index)"/>
            </div>
            <div class="form-group item-total">
              <label>Line Total</label>
              <input type="text" :value="formatCurrency(item.total_cost)" disabled />
            </div>
            <button type="button" @click="removeGRNItem(index)" class="remove-item-btn" :disabled="!!grn.purchase_order_id && grn.items.length === 1"> &times;</button>
          </div>
          <button type="button" @click="addGRNItem" class="add-item-btn" :disabled="!!grn.purchase_order_id">+ Add Item Manually</button>

          <div class="form-group notes-group">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="grn.notes" rows="2"></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">Create GRN</button> <!-- Editing GRN is complex, typically not done -->
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType } from 'vue';
import {
  type GoodsReceivedNote, type GRNItem, type MedicationItem, type Supplier, type PurchaseOrder, // Added type keyword
  createGRN, 
  fetchSuppliers, fetchMedicationItems, fetchPurchaseOrders, getPurchaseOrderById
} from '@/services/pharmacyService';
import store from '@/store';

interface GRNItemFormData extends Omit<GRNItem, 'id' | 'grn_id' | 'medication_name' | 'total_cost'> {
  unit_cost: number;
  total_cost?: number; // Calculated client-side
}

interface GRNFormData extends Omit<GoodsReceivedNote, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'received_by_user_name' | 'items'> {
  items: GRNItemFormData[];
}

export default defineComponent({
  name: 'CreateGRNModal',
  props: {
    targetPOId: { // To pre-fill from a specific PO
      type: [String, Number] as PropType<string | number | null>,
      default: null,
    },
  },
  emits: ['close', 'grnCreated'],
  setup(props, { emit }) {
    const grn = ref<GRNFormData>({
      supplier_id: '',
      purchase_order_id: props.targetPOId || '',
      grn_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      notes: '',
      items: [],
      // received_by_user_id will be set from store or backend
    });

    const suppliers = ref<Supplier[]>([]);
    const allPurchaseOrders = ref<PurchaseOrder[]>([]);
    const purchaseOrdersForSupplier = ref<PurchaseOrder[]>([]);
    const medicationItems = ref<MedicationItem[]>([]); // For manual item selection
    const errorMessage = ref('');
    const formTitle = ref('Create Goods Received Note');

    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        suppliers.value = await fetchSuppliers(token);
        allPurchaseOrders.value = await fetchPurchaseOrders(token);
        medicationItems.value = await fetchMedicationItems(token);

        if (props.targetPOId) {
            const po = await getPurchaseOrderById(props.targetPOId, token);
            if (po) {
                grn.value.supplier_id = po.supplier_id;
                handleSupplierChange(); // Filter POs for this supplier
                grn.value.purchase_order_id = po.id; // Ensure it's selected
                handlePOSelection(); // Pre-fill items
            }
        }
      } catch (error: any) { errorMessage.value = `Failed to load initial data: ${error.message}`; }
    };

    const handleSupplierChange = () => {
        if(grn.value.supplier_id) {
            purchaseOrdersForSupplier.value = allPurchaseOrders.value.filter(po => po.supplier_id === grn.value.supplier_id && (po.status === 'Ordered' || po.status === 'Partially Received'));
        } else {
            purchaseOrdersForSupplier.value = [];
        }
        // If current PO doesn't belong to new supplier, reset it
        if (grn.value.purchase_order_id && !purchaseOrdersForSupplier.value.find(po => po.id === grn.value.purchase_order_id)) {
            grn.value.purchase_order_id = '';
            grn.value.items = [];
            addGRNItem(); // Add one empty item if PO is cleared
        }
    };

    const handlePOSelection = async () => {
      if (grn.value.purchase_order_id) {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        const selectedPO = await getPurchaseOrderById(grn.value.purchase_order_id, token);
        if (selectedPO) {
          grn.value.supplier_id = selectedPO.supplier_id; // Ensure supplier is synced
          grn.value.items = selectedPO.items.map(poItem => ({
            medication_item_id: poItem.medication_item_id,
            purchase_order_item_id: poItem.id,
            batch_number: '', // User to fill
            expiry_date: '', // User to fill
            quantity_received: poItem.quantity_ordered, // Default to ordered qty
            unit_cost: poItem.unit_cost_estimated || 0, // Default to estimated cost
            total_cost: (poItem.quantity_ordered || 0) * (poItem.unit_cost_estimated || 0),
          }));
        }
      } else {
        grn.value.items = [];
        addGRNItem(); // Add one empty item if no PO selected
      }
    };

    const addGRNItem = () => {
      grn.value.items.push({
        medication_item_id: '',
        batch_number: '',
        expiry_date: '',
        quantity_received: 1,
        unit_cost: 0,
        total_cost: 0,
      });
    };

    const removeGRNItem = (index: number) => {
      // Prevent removing all items if linked to a PO, unless it's the only one and user wants to switch to manual
      if (grn.value.purchase_order_id && grn.value.items.length === 1) {
          alert("Cannot remove the last item when linked to a PO. Clear PO selection to add items manually.");
          return;
      }
      grn.value.items.splice(index, 1);
    };

    const updateItemTotalCost = (index: number) => {
      const item = grn.value.items[index];
      item.total_cost = (item.quantity_received || 0) * (item.unit_cost || 0);
    };
    
    onMounted(() => {
      loadInitialData();
      if (grn.value.items.length === 0 && !props.targetPOId) {
        addGRNItem(); // Start with one empty item row for new GRNs not linked to PO initially
      }
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!grn.value.supplier_id) { errorMessage.value = 'Please select a supplier.'; return; }
      if (grn.value.items.length === 0) { errorMessage.value = 'Please add at least one item.'; return; }
      for (const item of grn.value.items) {
        if (!item.medication_item_id || !item.batch_number.trim() || !item.expiry_date || item.quantity_received <= 0 || item.unit_cost < 0) {
          errorMessage.value = 'All items must have Medication, Batch No., Expiry Date, valid Qty Received, and valid Unit Cost.'; return;
        }
      }

      const token = store.state.token;
      if (!token) { errorMessage.value = 'User not authenticated.'; return; }

      const grnToSubmit: GRNFormData & { received_by_user_id?: string | number } = {
        ...grn.value,
        received_by_user_id: store.state.user?.id || 'user_placeholder',
      };

      try {
        const newGRN = await createGRN(grnToSubmit, token);
        emit('grnCreated', newGRN);
        emit('close');
      } catch (error: any) { errorMessage.value = `Failed to create GRN: ${error.message}`; }
    };

    return {
      grn,
      suppliers,
      allPurchaseOrders,
      purchaseOrdersForSupplier,
      medicationItems,
      errorMessage,
      handleSubmit,
      formTitle,
      addGRNItem,
      removeGRNItem,
      updateItemTotalCost,
      formatCurrency,
      handleSupplierChange,
      handlePOSelection,
    };
  },
});
</script>

<style scoped>
.create-grn-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-content {
  background: #fff; color: #111; padding: 1.5rem 2rem; border-radius: 12px;
  width: 90%; max-width: 950px; /* Wider for GRN items */
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex; flex-direction: column; max-height: 90vh;
}
.modal-title { color: var(--primary-blue); font-weight: 600; margin-bottom: 1.5rem; text-align: center; font-size: 1.6rem; flex-shrink: 0; }
.grn-form { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
.form-scrollable-content { overflow-y: auto; padding: 0.5rem 1rem 0.5rem 0.5rem; margin-right: -1rem; flex-grow: 1; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 1.5rem; }
.top-grid { margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; color: #333; font-size: 0.9rem; }
.form-group input, .form-group select, .form-group textarea {
  padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; width: 100%; box-sizing: border-box;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: var(--primary-blue); box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.section-title {
  font-size: 1.1rem; color: var(--primary-blue); font-weight: 500; margin-top: 1.5rem; margin-bottom: 1rem;
  padding-bottom: 0.3rem; border-bottom: 1px solid #e0e0e0;
}
.grn-item-row {
  display: grid; grid-template-columns: 2.5fr repeat(4, 1fr) auto; /* Med, Batch, Exp, Qty, Cost, Total, Btn */
  gap: 0.8rem; align-items: flex-end; margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px dashed #eee;
}
.grn-item-row:last-of-type { border-bottom: none; }
.item-medication { grid-column: 1 / 2; }
.item-batch { grid-column: 2 / 3; }
.item-expiry { grid-column: 3 / 4; }
.item-qty { grid-column: 4 / 5; }
.item-cost { grid-column: 5 / 6; }
.item-total { grid-column: 6 / 7; }
.remove-item-btn {
  background: #ff4d4f; color: white; border: none; border-radius: 4px; padding: 0.5rem 0.7rem;
  cursor: pointer; font-size: 1rem; line-height: 1; height: fit-content; margin-bottom: 0.6rem;
}
.add-item-btn {
  background: var(--teal); color: white; border: none; padding: 0.6rem 1rem; border-radius: 4px;
  cursor: pointer; margin-top: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; width: fit-content;
}
.notes-group textarea { min-height: 60px; resize: vertical; }
.form-actions {
  margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0;
  padding-top: 1rem; border-top: 1px solid #eee;
}
.submit-btn, .cancel-btn { padding: 0.7rem 1.5rem; border-radius: 4px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; border: none; }
.submit-btn { background: var(--primary-blue); color: var(--white); }
.submit-btn:hover { background: var(--teal); }
.cancel-btn { background: #ccc; color: #333; }
.cancel-btn:hover { background: #b0b0b0; }
.error-message { color: red; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
