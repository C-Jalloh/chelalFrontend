<template>
  <BaseAddEditModal
    :show="true"
    @close="$emit('close')"
    :error-message="errorMessage"
    :loading="loadingSubmit"
    @submit="handleSubmit"
  >
    <template #title>
      New Stock Adjustment
    </template>
    <template #default>
      <form @submit.prevent="handleSubmit" class="adjustment-form">
        <div class="form-scrollable-content">
          <div class="form-group">
            <label for="medication">Medication Item *</label>
            <select id="medication" v-model="adjustment.medication_item_id" required @change="handleMedicationChange">
              <option disabled value="">Select Medication</option>
              <option v-for="med in medicationItems" :key="med.id" :value="med.id">
                {{ med.name }} (Current Stock: {{ med.current_stock_level || 0 }})
              </option>
            </select>
          </div>
          <div class="form-group" v-if="availableBatches.length > 0">
            <label for="batch">Stock Batch (Batch No. - Expiry - Available Qty) *</label>
            <select id="batch" v-model="adjustment.stock_batch_id" required @change="handleBatchSelection">
              <option disabled value="">Select Batch</option>
              <option v-for="batch in availableBatches" :key="batch.id" :value="batch.id">
                {{ batch.batch_number }} - Exp: {{ batch.expiry_date }} - Avail: {{ batch.current_quantity }}
              </option>
            </select>
          </div>
          <div v-else-if="adjustment.medication_item_id && !loadingBatches" class="form-group info-text">
            No available batches for the selected medication to adjust.
          </div>
          <div v-if="loadingBatches" class="form-group info-text">Loading batches...</div>
          <div class="form-group" v-if="selectedBatchInfo">
            <p class="batch-info-text">Selected Batch: {{selectedBatchInfo.batch_number}} | Current Qty: {{selectedBatchInfo.current_quantity}}</p>
          </div>
          <div class="form-group">
            <label for="adjustment_type">Adjustment Type *</label>
            <select id="adjustment_type" v-model="adjustment.adjustment_type" required>
              <option disabled value="">Select Type</option>
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Physical Count - Increase">Physical Count - Increase</option>
              <option value="Physical Count - Decrease">Physical Count - Decrease</option>
              <option value="Returned to Supplier">Returned to Supplier</option>
              <option value="Internal Transfer">Internal Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="quantity_adjusted">Quantity Adjusted *</label>
            <input type="number" id="quantity_adjusted" v-model.number="adjustment.quantity_adjusted" required title="Enter a positive number for increase, negative for decrease."/>
            <small>Positive for increase (e.g., found stock), negative for decrease (e.g., damaged).</small>
          </div>
          <div class="form-group">
            <label for="adjustment_date">Adjustment Date *</label>
            <input type="datetime-local" id="adjustment_date" v-model="adjustment.adjustment_date" required />
          </div>
          <div class="form-group notes-group">
            <label for="reason">Reason / Notes (Required for most types)</label>
            <textarea id="reason" v-model="adjustment.reason" rows="3"></textarea>
          </div>
        </div>
      </form>
    </template>
    <template #submit-label>
      Save Adjustment
    </template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
  type StockAdjustment, type MedicationItem, type StockBatch, type StockAdjustmentType, // Added type keyword
  createStockAdjustment,
  fetchMedicationItems, fetchStockBatchesForItem
} from '@/services/pharmacyService';
import store from '@/store';
import BaseAddEditModal from './BaseAddEditModal.vue';

export default defineComponent({
  name: 'AddStockAdjustmentModal',
  emits: ['close', 'adjustmentCreated'],
  components: { BaseAddEditModal },
  setup(_, { emit }) {
    const adjustment = ref<Omit<StockAdjustment, 'id' | 'created_at' | 'medication_name' | 'batch_number' | 'adjusted_by_user_name'>>({
      medication_item_id: '',
      stock_batch_id: '',
      adjustment_type: 'Other' as StockAdjustmentType,
      quantity_adjusted: 0,
      adjustment_date: new Date().toISOString().slice(0, 16), // Defaults to now
      reason: '',
    });

    const medicationItems = ref<MedicationItem[]>([]);
    const availableBatches = ref<StockBatch[]>([]);
    const loadingBatches = ref(false);
    const loadingSubmit = ref(false);
    const errorMessage = ref('');

    const selectedBatchInfo = computed(() => {
        if(adjustment.value.stock_batch_id) {
            return availableBatches.value.find(b => b.id === adjustment.value.stock_batch_id);
        }
        return null;
    });

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        medicationItems.value = await fetchMedicationItems(token);
      } catch (error: any) { errorMessage.value = `Failed to load medication items: ${error.message}`; }
    };

    const handleMedicationChange = async () => {
      adjustment.value.stock_batch_id = ''; 
      availableBatches.value = [];
      if (adjustment.value.medication_item_id) {
        loadingBatches.value = true;
        try {
          const token = store.state.token;
          if (!token) { errorMessage.value = 'Auth token missing.'; loadingBatches.value = false; return; }
          // For adjustments, we might want to see all batches, even those with 0 qty if we are doing a count increase.
          availableBatches.value = await fetchStockBatchesForItem(adjustment.value.medication_item_id, token);
        } catch (error: any) {
          errorMessage.value = `Failed to load stock batches: ${error.message}`;
        } finally {
          loadingBatches.value = false;
        }
      }
    };
    
    const handleBatchSelection = () => { /* Future use if needed */ };

    onMounted(loadInitialData);

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!adjustment.value.medication_item_id) { errorMessage.value = 'Medication is required.'; return; }
      if (!adjustment.value.stock_batch_id) { errorMessage.value = 'Stock batch is required.'; return; }
      if (adjustment.value.quantity_adjusted === 0) { errorMessage.value = 'Quantity adjusted cannot be zero.'; return; }
      if (!adjustment.value.adjustment_type) { errorMessage.value = 'Adjustment type is required.'; return; }
      if (!adjustment.value.reason?.trim() && (adjustment.value.adjustment_type === 'Other' || adjustment.value.adjustment_type === 'Damaged' || adjustment.value.adjustment_type === 'Expired')) {
        errorMessage.value = 'Reason is required for the selected adjustment type.'; return;
      }

      const selectedBatch = availableBatches.value.find(b => b.id === adjustment.value.stock_batch_id);
      if (selectedBatch && (selectedBatch.current_quantity + adjustment.value.quantity_adjusted < 0) && adjustment.value.adjustment_type !== 'Physical Count - Increase') {
          // Allow physical count increase to make a negative batch positive, but other decreases shouldn't make it more negative than it is.
          // This logic might need refinement based on exact business rules for negative stock.
          if (adjustment.value.quantity_adjusted < 0 && (selectedBatch.current_quantity < Math.abs(adjustment.value.quantity_adjusted))) {
            errorMessage.value = `Adjustment quantity (${adjustment.value.quantity_adjusted}) exceeds available stock in batch (${selectedBatch.current_quantity}).`; return;
          }
      }

      loadingSubmit.value = true;
      const token = store.state.token;
      if (!token) { errorMessage.value = 'User not authenticated.'; loadingSubmit.value = false; return; }

      try {
        const adjToSubmit: Omit<StockAdjustment, 'id' | 'created_at' | 'medication_name' | 'batch_number' | 'adjusted_by_user_name'> = {
            ...adjustment.value,
            adjusted_by_user_id: store.state.user?.id || 'user_placeholder',
        };
        await createStockAdjustment(adjToSubmit, token);
        emit('adjustmentCreated');
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to save adjustment: ${error.message}`;
      } finally {
        loadingSubmit.value = false;
      }
    };

    return {
      adjustment,
      medicationItems,
      availableBatches,
      loadingBatches,
      loadingSubmit,
      errorMessage,
      handleSubmit,
      handleMedicationChange,
      handleBatchSelection,
      selectedBatchInfo,
      // Expose StockAdjustmentType for template if needed, or define options array
      adjustmentTypes: ['Damaged', 'Expired', 'Physical Count - Increase', 'Physical Count - Decrease', 'Returned to Supplier', 'Internal Transfer', 'Other'] as StockAdjustmentType[],
    };
  },
});
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-scrollable-content {
  overflow-y: auto;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  margin-right: -1rem;
  flex-grow: 1;
}
.info-text { font-style: italic; color: #555; margin-top: 0.5rem; }
.batch-info-text { font-size: 0.85rem; color: var(--primary-blue); margin-top: -0.5rem; margin-bottom: 1rem; }
.notes-group textarea { min-height: 60px; resize: vertical; }
</style>
