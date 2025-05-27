<template>
  <div class="medication-item-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Medication Item Details (ID: {{ item?.id }})</h3>
      <div class="modal-scrollable-content">
        <div v-if="!item">
          <p>No medication item data provided.</p>
        </div>
        <div v-else class="details-container">
          <div class="section">
            <h4 class="section-title">Basic Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Name:</span> <span class="value">{{ item.name }}</span></div>
              <div class="detail-item"><span class="label">Generic Name:</span> <span class="value">{{ item.generic_name || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Category:</span> <span class="value">{{ item.category_name || item.category_id }}</span></div>
              <div class="detail-item"><span class="label">Supplier:</span> <span class="value">{{ item.supplier_name || item.supplier_id || 'N/A' }}</span></div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">Specifications</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Form:</span> <span class="value">{{ item.form }}</span></div>
              <div class="detail-item"><span class="label">Strength:</span> <span class="value">{{ item.strength || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Unit of Measure:</span> <span class="value">{{ item.unit_of_measure }}</span></div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">Inventory Details</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Current Stock Level:</span> <span class="value">{{ item.current_stock_level !== null && item.current_stock_level !== undefined ? item.current_stock_level : 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Reorder Level:</span> <span class="value">{{ item.reorder_level !== null && item.reorder_level !== undefined ? item.reorder_level : 'N/A' }}</span></div>
            </div>
          </div>

          <!-- Stock Batches Section -->
          <div class="section">
            <h4 class="section-title">Stock Batches ({{ stockBatches.length }})</h4>
            <div v-if="loadingBatches" class="loading-text">Loading stock batches...</div>
            <div v-else-if="stockBatches.length > 0" class="batches-table-wrapper">
              <table class="batches-table">
                <thead>
                  <tr>
                    <th>Batch No.</th>
                    <th>Expiry</th>
                    <th>Qty Received</th>
                    <th>Current Qty</th>
                    <th>Supplier</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="batch in stockBatches" :key="batch.id">
                    <td>{{ batch.batch_number }}</td>
                    <td>{{ batch.expiry_date }}</td>
                    <td>{{ batch.quantity_received }}</td>
                    <td>{{ batch.current_quantity }}</td>
                    <td>{{ batch.supplier_name || 'N/A' }}</td>
                    <td>{{ batch.received_date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="no-data-text">No stock batches found for this item.</p>
          </div>

          <div class="section notes-section">
            <h4 class="section-title">Notes</h4>
            <pre class="value">{{ item.notes || 'N/A' }}</pre>
          </div>

          <div class="section">
            <h4 class="section-title">System Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ item.updated_at ? new Date(item.updated_at).toLocaleString() : 'N/A' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue';
import { type MedicationItem, type StockBatch, fetchStockBatchesForItem } from '@/services/pharmacyService';
import store from '@/store'; // Assuming token might be needed

export default defineComponent({
  name: 'MedicationItemDetailModal',
  props: {
    item: {
      type: Object as PropType<MedicationItem | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const stockBatches = ref<StockBatch[]>([]);
    const loadingBatches = ref(false);

    const loadStockBatches = async (medicationItemId: string | number) => {
      if (!medicationItemId) return;
      loadingBatches.value = true;
      stockBatches.value = [];
      try {
        const token = store.state.token; // Get token from store
        // In a real app, ensure token is valid/exists before calling
        stockBatches.value = await fetchStockBatchesForItem(medicationItemId, token);
      } catch (error) {
        console.error('Failed to load stock batches:', error);
        // Handle error display if necessary
      } finally {
        loadingBatches.value = false;
      }
    };

    watch(() => props.item, (newItem) => {
      if (newItem && newItem.id) {
        loadStockBatches(newItem.id);
      } else {
        stockBatches.value = []; // Clear batches if no item or item has no ID
      }
    }, { immediate: true });

    return {
      stockBatches,
      loadingBatches,
    };
  },
});
</script>

<style scoped>
.medication-item-detail-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2010;
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
.modal-scrollable-content {
  overflow-y: auto;
  padding: 0.5rem;
  margin-right: -0.5rem; 
  flex-grow: 1;
}
.details-container {
  /* Styles for the main container of details if needed */
}
.section {
  margin-bottom: 1.5rem;
}
.section:last-child {
  margin-bottom: 0.5rem;
}
.section-title {
  font-size: 1.2rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.detail-grid {
  display: grid;
  gap: 0.8rem 1.5rem;
}
.detail-grid.two-column {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.detail-item {
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column;
}
.detail-item .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.detail-item .value {
  color: #1a202c;
  font-size: 1rem;
  word-break: break-word;
}
.detail-item .value pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  background-color: #f8f9fa;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
}
.notes-section .value {
    background-color: #f8f9fa;
    padding: 0.8rem;
    border-radius: 4px;
    min-height: 60px;
    border: 1px solid #e9ecef;
}
.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
.close-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.close-btn:hover { background: #5a6268; }
.batches-table-wrapper {
  overflow-x: auto;
  margin-top: 0.5rem;
}
.batches-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.batches-table th,
.batches-table td {
  padding: 0.5rem 0.7rem;
  border: 1px solid #e9ecef;
  text-align: left;
  white-space: nowrap;
}
.batches-table th {
  background-color: #f8f9fa;
  font-weight: 500;
}
.loading-text,
.no-data-text {
  padding: 1rem 0;
  text-align: center;
  color: #555;
  font-style: italic;
}
</style>
