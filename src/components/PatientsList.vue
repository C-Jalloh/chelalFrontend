<template>
  <div class="patients-list">
    <div class="patients-header">
      <h2>Patients</h2>
      <button @click="showAddPatient = true">Add Patient</button>
      <input v-model="search" placeholder="Search patients..." />
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="syncError" class="error-message">Synchronization Error: {{ syncError }}</div>
    <div class="patients-table-wrapper">
      <table class="patients-table">
        <thead>
          <tr>
            <th>Unique ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in filteredPatients" :key="patient.id" @click="selectPatient(patient)">
            <td>{{ patient.unique_id }}</td>
            <td>{{ patient.first_name }}</td>
            <td>{{ patient.last_name }}</td>
            <td>{{ patient.date_of_birth }}</td>
            <td>{{ patient.gender }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <AddPatientForm v-if="showAddPatient" @close="showAddPatient = false" @patientAdded="handlePatientChange" />
    <PatientDetail v-if="selectedPatient" :patient="selectedPatient" @close="selectedPatient = null" @patientUpdated="handlePatientChange" @patientDeleted="handlePatientChange" />
    <div v-if="isSyncing" class="sync-indicator">Syncing changes...</div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AddPatientForm from './AddPatientForm.vue';
import PatientDetail from './PatientDetail.vue';
import { fetchPatients, type Patient, createPatient, updatePatient, deletePatient } from '@/services/patientService';
import { getPatientsOffline, getPendingPatients, removePatientOffline, syncPatientOffline, syncOnlinePatientsOffline } from '@/services/offlineService';
import store from '@/store';

export default {
  name: 'PatientsList',
  components: { AddPatientForm, PatientDetail },
  setup() {
    const search = ref('');
    const showAddPatient = ref(false);
    const selectedPatient = ref<Patient | null>(null);
    const patients = ref<Patient[]>([]);
    const errorMessage = ref('');
    const syncError = ref(''); // Added state for sync errors
    const isOnline = ref(navigator.onLine);
    const isSyncing = ref(false); // Added loading indicator for sync

    const syncOfflineChanges = async () => {
      const token = store.getters.isAuthenticated ? store.state.token : null;
      if (!token) {
        console.error('Cannot sync offline changes: User not authenticated.');
        syncError.value = 'Synchronization failed: User not authenticated.';
        return;
      }

      isSyncing.value = true; // Set syncing state
      syncError.value = ''; // Clear previous sync errors
      const pendingPatients = await getPendingPatients();

      for (const patient of pendingPatients) {
        try {
          if (patient.status === 'pending_add') {
            // Create patient online
            const { status, ...patientData } = patient; // Exclude status for API call
            const newPatient = await createPatient(patientData as Patient, token);
            // Update offline record with online ID and synced status
            // Pass the temporary offline ID to syncPatientOffline
            if (patient.id !== undefined) {
                 await syncPatientOffline(patient.id, newPatient); 
            } else {
                 console.error('Pending add patient missing temporary ID', patient);
            }
           
          } else if (patient.status === 'pending_update') {
            // Update patient online
             const { status, ...patientData } = patient; // Exclude status for API call
            const updatedPatient = await updatePatient(patientData as Patient, token);
            // Mark offline record as synced
            // Assuming updatePatient returns the full updated patient including the original ID
            if (updatedPatient.id !== undefined) {
                 await syncPatientOffline(updatedPatient.id, updatedPatient); 
            } else {
                 console.error('Synced patient after update missing ID', updatedPatient);
            }

          } else if (patient.status === 'pending_delete') {
            // Delete patient online
            if (patient.id) {
               await deletePatient(patient.id as string, token); // Assuming API uses string IDs
               // Remove from offline storage
               await removePatientOffline(patient.id);
            }
          }
        } catch (error: any) {
          console.error('Error syncing patient', patient, error);
          syncError.value = `Error syncing patient ${patient.id}: ${error.message}`; // Store specific sync error
          // TODO: Implement better error handling for sync conflicts/failures (e.g., retry, conflict resolution)
        }
      }
       // After syncing, refetch all patients from the API to ensure consistency
      await fetchAllPatients();
      isSyncing.value = false; // Clear syncing state
    };

    const fetchAllPatients = async () => {
      errorMessage.value = ''; // Clear previous errors
      try {
        if (isOnline.value) {
          const token = store.getters.isAuthenticated ? store.state.token : null;
          if (token) {
            console.log('Fetching patients from API...'); // Log API fetch
            const onlinePatients = await fetchPatients(token);
            console.log('Fetched patients from API:', onlinePatients); // Log fetched data
            patients.value = onlinePatients;
            
            // Synchronize online patients with offline storage
            await syncOnlinePatientsOffline(onlinePatients); // Use the new function

          } else {
            console.log('Fetching patients from offline storage...'); // Log offline fetch
            patients.value = await getPatientsOffline();
             console.log('Fetched patients from offline:', patients.value); // Log fetched data
          }
        } else {
          // Fetch from offline storage if offline
          console.log('Fetching patients from offline storage...'); // Log offline fetch
          patients.value = await getPatientsOffline();
           console.log('Fetched patients from offline:', patients.value); // Log fetched data
        }
      } catch (error: any) {
        errorMessage.value = error.message;
        console.error('Error fetching patients:', error);
      }
    };

    const handlePatientChange = () => {
      // Refetch patients after add, update, or delete (will fetch based on online/offline status)
      fetchAllPatients();
    };

    const handleOnlineStatusChange = async () => {
      isOnline.value = navigator.onLine;
      if (isOnline.value) {
        console.log('App is online, attempting to sync offline changes...');
        await syncOfflineChanges(); // Attempt to sync when coming back online
      }
      fetchAllPatients(); // Refresh list based on current online/offline status
    };

    onMounted(() => {
      fetchAllPatients();
      window.addEventListener('online', handleOnlineStatusChange);
      window.addEventListener('offline', handleOnlineStatusChange);
    });

    onUnmounted(() => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    });

    const filteredPatients = computed(() => {
      const term = search.value.toLowerCase();
      return patients.value.filter(p =>
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        (p.unique_id && p.unique_id.toLowerCase().includes(term)) ||
        (p.contact_info && p.contact_info.toLowerCase().includes(term)) || // Changed from phone and email
        (p.address && p.address.toLowerCase().includes(term))
      );
    });

    function selectPatient(patient: Patient) {
      console.log('Selecting patient:', patient);
      selectedPatient.value = patient;
    }

    console.log('PatientsList setup return:', { 
        search, 
        showAddPatient, 
        selectedPatient, 
        patients, 
        filteredPatients, 
        selectPatient, 
        errorMessage, 
        syncError, 
        isOnline, 
        isSyncing, 
        handlePatientChange // Added handlePatientChange to the return object
    });

    return { 
        search, 
        showAddPatient, 
        selectedPatient, 
        patients, 
        filteredPatients, 
        selectPatient, 
        errorMessage, 
        syncError, 
        isOnline, 
        isSyncing, 
        handlePatientChange // Ensure handlePatientChange is returned
    };
  },
};
</script>

<style scoped>
.patients-list {
  flex: 1 1 auto;
  width: 100%;
  min-height: 100vh;
  max-width: unset;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 2rem 2vw 1rem 2vw;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}
.patients-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.patients-header h2 {
  flex: 1 1 100%;
  margin: 0 0 0.5rem 0;
}
.patients-header button {
  flex: 0 0 auto;
  background: var(--white);
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.patients-header button:hover {
  background: var(--primary-blue);
  color: var(--white);
}
.patients-header input {
  flex: 1 1 200px;
  min-width: 120px;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.patients-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
  max-width: 100vw;
  box-sizing: border-box;
}
.patients-table {
  width: 100%;
  min-width: 900px;
  max-width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #111;
  table-layout: auto;
}
.patients-table th, .patients-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}
.patients-table th {
  background: #eaf4fb;
  color: #1e3a5c;
  font-weight: 600;
}
.patients-table tr {
  transition: background 0.2s;
  cursor: pointer;
}
.patients-table tr:nth-child(odd) {
  background: #f6fbff;
}
.patients-table tr:nth-child(even) {
  background: #fff;
}
.patients-table tr:hover {
  background: #d0e7f7;
}
@media (max-width: 1200px) {
  .patients-table {
    min-width: 700px;
  }
}
@media (max-width: 900px) {
  .patients-table {
    min-width: 500px;
  }
}
@media (max-width: 600px) {
  .patients-table {
    min-width: 350px;
    font-size: 0.95rem;
  }
  .patients-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .patients-header h2 {
    margin-bottom: 0.2rem;
  }
}
.error-message {
  color: red;
  margin-bottom: 1rem;
}

.sync-indicator {
  margin-top: 1rem;
  color: var(--teal);
  font-weight: bold;
}
</style>
