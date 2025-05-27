<template>
  <div class="dispensing-log-view-bg">
    <div class="dispensing-log-container">
      <div class="dispensing-log-header">
        <h2>Dispensing Log</h2>
        <button @click="openRecordDispenseModal">Record New Dispense</button>
      </div>

      <!-- Filters can be added here later -->

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="dispensing-log-table-wrapper">
        <table class="dispensing-log-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Patient</th>
              <th>Medication</th>
              <th>Batch No.</th>
              <th>Qty Dispensed</th>
              <th>Dispensed Date</th>
              <th>Dispensed By</th>
              <th>Rx ID (Optional)</th>
              <!-- No actions like edit/delete for logs typically -->
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td>Loading dispensing logs...</td></tr>
            <tr v-else-if="dispensingLogs.length === 0"><td>No dispensing records found.</td></tr>
            <tr v-for="log in dispensingLogs" :key="log.id">
              <td>{{ log.id }}</td>
              <td>{{ log.patient_name || log.patient_id }}</td>
              <td>{{ log.medication_name || log.medication_item_id }}</td>
              <td>{{ log.batch_number || log.stock_batch_id }}</td>
              <td>{{ log.quantity_dispensed }}</td>
              <td>{{ new Date(log.dispensed_date).toLocaleString() }}</td>
              <td>{{ log.dispensed_by_user_name || 'N/A' }}</td>
              <td>{{ log.prescription_id || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <RecordDispenseModal 
        v-if="showRecordDispenseModal" 
        @close="closeRecordDispenseModal" 
        @dispense-recorded="refreshDispensingLogs" 
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchDispensingLogs, type DispensingLog } from '@/services/pharmacyService';
import store from '@/store';
import RecordDispenseModal from '../components/RecordDispenseModal.vue'; // To be created

export default defineComponent({
  name: 'DispensingLogView',
  components: { RecordDispenseModal },
  setup() {
    const dispensingLogs = ref<DispensingLog[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const showRecordDispenseModal = ref(false);

    const loadDispensingLogs = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'User not authenticated.'; loading.value = false; return; }
        dispensingLogs.value = await fetchDispensingLogs(token);
      } catch (error: any) {
        errorMessage.value = `Failed to load dispensing logs: ${error.message || 'Unknown error'}`;
      } finally {
        loading.value = false;
      }
    };

    const refreshDispensingLogs = () => {
        loadDispensingLogs();
        // TODO: Consider a more global way to indicate that stock levels might have changed
        // so other views (like PharmacyInventoryView) could re-fetch if active.
    };

    const openRecordDispenseModal = () => {
      showRecordDispenseModal.value = true;
    };

    const closeRecordDispenseModal = () => {
      showRecordDispenseModal.value = false;
    };

    onMounted(loadDispensingLogs);

    return {
      dispensingLogs,
      loading,
      errorMessage,
      showRecordDispenseModal,
      openRecordDispenseModal,
      closeRecordDispenseModal,
      refreshDispensingLogs,
    };
  },
});
</script>

<style scoped>
.dispensing-log-view-bg {
  background: #eaf4fb;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

.dispensing-log-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.dispensing-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.dispensing-log-header h2 {
  color: var(--primary-blue);
  margin: 0;
  font-size: 1.8rem;
}

.dispensing-log-header button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.dispensing-log-header button:hover {
  background: var(--teal);
}

.dispensing-log-table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.dispensing-log-table {
  width: 100%;
  border-collapse: collapse;
  color: #111;
}

.dispensing-log-table th,
.dispensing-log-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: nowrap;
}

.dispensing-log-table th {
  background: #f0f6fa;
  color: var(--primary-blue);
  font-weight: 600;
}

.dispensing-log-table tr:nth-child(even) {
  background-color: #f9fcff;
}

.dispensing-log-table tr:hover {
  background-color: #e6f3fb;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
