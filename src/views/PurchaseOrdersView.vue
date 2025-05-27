<template>
  <div class="purchase-orders-view-bg">
    <div class="po-container">
      <div class="po-header">
        <h2>Purchase Orders</h2>
        <button @click="openCreatePOModal">Create Purchase Order</button>
      </div>

      <div class="filters-container">
        <select v-model="filterSupplierId" class="filter-input">
          <option value="">All Suppliers</option>
          <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
        </select>
        <select v-model="filterStatus" class="filter-input">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Ordered">Ordered</option>
          <option value="Partially Received">Partially Received</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="date" v-model="filterOrderDate" class="filter-input" />
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="po-table-wrapper">
        <table class="po-table">
          <thead>
            <tr>
              <th>PO ID</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Total Estimated Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading purchase orders...</td></tr>
            <tr v-else-if="filteredPurchaseOrders.length === 0"><td>No purchase orders match your filters or none exist.</td></tr>
            <tr v-for="po in filteredPurchaseOrders" :key="po.id" :class="`status-row-${po.status.toLowerCase().replace(/\s+/g, '-')}`">
              <td>{{ po.id }}</td>
              <td>{{ po.supplier_name || po.supplier_id }}</td>
              <td>{{ po.order_date }}</td>
              <td>{{ po.expected_delivery_date || 'N/A' }}</td>
              <td><span :class="`status-badge status-${po.status.toLowerCase().replace(/\s+/g, '-')}`">{{ po.status }}</span></td>
              <td>{{ formatCurrency(po.total_estimated_cost) }}</td>
              <td>
                <button @click="viewPurchaseOrder(po)" class="action-btn view-btn">View</button>
                <button @click="editPurchaseOrder(po)" class="action-btn edit-btn">Edit</button>
                <!-- <button @click="confirmDeletePO(po.id)" class="action-btn delete-btn">Delete</button> -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Create/Edit/View Purchase Order will be added here -->
      <CreatePurchaseOrderModal 
        v-if="showCreateModal" 
        :existing-p-o="poToEdit" 
        @close="closeCreateModal" 
        @po-created="refreshPurchaseOrders" 
        @po-updated="refreshPurchaseOrders" 
      />
      <PurchaseOrderDetailModal 
        v-if="poToView" 
        :purchase-order="poToView" 
        @close="closeDetailModal" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'; // Added computed
import { fetchPurchaseOrders, type PurchaseOrder, fetchSuppliers, type Supplier } from '@/services/pharmacyService'; // Added fetchSuppliers, Supplier
import store from '@/store';
import CreatePurchaseOrderModal from '../components/CreatePurchaseOrderModal.vue';
import PurchaseOrderDetailModal from '../components/PurchaseOrderDetailModal.vue';

export default defineComponent({
  name: 'PurchaseOrdersView',
  components: { CreatePurchaseOrderModal, PurchaseOrderDetailModal },
  setup() {
    const purchaseOrders = ref<PurchaseOrder[]>([]);
    const suppliers = ref<Supplier[]>([]); // For filter dropdown
    const loading = ref(false);
    const errorMessage = ref('');
    const showCreateModal = ref(false);
    const poToEdit = ref<PurchaseOrder | null>(null);
    const poToView = ref<PurchaseOrder | null>(null);

    // Filter refs
    const filterSupplierId = ref<string | number>('');
    const filterStatus = ref('');
    const filterOrderDate = ref('');

    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };

    const loadPurchaseOrders = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'User not authenticated.'; loading.value = false; return; }
        purchaseOrders.value = await fetchPurchaseOrders(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load purchase orders: ${error.message || 'Unknown error'}`;
      } finally {
        loading.value = false;
      }
    };

    const loadFilterData = async () => {
      try {
        const token = store.state.token;
        // Assuming token might be needed for these, though dummy services might not use it
        suppliers.value = await fetchSuppliers(token);
      } catch (error: any) {
        console.error('Failed to load filter data for POs:', error);
      }
    };

    const filteredPurchaseOrders = computed(() => {
      let tempPOs = purchaseOrders.value;
      if (filterSupplierId.value) {
        tempPOs = tempPOs.filter(po => po.supplier_id === filterSupplierId.value);
      }
      if (filterStatus.value) {
        tempPOs = tempPOs.filter(po => po.status === filterStatus.value);
      }
      if (filterOrderDate.value) {
        tempPOs = tempPOs.filter(po => po.order_date === filterOrderDate.value);
      }
      return tempPOs;
    });

    const clearFilters = () => {
      filterSupplierId.value = '';
      filterStatus.value = '';
      filterOrderDate.value = '';
    };

    const refreshPurchaseOrders = () => loadPurchaseOrders();

    const openCreatePOModal = () => {
      poToEdit.value = null; // Ensure it's a new PO
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
      poToEdit.value = null;
    };

    const viewPurchaseOrder = (po: PurchaseOrder) => {
      poToView.value = po;
    };

    const closeDetailModal = () => {
      poToView.value = null;
    };

    const editPurchaseOrder = (po: PurchaseOrder) => {
      poToEdit.value = { ...po };
      showCreateModal.value = true; // Re-use the same modal for editing
      alert(`Edit PO: ${JSON.stringify(po)}`); // Placeholder, actual edit logic is in modal
    };

    onMounted(() => {
        loadPurchaseOrders();
        loadFilterData(); // Load data for filter dropdowns
    });

    return {
      purchaseOrders, // Original list
      filteredPurchaseOrders, // For the table
      suppliers, // For filter dropdown
      loading,
      errorMessage,
      openCreatePOModal,
      closeCreateModal,
      showCreateModal,
      poToEdit,
      viewPurchaseOrder,
      closeDetailModal,
      poToView,
      editPurchaseOrder,
      refreshPurchaseOrders,
      formatCurrency,
      // Filter related
      filterSupplierId,
      filterStatus,
      filterOrderDate,
      clearFilters,
    };
  },
});
</script>

<style scoped>
.purchase-orders-view-bg {
  background: #eaf4fb; /* Consistent blueish white */
  color: #111; /* Consistent black text */
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.po-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.po-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.po-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.po-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.po-header button:hover {
  background: var(--teal);
}

.filters-container {
  display: flex;
  flex-wrap: wrap; /* Allow filters to wrap */
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  flex-grow: 1;
  min-width: 180px; /* Adjust min-width as needed */
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.po-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.po-table th,
.po-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.po-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.po-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.po-table tr:hover {
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
.edit-btn { background-color: var(--primary-blue); color: white; }
/* .delete-btn { background-color: #dc3545; color: white; } */

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
  display: inline-block;
}
.status-draft { background-color: #6c757d; color: white; }
.status-ordered { background-color: #007bff; color: white; }
.status-partially-received { background-color: #ffc107; color: #212529; }
.status-completed { background-color: #28a745; color: white; }
.status-cancelled { background-color: #dc3545; color: white; }
</style>
