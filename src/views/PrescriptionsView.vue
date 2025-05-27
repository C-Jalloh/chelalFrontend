<template>
  <div class="prescriptions-view-bg">
    <div class="prescriptions-list-container">
      <div class="prescriptions-header">
        <h2>Prescriptions</h2>
        <button @click="openAddPrescriptionModal">Add Prescription</button>
        <!-- Filters can be added here later -->
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="prescriptions-table-wrapper">
        <table class="prescriptions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Encounter ID</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading prescriptions...</td></tr>
            <tr v-else-if="prescriptions.length === 0"><td>No prescriptions found.</td></tr>
            <tr v-for="rx in prescriptions" :key="rx.id">
              <td>{{ rx.id }}</td>
              <td>{{ rx.patient_name || rx.patient_id }}</td>
              <td>{{ rx.encounter_id }}</td>
              <td>{{ rx.medication_name }}</td>
              <td>{{ rx.dosage }}</td>
              <td>{{ rx.frequency }}</td>
              <td><span :class="`status-${rx.status.toLowerCase().replace(/\s+/g, '-')}`">{{ rx.status }}</span></td>
              <td>
                <button @click="viewPrescription(rx)" class="action-btn view-btn">View</button>
                <button @click="editPrescription(rx)" class="action-btn edit-btn">Edit</button>
                <button @click="confirmDelete(rx.id)" class="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Add/Edit/View Prescription will be added here -->
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
import { defineComponent, ref, onMounted } from 'vue';
import { fetchPrescriptions, deletePrescription, type Prescription } from '@/services/prescriptionService';
import store from '@/store';
import AddPrescriptionForm from '../components/AddPrescriptionForm.vue';
import PrescriptionDetailModal from '../components/PrescriptionDetailModal.vue'; // Import the new detail modal

export default defineComponent({
  name: 'PrescriptionsView',
  components: { AddPrescriptionForm, PrescriptionDetailModal }, // Register the component
  setup() {
    const prescriptions = ref<Prescription[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddEditModal = ref(false);
    const prescriptionToEdit = ref<Prescription | null>(null);
    const prescriptionToView = ref<Prescription | null>(null); // For the detail modal

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
        // TODO: Add filters if needed, e.g., { patient_id: 'some_id' }
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
      prescriptionToEdit.value = null; // Ensure it's a new prescription
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
      prescriptionToEdit.value = { ...rx }; // Pass a copy to edit
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

    onMounted(() => {
      loadPrescriptions();
    });

    return {
      prescriptions,
      loading,
      errorMessage,
      openAddPrescriptionModal,
      viewPrescription,
      editPrescription,
      confirmDelete,
      refreshPrescriptions,
      showAddEditModal,
      prescriptionToEdit,
      closeAddEditModal,
      prescriptionToView, // Expose to template
      closeDetailModal, // Expose to template
    };
  },
});
</script>

<style scoped>
.prescriptions-view-bg {
  background: #eaf4fb; /* Consistent with other views */
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

.prescriptions-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.prescriptions-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.prescriptions-table th,
.prescriptions-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.prescriptions-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.prescriptions-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.prescriptions-table tr:hover {
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
.edit-btn { background-color: var(--primary-blue); color: white; }
.edit-btn:hover { background-color: var(--teal); }
.delete-btn { background-color: #dc3545; color: white; }
.delete-btn:hover { background-color: #c82333; }

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

/* Status specific colors */
.status-active { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending-dispense { color: #ffc107; font-weight: bold; }
</style>
