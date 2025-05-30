<template>
  <div class="appointment-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Appointment Details</h3>
      <div class="modal-scrollable-content">
        <div v-if="!appointment">
          <p>No appointment data provided.</p>
        </div>
        <div v-else class="details-container">
          <!-- Appointment Core Info -->
          <div class="section">
            <h4 class="section-title">Core Info</h4>
            <div class="details-grid">
              <div class="detail-item"><span class="label">Patient:</span> <span class="value">{{ appointment.patient_name || appointment.patient_id }}</span></div>
              <div class="detail-item"><span class="label">Doctor:</span> <span class="value">{{ appointment.doctor_name || appointment.doctor_id }}</span></div>
              <div class="detail-item"><span class="label">Date:</span> <span class="value">{{ appointment.appointment_date }}</span></div>
              <div class="detail-item"><span class="label">Time:</span> <span class="value">{{ appointment.appointment_time }}</span></div>
              <div class="detail-item"><span class="label">Status:</span> <span class="value" :class="`status-${appointment.status.toLowerCase()}`">{{ appointment.status }}</span></div>
            </div>
          </div>
          <div class="section">
            <h4 class="section-title">Notes</h4>
            <div class="detail-item full-width notes-item">
              <span class="label">Notes:</span>
              <span class="value">{{ appointment.notes || 'No notes.' }}</span>
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
import { type Appointment, type AppointmentNotificationInfo, fetchAppointmentNotificationInfo } from '@/services/appointmentService';
import store from '@/store';

export default defineComponent({
  name: 'AppointmentDetailModal',
  props: {
    appointment: {
      type: Object as PropType<Appointment | null>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const notificationInfo = ref<AppointmentNotificationInfo | null>(null);
    const loadingNotifications = ref(false);

    const loadNotificationData = async (appointmentId: string | number) => {
      if (!appointmentId) return;
      loadingNotifications.value = true;
      notificationInfo.value = null;
      try {
        const token = store.state.token;
        if (token) {
          notificationInfo.value = await fetchAppointmentNotificationInfo(appointmentId, token);
        }
      } catch (error) {
        console.error('Failed to load notification info:', error);
        // Error already handled by showing a message in the template if notificationInfo is null
      } finally {
        loadingNotifications.value = false;
      }
    };

    watch(() => props.appointment, (newAppointment) => {
      if (newAppointment && newAppointment.id) {
        loadNotificationData(newAppointment.id);
      } else {
        notificationInfo.value = null;
      }
    }, { immediate: true });

    return {
      notificationInfo,
      loadingNotifications,
    };
  },
});
</script>

<style scoped>
.appointment-detail-modal {
  /* Modal background and positioning */
}

.modal-content {
  /* Modal box styling */
}

.modal-title {
  /* Title styling */
}

.modal-scrollable-content {
  /* Scrollable content area */
}

.details-container {
  /* Container for appointment details */
}

.section {
  /* Section styling for core info and notes */
}

.section-title {
  /* Section title styling */
}

.details-grid {
  /* Grid layout for details */
}

.detail-item {
  /* Individual detail item styling */
}

.label {
  /* Label styling for detail items */
}

.value {
  /* Value styling for detail items */
}

.notes-item {
  /* Specific styling for notes item */
}

.form-actions {
  /* Actions area styling */
}

.close-btn {
  /* Close button styling */
}

/* Status and notification status styles */
.status-scheduled { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending { color: #ffc107; font-weight: bold; }
.notif-status-sent { color: #28a745; font-weight: bold; }
.notif-status-failed { color: #dc3545; font-weight: bold; }
.notif-status-pending { color: #007bff; font-weight: bold; }
.notif-status-not { color: #6c757d; } /* For 'Not Applicable' */
</style>
