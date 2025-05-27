<template>
  <div class="pharmacy-view-bg">
    <div class="pharmacy-container">
      <div class="pharmacy-header">
        <h2>Pharmacy Inventory - Medication Items</h2>
        <button @click="openAddMedicationItemModal">Add Medication Item</button>
      </div>

      <div class="filters-container">
        <input type="text" v-model="filterName" placeholder="Filter by Name..." class="filter-input" />
        <select v-model="filterCategoryId" class="filter-input">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select v-model="filterSupplierId" class="filter-input">
          <option value="">All Suppliers</option>
          <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
        </select>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="medication-table-wrapper">
        <table class="medication-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Form</th>
              <th>Strength</th>
              <th>Stock Level</th>
              <th>Reorder Level</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading medication items...</td></tr>
            <tr v-else-if="filteredMedicationItems.length === 0"><td>No medication items match your filters or none exist.</td></tr>
            <tr v-for="item in filteredMedicationItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.category_name }}</td>
              <td>{{ item.form }}</td>
              <td>{{ item.strength }}</td>
              <td>{{ item.current_stock_level }}</td>
              <td>{{ item.reorder_level }}</td>
              <td>{{ item.supplier_name || 'N/A' }}</td>
              <td>
                <button @click="viewMedicationItem(item)" class="action-btn view-btn">View</button>
                <button @click="editMedicationItem(item)" class="action-btn edit-btn">Edit</button>
                <button @click="confirmDelete(item.id)" class="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Add/Edit/View Medication Item will be added here -->
      <AddMedicationItemModal 
        v-if="showAddEditModal" 
        :existing-item="itemToEdit"
        @close="closeAddEditModal" 
        @item-added="refreshItems" 
        @item-updated="refreshItems" 
      />
      <MedicationItemDetailModal 
        v-if="itemToView" 
        :item="itemToView" 
        @close="closeDetailModal" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'; // Added computed
import {
  fetchMedicationItems, deleteMedicationItem, type MedicationItem, 
  fetchMedicationCategories, type MedicationCategory,
  fetchSuppliers, type Supplier
} from '@/services/pharmacyService';
import store from '@/store';
import AddMedicationItemModal from '../components/AddMedicationItemModal.vue';
import MedicationItemDetailModal from '../components/MedicationItemDetailModal.vue';

export default defineComponent({
  name: 'PharmacyInventoryView',
  components: { AddMedicationItemModal, MedicationItemDetailModal },
  setup() {
    const medicationItems = ref<MedicationItem[]>([]);
    const categories = ref<MedicationCategory[]>([]); // For filter dropdown
    const suppliers = ref<Supplier[]>([]); // For filter dropdown
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddEditModal = ref(false);
    const itemToEdit = ref<MedicationItem | null>(null);
    const itemToView = ref<MedicationItem | null>(null);

    // Filter refs
    const filterName = ref('');
    const filterCategoryId = ref<string | number>('');
    const filterSupplierId = ref<string | number>('');

    const loadMedicationItems = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'User not authenticated.'; loading.value = false; return; }
        // Pass filters to fetchMedicationItems if API supports it, otherwise filter client-side
        // For now, our dummy fetchMedicationItems does basic client-side name filtering if provided
        // but we will implement more comprehensive client-side filtering via computed prop.
        medicationItems.value = await fetchMedicationItems(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load medication items: ${error.message || 'Unknown error'}`;
      } finally {
        loading.value = false;
      }
    };

    const loadFilterDropdownData = async () => {
        try {
            const token = store.state.token;
            // Assuming token might be needed, though dummy services might not use it
            categories.value = await fetchMedicationCategories(token);
            suppliers.value = await fetchSuppliers(token);
        } catch (error: any) {
            console.error('Failed to load filter dropdown data:', error);
            // Optionally set an error message for dropdown loading failures
        }
    };

    const filteredMedicationItems = computed(() => {
      let tempItems = medicationItems.value;
      if (filterName.value) {
        tempItems = tempItems.filter(item =>
          item.name.toLowerCase().includes(filterName.value.toLowerCase()) ||
          item.generic_name?.toLowerCase().includes(filterName.value.toLowerCase())
        );
      }
      if (filterCategoryId.value) {
        tempItems = tempItems.filter(item => item.category_id === filterCategoryId.value);
      }
      if (filterSupplierId.value) {
        tempItems = tempItems.filter(item => item.supplier_id === filterSupplierId.value);
      }
      return tempItems;
    });

    const clearFilters = () => {
      filterName.value = '';
      filterCategoryId.value = '';
      filterSupplierId.value = '';
    };

    const refreshItems = () => loadMedicationItems();

    const openAddMedicationItemModal = () => {
      itemToEdit.value = null; // Clear for new item
      showAddEditModal.value = true;
    };

    const closeAddEditModal = () => {
      showAddEditModal.value = false;
      itemToEdit.value = null;
    };

    const viewMedicationItem = (item: MedicationItem) => {
      itemToView.value = item;
    };

    const closeDetailModal = () => {
      itemToView.value = null;
    };

    const editMedicationItem = (item: MedicationItem) => {
      itemToEdit.value = { ...item }; // Pass a copy for editing
      showAddEditModal.value = true;
    };

    const confirmDelete = async (itemId: string | number) => {
      if (confirm('Are you sure you want to delete this medication item?')) {
        try {
          const token = store.state.token;
          if (!token) { alert('User not authenticated.'); return; }
          await deleteMedicationItem(itemId, token);
          refreshItems();
        } catch (error: any) {
          alert(`Failed to delete item: ${error.message || 'Unknown error'}`);
        }
      }
    };

    onMounted(() => {
        loadMedicationItems();
        loadFilterDropdownData();
    });

    return {
      medicationItems, // Original list
      filteredMedicationItems, // For the table
      categories, // For filter dropdown
      suppliers,  // For filter dropdown
      loading,
      errorMessage,
      openAddMedicationItemModal,
      viewMedicationItem,
      editMedicationItem,
      confirmDelete,
      refreshItems,
      showAddEditModal,
      itemToEdit,
      closeAddEditModal,
      itemToView,
      closeDetailModal,
      // Filter related
      filterName,
      filterCategoryId,
      filterSupplierId,
      clearFilters,
    };
  },
});
</script>

<style scoped>
.pharmacy-view-bg {
  background: #eaf4fb; /* Consistent blueish white */
  color: #111; /* Consistent black text */
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.pharmacy-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.pharmacy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.pharmacy-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.pharmacy-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.pharmacy-header button:hover {
  background: var(--teal);
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
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
  min-width: 180px; /* Min width for filter inputs */
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.clear-filters-btn:hover {
  background-color: #5a6268;
}

.medication-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.medication-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.medication-table th,
.medication-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.medication-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.medication-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.medication-table tr:hover {
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
.delete-btn { background-color: #dc3545; color: white; }

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
