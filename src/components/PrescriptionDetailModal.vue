<template>
  <div class="prescription-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Prescription Details</h3>
      <div class="modal-scrollable-content">
        <div v-if="!prescription">
          <p>No prescription data provided.</p>
        </div>
        <div v-else class="details-container">
          <div class="section">
            <h4 class="section-title">Core Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Prescription ID:</span> <span class="value">{{ prescription.id }}</span></div>
              <div class="detail-item"><span class="label">Encounter ID:</span> <span class="value">{{ prescription.encounter_id }}</span></div>
              <div class="detail-item"><span class="label">Patient:</span> <span class="value">{{ prescription.patient_name || prescription.patient_id }}</span></div>
              <div class="detail-item"><span class="label">Encounter Date:</span> <span class="value">{{ prescription.encounter_date || 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Status:</span> <span :class="`status-${prescription.status.toLowerCase().replace(/\s+/g, '-')}`" class="value">{{ prescription.status }}</span></div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">Medication Details</h4>
            <div class="detail-item full-width"><span class="label">Medication Name:</span> <span class="value">{{ prescription.medication_name }}</span></div>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Dosage:</span> <span class="value">{{ prescription.dosage }}</span></div>
              <div class="detail-item"><span class="label">Frequency:</span> <span class="value">{{ prescription.frequency }}</span></div>
              <div class="detail-item"><span class="label">Duration:</span> <span class="value">{{ prescription.duration || 'N/A' }}</span></div>
            </div>
            <div class="detail-item full-width notes-item"><span class="label">Instructions/Notes:</span> <pre class="value">{{ prescription.notes || 'N/A' }}</pre></div>
          </div>

          <div class="section">
            <h4 class="section-title">System Information</h4>
            <div class="detail-grid two-column">
              <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ prescription.created_at ? new Date(prescription.created_at).toLocaleString() : 'N/A' }}</span></div>
              <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ prescription.updated_at ? new Date(prescription.updated_at).toLocaleString() : 'N/A' }}</span></div>
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
import { defineComponent, type PropType } from 'vue';
import { type Prescription } from '@/services/prescriptionService';

export default defineComponent({
  name: 'PrescriptionDetailModal',
  props: {
    prescription: {
      type: Object as PropType<Prescription | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup() {
    return {};
  },
});
</script>

<style scoped>
.prescription-detail-modal {
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
  max-width: 750px; /* Adjusted width */
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
  /* Styles for the main container of details if needed */
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
  flex-direction: column;
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
  white-space: pre-wrap; 
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
  grid-column: 1 / -1; /* Ensure full-width items in grid span correctly */
}
.notes-item .label {
  margin-bottom: 0.5rem;
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

/* Status specific colors */
.status-active { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending-dispense { color: #ffc107; font-weight: bold; }
</style>
