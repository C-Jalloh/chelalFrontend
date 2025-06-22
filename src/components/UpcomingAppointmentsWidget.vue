<template>
  <div class="standardized-card">
    <h3 class="card-title">Upcoming Appointments</h3>
    <ul class="card-list">
      <li v-for="appt in appointments" :key="appt.id" class="card-list-item">
        <span class="font-semibold">{{ appt.patient_name }}</span>
        <span class="text-xs text-gray-500 ml-2">{{ appt.appointment_date }} {{ appt.appointment_time }}</span>
      </li>
      <li v-if="appointments.length === 0" class="card-list-empty">No upcoming appointments. (Demo: 2025-06-16 10:00)</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchUpcomingAppointments } from '@/services/appointmentService';
const appointments = ref<any[]>([]);
onMounted(async () => {
  appointments.value = await fetchUpcomingAppointments();
});
</script>

<style scoped>
.standardized-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  padding: 2rem 1.5rem;
  min-width: 220px;
  min-height: 100px;
  max-height: 160px;
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.card-title {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}
.card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.card-list-item {
  padding: 0.2rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 1rem;
}
.card-list-empty {
  color: #9ca3af;
  font-size: 0.98rem;
  padding: 0.2rem 0;
}
</style>
