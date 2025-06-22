<template>
  <BaseViewModal
    v-if="grn"
    :title="`GRN Details (ID: ${grn.id})`"
    :entry="grnSummary"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <!-- GRN Items Section -->
      <div class="section">
        <h4 class="section-title">Received Items ({{ grn.items?.length || 0 }})</h4>
        <BaseTable
          v-if="grn.items && grn.items.length > 0"
          :columns="itemColumns"
          :data="grn.items"
          :idKey="'id'"
          :pageSize="5"
        />
        <p v-else class="no-data-text">No items recorded in this GRN.</p>
      </div>
      <!-- Notes Section -->
      <div class="section notes-section">
        <h4 class="section-title">Notes</h4>
        <pre class="value">{{ grn.notes || 'N/A' }}</pre>
      </div>
      <!-- System Information Section -->
      <div class="section">
        <h4 class="section-title">System Information</h4>
        <div class="detail-grid two-column">
          <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ grn.created_at ? new Date(grn.created_at).toLocaleString() : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ grn.updated_at ? new Date(grn.updated_at).toLocaleString() : 'N/A' }}</span></div>
        </div>
      </div>
    </template>
  </BaseViewModal>
  <div v-else class="modal-content">
    <p>No GRN data provided.</p>
    <div class="form-actions">
      <button @click="$emit('close')" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { type GoodsReceivedNote } from '@/services/pharmacyService';
import BaseViewModal from '@/components/BaseViewModal.vue';
import BaseTable from '@/components/BaseTable.vue';

const summaryColumns = [
  { key: 'supplier', label: 'Supplier' },
  { key: 'grn_date', label: 'GRN Date' },
  { key: 'purchase_order_id', label: 'Purchase Order ID' },
  { key: 'invoice_number', label: 'Supplier Invoice No.' },
  { key: 'received_by', label: 'Received By' },
];
const itemColumns = [
  { key: 'medication_name', label: 'Medication' },
  { key: 'batch_number', label: 'Batch No.' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'quantity_received', label: 'Qty Received' },
  { key: 'unit_cost', label: 'Unit Cost' },
  { key: 'total_cost', label: 'Total Cost' },
];

export default defineComponent({
  name: 'GRNDetailModal',
  components: { BaseViewModal, BaseTable },
  props: {
    grn: {
      type: Object as PropType<GoodsReceivedNote | null>,
      required: true,
    },
  },
  emits: ['close'],
  computed: {
    grnSummary() {
      if (!this.grn) return {};
      return {
        supplier: this.grn.supplier_name || this.grn.supplier_id,
        grn_date: this.grn.grn_date,
        purchase_order_id: this.grn.purchase_order_id || 'N/A',
        invoice_number: this.grn.invoice_number || 'N/A',
        received_by: this.grn.received_by_user_name || this.grn.received_by_user_id || 'N/A',
      };
    },
    summaryColumns() {
      return summaryColumns;
    },
    itemColumns() {
      return itemColumns;
    },
  },
});
</script>

<style scoped>
/* TODO: Standardize any remaining layout details and ensure all sections use shared classes. */
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
.notes-section .value {
  background-color: #f8f9fa;
  padding: 0.8rem;
  border-radius: 4px;
  min-height: 60px;
  border: 1px solid #e9ecef;
}
.no-data-text {
  color: #6c757d;
  font-style: italic;
  padding: 1rem 0;
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
</style>
