<template>
  <div>
    <h2>Appointment Notifications</h2>
    <ul>
      <li v-for="notif in notifications" :key="notif.id">
        {{ notif.notification_type }} - {{ notif.status }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchAppointmentNotifications } from '../services/appointmentNotificationService';
const notifications = ref([]);
const loadNotifications = async () => {
  const res = await fetchAppointmentNotifications();
  notifications.value = res.data;
};
onMounted(loadNotifications);
</script>
