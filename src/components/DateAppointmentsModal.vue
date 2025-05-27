<template>
  <div class="date-appointments-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">Appointments for {{ formattedDate }}</h3>
      <div v-if="!appointments || appointments.length === 0" class="no-appointments">
        <p>No appointments scheduled for this date.</p>
      </div>
      <div v-else class="appointments-list">
        <ul>
          <li v-for="appt in appointments" :key="appt.id" class="appointment-item">
            <div class="time">{{ formatTime(appt.appointment_time) }}</div>
            <div class="details">
              <span class="patient-name">{{ appt.patient_name || 'N/A' }}</span>
              <span class="doctor-name">with {{ appt.doctor_name || 'N/A' }}</span>
              <span :class="`status-${appt.status.toLowerCase()}`" class="status">{{ appt.status }}</span>
            </div>
            <button @click="viewAppointmentDetails(appt)" class="view-details-btn">Details</button>
          </li>
        </ul>
      </div>
      <div class="form-actions">
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { type Appointment } from '@/services/appointmentService';

export default defineComponent({
  name: 'DateAppointmentsModal',
  props: {
    appointments: {
      type: Array as PropType<Appointment[]>,
      required: true,
    },
    selectedDate: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'viewDetails'],
  setup(props, { emit }) {
    const formattedDate = computed(() => {
      if (!props.selectedDate) return '';
      return new Date(props.selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    const formatTime = (timeString: string) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const viewAppointmentDetails = (appointment: Appointment) => {
      emit('viewDetails', appointment);
    };

    return {
      formattedDate,
      formatTime,
      viewAppointmentDetails,
    };
  },
});
</script>

<style scoped>
.date-appointments-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2020; /* Higher than calendar event detail modal if they can overlap */
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem;
  border-radius: 10px;
  min-width: 480px;
  max-width: 550px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.4rem;
}
.no-appointments p {
  text-align: center;
  color: #555;
  padding: 2rem 0;
}
.appointments-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 40vh;
  overflow-y: auto;
}
.appointment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid #eee;
}
.appointment-item:last-child {
  border-bottom: none;
}
.time {
  font-weight: 500;
  color: var(--primary-blue);
  font-size: 0.95rem;
  width: 100px;
}
.details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
}
.patient-name {
  font-weight: 500;
  font-size: 0.95rem;
}
.doctor-name {
  font-size: 0.85rem;
  color: #444;
}
.status {
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 0.2rem;
}
.view-details-btn {
  background: var(--teal);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}
.view-details-btn:hover {
  background: var(--primary-blue);
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}
.close-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.close-btn:hover {
  background: #5a6268;
}

/* Status colors */
.status-scheduled { color: #007bff; }
.status-completed { color: #28a745; }
.status-cancelled { color: #dc3545; }
.status-pending { color: #ffc107; }
</style>
