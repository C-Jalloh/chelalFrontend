<template>
  <div class="po-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Purchase Order Details (ID: {{ purchaseOrder?.id }})</h3>
      <div class="modal-scrollable-content">
        <div v-if="!purchaseOrder">
          <p>No Purchase Order data provided.</p>
        </div>
        <div v-else class="details-container">
          <!-- PO Core Info -->
          <div class="section">
            <h4 class="section-title">Order Summary</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Supplier:</span> <span class="value">{{ purchaseOrder.supplier_name || purchaseOrder.supplier_id }}</span></div>
              <div class="detail-item"><span class="label">Status:</span> <span :class="`status-badge status-${purchaseOrder.status.toLowerCase().replace(/\s+/g, '-')}`" class="value">{{ purchaseOrder.status }}</span></div>
              <div class="detail-item"><span class="label">Order Date:</span> <span class="value">{{ purchaseOrder.order_date }}</span></div>
              <div class="detail-item"><span class="label">Expected Delivery:</span> <span class="value">{{ purchaseOrder.expected_delivery_date || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Created By:</span> <span class="value">{{ purchaseOrder.created_by_user_name || purchaseOrder.created_by_user_id || 'N/A' }}</span></div>
            </div>
          </div>

          <!-- PO Items Section -->
          <div class="section">
            <h4 class="section-title">Order Items ({{ purchaseOrder.items?.length || 0 }})</h4>
            <div v-if="purchaseOrder.items && purchaseOrder.items.length > 0" class="items-table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Qty Ordered</th>
                    <th>Est. Unit Cost</th>
                    <th>Est. Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in purchaseOrder.items" :key="item.id">
                    <td>{{ item.medication_name || item.medication_item_id }}</td>
                    <td>{{ item.quantity_ordered }}</td>
                    <td>{{ formatCurrency(item.unit_cost_estimated) }}</td>
                    <td>{{ formatCurrency(item.total_cost_estimated) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="no-data-text">No items in this purchase order.</p>
          </div>

          <!-- Financial Summary -->
           <div class="section financial-summary">
            <h4 class="section-title">Financials</h4>
            <div class="detail-grid one-column">
                <div class="detail-item"><span class="label">Total Estimated Cost:</span> <span class="value strong">{{ formatCurrency(purchaseOrder.total_estimated_cost) }}</span></div>
            </div>
          </div>

          <div class="section notes-section">
            <h4 class="section-title">Notes</h4>
            <pre class="value">{{ purchaseOrder.notes || 'N/A' }}</pre>
          </div>

          <div class="section">
            <h4 class="section-title">System Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ purchaseOrder.created_at ? new Date(purchaseOrder.created_at).toLocaleString() : 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ purchaseOrder.updated_at ? new Date(purchaseOrder.updated_at).toLocaleString() : 'N/A' }}</span></div>
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
import { defineComponent, type PropType } from 'vue';
import { type PurchaseOrder } from '@/services/pharmacyService';

export default defineComponent({
  name: 'PurchaseOrderDetailModal',
  props: {
    purchaseOrder: {
      type: Object as PropType<PurchaseOrder | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup() {
    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };
    return { formatCurrency };
  },
});
</script>

<style scoped>
.po-detail-modal {
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
  max-width: 850px; 
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
  margin-bottom: 1.8rem;
}
.section:last-child {
  margin-bottom: 0.5rem;
}
.section-title {
  font-size: 1.25rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #e2e8f0;
}
.detail-grid {
  display: grid;
  gap: 0.8rem 1.5rem;
}
.detail-grid.two-column {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.detail-grid.one-column {
  grid-template-columns: 1fr;
}
.detail-item {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}
.detail-item .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.detail-item .value {
  color: #1a202c;
  font-size: 1rem;
  word-break: break-word;
}
.detail-item .value.strong { font-weight: 600; font-size: 1.1rem; }
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
.items-table-wrapper {
  overflow-x: auto;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}
.items-table th,
.items-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #e9ecef;
  text-align: left;
  white-space: nowrap;
}
.items-table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #343a40;
}
.no-data-text {
  color: #6c757d;
  font-style: italic;
  padding: 1rem 0;
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
}
.close-btn:hover { background: #5a6268; }

/* Status Badges - ensure consistency */
.status-badge {
  padding: 0.25em 0.6em;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 0.25rem;
  text-transform: capitalize;
  display: inline-block;
}
.status-draft { background-color: #6c757d; color: white; }
.status-ordered { background-color: #007bff; color: white; }
.status-partially-received { background-color: #ffc107; color: #212529; }
.status-completed { background-color: #28a745; color: white; }
.status-cancelled { background-color: #dc3545; color: white; }
</style>
