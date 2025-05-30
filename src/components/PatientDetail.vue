<template>
  <div class="patient-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Patient Details</h3>
      <div v-if="loading">Loading patient details...</div>
      <div v-else-if="errorMessage">Error: {{ errorMessage }}</div>
      <div v-else-if="patientDetails">
        <div class="two-column-details">
          <div class="detail-item">
            <span class="detail-label">Unique ID:</span>
            <span class="detail-value">{{ patientDetails.unique_id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date of Birth:</span>
            <span class="detail-value">{{ patientDetails.date_of_birth }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">First Name:</span>
            <span class="detail-value">{{ patientDetails.first_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Gender:</span>
            <span class="detail-value">{{ patientDetails.gender }}</span>
          </div>
          <div class="detail-item">
            <span class="label-detail">Last Name:</span> <span class="detail-value">{{ patientDetails.last_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Contact Info:</span>
            <span class="detail-value">{{ patientDetails.contact_info }}</span>
          </div>
        </div>
        <table class="details-table single-column-details">
          <tbody> <!-- Added tbody -->
            <tr><th>Address:</th><td>{{ patientDetails.address }}</td></tr>
            <tr><th>Known Allergies:</th><td>{{ patientDetails.known_allergies }}</td></tr>
            <tr><th>Created At:</th><td>{{ patientDetails.created_at ? new Date(patientDetails.created_at).toLocaleString() : 'N/A' }}</td></tr>
            <tr><th>Updated At:</th><td>{{ patientDetails.updated_at ? new Date(patientDetails.updated_at).toLocaleString() : 'N/A' }}</td></tr>
          </tbody> <!-- Added tbody -->
        </table>
        <div class="form-actions">
          <button class="edit-btn" @click="startEditing">Edit</button>
          <button class="delete-btn" @click="showDeleteModal = true">Delete</button>
          <button class="close-btn" @click="$emit('close')">Close</button>
        </div>
        <ConfirmDeleteModal
          v-if="showDeleteModal"
          :title="'Delete Patient'"
          :message="'Are you sure you want to delete this patient? This action cannot be undone.'"
          :loading="deleting"
          @close="showDeleteModal = false"
          @confirm="handleDeleteConfirmed"
        />
      </div>
      <div v-else>
        <h3>Edit Patient</h3>
        <form v-if="editedPatient" @submit.prevent="handleUpdate">
          <label>Unique ID <input v-model="editedPatient.unique_id" required /></label>
          <label>First Name <input v-model="editedPatient.first_name" required /></label>
          <label>Last Name <input v-model="editedPatient.last_name" required /></label>
          <label>Date of Birth <input type="date" v-model="editedPatient.date_of_birth" required /></label>
          <label>Gender <select v-model="editedPatient.gender" required><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></label>
          <label>Contact Info <input v-model="editedPatient.contact_info" /></label>
          <label>Address <input v-model="editedPatient.address" /></label>
          <label>Known Allergies <textarea v-model="editedPatient.known_allergies"></textarea></label>
          
          <div v-if="updateErrorMessage" class="error-message">{{ updateErrorMessage }}</div>
          <div class="form-actions">
            <button type="submit" class="edit-btn">Save</button>
            <button type="button" class="close-btn" @click="cancelEditing">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
import { getPatientById, updatePatient, deletePatient, type Patient } from '@/services/patientService';
import { updatePatientOffline, deletePatientOffline } from '@/services/offlineService';
import ConfirmDeleteModal from './ConfirmDeleteModal.vue';
import store from '@/store';

export default defineComponent({
  name: 'PatientDetail',
  components: { ConfirmDeleteModal },
  props: {
    patient: { type: Object as () => Patient, required: true },
  },
  emits: ['close', 'patientUpdated', 'patientDeleted'],
  setup(props, { emit }) {
    const patientDetails = ref<Patient | null>(null);
    const editedPatient = ref<Patient | null>(null);
    const isEditing = ref(false);
    const loading = ref(false);
    const errorMessage = ref('');
    const updateErrorMessage = ref('');
    const isOnline = ref(navigator.onLine);
    const showDeleteModal = ref(false);
    const deleting = ref(false);

    // Add this function to fix the ReferenceError
    const handleOnlineStatusChange = () => {
      isOnline.value = navigator.onLine;
    };

    // Define fetchPatientDetails BEFORE the watcher
    const fetchPatientDetails = async (patientId: string) => {
      loading.value = true;
      errorMessage.value = '';
      try {
        if (navigator.onLine && store.getters.isAuthenticated) {
          const onlinePatient = await getPatientById(patientId);
          patientDetails.value = onlinePatient;
          editedPatient.value = { ...onlinePatient };
        } else {
          errorMessage.value = 'User not authenticated.';
        }
      } catch (error: any) {
        errorMessage.value = error.message;
      } finally {
        loading.value = false;
      }
    };

    // Now the watcher can safely use fetchPatientDetails
    watch(() => props.patient, (newPatient) => {
      if (newPatient?.id) {
        // Decide whether to fetch from API or offline based on status
        if (navigator.onLine && newPatient.status !== 'pending_add') { // Only fetch from API if online and not a new offline patient
             fetchPatientDetails(newPatient.id as string); // Assuming API uses string IDs
        } else {
             // If offline or a pending_add patient, the full details should already be in the passed patient prop
             patientDetails.value = newPatient;
             editedPatient.value = { ...newPatient };
        }
      } else {
          patientDetails.value = null;
          editedPatient.value = null;
      }
    }, { immediate: true });

    const startEditing = () => {
      isEditing.value = true;
      updateErrorMessage.value = '';
    };

    const cancelEditing = () => {
      isEditing.value = false;
      editedPatient.value = patientDetails.value ? { ...patientDetails.value } : null;
      updateErrorMessage.value = '';
    };

    const handleUpdate = async () => {
      if (!editedPatient.value || editedPatient.value.id === undefined) return; // Ensure ID exists
      updateErrorMessage.value = '';
      try {
        if (navigator.onLine && editedPatient.value.status !== 'pending_add') { // Online update for synced patients
          if (store.getters.isAuthenticated) {
            const updated = await updatePatient(editedPatient.value as Patient); // Only pass patient object
            patientDetails.value = updated;
            isEditing.value = false;
            emit('patientUpdated', updated);
          } else {
            updateErrorMessage.value = 'User not authenticated.';
          }
        } else { // Offline update or updating a pending_add patient
          const updated = await updatePatientOffline(editedPatient.value);
          patientDetails.value = updated;
          isEditing.value = false;
          emit('patientUpdated', updated);
        }
      } catch (error: any) {
        updateErrorMessage.value = error.message;
      }
    };

    const handleDeleteConfirmed = async () => {
      if (!patientDetails.value || !patientDetails.value.id) return;
      deleting.value = true;
      try {
        if (navigator.onLine) {
          await deletePatient(patientDetails.value.id);
          emit('patientDeleted', patientDetails.value.id);
        } else {
          await deletePatientOffline(patientDetails.value.id);
          emit('patientDeleted', patientDetails.value.id);
        }
        emit('close');
      } catch (error: any) {
        alert('Error deleting patient: ' + error.message);
      } finally {
        deleting.value = false;
        showDeleteModal.value = false;
      }
    };

    // Sync logic when coming back online
    onMounted(() => {
      window.addEventListener('online', handleOnlineStatusChange);
      window.addEventListener('offline', handleOnlineStatusChange);
    });
    onUnmounted(() => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    });

    return {
      patientDetails,
      editedPatient,
      isEditing,
      loading,
      errorMessage,
      updateErrorMessage,
      isOnline,
      showDeleteModal,
      deleting,
      startEditing,
      cancelEditing,
      handleUpdate,
      handleDeleteConfirmed,
    };
  },
});
</script>

<style scoped>
.patient-detail-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 58, 92, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  color: #111;
  border-radius: 16px;
  min-width: 480px;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  outline: none;
  padding: 3rem 3.5rem 2.5rem 3.5rem;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-title {
  color: #1e3a5c;
  font-weight: 600;
  margin-bottom: 2.5rem;
  text-align: center;
  font-size: 2rem;
}
.two-column-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem 2rem; /* row-gap column-gap */
  width: 100%;
  margin-bottom: 1rem; /* Reduced margin-bottom */
}
.detail-item {
  display: flex;
  flex-direction: column; /* Stack label and value vertically */
  padding: 0.4rem 0;
}
.detail-label {
  font-weight: 600;
  color: #1e3a5c; /* Dark blue for labels */
  margin-bottom: 0.2rem; /* Space between label and value */
  font-size: 0.95rem;
}
.detail-value {
  color: #222;
  font-size: 1.05rem;
}
.details-table.single-column-details th {
  text-align: left;
  padding: 0.8rem 0 0.8rem 0;
  color: #1e3a5c; /* Dark blue for labels */
  font-weight: 600;
  background: none;
  border: none;
  width: auto; /* Adjust width as needed or remove for auto */
  font-size: 0.95rem;
}
.details-table.single-column-details td {
  text-align: left;
  padding: 0.8rem 0 0.8rem 0.5rem;
  color: #222;
  background: none;
  border: none;
  width: auto;
  font-size: 1.05rem;
  padding-left: 1rem; /* Add padding to separate from label */
}
.details-table.single-column-details tr {
    border-bottom: 1px solid #eee;
}
.details-table.single-column-details tr:last-child {
    border-bottom: none;
}
.form-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}
.edit-btn {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}
.edit-btn:hover {
  background: var(--teal);
}
.delete-btn {
  background: #e57373;
  color: #fff;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}
.delete-btn:hover {
  background: #c62828;
}
.close-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}
.close-btn:hover {
  background: #b0b0b0;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
}
.email-item {
  width: 100%; /* Make email span full width */
  margin-bottom: 2rem;
  padding: 0.4rem 0;
  display: flex;
  flex-direction: column;
}
@media (max-width: 800px) {
  .modal-content {
    min-width: 90vw;
    max-width: 98vw;
    padding: 1.5rem 0.5rem;
  }
}
</style>
