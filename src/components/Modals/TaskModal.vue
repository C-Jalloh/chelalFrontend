<template>
  <BaseAddEditModal
    v-if="show"
    :errorMessage="errorMessage"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #title>{{ isEdit ? 'Edit Task' : 'Create Task' }}</template>
    <template #default>
      <fieldset :disabled="loading">
        <legend class="sr-only">Task Information</legend>
        <div class="form-section"><span class="section-title">Task Details</span></div>
        <div class="form-container">
          <FormInput
            id="title"
            label="Task Title"
            v-model="taskData.title"
            :required="true"
            placeholder="Enter task title"
            :maxlength="100"
            :errorMessage="validation.title"
            @blur="validateField('title')"
            @input="validateField('title')"
            :autofocus="true"
          />
          
          <FormSelect
            id="status"
            label="Status"
            v-model="taskData.status"
            :options="statusOptions"
            :required="true"
            :errorMessage="validation.status"
            @blur="validateField('status')"
            @change="validateField('status')"
          />
        </div>
      </fieldset>
      <div v-if="successMessage" class="success-message" role="status">{{ successMessage }}</div>
    </template>
    <template #submit-label>{{ loading ? 'Saving...' : 'Save' }}</template>
  </BaseAddEditModal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType, nextTick } from 'vue';
import BaseAddEditModal from './BaseAddEditModal.vue';
import FormInput from '@/components/FormElements/FormInput.vue';
import FormSelect from '@/components/FormElements/FormSelect.vue';

interface Task {
  id?: number;
  title: string;
  status: 'pending' | 'completed';
}

export default defineComponent({
  name: 'TaskModal',
  components: {
    BaseAddEditModal,
    FormInput,
    FormSelect
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    task: {
      type: Object as PropType<Task | null>,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const taskData = ref<Task>({
      title: '',
      status: 'pending'
    });
    
    const errorMessage = ref('');
    const successMessage = ref('');
    const loading = ref(false);
    const validation = ref<Record<string, string | null>>({});
    
    const statusOptions = [
      { value: 'pending', text: 'Pending' },
      { value: 'completed', text: 'Completed' }
    ];
    
    // Autofocus first field on open
    nextTick(() => {
      const el = document.getElementById('title');
      if (el) el.focus();
    });

    watch(() => props.task, (val) => {
      if (val) {
        taskData.value = { ...val };
      } else {
        taskData.value = { title: '', status: 'pending' };
      }
      validation.value = {};
      errorMessage.value = '';
      successMessage.value = '';
    }, { immediate: true });
    
    function validateField(field: string) {
      // Real-time validation for each field
      switch (field) {
        case 'title':
          validation.value.title = !taskData.value.title ? 'Task title is required.' : null;
          break;
        case 'status':
          validation.value.status = !taskData.value.status ? 'Status is required.' : null;
          break;
      }
    }
    
    function validateAll() {
      validateField('title');
      validateField('status');
      // Return true if no errors
      return Object.values(validation.value).every(v => !v);
    }
    
    const handleSubmit = async () => {
      if (!validateAll()) {
        errorMessage.value = 'Please correct the highlighted errors.';
        return;
      }
      
      loading.value = true;
      try {
        emit('save', { ...taskData.value });
        successMessage.value = props.isEdit ? 'Task updated successfully!' : 'Task created successfully!';
        setTimeout(() => {
          successMessage.value = '';
          emit('close');
        }, 1000);
      } catch (error: any) {
        errorMessage.value = error.message || 'Failed to save task.';
      } finally {
        loading.value = false;
      }
    };

    return {
      taskData,
      errorMessage,
      successMessage,
      loading,
      validation,
      statusOptions,
      validateField,
      handleSubmit
    };
  }
});
</script>

<style scoped>
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

.form-container {
  margin-bottom: 1rem;
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
</style>
