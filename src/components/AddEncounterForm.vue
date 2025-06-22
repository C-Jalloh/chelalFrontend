<template>
  <div class="add-encounter-form-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit">
        <!-- Appointment Linking -->
        <div class="form-group">
          <label for="appointment">Link to Appointment</label>
          <select id="appointment" v-model="encounter.appointment_id" @change="handleAppointmentSelection" required :disabled="isEditing && !!existingEncounter">
            <option disabled value="">Select an Appointment</option>
            <option v-for="appt in availableAppointments" :key="appt.id" :value="appt.id">
              {{ appt.appointment_date }} @ {{ appt.appointment_time }} - {{ appt.patient_name }} (with {{ appt.doctor_name }})
            </option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="encounter_date">Encounter Date</label>
            <input type="date" id="encounter_date" v-model="encounter.encounter_date" required />
          </div>
           <div class="form-group">
            <label for="patient_name">Patient</label>
            <input type="text" id="patient_name" :value="selectedAppointmentDetails.patient_name" disabled />
          </div>
          <div class="form-group">
            <label for="doctor_name">Doctor</label>
            <input type="text" id="doctor_name" :value="selectedAppointmentDetails.doctor_name" disabled />
          </div>
        </div>
        
        <!-- Clinical Details -->
        <h4 class="section-title">Clinical Information</h4>
        <div class="form-group">
          <label for="chief_complaint">Chief Complaint</label>
          <textarea id="chief_complaint" v-model="encounter.chief_complaint" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label for="presenting_illness_history">History of Presenting Illness</label>
          <textarea id="presenting_illness_history" v-model="encounter.presenting_illness_history" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="physical_examination">Physical Examination</label>
          <textarea id="physical_examination" v-model="encounter.physical_examination" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="diagnosis">Diagnosis</label>
          <textarea id="diagnosis" v-model="encounter.diagnosis" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label for="treatment_plan">Treatment Plan</label>
          <textarea id="treatment_plan" v-model="encounter.treatment_plan" rows="3"></textarea>
        </div>

        <!-- Vitals Section -->
        <h4 class="section-title">Vitals</h4>
        <div class="form-grid vitals-grid">
          <div class="form-group">
            <label for="temperature">Temperature (°C)</label>
            <input type="number" step="0.1" id="temperature" v-model.number="vitals.temperature_celsius" />
          </div>
          <div class="form-group">
            <label for="hr">Heart Rate (bpm)</label>
            <input type="number" id="hr" v-model.number="vitals.heart_rate_bpm" />
          </div>
          <div class="form-group bp-group">
            <label>Blood Pressure (Systolic/Diastolic)</label>
            <div class="bp-inputs">
              <input type="number" placeholder="Systolic" v-model.number="vitals.blood_pressure_systolic" />
              <span>/</span>
              <input type="number" placeholder="Diastolic" v-model.number="vitals.blood_pressure_diastolic" />
            </div>
          </div>
          <div class="form-group">
            <label for="rr">Respiratory Rate (bpm)</label>
            <input type="number" id="rr" v-model.number="vitals.respiratory_rate_bpm" />
          </div>
          <div class="form-group">
            <label for="spo2">SpO2 (%)</label>
            <input type="number" id="spo2" v-model.number="vitals.oxygen_saturation_percent" />
          </div>
        </div>

        <div class="form-group">
          <label for="notes">General Notes (Encounter)</label>
          <textarea id="notes" v-model="encounter.notes" rows="2"></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Save' }} Encounter</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import { type Encounter, createEncounter, updateEncounter } from '@/services/encounterService';
import { type Appointment, fetchAppointments } from '@/services/appointmentService';
import { type Vitals, saveVitalsForEncounter, fetchVitalsForEncounter } from '@/services/vitalsService'; // Import Vitals service
import store from '@/store';

// Define a type for the vitals part of the form
interface VitalsFormData {
  temperature_celsius?: number | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  heart_rate_bpm?: number | null;
  respiratory_rate_bpm?: number | null;
  oxygen_saturation_percent?: number | null;
}

export default defineComponent({
  name: 'AddEncounterForm',
  props: {
    existingEncounter: {
      type: Object as PropType<Encounter | null>,
      default: null,
    },
    // Optional: To pre-select an appointment if opening form from an appointment context
    targetAppointmentId: {
        type: [String, Number] as PropType<string | number | null>,
        default: null,
    }
  },
  emits: ['close', 'encounterAdded', 'encounterUpdated'],
  setup(props, { emit }) {
    const encounter = ref<Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>({
      appointment_id: props.targetAppointmentId || '',
      patient_id: '',
      doctor_id: '',
      encounter_date: '',
      chief_complaint: '',
      presenting_illness_history: '',
      physical_examination: '',
      diagnosis: '',
      treatment_plan: '',
      notes: '',
      vitals_id: undefined, // Initialize vitals_id
    });

    const vitals = ref<VitalsFormData>({}); // Ref for vitals form data

    const availableAppointments = ref<Appointment[]>([]);
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Add New Encounter');

    const selectedAppointmentDetails = computed(() => {
        if (encounter.value.appointment_id) {
            const appt = availableAppointments.value.find(a => a.id === encounter.value.appointment_id);
            return {
                patient_name: appt?.patient_name || 'N/A',
                doctor_name: appt?.doctor_name || 'N/A',
                patient_id: appt?.patient_id || '',
                doctor_id: appt?.doctor_id || '',
                encounter_date: appt?.appointment_date || ''
            };
        }
        return { patient_name: 'N/A', doctor_name: 'N/A', patient_id: '', doctor_id: '', encounter_date: '' };
    });

    const loadInitialData = async () => {
      try {
        const authToken = store.getters.getToken; // Use getter
        if (!authToken) {
          errorMessage.value = 'Authentication token not found.';
          return;
        }
        availableAppointments.value = await fetchAppointments(); // Remove token argument
        if (props.targetAppointmentId) {
            handleAppointmentSelection(); // Pre-fill details if targetAppointmentId is provided
        }
      } catch (error: any) {
        errorMessage.value = `Failed to load data: ${error.message}`;
      }
    };

    const handleAppointmentSelection = () => {
        const details = selectedAppointmentDetails.value;
        encounter.value.patient_id = details.patient_id;
        encounter.value.doctor_id = details.doctor_id;
        encounter.value.encounter_date = details.encounter_date;
    };

    const loadVitalsForEditing = async (encounterId: string | number) => {
        const authToken = store.getters.getToken; // Use getter
        if (authToken && encounterId) {
            const existingVitals = await fetchVitalsForEncounter(encounterId, authToken); // Use renamed variable
            if (existingVitals) {
                const { id, encounter_id, recorded_at, ...vitalsData } = existingVitals;
                vitals.value = vitalsData;
                encounter.value.vitals_id = id; // Link existing vitals id
            }
        }
    };

    watch(() => props.existingEncounter, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Encounter';
        const { id, created_at, updated_at, patient_name, doctor_name, ...formData } = newVal;
        encounter.value = { ...formData };
        vitals.value = {}; // Reset vitals, then load if they exist
        if (newVal.id) { // Use encounter.id to fetch its vitals
            loadVitalsForEditing(newVal.id);
        }
        if (formData.appointment_id && availableAppointments.value.length > 0) {
            handleAppointmentSelection();
        }
      } else {
        isEditing.value = false;
        formTitle.value = 'Add New Encounter';
        encounter.value = {
          appointment_id: props.targetAppointmentId || '',
          patient_id: '',
          doctor_id: '',
          encounter_date: '',
          chief_complaint: '',
          presenting_illness_history: '',
          physical_examination: '',
          diagnosis: '',
          treatment_plan: '',
          notes: '',
          vitals_id: undefined,
        };
        vitals.value = {}; // Reset vitals for new encounter
        if (props.targetAppointmentId) {
            handleAppointmentSelection();
        }
      }
    }, { immediate: true, deep: true });
    
    watch(() => props.targetAppointmentId, (newId) => {
        if (newId && !isEditing.value) {
            encounter.value.appointment_id = newId;
            handleAppointmentSelection();
        }
    });

    onMounted(() => {
      loadInitialData();
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      // --- Start Validation ---
      if (!encounter.value.appointment_id) {
        errorMessage.value = 'Please link this encounter to an appointment.';
        return;
      }
      if (!encounter.value.encounter_date) {
        errorMessage.value = 'Encounter date is required.';
        return;
      }

      const today = new Date(); // Current date is May 26, 2025, from context
      today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
      
      // Parse encounter_date correctly, assuming it's YYYY-MM-DD
      const [year, month, day] = encounter.value.encounter_date.split('-').map(Number);
      const encounterDate = new Date(year, month - 1, day);
      encounterDate.setHours(0,0,0,0); // Normalize for comparison

      if (encounterDate > today) {
        errorMessage.value = 'Encounter date cannot be in the future.';
        return;
      }
      
      // Check if encounterDate is before the linked appointment's date
      const linkedAppointment = availableAppointments.value.find(a => a.id === encounter.value.appointment_id);
      if (linkedAppointment) {
        const [apptYear, apptMonth, apptDay] = linkedAppointment.appointment_date.split('-').map(Number);
        const appointmentDate = new Date(apptYear, apptMonth - 1, apptDay);
        appointmentDate.setHours(0,0,0,0);
        if (encounterDate < appointmentDate) {
            errorMessage.value = 'Encounter date cannot be before the linked appointment date.';
            return;
        }
      }

      if (!encounter.value.chief_complaint?.trim()) {
        errorMessage.value = 'Chief Complaint is required.';
        return;
      }
      if (!encounter.value.diagnosis?.trim()) {
        errorMessage.value = 'Diagnosis is required.';
        return;
      }
      // --- End Validation ---

      if (!encounter.value.appointment_id) {
          errorMessage.value = 'Please link this encounter to an appointment.';
          return;
      }
      // Always derive patient_id and doctor_id from the selected appointment just before payload construction
      const selectedAppt = availableAppointments.value.find(a => a.id == encounter.value.appointment_id);
      if (!selectedAppt) {
        errorMessage.value = 'Selected appointment details not found.';
        return;
      }
      // Force as integer (or string if backend expects stringified IDs)
      encounter.value.patient_id = Number(selectedAppt.patient_id) || selectedAppt.patient_id;
      encounter.value.doctor_id = Number(selectedAppt.doctor_id) || selectedAppt.doctor_id;

      // --- Map frontend fields to backend fields ---
      // Ensure required fields are present and valid
      if (!encounter.value.patient_id) {
        errorMessage.value = 'Patient is required.';
        return;
      }
      if (!encounter.value.doctor_id) {
        errorMessage.value = 'Doctor is required.';
        return;
      }
      // Notes is required by backend
      if (!encounter.value.notes || !encounter.value.notes.trim()) {
        errorMessage.value = 'General Notes is required.';
        return;
      }
      const payload: Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'> = {
        appointment_id: encounter.value.appointment_id,
        patient_id: encounter.value.patient_id,
        doctor_id: encounter.value.doctor_id,
        encounter_date: encounter.value.encounter_date,
        chief_complaint: encounter.value.chief_complaint || undefined,
        presenting_illness_history: encounter.value.presenting_illness_history || undefined,
        physical_examination: encounter.value.physical_examination || undefined,
        diagnosis: encounter.value.diagnosis || undefined,
        treatment_plan: encounter.value.treatment_plan || undefined,
        notes: encounter.value.notes,
        vitals_id: undefined, // Not sent here; handled separately
      };
      // Remove any fields that are undefined (optional fields)
      Object.keys(payload).forEach(key => {
        if ((payload as any)[key] === undefined || (payload as any)[key] === '') {
          delete (payload as any)[key];
        }
      });
      // --- End mapping ---

      try {
        let savedEncounter: Encounter | undefined;
        if (isEditing.value && props.existingEncounter?.id) {
          savedEncounter = await updateEncounter(props.existingEncounter.id, payload); // Remove token argument
        } else {
          savedEncounter = await createEncounter(payload); // Remove token argument
        }

        if (savedEncounter && savedEncounter.id) {
          const hasVitalsData = Object.values(vitals.value).some(val => val !== null && val !== undefined && String(val) !== '');
          if (hasVitalsData) {
            const vitalsToSave: Omit<Vitals, 'id' | 'recorded_at'> & { id?: string | number } = {
              ...vitals.value,
              encounter_id: savedEncounter.id,
            };
            if (encounter.value.vitals_id) {
                vitalsToSave.id = encounter.value.vitals_id;
            }
            const savedVitals = await saveVitalsForEncounter(vitalsToSave, submitToken); // Use renamed variable
            // Optionally link savedVitals.id back to the encounter if the backend model updates encounter with vitals_id
            if (!savedEncounter.vitals_id) savedEncounter.vitals_id = savedVitals.id;
          }
        }

        if (isEditing.value) {
            emit('encounterUpdated', savedEncounter);
        } else {
            emit('encounterAdded', savedEncounter);
        }
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to save encounter: ${error.message}`;
      }
    };

    return {
      encounter,
      vitals, // Expose vitals ref
      availableAppointments,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
      selectedAppointmentDetails,
      handleAppointmentSelection,
    };
  },
});
</script>

<style scoped>
.add-encounter-form-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
html.dark .add-encounter-form-modal {
  background: rgba(20, 24, 31, 0.85);
}

.modal-content {
  background: var(--white);
  color: var(--text-dark);
  padding: 2rem 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 750px; /* Wider for more text areas */
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
html.dark .modal-content {
  background: var(--primary-blue);
  color: var(--text-contrast);
  box-shadow: 0 8px 32px rgba(30,58,92,0.45);
}

.modal-title, .section-title {
  color: var(--primary-blue);
}
html.dark .modal-title, html.dark .section-title {
  color: var(--teal);
}

form {
    overflow-y: auto; /* Allow form content to scroll */
    padding-right: 1rem; /* Space for scrollbar */
    margin-right: -1rem; /* Offset padding */
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
html.dark .form-group label {
  color: var(--text-contrast);
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
  background: var(--white);
  color: var(--text-dark);
}
html.dark .form-group input,
html.dark .form-group select,
html.dark .form-group textarea {
  background: #23272f;
  color: var(--text-contrast);
  border-color: #374151;
}

.form-group input:disabled {
    background-color: #e9ecef;
    opacity: 0.7;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.form-group textarea {
  resize: vertical;
  min-height: 60px;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.submit-btn, .cancel-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
.submit-btn {
  background: var(--primary-blue);
  color: var(--white);
}
html.dark .submit-btn {
  background: var(--teal);
  color: var(--text-contrast-inverse);
}
.cancel-btn {
  background: #ccc;
  color: #333;
}
html.dark .cancel-btn {
  background: #374151;
  color: var(--text-contrast);
}
.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.section-title {
  font-size: 1.1rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-top: 1.8rem;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e0e0e0;
}
.vitals-grid {
  grid-template-columns: repeat(2, 1fr); /* Default to 2 columns for vitals */
  gap: 0.8rem 1.5rem;
}
.bp-group .bp-inputs {
  display: flex;
  align-items: center;
}
.bp-group .bp-inputs input {
  width: calc(50% - 10px); /* Adjust width for two inputs and a separator */
}
.bp-group .bp-inputs span {
  margin: 0 5px;
  font-size: 1.2rem;
}

/* Responsive adjustments for vitals grid if needed */
@media (max-width: 600px) {
  .vitals-grid {
    grid-template-columns: 1fr; /* Stack vitals on small screens */
  }
  .bp-group .bp-inputs input {
    width: calc(50% - 5px); /* Adjust for smaller screens */
  }
}
</style>
