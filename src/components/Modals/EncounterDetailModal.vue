<template>
  <BaseViewModal
    v-if="encounter"
    :title="'Encounter Details'"
    :entry="encounterSummary"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Vitals Section -->
      <div class="form-section section">
        <span class="section-title">Vitals</span>
        <div v-if="loadingVitals" class="loading-text">Loading vitals...</div>
        <div v-else-if="vitals" class="detail-grid two-column">
          <div class="detail-item"><span class="label">Temperature:</span> <span class="value">{{ vitals.temperature_celsius !== null ? vitals.temperature_celsius + ' °C' : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Heart Rate:</span> <span class="value">{{ vitals.heart_rate_bpm !== null ? vitals.heart_rate_bpm + ' bpm' : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Blood Pressure:</span> <span class="value">{{ (vitals.blood_pressure_systolic !== null && vitals.blood_pressure_diastolic !== null) ? vitals.blood_pressure_systolic + '/' + vitals.blood_pressure_diastolic + ' mmHg' : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Respiratory Rate:</span> <span class="value">{{ vitals.respiratory_rate_bpm !== null ? vitals.respiratory_rate_bpm + ' bpm' : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">SpO2:</span> <span class="value">{{ vitals.oxygen_saturation_percent !== null ? vitals.oxygen_saturation_percent + ' %' : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Vitals Recorded:</span> <span class="value">{{ vitals.recorded_at ? new Date(vitals.recorded_at).toLocaleString() : 'N/A' }}</span></div>
        </div>
        <div v-else class="no-data-text">No vitals recorded for this encounter.</div>
      </div>
      <!-- Clinical Details Section -->
      <div class="form-section section">
        <span class="section-title">Clinical Details</span>
        <div class="detail-item full-width"><span class="label">Chief Complaint:</span> <pre class="value">{{ encounter.chief_complaint || 'N/A' }}</pre></div>
        <div class="detail-item full-width"><span class="label">History of Presenting Illness:</span> <pre class="value">{{ encounter.presenting_illness_history || 'N/A' }}</pre></div>
        <div class="detail-item full-width"><span class="label">Physical Examination:</span> <pre class="value">{{ encounter.physical_examination || 'N/A' }}</pre></div>
        <div class="detail-item full-width"><span class="label">Diagnosis:</span> <pre class="value">{{ encounter.diagnosis || 'N/A' }}</pre></div>
        <div class="detail-item full-width"><span class="label">Treatment Plan:</span> <pre class="value">{{ encounter.treatment_plan || 'N/A' }}</pre></div>
        <div class="detail-item full-width"><span class="label">General Notes:</span> <pre class="value">{{ encounter.notes || 'N/A' }}</pre></div>
      </div>
      <!-- System Information Section -->
      <div class="form-section section">
        <span class="section-title">System Information</span>
        <div class="detail-grid two-column">
          <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ encounter.created_at ? new Date(encounter.created_at).toLocaleString() : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ encounter.updated_at ? new Date(encounter.updated_at).toLocaleString() : 'N/A' }}</span></div>
        </div>
      </div>
    </template>
  </BaseViewModal>
  <div v-else class="modal-content">
    <p>No encounter data provided.</p>
    <div class="form-actions">
      <button @click="$emit('close')" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, computed } from 'vue';
import { type Encounter } from '@/services/encounterService';
import { type Vitals, fetchVitalsForEncounter } from '@/services/vitalsService';
import BaseViewModal from '@/components/BaseViewModal.vue';
import store from '@/store';

const summaryColumns = [
  { key: 'id', label: 'Encounter ID' },
  { key: 'appointment_id', label: 'Appointment ID' },
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'encounter_date', label: 'Encounter Date' },
];

export default defineComponent({
  name: 'EncounterDetailModal',
  components: { BaseViewModal },
  props: {
    encounter: {
      type: Object as PropType<Encounter | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const vitals = ref<Vitals | null | undefined>(null);
    const loadingVitals = ref(false);
    const encounterSummary = computed(() => {
      if (!props.encounter) return {};
      return {
        id: props.encounter.id,
        appointment_id: props.encounter.appointment_id,
        patient: props.encounter.patient_name || props.encounter.patient_id,
        doctor: props.encounter.doctor_name || props.encounter.doctor_id,
        encounter_date: props.encounter.encounter_date,
      };
    });
    const loadVitalsData = async (encounterId: string | number) => {
      if (!encounterId) return;
      loadingVitals.value = true;
      vitals.value = null;
      try {
        const token = store.state.token;
        if (token) {
          vitals.value = await fetchVitalsForEncounter(encounterId, token);
        }
      } catch (error) {
        console.error('Failed to load vitals for encounter:', error);
      } finally {
        loadingVitals.value = false;
      }
    };
    watch(() => props.encounter, (newEncounter) => {
      if (newEncounter && newEncounter.id) {
        loadVitalsData(newEncounter.id);
      } else {
        vitals.value = null;
      }
    }, { immediate: true });
    return {
      vitals,
      loadingVitals,
      encounterSummary,
      summaryColumns,
    };
  },
});
</script>

<style scoped>
/* TODO: Standardize modal layout and styling using BaseAddEditModal or BaseViewModal. */
</style>
