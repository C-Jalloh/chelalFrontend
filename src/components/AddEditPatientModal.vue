<template>
  <div class="add-edit-patient-modal" @mousedown.self="$emit('close')" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h3 class="modal-title">{{ isEditing ? 'Edit Patient' : 'Add New Patient' }}</h3>
      <form @submit.prevent="handleSubmit" novalidate aria-label="Patient Form">
        <fieldset :disabled="loading">
          <legend class="sr-only">Patient Information</legend>
          <div class="form-section"><span class="section-title">Personal Info</span></div>
          <div class="form-grid">
            <div class="form-group">
              <label for="first_name">First Name<span class="required">*</span></label>
              <input id="first_name" v-model="formPatient.first_name" required placeholder="Enter first name" maxlength="50" autocomplete="given-name" aria-required="true" :aria-invalid="!!validation.first_name" autofocus @blur="validateField('first_name')" @input="validateField('first_name')" />
              <small v-if="validation.first_name" class="field-error">{{ validation.first_name }}</small>
            </div>
            <div class="form-group">
              <label for="last_name">Last Name<span class="required">*</span></label>
              <input id="last_name" v-model="formPatient.last_name" required placeholder="Enter last name" maxlength="50" autocomplete="family-name" aria-required="true" :aria-invalid="!!validation.last_name" @blur="validateField('last_name')" @input="validateField('last_name')" />
              <small v-if="validation.last_name" class="field-error">{{ validation.last_name }}</small>
            </div>
            <div class="form-group">
              <label for="date_of_birth">Date of Birth<span class="required">*</span></label>
              <input type="date" id="date_of_birth" v-model="formPatient.date_of_birth" required :max="maxDate" autocomplete="bday" aria-required="true" :aria-invalid="!!validation.date_of_birth" @blur="validateField('date_of_birth')" @input="validateField('date_of_birth')" />
              <small v-if="validation.date_of_birth" class="field-error">{{ validation.date_of_birth }}</small>
            </div>
            <div class="form-group">
              <label for="gender">Gender<span class="required">*</span></label>
              <select id="gender" v-model="formPatient.gender" required autocomplete="sex" aria-required="true" :aria-invalid="!!validation.gender" @blur="validateField('gender')" @change="validateField('gender')">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <small v-if="validation.gender" class="field-error">{{ validation.gender }}</small>
            </div>
          </div>
          <div class="form-section"><span class="section-title">Contact Info <span class="optional">(optional)</span></span></div>
          <div class="form-grid">
            <div class="form-group full-width-group">
              <label for="contact_info">Contact Info
                <span class="help-text" title="Phone number or email address. Optional.">?</span>
              </label>
              <input id="contact_info" v-model="formPatient.contact_info" placeholder="Phone or email" maxlength="100" pattern="[\w\s@+.-]*" autocomplete="tel email" :aria-invalid="!!validation.contact_info" @blur="validateField('contact_info')" @input="validateField('contact_info')" />
              <small v-if="validation.contact_info" class="field-error">{{ validation.contact_info }}</small>
            </div>
            <div class="form-group full-width-group">
              <label for="address">Address <span class="optional">(optional)</span></label>
              <input id="address" v-model="formPatient.address" placeholder="Street, city, etc." maxlength="120" autocomplete="street-address" :aria-invalid="!!validation.address" @blur="validateField('address')" @input="validateField('address')" />
              <small v-if="validation.address" class="field-error">{{ validation.address }}</small>
            </div>
          </div>
          <div class="form-section"><span class="section-title">Medical Info <span class="optional">(optional)</span></span></div>
          <div class="form-group full-width-group notes-group">
            <label for="known_allergies">Known Allergies
              <span class="help-text" title="E.g. Penicillin, peanuts. Optional.">?</span>
            </label>
            <textarea id="known_allergies" v-model="formPatient.known_allergies" placeholder="E.g. Penicillin, peanuts" maxlength="200" autocomplete="off" :aria-invalid="!!validation.known_allergies" @blur="validateField('known_allergies')" @input="validateField('known_allergies')"></textarea>
            <small v-if="validation.known_allergies" class="field-error">{{ validation.known_allergies }}</small>
          </div>
        </fieldset>
        <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save') }}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn" :disabled="loading">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType, nextTick } from 'vue';
import { type Patient, createPatient, updatePatient } from '@/services/patientService';
import { addPatientOffline, updatePatientOffline } from '@/services/offlineService';

export default defineComponent({
  name: 'AddEditPatientModal',
  props: {
    existingPatient: {
      type: Object as PropType<Patient | null>,
      default: null,
    },
  },
  emits: ['close', 'patientAdded', 'patientUpdated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const formPatient = ref<Partial<Patient>>({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      contact_info: '',
      address: '',
      known_allergies: '',
    });
    const validation = ref<Record<string, string | null>>({});
    const maxDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    // Autofocus first field on open
    nextTick(() => {
      const el = document.getElementById('first_name');
      if (el) el.focus();
    });
    watch(() => props.existingPatient, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        const { unique_id, ...rest } = newVal;
        formPatient.value = { ...rest };
      } else {
        isEditing.value = false;
        formPatient.value = {
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: '',
          contact_info: '',
          address: '',
          known_allergies: '',
        };
      }
      validation.value = {};
      errorMessage.value = '';
      successMessage.value = '';
    }, { immediate: true });
    function validateField(field: string) {
      // Real-time validation for each field
      switch (field) {
        case 'first_name':
          validation.value.first_name = !formPatient.value.first_name ? 'First name is required.' : null;
          break;
        case 'last_name':
          validation.value.last_name = !formPatient.value.last_name ? 'Last name is required.' : null;
          break;
        case 'date_of_birth':
          if (!formPatient.value.date_of_birth) validation.value.date_of_birth = 'Date of birth is required.';
          else if (formPatient.value.date_of_birth > maxDate.value) validation.value.date_of_birth = 'Date cannot be in the future.';
          else validation.value.date_of_birth = null;
          break;
        case 'gender':
          validation.value.gender = !formPatient.value.gender ? 'Gender is required.' : null;
          break;
        case 'contact_info':
          if (formPatient.value.contact_info && formPatient.value.contact_info.length > 100)
            validation.value.contact_info = 'Contact info is too long.';
          else validation.value.contact_info = null;
          break;
        case 'address':
          if (formPatient.value.address && formPatient.value.address.length > 120)
            validation.value.address = 'Address is too long.';
          else validation.value.address = null;
          break;
        case 'known_allergies':
          if (formPatient.value.known_allergies && formPatient.value.known_allergies.length > 200)
            validation.value.known_allergies = 'Allergies info is too long.';
          else validation.value.known_allergies = null;
          break;
      }
    }
    function validateAll() {
      validateField('first_name');
      validateField('last_name');
      validateField('date_of_birth');
      validateField('gender');
      validateField('contact_info');
      validateField('address');
      validateField('known_allergies');
      // Return true if no errors
      return Object.values(validation.value).every(v => !v);
    }
    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      if (!validateAll()) {
        errorMessage.value = 'Please correct the highlighted errors.';
        return;
      }
      loading.value = true;
      try {
        if (navigator.onLine) {
          if (isEditing.value && props.existingPatient?.id) {
            const updated = await updatePatient({ ...formPatient.value, id: props.existingPatient.id } as Patient);
            emit('patientUpdated', updated);
            successMessage.value = 'Patient updated successfully!';
          } else {
            const newPatient = await createPatient(formPatient.value as Patient);
            emit('patientAdded', newPatient);
            successMessage.value = 'Patient added successfully!';
          }
          setTimeout(() => { successMessage.value = ''; emit('close'); }, 1200);
        } else {
          if (isEditing.value && props.existingPatient?.id) {
            const updated = await updatePatientOffline({ ...formPatient.value, id: props.existingPatient.id } as Patient);
            emit('patientUpdated', updated);
            successMessage.value = 'Patient updated (offline)!';
          } else {
            const newPatient = await addPatientOffline(formPatient.value as Patient);
            emit('patientAdded', newPatient);
            successMessage.value = 'Patient added (offline)!';
          }
          setTimeout(() => { successMessage.value = ''; emit('close'); }, 1200);
        }
      } catch (error: any) {
        errorMessage.value = error.message;
      } finally {
        loading.value = false;
      }
    };
    return {
      isEditing,
      formPatient,
      errorMessage,
      successMessage,
      loading,
      maxDate,
      validation,
      validateField,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.add-edit-patient-modal {
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
  min-width: 520px;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.6rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem 1.8rem;
  margin-bottom: 1.2rem;
}
.full-width-group {
  grid-column: 1 / -1;
  margin-top: 1.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.6rem;
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
  background: #fff !important;
  color: #111 !important;
  transition: background 0.2s, color 0.2s;
}
/* Force autofill background and text color for Chrome/Brave/Edge */
.form-group input:-webkit-autofill,
.form-group input:-webkit-autofill:focus,
.form-group input:-webkit-autofill:hover,
.form-group input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  -webkit-text-fill-color: #111 !important;
  transition: background-color 5000s ease-in-out 0s;
}
/* For Firefox dark mode */
@media (prefers-color-scheme: dark) {
  .form-group input,
  .form-group select,
  .form-group textarea {
    background: #fff !important;
    color: #111 !important;
  }
}
.notes-group {
  margin-top: 1.2rem;
}
.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.submit-btn {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.submit-btn:hover {
  background: var(--teal);
}
.cancel-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.cancel-btn:hover {
  background: #b0b0b0;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.form-section {
  margin: 1.2rem 0 0.5rem 0;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-blue);
}
.optional {
  color: #888;
  font-size: 0.95em;
  font-weight: 400;
}
.required {
  color: #e57373;
  margin-left: 0.2em;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
.help-text {
  margin-left: 0.3em;
  color: #888;
  cursor: help;
  font-size: 1em;
  border-bottom: 1px dotted #888;
}
.field-error {
  color: #e57373;
  font-size: 0.92em;
  margin-top: 0.2em;
}
.success-message {
  color: #2e7d32;
  background: #eafbe7;
  border-radius: 4px;
  padding: 0.5em 1em;
  margin-bottom: 1em;
  font-size: 1em;
  text-align: center;
}
@media (max-width: 700px) {
  .modal-content {
    min-width: 95vw;
    max-width: 99vw;
    padding: 1rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
