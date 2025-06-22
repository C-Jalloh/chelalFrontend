<template>
  <BaseViewModal
    v-if="bill"
    :title="`Record Payment for Bill #${bill.id}`"
    :entry="{}"
    :columns="[]"
    @close="$emit('close')"
  >
    <template #default>
      <div class="bill-summary">
        <p><strong>Patient:</strong> {{ bill.patient_name || bill.patient_id }}</p>
        <p><strong>Total Amount:</strong> {{ formatCurrency(bill.total_amount) }}</p>
        <p><strong>Amount Paid:</strong> {{ formatCurrency(bill.paid_amount) }}</p>
        <p><strong>Balance Due:</strong> <span class="balance-due">{{ formatCurrency(bill.balance_due) }}</span></p>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <FormInput
            label="Payment Date *"
            type="date"
            v-model="payment.payment_date"
            id="payment_date"
            required
          />
          <FormInput
            label="Amount Paid *"
            type="number"
            step="0.01"
            v-model.number="payment.amount_paid"
            id="amount_paid"
            required
          />
        </div>
        <FormSelect
          label="Payment Method *"
          v-model="payment.payment_method"
          id="payment_method"
          :options="paymentMethodOptions"
          required
        />
        <FormInput
          label="Reference Number (Optional)"
          v-model="payment.reference_number"
          id="reference_number"
        />
        <FormTextarea
          label="Notes (Optional)"
          v-model="payment.notes"
          id="payment_notes"
          :rows="2"
        />
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loadingPayment">{{ loadingPayment ? 'Processing...' : 'Record Payment' }}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn" :disabled="loadingPayment">Cancel</button>
        </div>
      </form>
    </template>
  </BaseViewModal>
  <div v-else class="modal-content">
    <p>No bill data provided.</p>
    <div class="form-actions">
      <button @click="$emit('close')" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BaseViewModal from '@/components/BaseViewModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';

export default defineComponent({
  name: 'RecordPaymentModal',
  components: { BaseViewModal, FormInput, FormSelect, FormTextarea },
  props: {
    bill: { type: Object, required: true },
    loadingPayment: { type: Boolean, default: false },
    errorMessage: { type: String, default: '' },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const payment = ref({
      payment_date: '',
      amount_paid: 0,
      payment_method: '',
      reference_number: '',
      notes: '',
    });
    const paymentMethodOptions = [
      { value: 'Cash', text: 'Cash' },
      { value: 'Card', text: 'Card' },
      { value: 'Insurance', text: 'Insurance' },
      { value: 'Mobile Money', text: 'Mobile Money' },
      { value: 'Other', text: 'Other' },
    ];
    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return Number(amount).toFixed(2);
    };
    function handleSubmit() {
      emit('submit', payment.value);
    }
    return {
      bill: props.bill,
      loadingPayment: props.loadingPayment,
      errorMessage: props.errorMessage,
      payment,
      paymentMethodOptions,
      formatCurrency,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.bill-summary {
  margin-bottom: 1.5rem;
}
.balance-due {
  color: #dc3545;
  font-weight: 600;
}
.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 1rem;
}
.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-message {
  color: #e57373;
  margin-bottom: 1rem;
  font-size: 0.98rem;
  text-align: center;
}
</style>
