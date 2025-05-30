<template>
  <div class="appointment-calendar-container">
    <FullCalendar :options="calendarOptions" />
  </div>
  <!-- We can add a modal here to show appointment details when an event is clicked -->
  <AppointmentDetailModal 
    v-if="selectedAppointmentForDetailView"
    :appointment="selectedAppointmentForDetailView"
    @close="selectedAppointmentForDetailView = null"
  />
  <DateAppointmentsModal
    v-if="showDateAppointmentsModal"
    :appointments="appointmentsForSelectedDate"
    :selected-date="clickedDateStr"
    @close="showDateAppointmentsModal = false"
    @view-details="handleViewDetailsFromDateModal"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type CalendarOptions, type EventClickArg } from '@fullcalendar/core';
import { type Appointment } from '@/services/appointmentService';
import AppointmentDetailModal from './AppointmentDetailModal.vue';
import DateAppointmentsModal from './DateAppointmentsModal.vue';

export default defineComponent({
  name: 'AppointmentCalendar',
  components: {
    FullCalendar,
    AppointmentDetailModal,
    DateAppointmentsModal,
  },
  props: {
    appointments: {
      type: Array as PropType<Appointment[]>,
      required: true,
    },
    initialView: {
      type: String,
      default: 'dayGridMonth',
    },
  },
  emits: ['dateClick', 'eventClick'],
  setup(props) {
    const selectedAppointmentForDetailView = ref<Appointment | null>(null);
    const showDateAppointmentsModal = ref(false);
    const appointmentsForSelectedDate = ref<Appointment[]>([]);
    const clickedDateStr = ref('');

    const transformAppointmentsToEvents = (appointments: Appointment[]) => {
      return appointments.map(appt => ({
        id: String(appt.id),
        title: `${appt.patient_name || 'Patient'} - ${appt.doctor_name || 'Doctor'}`,
        start: `${appt.appointment_date}T${appt.appointment_time}`,
        // end: Optional, if appointments have a duration
        backgroundColor: getEventColor(appt.status),
        borderColor: getEventColor(appt.status),
        classNames: [`appt-status-${(appt.status || '').toLowerCase()}`], // Add status class
        extendedProps: { ...appt }, // Store the original appointment object
      }));
    };

    const getEventColor = (status: Appointment['status']) => {
      switch (status) {
        case 'Scheduled': return '#007bff'; // Blue
        case 'Completed': return '#28a745'; // Green
        case 'Cancelled': return '#dc3545'; // Red
        case 'Pending': return '#ffc107'; // Yellow
        default: return '#6c757d'; // Grey
      }
    };

    const calendarOptions = ref<CalendarOptions>({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: props.initialView,
      weekends: true,
      selectable: true,
      events: transformAppointmentsToEvents(props.appointments),
      editable: true,       // Allows dragging and resizing (if backend supports updates)
      selectMirror: true,
      dayMaxEvents: true,   // When too many events, shows a "+X more" link
      eventClick: (clickInfo: EventClickArg) => {
        // Open a detail modal or emit an event to the parent
        selectedAppointmentForDetailView.value = clickInfo.event.extendedProps as Appointment;
      },
      dateClick: (clickInfo: any) => { // Changed to any
        clickedDateStr.value = clickInfo.dateStr;
        const dateAppointments = props.appointments.filter(
          appt => appt.appointment_date === clickInfo.dateStr
        );
        if (dateAppointments.length > 0) {
          appointmentsForSelectedDate.value = dateAppointments;
          showDateAppointmentsModal.value = true;
        } else {
          // Optionally, still open the add appointment form or show a message
          // For now, we can use the emit for parent to handle, or just alert.
          // emit('dateClicked', clickInfo.dateStr); 
          alert('No appointments for ' + clickInfo.dateStr + ". You can add one!");
        }
      },
      // more options...
    });

    // Watch for changes in appointments prop and update calendar events
    watch(() => props.appointments, (newAppointments) => {
      calendarOptions.value.events = transformAppointmentsToEvents(newAppointments);
    });

    const handleViewDetailsFromDateModal = (appointment: Appointment) => {
      showDateAppointmentsModal.value = false; // Close the date list modal
      selectedAppointmentForDetailView.value = appointment; // Open the main detail modal
    };

    return {
      calendarOptions,
      selectedAppointmentForDetailView, // Renamed
      showDateAppointmentsModal,
      appointmentsForSelectedDate,
      clickedDateStr,
      handleViewDetailsFromDateModal,
    };
  },
});
</script>

<style>
/* Global FullCalendar styles - often better in a global CSS file or main.ts */
/* Ensure these are loaded. Vite might require them in main.ts or a CSS entry point. */
/* @import '@fullcalendar/common/main.css'; already handled by individual plugin css usually */

.appointment-calendar-container {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Scoped styles for FullCalendar can be tricky due to its DOM structure. */
/* Some basic overrides might work here, but for deep customization, global styles are often needed. */
.fc .fc-button-primary {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
}
.fc .fc-button-primary:hover {
  background-color: var(--teal);
  border-color: var(--teal);
}
.fc .fc-event {
  font-size: 0.85em;
  padding: 2px 4px;
}

/* Make the event bar thicker and span the full width, remove dot */
.fc .fc-daygrid-event {
  border-radius: 6px;
  min-height: 22px;
  padding: 0 6px;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  border: none !important;
}
.fc .fc-daygrid-event-dot {
  display: none !important;
}
.fc .fc-event-main {
  color: #fff !important;
  padding: 0.2em 0.5em;
  width: 100%;
  display: block;
}

/* Appointment status color bars */
.fc .appt-status-scheduled {
  background-color: #007bff !important;
  color: #fff !important;
}
.fc .appt-status-completed {
  background-color: #28a745 !important;
  color: #fff !important;
}
.fc .appt-status-cancelled {
  background-color: #dc3545 !important;
  color: #fff !important;
}
.fc .appt-status-pending {
  background-color: #ffc107 !important;
  color: #111 !important;
}

/* Ensure the calendar is visible and has some height */
.fc {
  max-width: 100%;
  margin: 0 auto;
  min-height: 600px; /* Give calendar some default height */
}
</style>
