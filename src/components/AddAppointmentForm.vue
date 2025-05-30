<template>
  <div class="add-appointment-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">{{ existingAppointment ? 'Edit Appointment' : 'Add Appointment' }}</h3>
      <form @submit.prevent="handleSubmit" class="appointment-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Patient</label>
            <input v-model="form.patient_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Doctor</label>
            <input v-model="form.doctor_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="form.appointment_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Time</label>
            <input v-model="form.appointment_time" type="time" required />
          </div>
          <div class="form-group full-width-group">
            <label>Status</label>
            <select v-model="form.status" required>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div class="form-group full-width-group notes-group">
            <label>Notes</label>
            <textarea v-model="form.notes" placeholder="Optional notes..."></textarea>
          </div>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
          <button type="submit" class="submit-btn">{{ existingAppointment ? 'Update' : 'Add' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch } from 'vue';
import { type Appointment, createAppointment, getDoctors, updateAppointmentBackend, type AppointmentBackend } from '@/services/appointmentService';
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
        patients.value = await fetchPatients(); // Fetch all patients
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
        // Always send status as lowercase for backend compatibility
        let statusLower: string;
        switch (appointment.value.status.toLowerCase()) {
          case 'scheduled': statusLower = 'scheduled'; break;
          case 'completed': statusLower = 'completed'; break;
          case 'cancelled': statusLower = 'cancelled'; break;
          case 'pending': statusLower = 'pending'; break;
          default: statusLower = 'scheduled'; // fallback
        }
        if (isEditing.value && props.existingAppointment?.id) {
          const backendPayload: AppointmentBackend = {
            id: props.existingAppointment.id,
            patient: appointment.value.patient_id,
            doctor: appointment.value.doctor_id,
            date: appointment.value.appointment_date,
            time: appointment.value.appointment_time,
            status: statusLower,
            notes: appointment.value.notes,
          };
          await updateAppointmentBackend(backendPayload);
          emit('appointmentUpdated', backendPayload);
        } else {
          // For create, keep using the original function (if it works)
          const newAppt = await createAppointment(appointment.value);
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
.add-appointment-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  padding: 2rem;
  outline: none;
}

.modal-title {
  color: #1e3a8a;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}

.appointment-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group textarea {
  min-height: 3rem;
  resize: vertical;
}

.full-width-group {
  grid-column: span 2;
}

.notes-group {
  grid-column: span 2;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #4b5563;
}

.submit-btn {
  background: #1e3a8a;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #2563eb;
}
</style>
