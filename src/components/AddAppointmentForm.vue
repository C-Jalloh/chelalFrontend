<template>
  <div class="add-appointment-form-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label for="patient">Patient</label>
            <select id="patient" v-model="appointment.patient_id" required>
              <option disabled value="">Select Patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }} (ID: {{ patient.unique_id }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="doctor">Doctor</label>
            <select id="doctor" v-model="appointment.doctor_id" required>
              <option disabled value="">Select Doctor</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="appointment_date">Date</label>
            <input type="date" id="appointment_date" v-model="appointment.appointment_date" required />
          </div>

          <div class="form-group">
            <label for="appointment_time">Time</label>
            <input type="time" id="appointment_time" v-model="appointment.appointment_time" required />
          </div>
        </div>

        <div class="form-group full-width-group">
          <label for="status">Status</label>
          <select id="status" v-model="appointment.status" required>
            <option value="Scheduled">Scheduled</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div class="form-group full-width-group notes-group">
          <label for="notes">Notes</label>
          <textarea id="notes" v-model="appointment.notes"></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Save' }} Appointment</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch } from 'vue';
import { type Appointment, createAppointment, updateAppointment, getDoctors } from '@/services/appointmentService';
import { type Patient, fetchPatients } from '@/services/patientService'; // To fetch patients for dropdown
import store from '@/store';

type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';

export default defineComponent({
  name: 'AddAppointmentForm',
  props: {
    existingAppointment: {
      type: Object as PropType<Appointment | null>,
      default: null,
    },
  },
  emits: ['close', 'appointmentAdded', 'appointmentUpdated'],
  setup(props, { emit }) {
    const appointment = ref<Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'Scheduled' as AppointmentStatus,
      notes: '',
    });

    const patients = ref<Patient[]>([]);
    const doctors = ref<{ id: string; name: string }[]>([]);
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Add New Appointment');

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) {
          errorMessage.value = 'Authentication token not found.';
          return;
        }
        patients.value = await fetchPatients(token); // Fetch all patients
        doctors.value = await getDoctors(); // Fetch doctors
      } catch (error: any) {
        errorMessage.value = `Failed to load data: ${error.message}`;
      }
    };

    watch(() => props.existingAppointment, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Appointment';
        // Map existingAppointment to the form model, excluding non-form fields
        const { id, created_at, updated_at, patient_name, doctor_name, ...formData } = newVal;
        appointment.value = { ...formData };
      } else {
        isEditing.value = false;
        formTitle.value = 'Add New Appointment';
        // Reset form for new appointment
        appointment.value = {
          patient_id: '',
          doctor_id: '',
          appointment_date: '',
          appointment_time: '',
          status: 'Scheduled' as AppointmentStatus,
          notes: '',
        };
      }
    }, { immediate: true });

    onMounted(() => {
      loadInitialData();
    });

    const handleSubmit = async () => {
      errorMessage.value = ''; // Clear previous general errors
      
      // --- Start Validation ---
      if (!appointment.value.patient_id) {
        errorMessage.value = 'Please select a patient.';
        return;
      }
      if (!appointment.value.doctor_id) {
        errorMessage.value = 'Please select a doctor.';
        return;
      }
      if (!appointment.value.appointment_date) {
        errorMessage.value = 'Please select an appointment date.';
        return;
      }
      if (!appointment.value.appointment_time) {
        errorMessage.value = 'Please select an appointment time.';
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
      const [year, month, day] = appointment.value.appointment_date.split('-').map(Number);
      const localSelectedDate = new Date(year, month - 1, day);

      if (localSelectedDate < today && !isEditing.value) { // Only check for past date if not editing an old appointment
        // Or, if editing, ensure the date isn't changed to a past date if it wasn't already in the past.
        // For simplicity now, we only prevent new past appointments.
        // If editing an existing past appointment, this check might need adjustment based on desired logic.
        if (!props.existingAppointment || new Date(props.existingAppointment.appointment_date) >= today || appointment.value.appointment_date !== props.existingAppointment.appointment_date) {
            errorMessage.value = 'Appointment date cannot be in the past.';
            return;
        }
      }
      // --- End Validation ---

      const token = store.state.token;
      if (!token) {
        errorMessage.value = 'User not authenticated.';
        return;
      }

      try {
        if (isEditing.value && props.existingAppointment?.id) {
          const updated = await updateAppointment(props.existingAppointment.id, appointment.value, token);
          emit('appointmentUpdated', updated);
        } else {
          const newAppt = await createAppointment(appointment.value, token);
          emit('appointmentAdded', newAppt);
        }
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to save appointment: ${error.message}`;
      }
    };

    return {
      appointment,
      patients,
      doctors,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
    };
  },
});
</script>

<style scoped>
.add-appointment-form-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  min-width: 520px; /* Slightly wider */
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.6rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem 1.8rem; /* Increased gap */
  margin-bottom: 1.2rem; /* Adjusted margin */
}

.full-width-group {
  grid-column: 1 / -1; /* Span full width */
  margin-top: 1.2rem; /* Add margin top for separation */
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.6rem; /* Increased margin */
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.notes-group {
  /* grid-column: 1 / -1; /* No longer needed here, handled by full-width-group */
  margin-top: 1.2rem; /* Ensure consistent margin */
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.submit-btn {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.submit-btn:hover {
  background: var(--teal);
}
.cancel-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.cancel-btn:hover {
  background: #b0b0b0;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
