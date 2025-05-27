<template>
  <div class="billing-view-bg">
    <div class="billing-container">
      <div class="billing-header">
        <h2>Billing & Payments</h2>
        <button @click="openCreateBillModal">Create New Bill</button>
        <!-- Filters can be added here later -->
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="billing-table-wrapper">
        <table class="billing-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Amount Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading bills...</td></tr>
            <tr v-else-if="bills.length === 0"><td>No bills found.</td></tr>
            <tr v-for="bill in bills" :key="bill.id" :class="`status-row-${bill.status.toLowerCase().replace(/\s+/g, '-')}`">
              <td>{{ bill.id }}</td>
              <td>{{ bill.patient_name || bill.patient_id }}</td>
              <td>{{ bill.bill_date }}</td>
              <td>{{ formatCurrency(bill.total_amount) }}</td>
              <td>{{ formatCurrency(bill.paid_amount) }}</td>
              <td>{{ formatCurrency(bill.balance_due) }}</td>
              <td><span :class="`status-badge status-${bill.status.toLowerCase().replace(/\s+/g, '-')}`">{{ bill.status }}</span></td>
              <td>
                <button @click="viewBill(bill)" class="action-btn view-btn">View</button>
                <button @click="recordPaymentForBill(bill)" class="action-btn record-payment-btn" :disabled="bill.status === 'Paid' || bill.status === 'Void'">Record Payment</button>
                <!-- Edit/Void actions can be added later -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Create Bill, View Bill Details, Record Payment will be added here -->
      <CreateBillModal 
        v-if="showCreateBillModal" 
        @close="closeCreateBillModal" 
        @bill-created="refreshBills" 
      />
      <BillDetailModal 
        v-if="billToView" 
        :bill="billToView" 
        @close="closeDetailModal" 
      />
      <RecordPaymentModal
        v-if="billIdForPayment"
        :bill-id="billIdForPayment"
        @close="closeRecordPaymentModal"
        @payment-recorded="refreshBills"
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchBills, type Bill } from '@/services/billingService';
import store from '@/store';
import CreateBillModal from '../components/CreateBillModal.vue';
import BillDetailModal from '../components/BillDetailModal.vue';
import RecordPaymentModal from '../components/RecordPaymentModal.vue'; // Import the new modal

export default defineComponent({
  name: 'BillingView',
  components: { CreateBillModal, BillDetailModal, RecordPaymentModal }, // Register the component
  setup() {
    const bills = ref<Bill[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showCreateBillModal = ref(false);
    const billToView = ref<Bill | null>(null);
    const billIdForPayment = ref<string | number | null>(null); // For RecordPaymentModal

    const formatCurrency = (amount: number) => {
      // Basic currency formatting, can be enhanced with locale and currency symbol
      return amount.toFixed(2); // Example: 1234.50
    };

    const loadBills = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) {
          errorMessage.value = 'User not authenticated.';
          loading.value = false;
          return;
        }
        // TODO: Add filters if needed, e.g., { patient_id: 'some_id' }
        bills.value = await fetchBills(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load bills: ${error.message || 'Unknown error'}`;
        console.error(errorMessage.value, error);
      } finally {
        loading.value = false;
      }
    };

    const refreshBills = () => {
      loadBills();
    };

    const openCreateBillModal = () => {
      // billToEdit.value = null; // If using the same modal for edit
      showCreateBillModal.value = true;
    };

    const closeCreateBillModal = () => {
      showCreateBillModal.value = false;
    };

    const viewBill = (bill: Bill) => {
      billToView.value = bill;
    };

    const closeDetailModal = () => {
      billToView.value = null;
    };

    const recordPaymentForBill = (bill: Bill) => {
      if (bill.id) {
        billIdForPayment.value = bill.id;
      }
    };

    const closeRecordPaymentModal = () => {
      billIdForPayment.value = null;
    };

    onMounted(() => {
      loadBills();
    });

    return {
      bills,
      loading,
      errorMessage,
      openCreateBillModal,
      closeCreateBillModal,
      showCreateBillModal,
      viewBill,
      closeDetailModal,
      billToView,
      recordPaymentForBill,
      billIdForPayment, // Add this
      closeRecordPaymentModal, // Add this
      refreshBills,
      formatCurrency,
    };
  },
});
</script>

<style scoped>
.billing-view-bg {
  background: #eaf4fb; /* Consistent with other views */
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.billing-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.billing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.billing-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.billing-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.billing-header button:hover {
  background: var(--teal);
}

.billing-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.billing-table th,
.billing-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.billing-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.billing-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.billing-table tr:hover {
  background-color: #e6f3fb;
}

.action-btn {
  padding: 0.3rem 0.6rem;
  margin-right: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  border: 1px solid transparent;
}
.view-btn { background-color: #6c757d; color: white; }
.view-btn:hover { background-color: #5a6268; }
.record-payment-btn { background-color: #28a745; color: white; }
.record-payment-btn:hover { background-color: #218838; }
.record-payment-btn:disabled { background-color: #6c757d; opacity: 0.7; cursor: not-allowed; }

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.status-badge {
  padding: 0.25em 0.6em;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 0.25rem;
  text-transform: capitalize;
}
.status-open { background-color: #ffc107; color: #333;}
.status-paid { background-color: #28a745; color: white; }
.status-partially-paid { background-color: #17a2b8; color: white; }
.status-draft { background-color: #6c757d; color: white; }
.status-void { background-color: #dc3545; color: white; }

/* Optional: Row highlighting based on status */
.status-row-paid {
  /* background-color: #e9f5ec !important; */ /* Light green, might conflict with hover */
}
.status-row-open {
  /* background-color: #fff8e1 !important; */ /* Light yellow */
}
</style>
