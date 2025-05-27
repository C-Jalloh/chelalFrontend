<template>
  <div class="record-payment-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">Record Payment for Bill #{{ bill?.id }}</h3>
      <form @submit.prevent="handleSubmit" v-if="bill">
        <div class="bill-summary">
          <p><strong>Patient:</strong> {{ bill.patient_name || bill.patient_id }}</p>
          <p><strong>Total Amount:</strong> {{ formatCurrency(bill.total_amount) }}</p>
          <p><strong>Amount Paid:</strong> {{ formatCurrency(bill.paid_amount) }}</p>
          <p><strong>Balance Due:</strong> <span class="balance-due">{{ formatCurrency(bill.balance_due) }}</span></p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="payment_date">Payment Date *</label>
            <input type="date" id="payment_date" v-model="payment.payment_date" required />
          </div>
          <div class="form-group">
            <label for="amount_paid">Amount Paid *</label>
            <input type="number" step="0.01" id="amount_paid" v-model.number="payment.amount_paid" required />
          </div>
        </div>

        <div class="form-group">
          <label for="payment_method">Payment Method *</label>
          <select id="payment_method" v-model="payment.payment_method" required>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Insurance">Insurance</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="reference_number">Reference Number (Optional)</label>
          <input type="text" id="reference_number" v-model="payment.reference_number" />
        </div>

        <div class="form-group">
          <label for="payment_notes">Notes (Optional)</label>
          <textarea id="payment_notes" v-model="payment.notes" rows="2"></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loadingPayment">{{ loadingPayment ? 'Processing...' : 'Record Payment' }}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn" :disabled="loadingPayment">Cancel</button>
        </div>
      </form>
      <div v-else>
        <p>Loading bill information...</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType, watch, onMounted } from 'vue';
import { type Bill, type Payment, recordPayment, getBillById } from '@/services/billingService';
import store from '@/store';

export default defineComponent({
  name: 'RecordPaymentModal',
  props: {
    billId: {
      type: [String, Number] as PropType<string | number | null>,
      required: true,
    },
  },
  emits: ['close', 'paymentRecorded'],
  setup(props, { emit }) {
    const bill = ref<Bill | null>(null);
    const payment = ref<Omit<Payment, 'id' | 'created_at' | 'bill_id'>>({
      payment_date: new Date().toISOString().split('T')[0],
      amount_paid: 0,
      payment_method: 'Cash',
      reference_number: '',
      notes: '',
    });
    const errorMessage = ref('');
    const loadingBill = ref(false);
    const loadingPayment = ref(false);

    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };

    const loadBillDetails = async () => {
      if (!props.billId) return;
      loadingBill.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        const fetchedBill = await getBillById(props.billId, token);
        if (fetchedBill) {
          bill.value = fetchedBill;
          // Default payment amount to balance due, but not more than total (or allow overpayment based on policy)
          payment.value.amount_paid = fetchedBill.balance_due > 0 ? parseFloat(fetchedBill.balance_due.toFixed(2)) : 0;
        } else {
          errorMessage.value = 'Bill details not found.';
        }
      } catch (error: any) {
        errorMessage.value = `Failed to load bill details: ${error.message}`;
      } finally {
        loadingBill.value = false;
      }
    };

    watch(() => props.billId, (newId) => {
      if (newId) {
        loadBillDetails();
      } else {
        bill.value = null;
      }
    }, { immediate: true });

    onMounted(() => {
        if (!bill.value && props.billId) {
            loadBillDetails();
        }
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!bill.value || !props.billId) {
        errorMessage.value = 'Bill information is missing.';
        return;
      }
      if (payment.value.amount_paid <= 0) {
        errorMessage.value = 'Payment amount must be greater than zero.';
        return;
      }
      if (payment.value.amount_paid > bill.value.balance_due) {
        // Potentially allow overpayment based on policy, for now, let's warn or cap
        if (!confirm(`Payment amount (${formatCurrency(payment.value.amount_paid)}) exceeds balance due (${formatCurrency(bill.value.balance_due)}). Proceed with overpayment?`)) {
            // errorMessage.value = 'Payment amount cannot exceed the balance due.';
            return;
        }
      }
      if (!payment.value.payment_date) {
        errorMessage.value = 'Payment date is required.';
        return;
      }

      loadingPayment.value = true;
      const token = store.state.token;
      if (!token) { 
        errorMessage.value = 'User not authenticated.'; 
        loadingPayment.value = false;
        return; 
      }

      try {
        const paymentToSubmit: Omit<Payment, 'id' | 'created_at'> = {
          ...payment.value,
          bill_id: props.billId,
        };
        await recordPayment(paymentToSubmit, token);
        emit('paymentRecorded');
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to record payment: ${error.message}`;
      } finally {
        loadingPayment.value = false;
      }
    };

    return {
      bill,
      payment,
      errorMessage,
      loadingBill,
      loadingPayment,
      handleSubmit,
      formatCurrency,
    };
  },
});
</script>

<style scoped>
.record-payment-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2020;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 550px; 
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}
.bill-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}
.bill-summary p {
  margin: 0.4rem 0;
  font-size: 0.95rem;
}
.bill-summary .balance-due {
  font-weight: bold;
  color: #dc3545;
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
.form-group textarea {
  resize: vertical;
  min-height: 60px;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
.submit-btn {
  background: var(--primary-blue);
  color: var(--white);
}
.submit-btn:hover:not(:disabled) {
  background: var(--teal);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.cancel-btn {
  background: #ccc;
  color: #333;
}
.cancel-btn:hover:not(:disabled) {
  background: #b0b0b0;
}
.cancel-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
