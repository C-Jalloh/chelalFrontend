<template>
  <div class="appointments-view-bg">
    <div class="appointments-list-container">
      <div class="appointments-header">
        <h2>Appointments</h2>
        <div class="view-mode-toggle">
          <button @click="switchToTableView" :class="{ active: currentViewMode === 'table' }">Table View</button>
          <button @click="switchToCalendarView" :class="{ active: currentViewMode === 'calendar' }">Calendar View</button>
        </div>
        <button @click="openAddAppointmentModal" class="add-appointment-btn">Add Appointment</button>
      </div>

      <div v-if="currentViewMode === 'table'">
        <div class="filters-container">
          <input type="text" v-model="filterPatientName" placeholder="Filter by Patient Name..." class="filter-input" />
          <input type="text" v-model="filterDoctorName" placeholder="Filter by Doctor Name..." class="filter-input" />
          <input type="date" v-model="filterDate" class="filter-input" />
          <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="appointments-table-wrapper">
          <table class="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td>Loading appointments...</td></tr>
              <tr v-else-if="filteredAppointments.length === 0"><td>No appointments match your filters or none exist.</td></tr>
              <tr v-for="appointment in filteredAppointments" :key="appointment.id">
                <td>{{ appointment.id }}</td>
                <td>{{ appointment.patient_name || appointment.patient_id }}</td>
                <td>{{ appointment.doctor_name || appointment.doctor_id }}</td>
                <td>{{ appointment.appointment_date }}</td>
                <td>{{ appointment.appointment_time }}</td>
                <td><span :class="`status-${appointment.status.toLowerCase()}`">{{ appointment.status }}</span></td>
                <td>
                  <button @click="viewAppointment(appointment)" class="action-btn view-btn">View</button>
                  <button @click="editAppointment(appointment)" class="action-btn edit-btn">Edit</button>
                  <button @click="confirmDelete(appointment.id)" class="action-btn delete-btn">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import AppointmentDetailModal from '../components/AppointmentDetailModal.vue';
import AppointmentCalendar from '../components/AppointmentCalendar.vue'; // Import the new calendar component

export default defineComponent({
  name: 'AppointmentsView',
  components: { 
    AddAppointmentForm, 
    AppointmentDetailModal, 
    AppointmentCalendar // Register the calendar component
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
        appointments.value = await fetchAppointments(token);
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
          await deleteAppointment(appointmentId, token);
          refreshAppointments();
        } catch (error: any) {
          alert(`Failed to delete appointment: ${error.message || 'Unknown error'}`);
        }
      }
    };

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
    };
  },
});
</script>

<style scoped>
.appointments-view-bg {
  background: #eaf4fb; /* blueish white from PatientsView */
  color: #111; /* black text from PatientsView */
  min-height: 100vh;
  width: 100%; /* Changed from 100vw to 100% to fit within parent */
  padding: 1rem 2rem; /* Added padding */
  box-sizing: border-box;
}

.appointments-list-container {
  background: #fff; /* White background for the content area */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.appointments-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.view-mode-toggle button {
  background: #f0f6fa;
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  transition: background-color 0.2s, color 0.2s;
}

.view-mode-toggle button.active {
  background: var(--primary-blue);
  color: var(--white);
}

.view-mode-toggle button:hover:not(.active) {
  background: #e6f3fb;
}

.add-appointment-btn {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.add-appointment-btn:hover {
  background: var(--teal);
}

.filters-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa; /* Light background for filter area */
  border-radius: 6px;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  flex-grow: 1;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-filters-btn:hover {
  background-color: #5a6268;
}

.view-mode-switcher {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.view-mode-btn {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.view-mode-btn:hover {
  background-color: #0056b3;
}

.view-mode-btn.active {
  background-color: #0056b3;
  font-weight: bold;
}

.appointments-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.appointments-table th,
.appointments-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.appointments-table th {
  background: #f0f6fa; /* Lighter blue for table header */
  color: var(--primary-blue);
  font-weight: 600;
}

.appointments-table tr:nth-child(even) {
  background-color: #f9fcff; /* Slightly off-white for even rows */
}

.appointments-table tr:hover {
  background-color: #e6f3fb;
}

.status-scheduled { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending { color: #ffc107; font-weight: bold; }

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

/* Additional styles for calendar view if needed */
.appointments-calendar-wrapper {
  margin-top: 1rem;
}
</style>
