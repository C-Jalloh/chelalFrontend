<template>
  <div class="add-prescription-form-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="encounter">Link to Encounter</label>
          <select id="encounter" v-model="prescription.encounter_id" @change="handleEncounterSelection" required :disabled="isEditing && !!existingPrescription">
            <option disabled value="">Select an Encounter</option>
            <option v-for="enc in availableEncounters" :key="enc.id" :value="enc.id">
              {{ enc.encounter_date }} - {{ enc.patient_name }} ({{ enc.diagnosis || 'No diagnosis' }})
            </option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="patient_name">Patient</label>
            <input type="text" id="patient_name" :value="selectedEncounterDetails.patient_name" disabled />
          </div>
          <div class="form-group">
            <label for="encounter_date">Encounter Date</label>
            <input type="text" id="encounter_date" :value="selectedEncounterDetails.encounter_date" disabled />
          </div>
        </div>

        <div class="form-group">
          <label for="medication_name">Medication Name</label>
          <input type="text" id="medication_name" v-model="prescription.medication_name" required />
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="dosage">Dosage (e.g., 1 tablet, 10mg)</label>
            <input type="text" id="dosage" v-model="prescription.dosage" required />
          </div>
          <div class="form-group">
            <label for="frequency">Frequency (e.g., Twice a day)</label>
            <input type="text" id="frequency" v-model="prescription.frequency" required />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="duration">Duration (e.g., 7 days)</label>
            <input type="text" id="duration" v-model="prescription.duration" />
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="prescription.status" required>
              <option value="Active">Active</option>
              <option value="Pending Dispense">Pending Dispense</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Notes/Instructions</label>
          <textarea id="notes" v-model="prescription.notes" rows="3"></textarea>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Save' }} Prescription</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import { type Prescription, createPrescription, updatePrescription } from '@/services/prescriptionService';
import { type Encounter, fetchEncounters } from '@/services/encounterService';
import store from '@/store';

type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled' | 'Pending Dispense';

export default defineComponent({
  name: 'AddPrescriptionForm',
  props: {
    existingPrescription: {
      type: Object as PropType<Prescription | null>,
      default: null,
    },
    targetEncounterId: { // To pre-select an encounter if opening from an encounter context
        type: [String, Number] as PropType<string | number | null>,
        default: null,
    }
  },
  emits: ['close', 'prescriptionAdded', 'prescriptionUpdated'],
  setup(props, { emit }) {
    const prescription = ref<Omit<Prescription, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'encounter_date'>>({
      encounter_id: props.targetEncounterId || '',
      patient_id: '', // Will be derived from selected encounter
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
      status: 'Active' as PrescriptionStatus,
    });

    const availableEncounters = ref<Encounter[]>([]);
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Add New Prescription');

    const selectedEncounterDetails = computed(() => {
        if (prescription.value.encounter_id) {
            const enc = availableEncounters.value.find(e => e.id === prescription.value.encounter_id);
            return {
                patient_name: enc?.patient_name || 'N/A',
                encounter_date: enc?.encounter_date || 'N/A',
                patient_id: enc?.patient_id || ''
            };
        }
        return { patient_name: 'N/A', encounter_date: 'N/A', patient_id: '' };
    });

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) {
          errorMessage.value = 'Authentication token not found.';
          return;
        }
        availableEncounters.value = await fetchEncounters(token);
        if (props.targetEncounterId) {
            handleEncounterSelection();
        }
      } catch (error: any) {
        errorMessage.value = `Failed to load encounters: ${error.message}`;
      }
    };

    const handleEncounterSelection = () => {
        const details = selectedEncounterDetails.value;
        prescription.value.patient_id = details.patient_id;
        // patient_name and encounter_date are for display, not part of the core prescription model sent to backend
    };

    watch(() => props.existingPrescription, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Prescription';
        const { id, created_at, updated_at, patient_name, encounter_date, ...formData } = newVal;
        prescription.value = { ...formData };
        if (formData.encounter_id && availableEncounters.value.length > 0) {
            handleEncounterSelection();
        }
      } else {
        isEditing.value = false;
        formTitle.value = 'Add New Prescription';
        prescription.value = {
          encounter_id: props.targetEncounterId || '',
          patient_id: '',
          medication_name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: '',
          status: 'Active' as PrescriptionStatus,
        };
        if (props.targetEncounterId) {
            handleEncounterSelection();
        }
      }
    }, { immediate: true, deep: true });

    watch(() => props.targetEncounterId, (newId) => {
        if (newId && !isEditing.value) {
            prescription.value.encounter_id = newId;
            handleEncounterSelection();
        }
    });

    onMounted(() => {
      loadInitialData();
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      const token = store.state.token;
      if (!token) {
        errorMessage.value = 'User not authenticated.';
        return;
      }
      if (!prescription.value.encounter_id) {
          errorMessage.value = 'Please link this prescription to an encounter.';
          return;
      }
      if (!prescription.value.medication_name.trim()) {
          errorMessage.value = 'Medication name is required.';
          return;
      }
      if (!prescription.value.dosage.trim()) {
          errorMessage.value = 'Dosage is required.';
          return;
      }
      if (!prescription.value.frequency.trim()) {
          errorMessage.value = 'Frequency is required.';
          return;
      }

      const finalEncounterDetails = availableEncounters.value.find(e => e.id === prescription.value.encounter_id);
      if (!finalEncounterDetails) {
          errorMessage.value = 'Selected encounter details not found.';
          return;
      }
      prescription.value.patient_id = finalEncounterDetails.patient_id;

      try {
        if (isEditing.value && props.existingPrescription?.id) {
          const updated = await updatePrescription(props.existingPrescription.id, prescription.value, token);
          emit('prescriptionUpdated', updated);
        } else {
          const newRx = await createPrescription(prescription.value, token);
          emit('prescriptionAdded', newRx);
        }
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to save prescription: ${error.message}`;
      }
    };

    return {
      prescription,
      availableEncounters,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
      selectedEncounterDetails,
      handleEncounterSelection,
    };
  },
});
</script>

<style scoped>
.add-prescription-form-modal {
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
  width: 90%;
  max-width: 700px; 
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
form {
  overflow-y: auto;
  padding-right: 1rem; 
  margin-right: -1rem; 
  flex-grow: 1;
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
.submit-btn:hover {
  background: var(--teal);
}
.cancel-btn {
  background: #ccc;
  color: #333;
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
