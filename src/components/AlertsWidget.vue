<template>
  <div class="standardized-card">
    <h3 class="card-title">Alerts</h3>
    <ul class="card-list">
      <li v-if="error" class="card-list-empty error-message">{{ error }}</li>
      <li v-else v-for="alert in alerts" :key="alert.id" class="card-list-item">
        <span class="font-semibold">{{ alert.message }}</span>
        <span class="text-xs text-gray-500 ml-2">{{ alert.created_at }}</span>
      </li>
      <li v-if="!error && alerts.length === 0" class="card-list-empty">No alerts. (Demo: System maintenance)</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchAlerts } from '@/services/alertService';
const alerts = ref<any[]>([]);
const error = ref<string | null>(null);
onMounted(async () => {
  try {
    alerts.value = await fetchAlerts();
  } catch (e: any) {
    if (e?.response?.status === 404) {
      error.value = 'Alerts service unavailable.';
    } else if (e?.response?.status === 401) {
      error.value = 'You are not authorized to view alerts.';
    } else {
      error.value = 'Failed to load alerts.';
    }
    alerts.value = [];
  }
});
</script>

<style scoped>
.standardized-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
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
.error-message {
  color: #e57373;
  font-size: 0.98rem;
  padding: 0.2rem 0;
}
</style>
