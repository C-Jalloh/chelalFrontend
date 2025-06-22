<template>
  <div class="pharmacy-view-bg">
    <div class="pharmacy-container">
      <div class="pharmacy-header">
        <h2><svg class="icon-header" style="width:1.3em;height:1.3em;margin-right:0.5em;vertical-align:middle;color:var(--primary-blue);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7m14 0a2 2 0 00-2-2H7a2 2 0 00-2 2m14 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2" /></svg>Pharmacy Inventory</h2>
        <button @click="openAddMedicationItemModal" class="add-btn">Add Medication Item</button>
        <div style="position:relative;width:100%;max-width:340px;">
          <svg class="icon-search" style="position:absolute;left:0.7em;top:50%;transform:translateY(-50%);width:1.2em;height:1.2em;color:#888;pointer-events:none;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
          <input
            v-model="filterName"
            class="pharmacy-search"
            type="search"
            placeholder="Search by name, generic, or ID..."
            aria-label="Search medications"
            style="padding-left:2.5em;"
          />
        </div>
        <div class="pharmacy-filters">
          <select v-model="filterCategoryId">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <select v-model="filterSupplierId">
            <option value="">All Suppliers</option>
            <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
          </select>
          <ClearButton @click="clearFilters">Clear</ClearButton>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="medication-table-wrapper">
        <!-- TODO: Standardize table to use BaseTable for visual consistency -->
        <BaseTable
          :columns="tableColumns"
          :data="filteredMedicationItems"
          :idKey="'id'"
          :pageSize="10"
          @edit="editMedicationItem"
          @delete="row => confirmDelete(row.id)"
        >
          <template #actions="{ row }">
            <button @click.stop="viewMedicationItem(row)" class="action-btn view-btn">View</button>
          </template>
        </BaseTable>
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
import AddMedicationItemModal from '../components/Modals/AddMedicationItemModal.vue';
import MedicationItemDetailModal from '../components/Modals/MedicationItemDetailModal.vue';
import BaseTable from '@/components/BaseTable.vue';
import ClearButton from '@/components/buttons/ClearButton.vue';

export default defineComponent({
  name: 'PharmacyInventoryView',
  components: { AddMedicationItemModal, MedicationItemDetailModal, BaseTable, ClearButton },
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

    const tableColumns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'category_name', label: 'Category', sortable: true },
      { key: 'form', label: 'Form', sortable: true },
      { key: 'strength', label: 'Strength', sortable: false },
      { key: 'current_stock_level', label: 'Stock Level', sortable: true },
      { key: 'reorder_level', label: 'Reorder Level', sortable: true },
      { key: 'supplier_name', label: 'Supplier', sortable: false },
    ];

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

    const DUMMY_CATEGORIES = [
      { id: 1, name: 'Analgesics', description: 'Pain relievers' },
      { id: 2, name: 'Antibiotics', description: 'Antibacterial drugs' },
      { id: 3, name: 'Antipyretics', description: 'Fever reducers' },
      { id: 4, name: 'Antimalarials', description: 'Malaria treatment' },
      { id: 5, name: 'Vitamins', description: 'Nutritional supplements' },
      { id: 6, name: 'Antihypertensives', description: 'Blood pressure control' },
    ];

    const loadFilterDropdownData = async () => {
      // Always use dummy categories for demo
      categories.value = DUMMY_CATEGORIES;
      try {
        suppliers.value = await fetchSuppliers();
      } catch (error) {
        suppliers.value = [];
        console.error('Failed to load suppliers:', error);
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
          await deleteMedicationItem(itemId);
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
      tableColumns,
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
  background: var(--primary-blue); /* Changed from #eaf4fb to primary color */
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
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.pharmacy-header h2 {
  flex: 1 1 100%;
  margin: 0 0 0.5rem 0;
  min-width: 120px;
  word-break: break-word;
  color: var(--primary-blue);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
}

.pharmacy-header .add-btn {
  height: 2.4rem;
  line-height: 2.3rem;
  padding: 0 1.4rem;
  font-size: 0.98rem;
  border-radius: 6px;
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  box-shadow: 0 2px 8px rgba(30,58,92,0.07);
  font-weight: 600;
  display: flex;
  align-items: center;
  transition: background 0.18s, box-shadow 0.18s;
  margin-right: 0.5rem;
  box-sizing: border-box;
}

.pharmacy-header .pharmacy-search {
  height: 2.4rem;
  line-height: 2.3rem;
  background: #fff !important;
  color: #111 !important;
  border: 1.5px solid var(--primary-blue, #2563eb);
  border-radius: 6px;
  padding: 0 2.5rem 0 2.2rem;
  font-size: 1.08rem;
  min-width: 220px !important;
  max-width: 340px !important;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(30,58,92,0.07);
  transition: border 0.2s, box-shadow 0.2s;
}

.pharmacy-header .pharmacy-search:focus {
  outline: none;
  border-color: var(--teal, #008080);
  box-shadow: 0 0 0 2px rgba(0,128,128,0.13);
}

.pharmacy-header .pharmacy-search::placeholder {
  color: #888;
  opacity: 1;
}

.pharmacy-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: nowrap;
  width: auto;
}

.pharmacy-filters select {
  flex: 1 1 180px;
  max-width: 200px;
  min-width: 120px;
  height: 2.4rem;
  line-height: 2.3rem;
  padding: 0 1.1rem 0 0.8rem;
  border-radius: 6px;
  border: 1.5px solid var(--primary-blue, #2563eb);
  background: #fff;
  color: #222;
  font-size: 1.08rem;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(30,58,92,0.07);
  transition: border 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
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
