<template>
  <BaseAddEditModal
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEditing ? 'Edit Patient' : 'Add New Patient' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Patient Information</legend>
        <div class="form-section"><span class="section-title">Personal Info</span></div>
        <div class="form-grid">
          <FormInput
            id="first_name"
            label="First Name"
            v-model="formPatient.first_name"
            :required="true"
            placeholder="Enter first name"
            :maxlength="50"
            autocomplete="given-name"
            :errorMessage="validation.first_name"
            @blur="validateField('first_name')"
            @input="validateField('first_name')"
            :autofocus="true"
          />
          <FormInput
            id="last_name"
            label="Last Name"
            v-model="formPatient.last_name"
            :required="true"
            placeholder="Enter last name"
            :maxlength="50"
            autocomplete="family-name"
            :errorMessage="validation.last_name"
            @blur="validateField('last_name')"
            @input="validateField('last_name')"
          />
          <FormInput
            id="date_of_birth"
            label="Date of Birth"
            type="date"
            v-model="formPatient.date_of_birth"
            :required="true"
            :maxDate="maxDate"
            autocomplete="bday"
            :errorMessage="validation.date_of_birth"
            @blur="validateField('date_of_birth')"
            @input="validateField('date_of_birth')"
          />
          <FormSelect
            id="gender"
            label="Gender"
            v-model="formPatient.gender"
            :required="true"
            :options="genderOptions"
            placeholder="Select Gender"
            autocomplete="sex"
            :errorMessage="validation.gender"
            @blur="validateField('gender')"
            @change="validateField('gender')"
          />
        </div>
        <div class="form-section"><span class="section-title">Contact Info <span class="optional">(optional)</span></span></div>
        <div class="form-grid">
          <div class="form-group full-width-group">
            <FormInput
              id="contact_info"
              label="Contact Info"
              v-model="formPatient.contact_info"
              placeholder="Phone or email"
              :maxlength="100"
              pattern="[\w\s@+\.\-]*"
              autocomplete="tel email"
              :errorMessage="validation.contact_info"
              helpText="Phone number or email address. Optional."
              @blur="validateField('contact_info')"
              @input="validateField('contact_info')"
            />
          </div>
          <div class="form-group full-width-group">
            <FormInput
              id="address"
              label="Address"
              v-model="formPatient.address"
              placeholder="Street, city, etc."
              :maxlength="120"
              autocomplete="street-address"
              :errorMessage="validation.address"
              helpText="Optional."
              @blur="validateField('address')"
              @input="validateField('address')"
            />
          </div>
        </div>
        <div class="form-section"><span class="section-title">Medical Info <span class="optional">(optional)</span></span></div>
        <div class="form-group full-width-group notes-group">
          <FormTextarea
            id="known_allergies"
            label="Known Allergies"
            v-model="formPatient.known_allergies"
            placeholder="E.g. Penicillin, peanuts"
            :maxlength="200"
            autocomplete="off"
            :errorMessage="validation.known_allergies"
            helpText="E.g. Penicillin, peanuts. Optional."
            @blur="validateField('known_allergies')"
            @input="validateField('known_allergies')"
          />
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save') }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType, nextTick } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';
import FormTextarea from '@/components/FormElements/FormTextarea.vue';
import { type Patient, createPatient, updatePatient } from '@/services/patientService';
import { addPatientOffline, updatePatientOffline } from '@/services/offlineService';

export default defineComponent({
  name: 'AddEditPatientModal',
  components: { 
    BaseAddEditModal,
    FormInput,
    FormSelect,
    FormTextarea
  },
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
    
    const genderOptions = [
      { value: 'Male', text: 'Male' },
      { value: 'Female', text: 'Female' },
      // Add other gender options if needed, e.g.:
      // { value: 'Other', text: 'Other' },
      // { value: 'PreferNotToSay', text: 'Prefer not to say' }
    ];

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
      errorMessage,
      successMessage,
      loading,
      formPatient,
      validation,
      genderOptions, // <-- Add this line
      maxDate,
      handleSubmit,
      validateField,
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
  gap: 0rem 1.8rem; /* Adjusted gap to rely on component's internal margin-bottom */
  margin-bottom: 0.2rem; /* Adjusted margin */
}
.full-width-group {
  grid-column: 1 / -1;
  /* margin-top: 1.2rem; */ /* May not be needed if form-group has margin-bottom */
}
.notes-group {
}
.form-section {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0; /* Light gray border */
}
.section-title {
  font-size: 0.95rem; /* Slightly smaller than main title */
  font-weight: 600;
  color: #4a5568; /* Darker gray text */
}
.optional {
  font-size: 0.8rem;
  font-weight: normal;
  color: #718096; /* Medium gray text */
}
.success-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #c6f6d5; /* Green-200 */
  color: #2f855a; /* Green-700 */
  border: 1px solid #9ae6b4; /* Green-300 */
  border-radius: 0.375rem; /* Rounded corners */
  text-align: center;
}
/* Ensure fieldset takes up space and legend is accessible */
fieldset {
  border: none;
  padding: 0;
  margin: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
/* Add some breathing room at the bottom of the modal content */
form > div:last-child {
  margin-bottom: 1rem;
}
@media (max-width: 700px) {
  .modal-content {
    min-width: 95vw;
    max-width: 99vw;
    padding: 1rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0rem; /* Adjusted gap */
  }
}
</style>
