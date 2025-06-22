<template>
  <div class="prescriptions-view-bg">
    <div class="prescriptions-list-container">
      <div class="prescriptions-header">
        <h2>Prescriptions</h2>
        <AddButton :label="'Add Prescription'" :icon="ClipboardDocumentListIcon" @click="openAddPrescriptionModal" />
      </div>
      <!-- Filter Bar -->
      <div class="filters-container">
        <input type="text" v-model="filterPatientName" placeholder="Filter by Patient..." class="filter-input" />
        <input type="text" v-model="filterMedicationName" placeholder="Filter by Medication..." class="filter-input" />
        <select v-model="filterStatus" class="filter-input">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending Dispense">Pending Dispense</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button class="clear-filters-btn" @click="clearFilters">Clear Filters</button>
      </div>
      <div v-if="errorMessage">
        <BaseAlert type="error">{{ errorMessage }}</BaseAlert>
      </div>
      <!-- TODO: Standardize filter bar using shared filter components -->
      <BaseTable
        :columns="columns"
        :data="filteredPrescriptions"
        :idKey="'id'"
        :pageSize="10"
        @edit="editPrescription"
        @delete="confirmDelete"
        @row-click="viewPrescription"
      />
      <AddPrescriptionForm 
        v-if="showAddEditModal" 
        :existing-prescription="prescriptionToEdit"
        @close="closeAddEditModal" 
        @prescription-added="refreshPrescriptions" 
        @prescription-updated="refreshPrescriptions" 
      />
      <PrescriptionDetailModal 
        v-if="prescriptionToView" 
        :prescription="prescriptionToView" 
        @close="closeDetailModal" 
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchPrescriptions, deletePrescription, type Prescription } from '@/services/prescriptionService';
import store from '@/store';
import AddPrescriptionForm from '../components/AddPrescriptionForm.vue';
import PrescriptionDetailModal from '../components/Modals/PrescriptionDetailModal.vue';
import BaseTable from '../components/BaseTable.vue';
import { ClipboardDocumentListIcon, UserIcon, CalendarDaysIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import AddButton from '../components/buttons/AddButton.vue';
import BaseAlert from '../components/BaseAlert.vue';

export default defineComponent({
  name: 'PrescriptionsView',
  components: { AddPrescriptionForm, PrescriptionDetailModal, BaseTable, ClipboardDocumentListIcon, UserIcon, CalendarDaysIcon, DocumentTextIcon, AddButton, BaseAlert },
  setup() {
    const prescriptions = ref<Prescription[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddEditModal = ref(false);
    const prescriptionToEdit = ref<Prescription | null>(null);
    const prescriptionToView = ref<Prescription | null>(null);

    const columns = [
      { key: 'id', label: 'ID', sortable: true, icon: ClipboardDocumentListIcon },
      { key: 'patient_name', label: 'Patient', sortable: true, icon: UserIcon },
      { key: 'encounter_id', label: 'Encounter ID', sortable: true, icon: CalendarDaysIcon },
      { key: 'medication_name', label: 'Medication', sortable: true, icon: DocumentTextIcon },
      { key: 'status', label: 'Status', sortable: true, icon: null },
    ];

    const loadPrescriptions = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) {
          errorMessage.value = 'User not authenticated.';
          loading.value = false;
          return;
        }
        prescriptions.value = await fetchPrescriptions(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load prescriptions: ${error.message || 'Unknown error'}`;
        console.error(errorMessage.value, error);
      } finally {
        loading.value = false;
      }
    };

    const refreshPrescriptions = () => {
      loadPrescriptions();
    };

    const openAddPrescriptionModal = () => {
      prescriptionToEdit.value = null;
      showAddEditModal.value = true;
    };

    const closeAddEditModal = () => {
      showAddEditModal.value = false;
      prescriptionToEdit.value = null;
    };

    const viewPrescription = (rx: Prescription) => {
      prescriptionToView.value = rx;
    };

    const closeDetailModal = () => {
      prescriptionToView.value = null;
    };

    const editPrescription = (rx: Prescription) => {
      prescriptionToEdit.value = { ...rx };
      showAddEditModal.value = true;
    };

    const confirmDelete = async (rxId: string | number) => {
      if (confirm('Are you sure you want to delete this prescription?')) {
        try {
          const token = store.state.token;
          if (!token) {
            alert('User not authenticated.');
            return;
          }
          await deletePrescription(rxId, token);
          refreshPrescriptions();
        } catch (error: any) {
          alert(`Failed to delete prescription: ${error.message || 'Unknown error'}`);
        }
      }
    };

    // Filter refs
    const filterPatientName = ref('');
    const filterMedicationName = ref('');
    const filterStatus = ref('');
    // Filtering logic
    const filteredPrescriptions = computed(() => {
      let temp = prescriptions.value as any[];
      if (filterPatientName.value) {
        temp = temp.filter(rx => rx.patient_name?.toLowerCase().includes(filterPatientName.value.toLowerCase()));
      }
      if (filterMedicationName.value) {
        temp = temp.filter(rx => rx.medication_name?.toLowerCase().includes(filterMedicationName.value.toLowerCase()));
      }
      if (filterStatus.value) {
        temp = temp.filter(rx => rx.status === filterStatus.value);
      }
      return temp;
    });
    const clearFilters = () => {
      filterPatientName.value = '';
      filterMedicationName.value = '';
      filterStatus.value = '';
    };

    onMounted(() => {
      loadPrescriptions();
    });

    return {
      prescriptions,
      filteredPrescriptions,
      filterPatientName,
      filterMedicationName,
      filterStatus,
      clearFilters,
      openAddPrescriptionModal,
      viewPrescription,
      editPrescription,
      confirmDelete,
      refreshPrescriptions,
      showAddEditModal,
      prescriptionToEdit,
      closeAddEditModal,
      prescriptionToView,
      closeDetailModal,
      columns,
      ClipboardDocumentListIcon, // <-- add this to expose the icon to the template
    };
  },
});
</script>

<style scoped>
.prescriptions-view-bg {
  background: var(--primary-blue); /* Changed from #eaf4fb to primary color */
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.prescriptions-list-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.prescriptions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.prescriptions-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.prescriptions-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.prescriptions-header button:hover {
  background: var(--teal);
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

/* Filter Bar Styles */
.filters-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  align-items: center;
}
.filter-input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 220px;
}
.clear-filters-btn {
  background-color: var(--primary-blue);
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: background-color 0.3s;
  font-size: 1rem;
  font-weight: 500;
}
.clear-filters-btn:hover {
  background-color: #163052;
}

/* Status specific colors */
.status-active { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending-dispense { color: #ffc107; font-weight: bold; }
</style>
