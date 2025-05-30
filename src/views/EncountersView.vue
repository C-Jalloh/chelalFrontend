<template>
  <div class="encounters-view-bg">
    <div class="encounters-list-container">
      <div class="encounters-header">
        <h2><CalendarDaysIcon class="icon-header" /> Encounters</h2>
        <button @click="openAddEncounterModal" class="add-encounter-btn"><PencilSquareIcon class="icon-btn" /> Add Encounter</button>
      </div>

      <div class="filters-container">
        <UserIcon class="icon-search" />
        <input type="text" v-model="filterPatientName" placeholder="Filter by Patient..." class="filter-input" />
        <UserGroupIcon class="icon-search" />
        <input type="text" v-model="filterDoctorName" placeholder="Filter by Doctor..." class="filter-input" />
        <CalendarDaysIcon class="icon-search" />
        <input type="date" v-model="filterEncounterDate" class="filter-input" />
        <input type="text" v-model="filterDiagnosis" placeholder="Filter by Diagnosis..." class="filter-input" />
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="encounters-table-wrapper responsive-table-wrapper">
        <table class="encounters-table">
          <thead>
            <tr>
              <th><UserIcon class="icon-th" /> Patient</th>
              <th><UserGroupIcon class="icon-th" /> Doctor</th>
              <th><CalendarDaysIcon class="icon-th" /> Date</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="5">Loading encounters...</td></tr>
            <tr v-else-if="paginatedEncounters.length === 0"><td colspan="5">No encounters match your filters or none exist.</td></tr>
            <tr v-for="encounter in paginatedEncounters" :key="encounter.id" @click="handleRowClick(encounter, $event)">
              <td>{{ encounter.patient_name || encounter.patient_id }}</td>
              <td>{{ encounter.doctor_name || encounter.doctor_id }}</td>
              <td>{{ encounter.appointment_date || encounter.encounter_date }}</td>
              <td>{{ encounter.diagnosis || 'N/A' }}</td>
              <td>
                <div class="table-action-group">
                  <button @click.stop="viewEncounter(encounter)" class="action-btn view-btn"><EyeIcon class="icon-btn" /> View</button>
                  <button @click.stop="editEncounter(encounter)" class="action-btn edit-btn"><PencilSquareIcon class="icon-btn" /> Edit</button>
                  <button @click.stop="confirmDelete(encounter.id)" class="action-btn delete-btn"><TrashIcon class="icon-btn" /> Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-controls">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">&lt; Prev</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Next &gt;</button>
      </div>

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
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchEncounters, deleteEncounter, type Encounter } from '@/services/encounterService';
import store from '@/store';
import AddEncounterForm from '../components/AddEncounterForm.vue';
import EncounterDetailModal from '../components/EncounterDetailModal.vue';
import { CalendarDaysIcon, UserIcon, UserGroupIcon, PencilSquareIcon, EyeIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useUniversalTableClick } from '../components/UniversalTableClick';

export default defineComponent({
  name: 'EncountersView',
  components: { AddEncounterForm, EncounterDetailModal, CalendarDaysIcon, UserIcon, UserGroupIcon, PencilSquareIcon, EyeIcon, TrashIcon },
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
    // Pagination
    const currentPage = ref(1);
    const pageSize = ref(10);
    const paginatedEncounters = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredEncounters.value.slice(start, start + pageSize.value);
    });
    const totalPages = computed(() => Math.ceil(filteredEncounters.value.length / pageSize.value) || 1);
    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) currentPage.value = page;
    };
    // Filtering
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
    const refreshEncounters = () => { loadEncounters(); };
    const openAddEncounterModal = () => { encounterToEdit.value = null; showAddEditModal.value = true; };
    const closeAddEditModal = () => { showAddEditModal.value = false; encounterToEdit.value = null; };
    const viewEncounter = (encounter: Encounter) => { encounterToView.value = encounter; };
    const closeDetailModal = () => { encounterToView.value = null; };
    const editEncounter = (encounter: Encounter) => { encounterToEdit.value = { ...encounter }; showAddEditModal.value = true; };
    const confirmDelete = async (encounterId: string | number) => {
      if (confirm('Are you sure you want to delete this encounter record?')) {
        try {
          const token = store.state.token;
          if (!token) { alert('User not authenticated.'); return; }
          await deleteEncounter(encounterId);
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
        encounters.value = await fetchEncounters(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load encounters: ${error.message || 'Unknown error'}`;
        console.error(errorMessage.value, error);
      } finally {
        loading.value = false;
      }
    };
    const { handleRowClick } = useUniversalTableClick<Encounter>((entry) => viewEncounter(entry));
    onMounted(() => { loadEncounters(); });
    return {
      encounters,
      filteredEncounters,
      paginatedEncounters,
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
      filterPatientName,
      filterDoctorName,
      filterEncounterDate,
      filterDiagnosis,
      clearFilters,
      currentPage,
      totalPages,
      goToPage,
      handleRowClick,
    };
  },
});
</script>

<style scoped>
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
  margin-right: 0.35em;
  position: relative;
  top: 0.08em;
}
.filters-container .icon-search {
  margin-right: 0.3em;
  margin-left: 0.1em;
  position: relative;
  top: 0.18em;
  display: inline-block;
  vertical-align: middle;
}
.encounters-view-bg {
  background: #1e3a5c;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}
.encounters-list-container {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.encounters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.encounters-header h2 {
  color: #1e3a8a;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.add-encounter-btn {
  background-color: var(--primary-blue) !important;
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}
.add-encounter-btn:hover {
  background-color: #163052 !important;
}
.filters-container {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.filter-input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 250px;
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
.encounters-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
  max-height: unset;
  height: auto;
}
.encounters-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #111;
}
.encounters-table th,
.encounters-table td {
  padding: 0.58rem 0.8rem; /* 20% less than previous 0.72rem 1rem */
  border: none !important;
  text-align: left;
  white-space: nowrap;
}
.encounters-table th {
  background: var(--primary-blue);
  color: #fff;
  font-weight: 600;
}
.encounters-table tr:nth-child(even) {
  background-color: #eaf0fa;
}
.encounters-table tr:hover {
  background-color: #e0e7ef;
}
.table-action-group {
  display: flex;
  gap: 0.5rem;
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
}
.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e9ecef !important;
  color: #888 !important;
  border-color: #e0e0e0 !important;
}
.view-btn {
  background: var(--primary-blue);
  color: #fff;
  border: none;
  transition: background 0.2s;
}
.view-btn:hover {
  background: #163052;
}
.edit-btn {
  background: var(--primary-blue);
  color: #fff;
  border: none;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #163052;
}
.delete-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #b91c1c;
}
@media (max-width: 900px) {
  .encounters-list-container {
    padding: 1rem;
  }
  .encounters-table th,
  .encounters-table td {
    padding: 0.45rem 0.5rem;
    font-size: 0.95rem;
  }
}
@media (max-width: 600px) {
  .encounters-list-container {
    padding: 0.5rem;
  }
  .encounters-table th,
  .encounters-table td {
    padding: 0.27rem 0.2rem;
    font-size: 0.9rem;
  }
}
</style>
