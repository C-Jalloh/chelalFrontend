<template>
  <BaseViewModal
    v-if="bill"
    :title="`Bill Details (ID: ${bill.id})`"
    :entry="billSummary"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Bill Items Section -->
      <div class="form-section section">
        <span class="section-title">Bill Items ({{ bill.items?.length || 0 }})</span>
        <BaseTable
          v-if="bill.items && bill.items.length > 0"
          :columns="itemColumns"
          :data="bill.items"
          :idKey="'id'"
          :pageSize="5"
        />
        <p v-else class="no-data-text">No items on this bill.</p>
      </div>
      <!-- Financial Summary -->
      <div class="form-section section financial-summary">
        <span class="section-title">Financials</span>
        <div class="detail-grid two-column">
          <div class="detail-item"><span class="label">Total Amount:</span> <span class="value strong">{{ formatCurrency(bill.total_amount) }}</span></div>
          <div class="detail-item"><span class="label">Amount Paid:</span> <span class="value strong">{{ formatCurrency(bill.paid_amount) }}</span></div>
          <div class="detail-item"><span class="label">Balance Due:</span> <span class="value strong balance-due">{{ formatCurrency(bill.balance_due) }}</span></div>
        </div>
      </div>
      <!-- Payments Section -->
      <div class="form-section section">
        <span class="section-title">Payments ({{ bill.payments?.length || 0 }})</span>
        <BaseTable
          v-if="bill.payments && bill.payments.length > 0"
          :columns="paymentColumns"
          :data="bill.payments"
          :idKey="'id'"
          :pageSize="5"
        />
        <p v-else class="no-data-text">No payments recorded for this bill.</p>
      </div>
      <!-- Notes Section -->
      <div class="form-section section notes-section">
        <span class="section-title">Notes</span>
        <pre class="value">{{ bill.notes || 'N/A' }}</pre>
      </div>
    </template>
  </BaseViewModal>
  <BaseViewModal
    v-else
    title="Bill Details"
    :entry="{}"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <BaseAlert type="info">No bill data provided.</BaseAlert>
    </template>
  </BaseViewModal>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { type Bill } from '@/services/billingService';
import BaseViewModal from '@/components/BaseViewModal.vue';
import BaseTable from '@/components/BaseTable.vue';
import BaseAlert from '@/components/BaseAlert.vue';

const summaryColumns = [
  { key: 'patient', label: 'Patient' },
  { key: 'status', label: 'Status' },
  { key: 'bill_date', label: 'Bill Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'encounter_id', label: 'Encounter ID' },
  { key: 'insurance_id', label: 'Insurance ID' },
];
const itemColumns = [
  { key: 'service_name', label: 'Service/Item' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unit_price', label: 'Unit Price' },
  { key: 'total_price', label: 'Total Price' },
];
const paymentColumns = [
  { key: 'payment_date', label: 'Date' },
  { key: 'amount_paid', label: 'Amount Paid' },
  { key: 'payment_method', label: 'Method' },
  { key: 'reference_number', label: 'Reference' },
];

export default defineComponent({
  name: 'BillDetailModal',
  components: { BaseViewModal, BaseTable, BaseAlert },
  props: {
    bill: {
      type: Object as PropType<Bill | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };
    const billSummary = computed(() => {
      if (!props.bill) return {};
      return {
        patient: props.bill.patient_name || props.bill.patient_id,
        status: props.bill.status,
        bill_date: props.bill.bill_date,
        due_date: props.bill.due_date || 'N/A',
        encounter_id: props.bill.encounter_id || 'N/A',
        insurance_id: props.bill.insurance_id || 'N/A',
      };
    });
    return {
      formatCurrency,
      billSummary,
      summaryColumns,
      itemColumns,
      paymentColumns,
    };
  },
});
</script>

<style scoped>
.bill-detail-modal {
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
  max-width: 800px; 
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
  margin-right: -0.5rem; /* Offset scrollbar padding if scrollbar is inside padding */
  flex-grow: 1;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
.detail-item .value.strong { font-weight: 500; }
.detail-item .value.balance-due { color: #dc3545; }
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
.items-table-wrapper, .payments-table-wrapper {
  overflow-x: auto;
}
.items-table, .payments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}
.items-table th, .items-table td,
.payments-table th, .payments-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #e9ecef;
  text-align: left;
}
.items-table th, .payments-table th {
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

/* Status Badges from BillingView - ensure consistency */
.status-badge {
  padding: 0.25em 0.6em;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 0.25rem;
  text-transform: capitalize;
  display: inline-block; /* Ensure badge takes only content width */
}
.status-open { background-color: #ffc107; color: #333;}
.status-paid { background-color: #28a745; color: white; }
.status-partially-paid { background-color: #17a2b8; color: white; }
.status-draft { background-color: #6c757d; color: white; }
.status-void { background-color: #dc3545; color: white; }

/* TODO: Standardize modal layout and styling using BaseAddEditModal or BaseViewModal. */
</style>
