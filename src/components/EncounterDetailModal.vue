<template>
  <div class="encounter-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Encounter Details</h3>
      <div class="modal-scrollable-content">
        <div v-if="!encounter">
          <p>No encounter data provided.</p>
        </div>
        <div v-else class="details-container">
          <!-- Core Information Section -->
          <div class="section">
            <h4 class="section-title">Core Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Encounter ID:</span> <span class="value">{{ encounter.id }}</span></div>
              <div class="detail-item"><span class="label">Appointment ID:</span> <span class="value">{{ encounter.appointment_id }}</span></div>
              <div class="detail-item"><span class="label">Patient:</span> <span class="value">{{ encounter.patient_name || encounter.patient_id }}</span></div>
              <div class="detail-item"><span class="label">Doctor:</span> <span class="value">{{ encounter.doctor_name || encounter.doctor_id }}</span></div>
              <div class="detail-item"><span class="label">Encounter Date:</span> <span class="value">{{ encounter.encounter_date }}</span></div>
            </div>
          </div>

          <!-- Vitals Section -->
          <div class="section">
            <h4 class="section-title">Vitals</h4>
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
          <div class="section">
            <h4 class="section-title">Clinical Details</h4>
            <div class="detail-item full-width"><span class="label">Chief Complaint:</span> <pre class="value">{{ encounter.chief_complaint || 'N/A' }}</pre></div>
            <div class="detail-item full-width"><span class="label">History of Presenting Illness:</span> <pre class="value">{{ encounter.presenting_illness_history || 'N/A' }}</pre></div>
            <div class="detail-item full-width"><span class="label">Physical Examination:</span> <pre class="value">{{ encounter.physical_examination || 'N/A' }}</pre></div>
            <div class="detail-item full-width"><span class="label">Diagnosis:</span> <pre class="value">{{ encounter.diagnosis || 'N/A' }}</pre></div>
            <div class="detail-item full-width"><span class="label">Treatment Plan:</span> <pre class="value">{{ encounter.treatment_plan || 'N/A' }}</pre></div>
            <div class="detail-item full-width"><span class="label">General Notes:</span> <pre class="value">{{ encounter.notes || 'N/A' }}</pre></div>
          </div>

          <!-- System Information Section -->
          <div class="section">
            <h4 class="section-title">System Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ encounter.created_at ? new Date(encounter.created_at).toLocaleString() : 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ encounter.updated_at ? new Date(encounter.updated_at).toLocaleString() : 'N/A' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue';
import { type Encounter } from '@/services/encounterService';
import { type Vitals, fetchVitalsForEncounter } from '@/services/vitalsService'; // Import Vitals service
import store from '@/store';

export default defineComponent({
  name: 'EncounterDetailModal',
  props: {
    encounter: {
      type: Object as PropType<Encounter | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const vitals = ref<Vitals | null | undefined>(null); // Can be undefined if not found
    const loadingVitals = ref(false);

    const loadVitalsData = async (encounterId: string | number) => {
      if (!encounterId) return;
      loadingVitals.value = true;
      vitals.value = null; // Reset before fetching
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
    };
  },
});
</script>

<style scoped>
.encounter-detail-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2010;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px; /* Wider for more content */
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.modal-scrollable-content {
  overflow-y: auto;
  padding-right: 1rem; 
  margin-right: -1rem; 
  flex-grow: 1;
}
.details-container {
  /* This div itself doesn't need specific styles if modal-scrollable-content handles scroll */
}
.section {
  margin-bottom: 1.5rem;
}
.section:last-child {
  margin-bottom: 0.5rem;
}
.section-title {
  font-size: 1.2rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.detail-grid {
  display: grid;
  gap: 0.8rem 1.5rem;
}
.detail-grid.two-column {
  grid-template-columns: repeat(2, 1fr);
}
.detail-item {
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column; /* Stack label and value */
}
.detail-item .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
.detail-item .value {
  color: #1a202c;
  font-size: 1rem;
  white-space: pre-wrap; /* For text areas like notes */
  word-break: break-word;
}
.detail-item .value pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  background-color: #f7fafc;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}
.detail-item.full-width {
  /* If using detail-grid, this might not be needed or apply differently */
}
.form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
.close-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.close-btn:hover {
  background: #5a6268;
}
.loading-text,
.no-data-text {
  padding: 1rem 0;
  text-align: center;
  color: #555;
  font-style: italic;
}
</style>
