<template>
  <BaseViewModal
    v-if="prescription"
    :title="'Prescription Details'"
    :entry="prescriptionSummary"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Medication Details Section -->
      <div class="form-section section">
        <span class="section-title">Medication Details</span>
        <div class="detail-item full-width"><span class="label">Medication Name:</span> <span class="value">{{ prescription.medication_name }}</span></div>
        <div class="detail-grid two-column">
          <div class="detail-item"><span class="label">Dosage:</span> <span class="value">{{ prescription.dosage }}</span></div>
          <div class="detail-item"><span class="label">Frequency:</span> <span class="value">{{ prescription.frequency }}</span></div>
          <div class="detail-item"><span class="label">Duration:</span> <span class="value">{{ getField('duration') }}</span></div>
        </div>
        <div class="detail-item full-width notes-item"><span class="label">Instructions/Notes:</span> <pre class="value">{{ getField('notes') }}</pre></div>
      </div>
      <!-- System Information Section -->
      <div class="form-section section">
        <span class="section-title">System Information</span>
        <div class="detail-grid two-column">
          <div class="detail-item"><span class="label">Created At:</span> <span class="value">{{ prescription.created_at ? new Date(prescription.created_at).toLocaleString() : 'N/A' }}</span></div>
          <div class="detail-item"><span class="label">Updated At:</span> <span class="value">{{ prescription.updated_at ? new Date(prescription.updated_at).toLocaleString() : 'N/A' }}</span></div>
        </div>
      </div>
    </template>
  </BaseViewModal>
  <BaseViewModal
    v-else
    title="Prescription Details"
    :entry="{}"
    :columns="summaryColumns"
    @close="$emit('close')"
  >
    <template #default>
      <BaseAlert type="info">No prescription data provided.</BaseAlert>
    </template>
  </BaseViewModal>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { type Prescription } from '@/services/prescriptionService';
import BaseViewModal from '@/components/BaseViewModal.vue';
import BaseAlert from '@/components/BaseAlert.vue';

const summaryColumns = [
  { key: 'id', label: 'Prescription ID' },
  { key: 'encounter_id', label: 'Encounter ID' },
  { key: 'patient_name', label: 'Patient' },
  { key: 'encounter_date', label: 'Encounter Date' },
  { key: 'status', label: 'Status' },
];

export default defineComponent({
  name: 'PrescriptionDetailModal',
  components: { BaseViewModal, BaseAlert },
  props: {
    prescription: {
      type: Object as PropType<Prescription | Record<string, any> | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const prescriptionSummary = computed(() => {
      if (!props.prescription) return {};
      const p = props.prescription as Record<string, any>;
      return {
        id: p.id ?? 'N/A',
        encounter_id: p['encounter_id'] ?? p['encounter'] ?? 'N/A',
        patient_name: p['patient_name'] ?? 'N/A',
        encounter_date: p['encounter_date'] ?? 'N/A',
        status: p['status'] ?? 'N/A',
      };
    });
    // Defensive: fallback for duration/notes if not present
    const getField = (field: string) => {
      return props.prescription && field in (props.prescription as Record<string, any>)
        ? (props.prescription as Record<string, any>)[field] || 'N/A'
        : 'N/A';
    };
    return {
      prescriptionSummary,
      summaryColumns,
      getField,
      prescription: props.prescription,
    };
  },
});
</script>

<style scoped>
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
  grid-column: 1 / -1;
}
.notes-item .label {
  margin-bottom: 0.5rem;
}
</style>
