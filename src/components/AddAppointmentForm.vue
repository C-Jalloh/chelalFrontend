<template>
  <BaseAddEditModal
    :show="true"
    @close="$emit('close')"
    :error-message="errorMessage"
    :loading="false"
    @submit="handleSubmit"
  >
    <template #title>
      {{ isEditing ? 'Edit Appointment' : 'Add Appointment' }}
    </template>
    <template #default>
      <form @submit.prevent="handleSubmit" class="appointment-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Patient</label>
            <select v-model="appointment.patient_id" required>
              <option value="" disabled>Select a patient</option>
              <option v-for="p in patients" :key="p.id" :value="p.id">
                {{ p.first_name }} {{ p.last_name }} ({{ p.unique_id }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Doctor</label>
            <select v-model="appointment.doctor_id" required>
              <option value="" disabled>Select a doctor</option>
              <option v-for="d in doctors" :key="d.id" :value="d.id">
                {{ d.name || d.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="appointment.appointment_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Time</label>
            <input v-model="appointment.appointment_time" type="time" required />
          </div>
          <div class="form-group full-width-group">
            <label>Status</label>
            <select v-model="appointment.status" required>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div class="form-group full-width-group notes-group">
            <label>Notes</label>
            <textarea v-model="appointment.notes" placeholder="Optional notes..."></textarea>
          </div>
        </div>
      </form>
    </template>
    <template #submit-label>
      {{ isEditing ? 'Update' : 'Add' }}
    </template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch } from 'vue';
import { type Appointment, createAppointment, getDoctors, updateAppointmentBackend, type AppointmentBackend } from '@/services/appointmentService';
import { type Patient, fetchPatients } from '@/services/patientService'; // To fetch patients for dropdown
import store from '@/store';
import BaseAddEditModal from './Modals/BaseAddEditModal.vue';

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
  components: { BaseAddEditModal },
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
        patients.value = await fetchPatients(); // Fetch all patients
        // Fetch doctors and ensure each has a 'name' field for display
        const rawDoctors = await getDoctors();
        doctors.value = rawDoctors.map((d: any) => ({
          ...d,
          name: d.name || (d.first_name && d.last_name ? `${d.first_name} ${d.last_name}` : d.username || d.email || d.id)
        }));
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
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
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
</style>
