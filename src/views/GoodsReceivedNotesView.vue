<template>
  <div class="grn-view-bg">
    <div class="grn-container">
      <div class="grn-header">
        <h2>Goods Received Notes (GRNs)</h2>
        <button @click="openCreateGRNModal">Create GRN / Receive Goods</button>
      </div>

      <!-- Filters can be added here later -->

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="grn-table-wrapper">
        <table class="grn-table">
          <thead>
            <tr>
              <th>GRN ID</th>
              <th>Supplier</th>
              <th>GRN Date</th>
              <th>PO ID (Optional)</th>
              <th>Invoice No.</th>
              <th>Items Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading GRNs...</td></tr>
            <tr v-else-if="grns.length === 0"><td>No GRNs found.</td></tr>
            <tr v-for="grn in grns" :key="grn.id">
              <td>{{ grn.id }}</td>
              <td>{{ grn.supplier_name || grn.supplier_id }}</td>
              <td>{{ grn.grn_date }}</td>
              <td>{{ grn.purchase_order_id || 'N/A' }}</td>
              <td>{{ grn.invoice_number || 'N/A' }}</td>
              <td>{{ grn.items.length }}</td>
              <td>
                <button @click="viewGRN(grn)" class="action-btn view-btn">View Details</button>
                <!-- Edit/Delete for GRNs might be complex due to stock implications -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Create/View GRN will be added here -->
      <CreateGRNModal 
        v-if="showCreateGRNModal" 
        @close="closeCreateGRNModal" 
        @grn-created="refreshGRNs" 
      />
      <GRNDetailModal 
        v-if="grnToView" 
        :grn="grnToView" 
        @close="closeDetailModal" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchGRNs, type GoodsReceivedNote } from '@/services/pharmacyService';
import store from '@/store';
import CreateGRNModal from '../components/CreateGRNModal.vue';
import GRNDetailModal from '../components/GRNDetailModal.vue'; // Import the new detail modal

export default defineComponent({
  name: 'GoodsReceivedNotesView',
  components: { CreateGRNModal, GRNDetailModal }, // Register the component
  setup() {
    const grns = ref<GoodsReceivedNote[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showCreateGRNModal = ref(false);
    const grnToView = ref<GoodsReceivedNote | null>(null); // For the detail modal

    const loadGRNs = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'User not authenticated.'; loading.value = false; return; }
        grns.value = await fetchGRNs(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load GRNs: ${error.message || 'Unknown error'}`;
      } finally {
        loading.value = false;
      }
    };

    const refreshGRNs = () => loadGRNs();

    const openCreateGRNModal = () => {
      showCreateGRNModal.value = true;
    };

    const closeCreateGRNModal = () => {
      showCreateGRNModal.value = false;
    };

    const viewGRN = (grn: GoodsReceivedNote) => {
      grnToView.value = grn;
    };

    const closeDetailModal = () => {
      grnToView.value = null;
    };

    onMounted(loadGRNs);

    return {
      grns,
      loading,
      errorMessage,
      openCreateGRNModal,
      closeCreateGRNModal, // Keep if still used by CreateGRNModal logic
      showCreateGRNModal,  // Keep if still used
      viewGRN,
      grnToView,           // Expose to template
      closeDetailModal,    // Expose to template
      refreshGRNs,
    };
  },
});
</script>

<style scoped>
.grn-view-bg {
  background: #eaf4fb;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.grn-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.grn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.grn-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.grn-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.grn-header button:hover {
  background: var(--teal);
}

.grn-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.grn-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.grn-table th,
.grn-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.grn-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.grn-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.grn-table tr:hover {
  background-color: #e6f3fb;
}

.view-btn { background-color: #6c757d; color: white; }
.view-btn:hover { background-color: #545b62; }

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
