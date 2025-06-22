<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Appointment' : 'Add New Appointment' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Appointment Information</legend>
        <div class="form-section"><span class="section-title">Appointment Info</span></div>
        <div class="form-grid">
          <FormSelect
            id="patient_id"
            label="Patient"
            v-model="formAppointment.patient_id"
            :options="patientOptions"
            :required="true"
            placeholder="Select Patient"
            :errorMessage="validation.patient_id"
            @blur="validateField('patient_id')"
            @change="validateField('patient_id')"
            :autofocus="true"
          />
          <FormSelect
            id="doctor_id"
            label="Doctor"
            v-model="formAppointment.doctor_id"
            :options="doctorOptions"
            :required="true"
            placeholder="Select Doctor"
            :errorMessage="validation.doctor_id"
            @blur="validateField('doctor_id')"
            @change="validateField('doctor_id')"
          />
          <FormInput
            id="appointment_date"
            label="Date"
            type="date"
            v-model="formAppointment.appointment_date"
            :required="true"
            :errorMessage="validation.appointment_date"
            @blur="validateField('appointment_date')"
            @input="validateField('appointment_date')"
          />
          <FormInput
            id="appointment_time"
            label="Time"
            type="time"
            v-model="formAppointment.appointment_time"
            :required="true"
            :errorMessage="validation.appointment_time"
            @blur="validateField('appointment_time')"
            @input="validateField('appointment_time')"
          />
          <FormSelect
            id="status"
            label="Status"
            v-model="formAppointment.status"
            :options="statusOptions"
            :required="true"
            placeholder="Select Status"
            :errorMessage="validation.status"
            @blur="validateField('status')"
            @change="validateField('status')"
          />
        </div>
        <div class="form-section"><span class="section-title">Notes <span class="optional">(optional)</span></span></div>
        <div class="form-group full-width-group notes-group">
          <FormTextarea
            id="notes"
            label="Notes"
            v-model="formAppointment.notes"
            placeholder="Reason for visit, etc."
            :maxlength="500"
            :errorMessage="validation.notes"
            helpText="Optional. Max 500 characters."
            @blur="validateField('notes')"
            @input="validateField('notes')"
          />
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Save Appointment' : 'Create Appointment') }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, type PropType } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';
import { type Appointment, createAppointment, updateAppointment, getDoctors } from '@/services/appointmentService';
import { type Patient, fetchPatients } from '@/services/patientService';
import { addAppointmentOffline, updateAppointmentOffline } from '@/services/offlineService';

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending';

interface AppointmentForm {
  patient_id: string | number;
  doctor_id: string | number;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes?: string;
}

export default defineComponent({
  name: 'AddEditAppointmentModal',
  components: { 
    BaseAddEditModal,
    FormInput,
    FormSelect,
    FormTextarea
  },
  props: {
    existingAppointment: {
      type: Object as PropType<Appointment | null>,
      default: null,
    },
  },
  emits: ['close', 'appointmentAdded', 'appointmentUpdated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    
    const formAppointment = ref<Partial<AppointmentForm>>({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'scheduled',
      notes: '',
    });

    const validation = ref<Record<string, string | null>>({});
    const patients = ref<Patient[]>([]);
    const doctors = ref<any[]>([]); 

    const patientOptions = computed(() => 
      patients.value
        .filter(p => p.id !== undefined)
        .map(p => ({ value: p.id!, text: `${p.first_name} ${p.last_name} (${p.unique_id})` }))
    );

    const doctorOptions = computed(() => 
      doctors.value
        .filter(d => d.id !== undefined)
        .map(d => ({ value: d.id!, text: `${d.first_name} ${d.last_name}` }))
    );

    const statusOptions = [
      { value: 'scheduled', text: 'Scheduled' },
      { value: 'completed', text: 'Completed' },
      { value: 'cancelled', text: 'Cancelled' },
      { value: 'pending', text: 'Pending' },
    ];

    const loadInitialData = async () => {
      loading.value = true;
      try {
        patients.value = await fetchPatients();
        doctors.value = await getDoctors(); 
      } catch (error: any) {
        errorMessage.value = `Failed to load initial data: ${error.message}`;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadInitialData();
    });

    watch(() => props.existingAppointment, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formAppointment.value = {
          patient_id: newVal.patient_id,
          doctor_id: newVal.doctor_id,
          appointment_date: newVal.appointment_date, 
          appointment_time: newVal.appointment_time, 
          status: newVal.status as AppointmentStatus,
          notes: newVal.notes || '',
        };
      } else {
        isEditing.value = false;
        formAppointment.value = {
          patient_id: '',
          doctor_id: '',
          appointment_date: '',
          appointment_time: '',
          status: 'scheduled',
          notes: '',
        };
      }
      validation.value = {};
      errorMessage.value = '';
      successMessage.value = '';
    }, { immediate: true, deep: true });

    function validateField(field: keyof AppointmentForm) {
      switch (field) {
        case 'patient_id':
          validation.value.patient_id = !formAppointment.value.patient_id ? 'Patient is required.' : null;
          break;
        case 'doctor_id':
          validation.value.doctor_id = !formAppointment.value.doctor_id ? 'Doctor is required.' : null;
          break;
        case 'appointment_date':
          validation.value.appointment_date = !formAppointment.value.appointment_date ? 'Date is required.' : null;
          break;
        case 'appointment_time':
          validation.value.appointment_time = !formAppointment.value.appointment_time ? 'Time is required.' : null;
          break;
        case 'status':
          validation.value.status = !formAppointment.value.status ? 'Status is required.' : null;
          break;
        case 'notes':
          if (formAppointment.value.notes && formAppointment.value.notes.length > 500)
            validation.value.notes = 'Notes are too long (max 500 characters).';
          else validation.value.notes = null;
          break;
      }
    }

    function validateAll() {
      validateField('patient_id');
      validateField('doctor_id');
      validateField('appointment_date');
      validateField('appointment_time');
      validateField('status');
      validateField('notes');
      return Object.values(validation.value).every(v => !v);
    }

    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      if (!validateAll()) {
        errorMessage.value = 'Please correct the highlighted errors.';
        return;
      }
      loading.value = true;

      const payload: any = {
        ...formAppointment.value,
      };

      try {
        if (navigator.onLine) {
          if (isEditing.value && props.existingAppointment?.id) {
            const updated = await updateAppointment({ ...payload, id: props.existingAppointment.id } as Appointment);
            emit('appointmentUpdated', updated);
            successMessage.value = 'Appointment updated successfully!';
          } else {
            const newAppointment = await createAppointment(payload as Omit<Appointment, 'id'>);
            emit('appointmentAdded', newAppointment);
            successMessage.value = 'Appointment added successfully!';
          }
        } else {
          if (isEditing.value && props.existingAppointment?.id) {
            const updated = await updateAppointmentOffline({ ...payload, id: props.existingAppointment.id } as Appointment);
            emit('appointmentUpdated', updated);
            successMessage.value = 'Appointment updated (offline)!';
          } else {
            const newAppointment = await addAppointmentOffline(payload as Omit<Appointment, 'id'>);
            emit('appointmentAdded', newAppointment);
            successMessage.value = 'Appointment added (offline)!';
          }
        }
        setTimeout(() => { 
          successMessage.value = ''; 
          emit('close'); 
        }, 1200);
      } catch (error: any) {
        errorMessage.value = error.response?.data?.detail || error.message || 'An unexpected error occurred.';
        if (error.response?.data) {
          const backendErrors = error.response.data;
          for (const key in backendErrors) {
            if (formAppointment.value.hasOwnProperty(key) || validation.value.hasOwnProperty(key)) {
              validation.value[key] = Array.isArray(backendErrors[key]) ? backendErrors[key].join(' ') : backendErrors[key];
            }
          }
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      errorMessage,
      successMessage,
      loading,
      formAppointment,
      validation,
      patientOptions,
      doctorOptions,
      statusOptions,
      validateField,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.add-edit-appointment-modal {
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
  min-width: 520px;
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

.form-section {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0; /* Light gray border */
}

.section-title {
  font-size: 1.1rem; /* Slightly larger */
  font-weight: 600;
  color: #1e3a8a; /* Primary blue for section titles */
  display: flex;
  align-items: center;
  padding-left: 0.5rem; /* Add some padding */
}

/* Add a marker before section titles */
.section-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 1.1em;
  background-color: #1e3a8a; /* Primary blue */
  margin-right: 0.5rem;
  border-radius: 3px;
}

.optional {
  font-size: 0.85rem;
  font-weight: normal;
  color: #64748b; /* Slightly darker gray for better contrast */
  margin-left: 0.5rem; /* Add spacing from main title */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0rem 1.8rem; /* Adjusted gap to rely on component's internal margin-bottom */
  margin-bottom: 0.2rem; /* Adjusted margin */
}

.full-width-group {
  grid-column: 1 / -1;
  /* margin-top: 1.2rem; */ /* May not be needed if form-group has margin-bottom */
}

.notes-group {
  /* Styles for the notes group */
  margin-top: 0.5rem;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #c6f6d5; /* Green-200 */
  color: #2f855a; /* Green-700 */
  border: 1px solid #9ae6b4; /* Green-300 */
  border-radius: 0.375rem; /* Rounded corners */
  text-align: center;
}

/* Ensure fieldset takes up space and legend is accessible */
fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

/* Add styling for form inputs and selects */
:deep(.form-group input),
:deep(.form-group select),
:deep(.form-group textarea),
/* Direct input styling for regular HTML inputs in the modal */
input[type="date"],
input[type="time"],
input[type="text"],
select,
textarea,
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: #fff !important;
  color: #111 !important;
  transition: background 0.2s, color 0.2s;
}

:deep(.form-group input:focus),
:deep(.form-group select:focus),
:deep(.form-group textarea:focus),
/* Direct focus styling */
input[type="date"]:focus,
input[type="time"]:focus,
input[type="text"]:focus,
select:focus,
textarea:focus,
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

:deep(.field-error),
.field-error,
small.field-error {
  color: #e57373;
  font-size: 0.92em;
  margin-top: 0.2em;
  display: block;
}

/* Add some breathing room at the bottom of the modal content */
form > div:last-child {
  margin-bottom: 1rem;
}

/* Button styles */
:deep(.base-submit-btn),
:deep(.base-cancel-btn) {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

:deep(.base-submit-btn) {
  background: var(--primary-blue);
  color: var(--white);
}

:deep(.base-submit-btn:hover) {
  background: var(--teal);
}

:deep(.base-cancel-btn) {
  background: #ccc;
  color: #333;
}

:deep(.base-cancel-btn:hover) {
  background: #b0b0b0;
}

@media (max-width: 700px) {
  .modal-content {
    min-width: 95vw;
    max-width: 99vw;
    padding: 1rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0rem; /* Adjusted gap */
  }
}
</style>
