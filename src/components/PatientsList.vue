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
    <BaseTable
      :columns="columns"
      :data="filteredPatients"
      :idKey="'id'"
      :pageSize="pageSize"
      @row-click="selectPatient"
      @edit="openEditModal"
    />
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
import { ref, computed, onMounted } from "vue";
import AddEditPatientModal from "./Modals/AddEditPatientModal.vue";
import PatientDetail from "./PatientDetail.vue";
import BaseTable from "./BaseTable.vue";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  UserIcon
} from '@heroicons/vue/24/outline';
import { fetchPatients, type Patient } from '../services/patientService';

export default {
  name: 'PatientsList',
  components: { AddEditPatientModal, PatientDetail, BaseTable, UserPlusIcon, MagnifyingGlassIcon, UserIcon },
  setup() {
    const patients = ref<Patient[]>([]);
    const search = ref('');
    const genderFilter = ref('');
    const ageFilter = ref('');
    const recentAppointmentFilter = ref('');
    const showAddEditModal = ref(false);
    const editingPatient = ref<Patient|null>(null);
    const selectedPatient = ref<Patient|null>(null);
    const errorMessage = ref('');
    const syncError = ref('');
    const isSyncing = ref(false);
    const pageSize = 10;

    const columns = [
      { key: 'unique_id', label: 'Unique ID', sortable: true },
      { key: 'first_name', label: 'First Name', sortable: true },
      { key: 'last_name', label: 'Last Name', sortable: true },
      { key: 'date_of_birth', label: 'Date of Birth', sortable: true },
      { key: 'gender', label: 'Gender', sortable: true },
      { key: 'has_recent_appointment', label: 'Recent Appointment', sortable: true,
        render: (row: Patient) => {
          if (row.has_recent_appointment === true) {
            return '<span class="recent-yes">Yes</span>';
          } else if (row.has_recent_appointment === false) {
            return '<span class="recent-no">No</span>';
          } else {
            return '';
          }
        }
      },
    ];

    const filteredPatients = computed(() => {
      let result = [...patients.value];
      if (search.value) {
        const s = search.value.toLowerCase();
        result = result.filter(p =>
          p.first_name?.toLowerCase().includes(s) ||
          p.last_name?.toLowerCase().includes(s) ||
          p.unique_id?.toLowerCase().includes(s) ||
          p.contact_info?.toLowerCase().includes(s)
        );
      }
      if (genderFilter.value) {
        result = result.filter(p => p.gender === genderFilter.value);
      }
      if (ageFilter.value) {
        const now = new Date();
        result = result.filter(p => {
          if (!p.date_of_birth) return false;
          const dob = new Date(p.date_of_birth);
          const age = now.getFullYear() - dob.getFullYear();
          if (ageFilter.value === '0-18') return age >= 0 && age <= 18;
          if (ageFilter.value === '19-40') return age >= 19 && age <= 40;
          if (ageFilter.value === '41-65') return age >= 41 && age <= 65;
          if (ageFilter.value === '66+') return age >= 66;
          return true;
        });
      }
      if (recentAppointmentFilter.value) {
        if (recentAppointmentFilter.value === 'yes') {
          result = result.filter(p => p.has_recent_appointment === true);
        } else if (recentAppointmentFilter.value === 'no') {
          result = result.filter(p => p.has_recent_appointment === false);
        }
      }
      return result;
    });

    function openAddModal() {
      editingPatient.value = null;
      showAddEditModal.value = true;
    }
    function openEditModal(patient: Patient) {
      editingPatient.value = patient;
      showAddEditModal.value = true;
    }
    function closeAddEditModal() {
      showAddEditModal.value = false;
      editingPatient.value = null;
    }
    function selectPatient(patient: Patient) {
      selectedPatient.value = patient;
    }
    function handlePatientChange() {
      loadPatients();
      closeAddEditModal();
      selectedPatient.value = null;
    }
    function clearFilters() {
      search.value = '';
      genderFilter.value = '';
      ageFilter.value = '';
      recentAppointmentFilter.value = '';
    }
    async function loadPatients() {
      try {
        patients.value = await fetchPatients();
      } catch (err) {
        errorMessage.value = 'Failed to load patients.';
      }
    }
    onMounted(loadPatients);

    return {
      search,
      genderFilter,
      ageFilter,
      recentAppointmentFilter,
      showAddEditModal,
      editingPatient,
      selectedPatient,
      errorMessage,
      syncError,
      isSyncing,
      columns,
      pageSize,
      filteredPatients,
      openAddModal,
      openEditModal,
      closeAddEditModal,
      selectPatient,
      handlePatientChange,
      clearFilters,
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
.patients-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: nowrap; /* Prevent stacking */
  width: auto;
}
.patients-filters select {
  flex: 1 1 120px;
  max-width: 140px;
  min-width: 80px;
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
.patients-list {
  background: #fff;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100vh;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 2rem 2vw 1rem 2vw;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
}
.patients-list .base-table {
  min-height: 500px;
  height: 60vh;
  /* Adjust as needed for your layout */
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
  flex-wrap: nowrap; /* Prevent stacking */
  width: auto;
}
.patients-filters select {
  flex: 1 1 120px;
  max-width: 140px;
  min-width: 80px;
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
  min-width: 90px;
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
@media (max-width: 700px) {
  .patients-filters {
    flex-wrap: wrap;
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
