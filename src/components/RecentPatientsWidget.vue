<template>
  <div class="standardized-card">
    <h3 class="card-title">Recent Patients</h3>
    <ul class="card-list">
      <li v-for="patient in patients" :key="patient.id" class="card-list-item">
        <span class="font-semibold">{{ patient.first_name }} {{ patient.last_name }}</span>
        <span class="text-xs text-gray-500 ml-2">({{ patient.unique_id }})</span>
      </li>
      <li v-if="patients.length === 0" class="card-list-empty">No recent patients. (Demo: John Doe, Jane Smith)</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchRecentPatients } from '@/services/userService';
const patients = ref<any[]>([]);
onMounted(async () => {
  patients.value = await fetchRecentPatients();
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
