<template>
  <div class="record-dispense-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">Record New Dispense</h3>
      <form @submit.prevent="handleSubmit" class="dispense-form">
        <div class="form-scrollable-content">
          <div class="form-group">
            <label for="patient">Patient *</label>
            <select id="patient" v-model="dispense.patient_id" required @change="handlePatientChange">
              <option disabled value="">Select Patient</option>
              <option v-for="p in patients" :key="p.id" :value="p.id">
                {{ p.first_name }} {{ p.last_name }} (ID: {{ p.unique_id }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="medication">Medication Item *</label>
            <select id="medication" v-model="dispense.medication_item_id" required @change="handleMedicationChange">
              <option disabled value="">Select Medication</option>
              <option v-for="med in medicationItems" :key="med.id" :value="med.id">
                {{ med.name }} (Stock: {{ med.current_stock_level || 0 }})
              </option>
            </select>
          </div>

          <div class="form-group" v-if="availableBatches.length > 0">
            <label for="batch">Stock Batch (Batch No. - Expiry - Available Qty) *</label>
            <select id="batch" v-model="dispense.stock_batch_id" required @change="handleBatchSelection">
              <option disabled value="">Select Batch</option>
              <option v-for="batch in availableBatches" :key="batch.id" :value="batch.id">
                {{ batch.batch_number }} - Exp: {{ batch.expiry_date }} - Avail: {{ batch.current_quantity }}
              </option>
            </select>
          </div>
          <div v-else-if="dispense.medication_item_id && !loadingBatches" class="form-group info-text">
            No available batches for the selected medication.
          </div>
          <div v-if="loadingBatches" class="form-group info-text">Loading batches...</div>
          
          <div class="form-group" v-if="selectedBatchInfo">
             <p class="batch-info-text">Selected Batch: {{selectedBatchInfo.batch_number}} | Expires: {{selectedBatchInfo.expiry_date}} | Available: {{selectedBatchInfo.current_quantity}}</p>
          </div>

          <div class="form-group">
            <label for="quantity_dispensed">Quantity to Dispense *</label>
            <input type="number" id="quantity_dispensed" v-model.number="dispense.quantity_dispensed" min="1" required />
          </div>

          <div class="form-group">
            <label for="dispensed_date">Dispensed Date *</label>
            <input type="datetime-local" id="dispensed_date" v-model="dispense.dispensed_date" required />
          </div>
          
          <div class="form-group">
            <label for="prescription_id">Prescription ID (Optional)</label>
            <input type="text" id="prescription_id" v-model="dispense.prescription_id" />
          </div>

          <div class="form-group notes-group">
            <label for="notes">Notes (Optional)</label>
            <textarea id="notes" v-model="dispense.notes" rows="2"></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loadingSubmit">{{ loadingSubmit ? 'Processing...' : 'Record Dispense'}}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn" :disabled="loadingSubmit">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
  type DispensingLog, type MedicationItem, type StockBatch, // Added type keyword
  createDispensingLog, fetchMedicationItems, fetchStockBatchesForItem,
} from '@/services/pharmacyService';
import { type Patient, fetchPatients } from '@/services/patientService'; // Correctly import Patient and add type keyword
import store from '@/store';

export default defineComponent({
  name: 'RecordDispenseModal',
  emits: ['close', 'dispenseRecorded'],
  setup(_, { emit }) {
    const dispense = ref<Omit<DispensingLog, 'id' | 'created_at' | 'patient_name' | 'medication_name' | 'batch_number' | 'dispensed_by_user_name'>>({
      patient_id: '',
      medication_item_id: '',
      stock_batch_id: '',
      quantity_dispensed: 1,
      dispensed_date: new Date().toISOString().slice(0, 16), // Defaults to now, YYYY-MM-DDTHH:mm
      prescription_id: '',
      notes: '',
    });

    const patients = ref<Patient[]>([]);
    const medicationItems = ref<MedicationItem[]>([]);
    const availableBatches = ref<StockBatch[]>([]);
    const loadingBatches = ref(false);
    const loadingSubmit = ref(false);
    const errorMessage = ref('');

    const selectedBatchInfo = computed(() => {
        if(dispense.value.stock_batch_id) {
            return availableBatches.value.find(b => b.id === dispense.value.stock_batch_id);
        }
        return null;
    });

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        patients.value = await fetchPatients(token);
        medicationItems.value = await fetchMedicationItems(token);
      } catch (error: any) { errorMessage.value = `Failed to load initial data: ${error.message}`; }
    };

    const handlePatientChange = () => {
      // Future: Could filter prescriptions based on patient if Rx ID is to be selected from a list
    };

    const handleMedicationChange = async () => {
      dispense.value.stock_batch_id = ''; // Reset batch selection
      availableBatches.value = [];
      if (dispense.value.medication_item_id) {
        loadingBatches.value = true;
        try {
          const token = store.state.token;
          if (!token) { errorMessage.value = 'Auth token missing.'; loadingBatches.value = false; return; }
          // Filter out batches with 0 current_quantity or expired (dummy service doesn't do expiry check yet)
          const batches = await fetchStockBatchesForItem(dispense.value.medication_item_id, token);
          availableBatches.value = batches.filter(b => b.current_quantity > 0);
        } catch (error: any) {
          errorMessage.value = `Failed to load stock batches: ${error.message}`;
        } finally {
          loadingBatches.value = false;
        }
      }
    };
    
    const handleBatchSelection = () => {
        // If needed, update something based on batch selection, e.g., max quantity
    };

    onMounted(loadInitialData);

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (!dispense.value.patient_id) { errorMessage.value = 'Patient is required.'; return; }
      if (!dispense.value.medication_item_id) { errorMessage.value = 'Medication is required.'; return; }
      if (!dispense.value.stock_batch_id) { errorMessage.value = 'Stock batch is required.'; return; }
      if (dispense.value.quantity_dispensed <= 0) { errorMessage.value = 'Quantity must be greater than 0.'; return; }
      
      const selectedBatch = availableBatches.value.find(b => b.id === dispense.value.stock_batch_id);
      if (selectedBatch && dispense.value.quantity_dispensed > selectedBatch.current_quantity) {
          errorMessage.value = `Cannot dispense more than available in batch (Available: ${selectedBatch.current_quantity}).`; return;
      }

      loadingSubmit.value = true;
      const token = store.state.token;
      if (!token) { errorMessage.value = 'User not authenticated.'; loadingSubmit.value = false; return; }

      try {
        const logToSubmit: Omit<DispensingLog, 'id' | 'created_at' | 'patient_name' | 'medication_name' | 'batch_number' | 'dispensed_by_user_name'> = {
            ...dispense.value,
            dispensed_by_user_id: store.state.user?.id || 'user_placeholder',
        };
        await createDispensingLog(logToSubmit, token);
        emit('dispenseRecorded');
        emit('close');
      } catch (error: any) {
        errorMessage.value = `Failed to record dispense: ${error.message}`;
      } finally {
        loadingSubmit.value = false;
      }
    };

    return {
      dispense,
      patients,
      medicationItems,
      availableBatches,
      loadingBatches,
      loadingSubmit,
      errorMessage,
      handleSubmit,
      handlePatientChange,
      handleMedicationChange,
      handleBatchSelection,
      selectedBatchInfo,
    };
  },
});
</script>

<style scoped>
.record-dispense-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-content {
  background: #fff; color: #111; padding: 1.5rem 2rem; border-radius: 12px;
  width: 90%; max-width: 650px; 
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex; flex-direction: column; max-height: 90vh;
}
.modal-title { color: var(--primary-blue); font-weight: 600; margin-bottom: 1.5rem; text-align: center; font-size: 1.6rem; flex-shrink: 0; }
.dispense-form { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
.form-scrollable-content { overflow-y: auto; padding: 0.5rem 1rem 0.5rem 0.5rem; margin-right: -1rem; flex-grow: 1; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; color: #333; font-size: 0.9rem; }
.form-group input, .form-group select, .form-group textarea {
  padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; width: 100%; box-sizing: border-box;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: var(--primary-blue); box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.info-text { font-style: italic; color: #555; margin-top: 0.5rem; }
.batch-info-text { font-size: 0.85rem; color: var(--primary-blue); margin-top: -0.5rem; margin-bottom: 1rem; }
.notes-group textarea { min-height: 60px; resize: vertical; }
.form-actions {
  margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0;
  padding-top: 1rem; border-top: 1px solid #eee;
}
.submit-btn, .cancel-btn { padding: 0.7rem 1.5rem; border-radius: 4px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; border: none; }
.submit-btn { background: var(--primary-blue); color: var(--white); }
.submit-btn:hover:not(:disabled) { background: var(--teal); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.cancel-btn { background: #ccc; color: #333; }
.cancel-btn:hover:not(:disabled) { background: #b0b0b0; }
.cancel-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.error-message { color: red; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
