// TODO: Standardize: Now uses BaseAddEditModal, shared form components, BaseButton, and BaseAlert for notifications.
<template>
  <BaseAddEditModal
    :title="formTitle"
    :is-editing="isEditing"
    @close="$emit('close')"
  >
    <template #default>
      <form @submit.prevent="handleSubmit">
        <FormSelect
          id="encounter"
          v-model="prescription.encounter"
          label="Link to Encounter"
          :options="encounterOptions"
          :disabled="isEditing && !!existingPrescription"
          required
          @change="handleEncounterSelection"
        />
        <div class="form-grid">
          <FormInput
            id="patient_name"
            :model-value="selectedEncounterDetails.patient_name"
            label="Patient"
            disabled
          />
          <FormInput
            id="encounter_date"
            :model-value="selectedEncounterDetails.encounter_date"
            label="Encounter Date"
            disabled
          />
        </div>
        <FormInput
          id="medication_name"
          v-model="prescription.medication_name"
          label="Medication Name"
          required
        />
        <div class="form-grid">
          <FormInput
            id="dosage"
            v-model="prescription.dosage"
            label="Dosage (e.g., 1 tablet, 10mg)"
            required
          />
          <FormInput
            id="frequency"
            v-model="prescription.frequency"
            label="Frequency (e.g., Twice a day)"
            required
          />
        </div>
        <div class="form-grid">
          <FormInput
            id="duration"
            v-model="prescription.duration"
            label="Duration (e.g., 7 days)"
          />
          <FormSelect
            id="status"
            v-model="prescription.status"
            label="Status"
            :options="statusOptions"
            required
          />
        </div>
        <FormTextarea
          id="notes"
          v-model="prescription.notes"
          label="Notes/Instructions"
          :rows="3"
        />
        <BaseAlert v-if="errorMessage" type="error">{{ errorMessage }}</BaseAlert>
        <div class="form-actions">
          <BaseButton type="submit" variant="primary">
            {{ isEditing ? 'Update Prescription' : 'Save Prescription' }}
          </BaseButton>
          <BaseButton type="button" variant="secondary" @click="$emit('close')">
            Cancel
          </BaseButton>
        </div>
      </form>
    </template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import { type Prescription, createPrescription, updatePrescription } from '@/services/prescriptionService';
import { type Encounter, fetchEncounters } from '@/services/encounterService';
import store from '@/store';
import BaseAddEditModal from '@/components/Modals/BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';
import BaseButton from '@/components/buttons/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';

type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled' | 'Pending Dispense';

interface PrescriptionForm {
  encounter: string | number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  status: PrescriptionStatus;
}

export default defineComponent({
  name: 'AddPrescriptionForm',
  components: { BaseAddEditModal, FormInput, FormSelect, FormTextarea, BaseButton, BaseAlert },
  props: {
    existingPrescription: {
      type: Object as PropType<Prescription | null>,
      default: null,
    },
    targetEncounterId: {
      type: [String, Number] as PropType<string | number | null>,
      default: null,
    }
  },
  emits: ['close', 'prescriptionAdded', 'prescriptionUpdated'],
  setup(props, { emit }) {
    const prescription = ref<PrescriptionForm>({
      encounter: props.targetEncounterId || '',
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
      status: 'Active',
    });
    const availableEncounters = ref<Encounter[]>([]);
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Add New Prescription');
    const statusOptions = [
      { value: 'Active', text: 'Active' },
      { value: 'Pending Dispense', text: 'Pending Dispense' },
      { value: 'Completed', text: 'Completed' },
      { value: 'Cancelled', text: 'Cancelled' },
    ];
    const encounterOptions = computed(() => [
      { value: '', text: 'Select an Encounter', disabled: true },
      ...availableEncounters.value.map(enc => ({
        value: enc.id,
        text: `${enc.encounter_date || ''} - ${enc.patient_name || ''} (${enc.diagnosis || 'No diagnosis'})`
      }))
    ]);
    const selectedEncounterDetails = computed(() => {
      if (prescription.value.encounter) {
        const enc = availableEncounters.value.find(e => e.id == prescription.value.encounter);
        return {
          patient_name: enc?.patient_name || 'N/A',
          encounter_date: enc?.encounter_date || 'N/A',
        };
      }
      return { patient_name: 'N/A', encounter_date: 'N/A' };
    });
    const loadInitialData = async () => {
      try {
        const token = store.getters.getToken;
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
      // No patient_id in prescription model, so nothing to set here
    };
    watch(() => props.existingPrescription, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Prescription';
        const { id, created_at, updated_at, patient_name, encounter_date, ...formData } = newVal as any;
        prescription.value = {
          encounter: formData.encounter,
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration || '',
          notes: formData.notes || '',
          status: formData.status || 'Active',
        };
      } else {
        isEditing.value = false;
        formTitle.value = 'Add New Prescription';
        prescription.value = {
          encounter: props.targetEncounterId || '',
          medication_name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: '',
          status: 'Active',
        };
        if (props.targetEncounterId) {
          handleEncounterSelection();
        }
      }
    }, { immediate: true, deep: true });
    watch(() => props.targetEncounterId, (newId) => {
      if (newId && !isEditing.value) {
        prescription.value.encounter = newId;
        handleEncounterSelection();
      }
    });
    onMounted(() => {
      loadInitialData();
    });
    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!prescription.value.encounter) {
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
      try {
        if (isEditing.value && props.existingPrescription?.id) {
          const updated = await updatePrescription({ id: props.existingPrescription.id, ...prescription.value });
          emit('prescriptionUpdated', updated);
        } else {
          const newRx = await createPrescription(prescription.value);
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
      statusOptions,
      encounterOptions,
      existingPrescription: props.existingPrescription,
    };
  },
});
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
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
.mb-2 { margin-bottom: 0.75rem; }
</style>
