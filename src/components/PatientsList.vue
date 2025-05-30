<template>
  <div class="patients-list">
    <div class="patients-header">
      <h2><UserIcon class="icon-header" /> Patients</h2>
      <button @click="openAddModal">
        <UserPlusIcon class="icon-btn" style="width:1.3em;height:1.3em;margin-right:0.5em;" />
        Add Patient
      </button>
      <div style="position:relative;width:100%;max-width:480px;">
        <MagnifyingGlassIcon class="icon-search" style="position:absolute;left:0.7em;top:50%;transform:translateY(-50%);width:1.2em;height:1.2em;color:#888;pointer-events:none;" />
        <input
          v-model="search"
          class="patients-search"
          type="search"
          placeholder="Search patients by name, ID, or contact..."
          aria-label="Search patients"
          style="padding-left:2.5em;"
        />
      </div>
      <div class="patients-filters">
        <select v-model="genderFilter">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select v-model="ageFilter">
          <option value="">All Ages</option>
          <option value="0-18">0-18</option>
          <option value="19-40">19-40</option>
          <option value="41-65">41-65</option>
          <option value="66+">66+</option>
        </select>
        <select v-model="recentAppointmentFilter">
          <option value="">All</option>
          <option value="yes">Has Recent Appointment</option>
          <option value="no">No Recent Appointment</option>
        </select>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="syncError" class="error-message">
      Synchronization Error: {{ syncError }}
    </div>
    <table class="patients-table">
      <thead>
        <tr>
          <th><IdentificationIcon class="icon-th" /> Unique ID</th>
          <th><UserIcon class="icon-th" /> First Name</th>
          <th><UserIcon class="icon-th" /> Last Name</th>
          <th><CalendarIcon class="icon-th" /> Date of Birth</th>
          <th><UserIcon class="icon-th" /> Gender</th>
          <th><CheckCircleIcon class="icon-th" /> Recent Appointment</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="patient in paginatedPatients"
          :key="patient.id"
        >
          <td @click="selectPatient(patient)">{{ patient.unique_id }}</td>
          <td @click="selectPatient(patient)">{{ patient.first_name }}</td>
          <td @click="selectPatient(patient)">{{ patient.last_name }}</td>
          <td @click="selectPatient(patient)">{{ patient.date_of_birth }}</td>
          <td @click="selectPatient(patient)">{{ patient.gender }}</td>
          <td @click="selectPatient(patient)">
            <span v-if="patient.has_recent_appointment === true" class="recent-yes">Yes</span>
            <span v-else-if="patient.has_recent_appointment === false" class="recent-no">No</span>
            <span v-else>-</span>
          </td>
          <td>
            <button class="edit-btn" @click.stop="openEditModal(patient)">
              <PencilSquareIcon class="icon-btn" style="width:1.1em;height:1.1em;margin-right:0.3em;" />
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination-controls">
      <button :disabled="currentPage === 1" @click="currentPage--">Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
    <AddEditPatientModal
      v-if="showAddEditModal"
      :existing-patient="editingPatient"
      @close="closeAddEditModal"
      @patientAdded="handlePatientChange"
      @patientUpdated="handlePatientChange"
    />
    <PatientDetail
      v-if="selectedPatient"
      :patient="selectedPatient"
      @close="selectedPatient = null"
      @patientUpdated="handlePatientChange"
      @patientDeleted="handlePatientChange"
    />
    <div v-if="isSyncing" class="sync-indicator">Syncing changes...</div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, type Ref } from "vue";
import AddEditPatientModal from "./AddEditPatientModal.vue";
import PatientDetail from "./PatientDetail.vue";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  UserIcon, 
  CalendarIcon, 
  IdentificationIcon, 
  CheckCircleIcon 
} from '@heroicons/vue/24/outline';
import {
  fetchPatients,
  type Patient,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/services/patientService";
import {
  getPatientsOffline,
  getPendingPatients,
  removePatientOffline,
  syncPatientOffline,
  syncOnlinePatientsOffline,
} from "@/services/offlineService";
import store from "@/store";

export default {
  name: "PatientsList",
  components: { AddEditPatientModal, PatientDetail, UserPlusIcon, MagnifyingGlassIcon, PencilSquareIcon, UserIcon, CalendarIcon, IdentificationIcon, CheckCircleIcon },
  setup() {
    const search = ref("");
    const showAddEditModal = ref(false);
    const editingPatient = ref<Patient | null>(null);
    const selectedPatient = ref<Patient | null>(null);
    /** @type {import('@/services/patientService').Patient[]} */
    const patients = ref([]) as Ref<Patient[]>;
    const errorMessage = ref("");
    const syncError = ref(""); // Added state for sync errors
    const isOnline = ref(navigator.onLine);
    const isSyncing = ref(false); // Added loading indicator for sync
    const currentPage = ref(1);
    const pageSize = 10;
    const genderFilter = ref("");
    const ageFilter = ref("");
    const recentAppointmentFilter = ref("");

    const paginatedPatients = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredPatients.value.slice(start, start + pageSize);
    });
    const totalPages = computed(() => Math.ceil(filteredPatients.value.length / pageSize) || 1);

    // Watch for search changes to reset to page 1
    watch(search, () => { currentPage.value = 1; });

    const syncOfflineChanges = async () => {
      const token = store.getters.isAuthenticated ? store.state.token : null;
      if (!token) {
        console.error("Cannot sync offline changes: User not authenticated.");
        syncError.value = "Synchronization failed: User not authenticated.";
        return;
      }

      isSyncing.value = true; // Set syncing state
      syncError.value = ""; // Clear previous sync errors
      const pendingPatients = await getPendingPatients();

      for (const patient of pendingPatients) {
        try {
          if (patient.status === "pending_add") {
            // Create patient online
            const { status, ...patientData } = patient; // Exclude status for API call
            const newPatient = await createPatient(patientData as Patient);
            // Update offline record with online ID and synced status
            // Pass the temporary offline ID to syncPatientOffline
            if (patient.id !== undefined) {
              await syncPatientOffline(patient.id, newPatient);
            } else {
              console.error(
                "Pending add patient missing temporary ID",
                patient
              );
            }
          } else if (patient.status === "pending_update") {
            // Update patient online
            const { status, ...patientData } = patient; // Exclude status for API call
            const updatedPatient = await updatePatient(patientData as Patient);
            // Mark offline record as synced
            // Assuming updatePatient returns the full updated patient including the original ID
            if (updatedPatient.id !== undefined) {
              await syncPatientOffline(updatedPatient.id, updatedPatient);
            } else {
              console.error(
                "Synced patient after update missing ID",
                updatedPatient
              );
            }
          } else if (patient.status === "pending_delete") {
            // Delete patient online
            if (patient.id) {
              await deletePatient(patient.id as string); // Assuming API uses string IDs
              // Remove from offline storage
              await removePatientOffline(patient.id);
            }
          }
        } catch (error: any) {
          console.error("Error syncing patient", patient, error);
          syncError.value = `Error syncing patient ${patient.id}: ${error.message}`; // Store specific sync error
          // TODO: Implement better error handling for sync conflicts/failures (e.g., retry, conflict resolution)
        }
      }
      // After syncing, refetch all patients from the API to ensure consistency
      await fetchAllPatients();
      isSyncing.value = false; // Clear syncing state
    };

    const fetchAllPatients = async () => {
      errorMessage.value = ""; // Clear previous errors
      try {
        if (isOnline.value) {
          const token = store.getters.isAuthenticated
            ? store.state.token
            : null;
          if (token) {
            console.log("Fetching patients from API..."); // Log API fetch
            const onlinePatients = await fetchPatients();
            console.log("Fetched patients from API:", onlinePatients); // Log fetched data
            patients.value = onlinePatients;

            // Synchronize online patients with offline storage
            await syncOnlinePatientsOffline(onlinePatients); // Use the new function
          } else {
            console.log("Fetching patients from offline storage..."); // Log offline fetch
            patients.value = await getPatientsOffline();
            console.log("Fetched patients from offline:", patients.value); // Log fetched data
          }
        } else {
          // Fetch from offline storage if offline
          console.log("Fetching patients from offline storage..."); // Log offline fetch
          patients.value = await getPatientsOffline();
          console.log("Fetched patients from offline:", patients.value); // Log fetched data
        }
      } catch (error: any) {
        errorMessage.value = error.message;
        console.error("Error fetching patients:", error);
      }
    };

    const handlePatientChange = () => {
      // Refetch patients after add, update, or delete (will fetch based on online/offline status)
      fetchAllPatients();
    };

    const handleOnlineStatusChange = async () => {
      isOnline.value = navigator.onLine;
      if (isOnline.value) {
        console.log("App is online, attempting to sync offline changes...");
        await syncOfflineChanges(); // Attempt to sync when coming back online
      }
      fetchAllPatients(); // Refresh list based on current online/offline status
    };

    onMounted(() => {
      fetchAllPatients();
      window.addEventListener("online", handleOnlineStatusChange);
      window.addEventListener("offline", handleOnlineStatusChange);
    });

    onUnmounted(() => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    });

    const filteredPatients = computed(() => {
      const term = search.value.toLowerCase();
      return patients.value.filter((p) => {
        const matchesSearch =
          p.first_name.toLowerCase().includes(term) ||
          p.last_name.toLowerCase().includes(term) ||
          (p.unique_id && p.unique_id.toLowerCase().includes(term)) ||
          (p.contact_info && p.contact_info.toLowerCase().includes(term)) ||
          (p.address && p.address.toLowerCase().includes(term));
        const matchesGender =
          !genderFilter.value ||
          (p.gender && p.gender.toLowerCase() === genderFilter.value);
        const age = p.date_of_birth ? getAge(p.date_of_birth) : null;
        let matchesAge = true;
        if (ageFilter.value === "0-18") matchesAge = age !== null && age <= 18;
        else if (ageFilter.value === "19-40") matchesAge = age !== null && age >= 19 && age <= 40;
        else if (ageFilter.value === "41-65") matchesAge = age !== null && age >= 41 && age <= 65;
        else if (ageFilter.value === "66+") matchesAge = age !== null && age >= 66;
        let matchesRecent = true;
        if (recentAppointmentFilter.value === "yes") matchesRecent = p.has_recent_appointment === true;
        else if (recentAppointmentFilter.value === "no") matchesRecent = p.has_recent_appointment === false;
        return matchesSearch && matchesGender && matchesAge && matchesRecent;
      });
    });

    function getAge(dateString: string): number | null {
      const dob = new Date(dateString);
      if (isNaN(dob.getTime())) return null;
      const diff = Date.now() - dob.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    function selectPatient(patient: Patient) {
      console.log("Selecting patient:", patient);
      selectedPatient.value = patient;
    }

    function openAddModal() {
      editingPatient.value = null;
      showAddEditModal.value = true;
    }
    function openEditModal(patient: Patient) {
      editingPatient.value = { ...patient };
      showAddEditModal.value = true;
    }
    function closeAddEditModal() {
      showAddEditModal.value = false;
      editingPatient.value = null;
    }

    console.log("PatientsList setup return:", {
      search,
      showAddEditModal,
      editingPatient,
      selectedPatient,
      patients,
      filteredPatients,
      selectPatient,
      errorMessage,
      syncError,
      isOnline,
      isSyncing,
      handlePatientChange, // Added handlePatientChange to the return object
    });

    return {
      search,
      showAddEditModal,
      editingPatient,
      selectedPatient,
      patients,
      filteredPatients,
      selectPatient,
      errorMessage,
      syncError,
      isOnline,
      isSyncing,
      handlePatientChange, // Ensure handlePatientChange is returned
      paginatedPatients,
      currentPage,
      totalPages,
      genderFilter,
      ageFilter,
      recentAppointmentFilter,
      openAddModal,
      openEditModal,
      closeAddEditModal,
    };
  },
};
</script>

<style scoped>
:root {
  --patients-header-height: 2.4rem;
}

.patients-header button,
.patients-header .patients-search,
.patients-filters select {
  height: 2.4rem !important;
  min-height: 2.4rem !important;
  max-height: 2.4rem !important;
  line-height: 2.3rem !important;
  font-size: 0.98rem !important;
  box-sizing: border-box;
  vertical-align: middle;
}
.patients-filters select {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}
.patients-list {
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100vh;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 2rem 2vw 1rem 2vw;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
}
.patients-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.patients-header h2 {
  flex: 1 1 100%;
  margin: 0 0 0.5rem 0;
  min-width: 120px;
  word-break: break-word;
}
.patients-header button {
  height: var(--patients-header-height);
  line-height: calc(var(--patients-header-height) - 2px);
  padding: 0 1.4rem;
  font-size: 2.1rem;
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
.patients-header .patients-search {
  height: var(--patients-header-height);
  line-height: calc(var(--patients-header-height) - 2px);
  background: #fff !important;
  color: #111 !important;
  border: 1.5px solid var(--primary-blue, #2563eb);
  border-radius: 6px;
  padding: 0 2.5rem 0 2.2rem;
  font-size: 2.1rem;
  min-width: 340px !important;
  max-width: 480px !important;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(30,58,92,0.07);
  transition: border 0.2s, box-shadow 0.2s;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23888" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>');
  background-repeat: no-repeat;
  background-position: 0.85rem center;
  background-size: 1.1rem 1.1rem;
}
.patients-header .patients-search:focus {
  outline: none;
  border-color: var(--teal, #008080);
  box-shadow: 0 0 0 2px rgba(0,128,128,0.13);
}
.patients-header .patients-search::-webkit-input-placeholder {
  color: #888;
  opacity: 1;
}
.patients-header .patients-search::-moz-placeholder {
  color: #888;
  opacity: 1;
}
.patients-header .patients-search:-ms-input-placeholder {
  color: #888;
  opacity: 1;
}
.patients-header .patients-search::placeholder {
  color: #888;
  opacity: 1;
}
.patients-header .patients-search:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  -webkit-text-fill-color: #111 !important;
  transition: background-color 5000s ease-in-out 0s;
}
@media (prefers-color-scheme: dark) {
  .patients-header .patients-search {
    background: #fff !important;
    color: #111 !important;
  }
}
.patients-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.patients-filters select {
  height: var(--patients-header-height);
  line-height: calc(var(--patients-header-height) - 2px);
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
.patients-header .patients-search, .patients-header button, .patients-filters select {
  min-width: 120px;
  max-height: var(--patients-header-height);
  margin-bottom: 0;
  vertical-align: middle;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.7rem 1.5rem;
}
.pagination-controls button {
  background: #f0f6fa !important;
  color: var(--primary-blue) !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  padding: 0.4rem 1.1rem !important;
  font-size: 1rem !important;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.pagination-controls button:not(:disabled) {
  color: var(--primary-blue) !important;
}
.pagination-controls button:hover:not(:disabled) {
  background: var(--teal) !important;
  color: #fff !important;
  border-color: var(--teal) !important;
}
.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e9ecef !important;
  color: #888 !important;
  border-color: #e0e0e0 !important;
}

@media (max-width: 900px) {
  .patients-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .patients-filters {
    width: 100%;
    justify-content: flex-start;
  }
  .patients-header .patients-search, .patients-header button, .patients-filters select {
    width: 100%;
    min-width: 0;
    margin-right: 0;
  }
}
@media (max-width: 600px) {
  .patients-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .patients-filters {
    width: 100%;
    justify-content: flex-start;
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

.recent-yes {
  color: var(--teal, #008080);
  font-weight: bold;
}
.recent-no {
  color: #b91c1c;
  font-weight: bold;
}
.edit-btn {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.4rem 1.1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.95rem;
  margin: 0 0.2rem;
}
.edit-btn:hover {
  background: var(--teal);
}
.table-icon {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.4rem;
  vertical-align: middle;
  display: inline-block;
  fill: currentColor;
}
.icon {
  width: 1.4rem;
  height: 1.4rem;
  margin-right: 0.4rem;
  vertical-align: middle;
  display: inline-block;
  fill: currentColor;
}
.icon-header,
.icon-btn,
.icon-search,
.icon-th {
  width: 1.1em !important;
  height: 1.1em !important;
  min-width: 1.1em !important;
  min-height: 1.1em !important;
  max-width: 1.1em !important;
  max-height: 1.1em !important;
  vertical-align: middle;
}
</style>
