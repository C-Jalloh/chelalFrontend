<template>
  <div class="bill-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Bill Details (ID: {{ bill?.id }})</h3>
      <div class="modal-scrollable-content">
        <div v-if="!bill">
          <p>No bill data provided.</p>
        </div>
        <div v-else class="details-container">
          <!-- Bill Core Info -->
          <div class="section">
            <h4 class="section-title">Summary</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Patient:</span> <span class="value">{{ bill.patient_name || bill.patient_id }}</span></div>
              <div class="detail-item"><span class="label">Status:</span> <span :class="`status-badge status-${bill.status.toLowerCase().replace(/\s+/g, '-')}`" class="value">{{ bill.status }}</span></div>
              <div class="detail-item"><span class="label">Bill Date:</span> <span class="value">{{ bill.bill_date }}</span></div>
              <div class="detail-item"><span class="label">Due Date:</span> <span class="value">{{ bill.due_date || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Encounter ID:</span> <span class="value">{{ bill.encounter_id || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Insurance ID:</span> <span class="value">{{ bill.insurance_id || 'N/A' }}</span></div>
            </div>
          </div>

          <!-- Bill Items Section -->
          <div class="section">
            <h4 class="section-title">Bill Items ({{ bill.items?.length || 0 }})</h4>
            <div v-if="bill.items && bill.items.length > 0" class="items-table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Service/Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in bill.items" :key="item.id">
                    <td>{{ item.service_name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td>{{ formatCurrency(item.total_price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="no-data-text">No items on this bill.</p>
          </div>

          <!-- Financial Summary -->
           <div class="section financial-summary">
            <h4 class="section-title">Financials</h4>
            <div class="detail-grid two-column">
                <div class="detail-item"><span class="label">Total Amount:</span> <span class="value strong">{{ formatCurrency(bill.total_amount) }}</span></div>
                <div class="detail-item"><span class="label">Amount Paid:</span> <span class="value strong">{{ formatCurrency(bill.paid_amount) }}</span></div>
                <div class="detail-item"><span class="label">Balance Due:</span> <span class="value strong balance-due">{{ formatCurrency(bill.balance_due) }}</span></div>
            </div>
          </div>

          <!-- Payments Section -->
          <div class="section">
            <h4 class="section-title">Payments ({{ bill.payments?.length || 0 }})</h4>
            <div v-if="bill.payments && bill.payments.length > 0" class="payments-table-wrapper">
              <table class="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in bill.payments" :key="payment.id">
                    <td>{{ payment.payment_date }}</td>
                    <td>{{ formatCurrency(payment.amount_paid) }}</td>
                    <td>{{ payment.payment_method }}</td>
                    <td>{{ payment.reference_number || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="no-data-text">No payments recorded for this bill.</p>
          </div>

          <div class="section notes-section">
            <h4 class="section-title">Notes</h4>
            <pre class="value">{{ bill.notes || 'N/A' }}</pre>
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
import { type Bill } from '@/services/billingService';

export default defineComponent({
  name: 'BillDetailModal',
  props: {
    bill: {
      type: Object as PropType<Bill | null>,
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
.details-container {
  /* Container for all sections */
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
</style>
