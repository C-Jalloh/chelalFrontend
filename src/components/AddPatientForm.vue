<template>
  <div class="add-patient-form-modal">
    <div class="modal-content">
      <h3>Add New Patient</h3>
      <form @submit.prevent="handleSubmit">
        <label>Unique ID <input v-model="patient.unique_id" required /></label>
        <label>First Name <input v-model="patient.first_name" required /></label>
        <label>Last Name <input v-model="patient.last_name" required /></label>
        <label>Date of Birth <input type="date" v-model="patient.date_of_birth" required /></label>
        <label>Gender <select v-model="patient.gender" required><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select></label>
        <label>Contact Info <input v-model="patient.contact_info" /></label>
        <label>Address <input v-model="patient.address" /></label>
        <label>Known Allergies <textarea v-model="patient.known_allergies"></textarea></label>
        
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit">Save</button>
          <button type="button" @click="$emit('cancel')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { type Patient } from '@/services/patientService'; // Import Patient interface
import { createPatient } from '@/services/patientService';
import { addPatientOffline } from '@/services/offlineService';
import store from '@/store';

export default defineComponent({
  name: 'AddPatientForm',
  emits: ['patientAdded', 'cancel'],
  setup(_props, { emit }) {
    const patient = ref<Partial<Patient>>({
      unique_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      contact_info: '', // Changed from separate phone and email
      address: '',
      known_allergies: '',
    });
    const errorMessage = ref('');

    const handleSubmit = async () => {
      errorMessage.value = ''; // Clear previous errors
      try {
        // Ensure unique_id is always a string
        patient.value.unique_id = String(patient.value.unique_id);

        if (navigator.onLine) {
          const token = store.getters.isAuthenticated ? store.state.token : null;
          if (token) {
            const newPatient = await createPatient(patient.value as Patient, token); // Cast to Patient for online creation
            emit('patientAdded', newPatient);
            emit('cancel');
          } else {
            errorMessage.value = 'User not authenticated.';
          }
        } else {
          // Offline: Add to IndexedDB
          if (!patient.value.unique_id) patient.value.unique_id = '';
          // Ensure unique_id is always a string (not undefined)
          patient.value.unique_id = String(patient.value.unique_id);
          const newPatient = await addPatientOffline(patient.value as Patient);
          emit('patientAdded', newPatient);
          emit('cancel');
        }
      } catch (error: any) {
        errorMessage.value = error.message;
      }
    };

    return {
      patient,
      errorMessage,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.add-patient-form-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  min-width: 320px;
}
.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
}
</style>
