<template>
  <div class="stock-adjustments-view-bg">
    <div class="stock-adjustments-container">
      <div class="stock-adjustments-header">
        <h2>Stock Adjustments</h2>
        <button @click="openAddAdjustmentModal">New Stock Adjustment</button>
      </div>

      <!-- Filters can be added here later -->

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="stock-adjustments-table-wrapper">
        <table class="stock-adjustments-table">
          <thead>
            <tr>
              <th>Adj. ID</th>
              <th>Medication</th>
              <th>Batch No.</th>
              <th>Type</th>
              <th>Qty Adjusted</th>
              <th>Reason</th>
              <th>Adj. Date</th>
              <th>Adjusted By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading stock adjustments...</td></tr>
            <tr v-else-if="stockAdjustments.length === 0"><td>No stock adjustment records found.</td></tr>
            <tr v-for="adj in stockAdjustments" :key="adj.id" :class="{'adjustment-increase': adj.quantity_adjusted > 0, 'adjustment-decrease': adj.quantity_adjusted < 0}">
              <td>{{ adj.id }}</td>
              <td>{{ adj.medication_name || adj.medication_item_id }}</td>
              <td>{{ adj.batch_number || adj.stock_batch_id }}</td>
              <td>{{ adj.adjustment_type }}</td>
              <td>{{ adj.quantity_adjusted }}</td>
              <td>{{ adj.reason || 'N/A' }}</td>
              <td>{{ new Date(adj.adjustment_date).toLocaleString() }}</td>
              <td>{{ adj.adjusted_by_user_name || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <AddStockAdjustmentModal 
        v-if="showAddAdjustmentModal" 
        @close="closeAddAdjustmentModal" 
        @adjustment-created="refreshStockAdjustments" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchStockAdjustments, type StockAdjustment } from '@/services/pharmacyService';
import store from '@/store';
import AddStockAdjustmentModal from '../components/AddStockAdjustmentModal.vue'; // To be created

export default defineComponent({
  name: 'StockAdjustmentsView',
  components: { AddStockAdjustmentModal },
  setup() {
    const stockAdjustments = ref<StockAdjustment[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddAdjustmentModal = ref(false);

    const loadStockAdjustments = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'User not authenticated.'; loading.value = false; return; }
        stockAdjustments.value = await fetchStockAdjustments(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load stock adjustments: ${error.message || 'Unknown error'}`;
      } finally {
        loading.value = false;
      }
    };

    const refreshStockAdjustments = () => {
        loadStockAdjustments();
        // Consider a global event or state change to notify other components (e.g., inventory view) of stock changes
    };

    const openAddAdjustmentModal = () => {
      showAddAdjustmentModal.value = true;
    };

    const closeAddAdjustmentModal = () => {
      showAddAdjustmentModal.value = false;
    };

    onMounted(loadStockAdjustments);

    return {
      stockAdjustments,
      loading,
      errorMessage,
      showAddAdjustmentModal,
      openAddAdjustmentModal,
      closeAddAdjustmentModal,
      refreshStockAdjustments,
    };
  },
});
</script>

<style scoped>
.stock-adjustments-view-bg {
  background: #eaf4fb;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.stock-adjustments-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stock-adjustments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stock-adjustments-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.stock-adjustments-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.stock-adjustments-header button:hover {
  background: var(--teal);
}

.stock-adjustments-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.stock-adjustments-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.stock-adjustments-table th,
.stock-adjustments-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.stock-adjustments-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.stock-adjustments-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.stock-adjustments-table tr:hover {
  background-color: #e6f3fb;
}

.adjustment-increase td:nth-child(5) { /* Quantity Adjusted column */
  color: #28a745; /* Green for positive adjustments */
  font-weight: bold;
}
.adjustment-decrease td:nth-child(5) { /* Quantity Adjusted column */
  color: #dc3545; /* Red for negative adjustments */
  font-weight: bold;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
