<template>
  <div class="appointment-detail-modal" @mousedown.self="$emit('close')">
    <div class="modal-content" tabindex="0">
      <h3 class="modal-title">Appointment Details</h3>
      <div class="modal-scrollable-content">
        <div v-if="!appointment">
          <p>No appointment data provided.</p>
        </div>
        <div v-else class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Appointment ID:</span>
            <span class="detail-value">{{ appointment.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span :class="`status-${appointment.status.toLowerCase()}`" class="detail-value">{{ appointment.status }}</span>
          </div>
          
          <div class="detail-item full-width">
            <span class="detail-label">Patient:</span>
            <span class="detail-value">{{ appointment.patient_name || appointment.patient_id }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">Doctor:</span>
            <span class="detail-value">{{ appointment.doctor_name || appointment.doctor_id }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Date:</span>
            <span class="detail-value">{{ appointment.appointment_date }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Time:</span>
            <span class="detail-value">{{ appointment.appointment_time }}</span>
          </div>

          <div class="detail-item notes-item full-width">
            <span class="detail-label">Notes:</span>
            <span class="detail-value notes-text">{{ appointment.notes || 'N/A' }}</span>
          </div>

          <div class="detail-item full-width section-divider">
            <h4 class="section-title">System Information</h4>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Created At:</span>
            <span class="detail-value">{{ appointment.created_at ? new Date(appointment.created_at).toLocaleString() : 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Updated At:</span>
            <span class="detail-value">{{ appointment.updated_at ? new Date(appointment.updated_at).toLocaleString() : 'N/A' }}</span>
          </div>

          <div class="detail-item full-width section-divider">
            <h4 class="section-title">Reminders & Follow-ups</h4>
          </div>
          <div v-if="loadingNotifications" class="detail-item full-width">
            <p>Loading notification status...</p>
          </div>
          <div v-else-if="notificationInfo" class="detail-item full-width notification-details">
            <p><strong>Communication Type:</strong> {{ notificationInfo.communication_type || 'N/A' }}</p>
            <p><strong>Reminder Status:</strong> 
              <span :class="`notif-status-${notificationInfo.reminder_status?.toLowerCase()}`">
                {{ notificationInfo.reminder_status }}
              </span>
              <span v-if="notificationInfo.reminder_sent_at"> (Sent: {{ new Date(notificationInfo.reminder_sent_at).toLocaleString() }})</span>
            </p>
            <p><strong>Follow-up Status:</strong> 
              <span :class="`notif-status-${notificationInfo.follow_up_status?.toLowerCase()}`">
                {{ notificationInfo.follow_up_status }}
              </span>
              <span v-if="notificationInfo.follow_up_sent_at"> (Sent: {{ new Date(notificationInfo.follow_up_sent_at).toLocaleString() }})</span>
            </p>
          </div>
          <div v-else class="detail-item full-width">
            <p class="reminder-info-text">
              Could not load reminder and follow-up status.
            </p>
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
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2010;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem; /* Adjusted padding */
  border-radius: 12px;
  min-width: 500px;
  max-width: 650px;
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex; /* Added for flex column layout */
  flex-direction: column; /* Added for flex column layout */
  max-height: 85vh; /* Overall max height for the modal box */
}

.modal-scrollable-content {
  overflow-y: auto; /* Allow this part to scroll */
  padding-right: 1rem; /* Space for scrollbar */
  margin-right: -1rem; /* Counteract padding for scrollbar */
  flex-grow: 1; /* Allow this area to take available space */
}

.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem; /* Adjusted margin */
  text-align: center;
  font-size: 1.6rem; /* Adjusted font size */
  flex-shrink: 0; /* Prevent title from shrinking */
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.8rem; /* Adjusted gap */
  margin-bottom: 1.5rem; /* Adjusted margin */
}
.detail-item {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0; /* Increased padding */
}
.detail-item.full-width {
  grid-column: 1 / -1;
}
.detail-label {
  font-weight: 600; /* Bolder labels */
  color: #4a5568; /* Slightly softer label color */
  margin-bottom: 0.5rem; /* Increased space */
  font-size: 0.95rem;
}
.detail-value {
  color: #1a202c; /* Darker value color */
  font-size: 1.05rem;
}
.notes-item .detail-label {
  margin-bottom: 0.6rem;
}
.notes-text {
  white-space: pre-wrap;
  background-color: #f7fafc; /* Lighter background for notes */
  padding: 0.8rem 1rem; /* Increased padding */
  border-radius: 6px;
  min-height: 70px;
  border: 1px solid #e2e8f0; /* Softer border */
  line-height: 1.6;
}
.section-divider {
  margin-top: 1.5rem; /* Increased spacing */
  margin-bottom: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.section-title {
  font-size: 1.15rem; /* Slightly larger */
  color: var(--primary-blue);
  font-weight: 500;
  margin: 0 0 1rem 0; /* Increased bottom margin */
}

.reminder-info-text {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
  background-color: #f8f9fc;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  margin-top: 0.5rem;
}

.notification-details p {
  margin: 0.4rem 0;
  font-size: 0.95rem;
}
.notif-status-sent { color: #28a745; font-weight: bold; }
.notif-status-failed { color: #dc3545; font-weight: bold; }
.notif-status-pending { color: #007bff; font-weight: bold; }
.notif-status-not { color: #6c757d; } /* For 'Not Applicable' */

.form-actions {
  margin-top: 1.5rem; /* Adjusted margin */
  padding-top: 1rem; /* Add padding to separate from scrollable content */
  border-top: 1px solid #e8e8e8; /* Separator line */
  flex-shrink: 0; /* Prevent actions from shrinking */
}
.close-btn {
  background: #ccc;
  color: #333;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.close-btn:hover {
  background: #b0b0b0;
}

/* Status colors - ensure these match AppointmentsView */
.status-scheduled { color: #007bff; font-weight: bold; }
.status-completed { color: #28a745; font-weight: bold; }
.status-cancelled { color: #dc3545; font-weight: bold; }
.status-pending { color: #ffc107; font-weight: bold; }
</style>
