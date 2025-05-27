<template>
  <div class="encounters-view-bg">
    <div class="encounters-list-container">
      <div class="encounters-header">
        <h2>Encounters</h2>
        <button @click="openAddEncounterModal">Add Encounter</button>
      </div>

      <div class="filters-container">
        <input type="text" v-model="filterPatientName" placeholder="Filter by Patient..." class="filter-input" />
        <input type="text" v-model="filterDoctorName" placeholder="Filter by Doctor..." class="filter-input" />
        <input type="date" v-model="filterEncounterDate" class="filter-input" />
        <input type="text" v-model="filterDiagnosis" placeholder="Filter by Diagnosis..." class="filter-input" />
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="encounters-table-wrapper">
        <table class="encounters-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading encounters...</td></tr>
            <tr v-else-if="filteredEncounters.length === 0"><td>No encounters match your filters or none exist.</td></tr>
            <tr v-for="encounter in filteredEncounters" :key="encounter.id">
              <td>{{ encounter.id }}</td>
              <td>{{ encounter.appointment_id }}</td>
              <td>{{ encounter.patient_name || encounter.patient_id }}</td>
              <td>{{ encounter.doctor_name || encounter.doctor_id }}</td>
              <td>{{ encounter.encounter_date }}</td>
              <td>{{ encounter.diagnosis || 'N/A' }}</td>
              <td>
                <button @click="viewEncounter(encounter)" class="action-btn view-btn">View</button>
                <button @click="editEncounter(encounter)" class="action-btn edit-btn">Edit</button>
                <button @click="confirmDelete(encounter.id)" class="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals for Add/Edit/View Encounter will be added here -->
      <AddEncounterForm 
        v-if="showAddEditModal" 
        :existing-encounter="encounterToEdit"
        @close="closeAddEditModal" 
        @encounter-added="refreshEncounters" 
        @encounter-updated="refreshEncounters" 
      />
      <EncounterDetailModal 
        v-if="encounterToView" 
        :encounter="encounterToView" 
        @close="closeDetailModal" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'; // Added computed
import { fetchEncounters, deleteEncounter, type Encounter } from '@/services/encounterService';
import store from '@/store';
import AddEncounterForm from '../components/AddEncounterForm.vue';
import EncounterDetailModal from '../components/EncounterDetailModal.vue'; // Import the new detail modal

export default defineComponent({
  name: 'EncountersView',
  components: { AddEncounterForm, EncounterDetailModal }, // Register the component
  setup() {
    const encounters = ref<Encounter[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddEditModal = ref(false);
    const encounterToEdit = ref<Encounter | null>(null);
    const encounterToView = ref<Encounter | null>(null);

    // Filter refs
    const filterPatientName = ref('');
    const filterDoctorName = ref('');
    const filterEncounterDate = ref('');
    const filterDiagnosis = ref('');

    const loadEncounters = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) {
          errorMessage.value = 'User not authenticated.';
          loading.value = false;
          return;
        }
        // TODO: Add filters if needed, e.g., fetchEncounters(token, { patient_id: 'some_patient_id' })
        encounters.value = await fetchEncounters(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load encounters: ${error.message || 'Unknown error'}`;
        console.error(errorMessage.value, error);
      } finally {
        loading.value = false;
      }
    };

    const filteredEncounters = computed(() => {
      let tempEncounters = encounters.value;

      if (filterPatientName.value) {
        tempEncounters = tempEncounters.filter(enc => 
          enc.patient_name?.toLowerCase().includes(filterPatientName.value.toLowerCase())
        );
      }
      if (filterDoctorName.value) {
        tempEncounters = tempEncounters.filter(enc => 
          enc.doctor_name?.toLowerCase().includes(filterDoctorName.value.toLowerCase())
        );
      }
      if (filterEncounterDate.value) {
        tempEncounters = tempEncounters.filter(enc => 
          enc.encounter_date === filterEncounterDate.value
        );
      }
      if (filterDiagnosis.value) {
        tempEncounters = tempEncounters.filter(enc => 
          enc.diagnosis?.toLowerCase().includes(filterDiagnosis.value.toLowerCase())
        );
      }
      return tempEncounters;
    });

    const refreshEncounters = () => {
      loadEncounters();
    };

    const openAddEncounterModal = () => {
      encounterToEdit.value = null; // Ensure it's a new encounter
      showAddEditModal.value = true;
    };

    const closeAddEditModal = () => {
      showAddEditModal.value = false;
      encounterToEdit.value = null;
    };

    const viewEncounter = (encounter: Encounter) => {
      encounterToView.value = encounter;
    };

    const closeDetailModal = () => {
      encounterToView.value = null;
    };

    const editEncounter = (encounter: Encounter) => {
      encounterToEdit.value = { ...encounter }; // Pass a copy to edit
      showAddEditModal.value = true;
    };

    const confirmDelete = async (encounterId: string | number) => {
      if (confirm('Are you sure you want to delete this encounter record?')) {
        try {
          const token = store.state.token;
          if (!token) {
            alert('User not authenticated.');
            return;
          }
          await deleteEncounter(encounterId, token);
          refreshEncounters();
        } catch (error: any) {
          alert(`Failed to delete encounter: ${error.message || 'Unknown error'}`);
        }
      }
    };

    const clearFilters = () => {
      filterPatientName.value = '';
      filterDoctorName.value = '';
      filterEncounterDate.value = '';
      filterDiagnosis.value = '';
    };

    onMounted(() => {
      loadEncounters();
    });

    return {
      encounters, // Original list
      filteredEncounters, // For the table
      loading,
      errorMessage,
      openAddEncounterModal,
      viewEncounter,
      editEncounter,
      confirmDelete,
      refreshEncounters,
      showAddEditModal,
      encounterToEdit,
      closeAddEditModal,
      encounterToView,
      closeDetailModal,
      // Filter related
      filterPatientName,
      filterDoctorName,
      filterEncounterDate,
      filterDiagnosis,
      clearFilters,
    };
  },
});
</script>

<style scoped>
.encounters-view-bg {
  background: #eaf4fb; /* Consistent with PatientsView */
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.encounters-list-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.encounters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.encounters-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.encounters-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.encounters-header button:hover {
  background: var(--teal);
}

.filters-container {
  display: flex;
  flex-wrap: wrap; /* Allow filters to wrap on smaller screens */
  gap: 0.8rem; /* Reduced gap slightly */
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
  min-width: 150px; /* Minimum width for inputs */
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  flex-shrink: 0; /* Prevent button from shrinking too much */
}

.clear-filters-btn:hover {
  background-color: #5a6268;
}

.encounters-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.encounters-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.encounters-table th,
.encounters-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.encounters-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.encounters-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.encounters-table tr:hover {
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
</style>
