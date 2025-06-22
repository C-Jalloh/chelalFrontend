<template>
  <div>
    <h2 class="notifications-title">Notifications</h2>
    <AppointmentNotificationsView />
    <!-- Add other notification types/components here as needed -->
  </div>
</template>

<script setup lang="ts">
import AppointmentNotificationsView from '../components/AppointmentNotificationsView.vue';
</script>

<style scoped>
.notifications-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-contrast);
}
</style>
