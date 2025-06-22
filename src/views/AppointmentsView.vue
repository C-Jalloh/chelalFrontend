<template>
  <div class="appointments-view-bg">
    <div class="appointments-list-container">
      <div class="appointments-header">
        <h2><CalendarDaysIcon class="icon-header" /> Appointments</h2>
        <div class="view-mode-toggle">
          <button @click="switchToTableView" :class="['view-mode-btn', { active: currentViewMode === 'table' }]"><EyeIcon class="icon-btn" /> Table View</button>
          <button @click="switchToCalendarView" :class="['view-mode-btn', { active: currentViewMode === 'calendar' }]"><CalendarDaysIcon class="icon-btn" /> Calendar View</button>
        </div>
        <button @click="openAddAppointmentModal" class="add-appointment-btn"><PencilSquareIcon class="icon-btn" /> Add Appointment</button>
      </div>

      <div v-if="currentViewMode === 'table'">
        <div class="filters-container">
          <UserIcon class="icon-search" />
          <input type="text" v-model="filterPatientName" placeholder="Filter by Patient Name..." class="filter-input" />
          <UserGroupIcon class="icon-search" />
          <input type="text" v-model="filterDoctorName" placeholder="Filter by Doctor Name..." class="filter-input" />
          <ClockIcon class="icon-search" />
          <input type="date" v-model="filterDate" class="filter-input" />
          <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <BaseTable
          :columns="columns"
          :data="paginatedAppointments"
          :idKey="'id'"
          :pageSize="pageSize"
          @edit="editAppointment"
          @delete="confirmDelete"
          @row-click="viewAppointment"
        />
      </div>

      <div v-if="currentViewMode === 'calendar'">
        <AppointmentCalendar 
          :appointments="appointments" 
          @date-clicked="handleCalendarDateClick" 
          @event-clicked="handleCalendarEventClick"
        />
      </div>

      <AddAppointmentForm 
        v-if="showAddEditModal" 
        :existing-appointment="appointmentToEdit"
        @close="closeAddEditModal" 
        @appointmentAdded="refreshAppointments" 
        @appointmentUpdated="refreshAppointments" 
      />
      <AppointmentDetailModal 
        v-if="appointmentToView" 
        :appointment="appointmentToView" 
        @close="closeDetailModal" 
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchAppointments, deleteAppointment, type Appointment } from '@/services/appointmentService';
import store from '@/store';
import AddAppointmentForm from '../components/AddAppointmentForm.vue';
import AppointmentDetailModal from '../components/Modals/AppointmentDetailModal.vue';
import AppointmentCalendar from '../components/AppointmentCalendar.vue';
import BaseTable from '../components/BaseTable.vue';
import { CalendarDaysIcon, UserIcon, UserGroupIcon, ClockIcon, PencilSquareIcon, EyeIcon, TrashIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'AppointmentsView',
  components: { 
    AddAppointmentForm, 
    AppointmentDetailModal, 
    AppointmentCalendar,
    BaseTable,
    CalendarDaysIcon, UserIcon, UserGroupIcon, ClockIcon, PencilSquareIcon, EyeIcon, TrashIcon
  },
  setup() {
    const appointments = ref<Appointment[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showAddEditModal = ref(false);
    const appointmentToEdit = ref<Appointment | null>(null);
    const appointmentToView = ref<Appointment | null>(null);
    const currentViewMode = ref('table'); // 'table' or 'calendar'

    // Filter refs
    const filterPatientName = ref('');
    const filterDoctorName = ref('');
    const filterDate = ref('');

    const loadAppointments = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token; // Or however you get your auth token
        if (!token) {
          errorMessage.value = 'User not authenticated.';
          loading.value = false;
          return;
        }
        appointments.value = await fetchAppointments( );
      } catch (error: any) {
        errorMessage.value = `Failed to load appointments: ${error.message || 'Unknown error'}`;
        console.error(errorMessage.value, error);
      } finally {
        loading.value = false;
      }
    };

    const filteredAppointments = computed(() => {
      let tempAppointments = appointments.value;

      if (filterPatientName.value) {
        tempAppointments = tempAppointments.filter(appt => 
          appt.patient_name?.toLowerCase().includes(filterPatientName.value.toLowerCase())
        );
      }
      if (filterDoctorName.value) {
        tempAppointments = tempAppointments.filter(appt => 
          appt.doctor_name?.toLowerCase().includes(filterDoctorName.value.toLowerCase())
        );
      }
      if (filterDate.value) {
        tempAppointments = tempAppointments.filter(appt => 
          appt.appointment_date === filterDate.value
        );
      }
      return tempAppointments;
    });

    const clearFilters = () => {
      filterPatientName.value = '';
      filterDoctorName.value = '';
      filterDate.value = '';
    };

    const switchToCalendarView = () => {
      currentViewMode.value = 'calendar';
    };

    const switchToTableView = () => {
      currentViewMode.value = 'table';
    };

    const handleCalendarDateClick = (dateStr: string) => {
      // Pre-fill date in AddAppointmentForm when a date is clicked on the calendar
      // For now, just open the modal. We can enhance this to pass the date.
      appointmentToEdit.value = null; // Clear any existing edit data
      showAddEditModal.value = true;
      // TODO: Pass dateStr to AddAppointmentForm to prefill the date
      console.log('Date clicked on calendar:', dateStr);
    };

    const handleCalendarEventClick = (appointment: Appointment) => {
      appointmentToView.value = appointment;
    };

    const refreshAppointments = () => {
      loadAppointments();
    };

    const openAddAppointmentModal = () => {
      appointmentToEdit.value = null; // Ensure it's a new appointment
      showAddEditModal.value = true;
    };

    const closeAddEditModal = () => {
      showAddEditModal.value = false;
      appointmentToEdit.value = null;
    };

    const viewAppointment = (appointment: Appointment) => {
      appointmentToView.value = appointment;
    };

    const closeDetailModal = () => {
      appointmentToView.value = null;
    };

    const editAppointment = (appointment: Appointment) => {
      appointmentToEdit.value = { ...appointment }; // Pass a copy to edit
      showAddEditModal.value = true;
    };

    const confirmDelete = async (appointmentId: string | number) => {
      if (confirm('Are you sure you want to delete this appointment?')) {
        try {
          const token = store.state.token;
          if (!token) {
            alert('User not authenticated.');
            return;
          }
          await deleteAppointment(appointmentId);
          refreshAppointments();
        } catch (error: any) {
          alert(`Failed to delete appointment: ${error.message || 'Unknown error'}`);
        }
      }
    };

    const currentPage = ref(1);
    const pageSize = ref(10);
    const paginatedAppointments = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredAppointments.value.slice(start, start + pageSize.value);
    });
    const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / pageSize.value) || 1);
    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) currentPage.value = page;
    };

    // Columns for BaseTable with colored status
    const columns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'patient_name', label: 'Patient', sortable: true },
      { key: 'doctor_name', label: 'Doctor', sortable: true },
      { key: 'appointment_date', label: 'Date', sortable: true },
      { key: 'appointment_time', label: 'Time', sortable: false },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (row: Appointment) => {
          if (!row.status) return '';
          const status = row.status.toLowerCase();
          return `<span class="status-${status}">${row.status}</span>`;
        }
      }
    ];

    onMounted(() => {
      loadAppointments();
    });

    return {
      appointments,
      filteredAppointments, 
      loading,
      errorMessage,
      openAddAppointmentModal,
      viewAppointment, // This will be used by the table view
      editAppointment,
      confirmDelete,
      refreshAppointments,
      showAddEditModal,
      appointmentToEdit,
      closeAddEditModal,
      appointmentToView,
      closeDetailModal,
      filterPatientName,
      filterDoctorName,
      filterDate,
      clearFilters,
      // View mode and calendar handlers
      currentViewMode,
      switchToCalendarView,
      switchToTableView,
      handleCalendarDateClick,
      handleCalendarEventClick,
      paginatedAppointments,
      currentPage,
      totalPages,
      goToPage,
      pageSize,
      columns,
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
  /* Align icons with input fields */
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

.status-scheduled { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending { color: #ffc107; font-weight: bold; }

/* Restored original class-based layout and button styles */
.appointments-view-bg {
  background-color: #1e3a5c; /* dark blue */
  min-height: 100vh;
  padding: 1rem;
}

.appointments-list-container {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.appointments-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.appointments-header h2 {
  color: #1e3a8a;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.view-mode-toggle {
  display: flex;
  gap: 0.5rem;
}
.view-mode-btn {
  background: #fff;
  border: 1.5px solid var(--primary-blue);
  border-radius: 0.375rem;
  color: var(--primary-blue);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.view-mode-btn:hover {
  background: #f0f6fa;
}
.view-mode-btn.active {
  background: var(--primary-blue);
  color: #fff;
  border-color: var(--primary-blue);
}

.add-appointment-btn {
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

.add-appointment-btn:hover {
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

.error-message {
  background-color: #fee2e2;
  border: 1px solid #f87171;
  border-radius: 0.375rem;
  color: #b91c1c;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
}

.appointments-table-wrapper {
  width: 100%;
  /* Remove overflow-x and max-height to allow table to grow/shrink naturally */
  overflow-x: auto;
  margin-bottom: 1rem;
  max-height: unset;
  height: auto;
}

.appointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #111;
}

.appointments-table th,
.appointments-table td {
  padding: 0.72rem 1rem; /* 10% less than previous 0.8rem */
  border: none !important;
  text-align: left;
  white-space: nowrap;
}

.appointments-table th {
  background: var(--primary-blue);
  color: #fff;
  font-weight: 600;
}

.appointments-table tr:nth-child(even) {
  background-color: #eaf0fa;
}

.appointments-table tr:hover {
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
  border-color: var(--teal) !important;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e9ecef !important;
  color: #888 !important;
  border-color: #e0e0e0 !important;
}

.table-action-group .action-btn {
  margin: 0 !important;
}

@media (max-width: 900px) {
  .appointments-list-container {
    padding: 1rem;
  }
  .appointments-table th,
  .appointments-table td {
    padding: 0.45rem 0.5rem; /* 10% less than previous 0.5rem */
    font-size: 0.95rem;
  }
}
@media (max-width: 600px) {
  .appointments-list-container {
    padding: 0.5rem;
  }
  .appointments-table th,
  .appointments-table td {
    padding: 0.27rem 0.2rem; /* 10% less than previous 0.3rem */
    font-size: 0.9rem;
  }
}
</style>
