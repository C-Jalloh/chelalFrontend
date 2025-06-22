<template>
  <div class="standardized-card">
    <h3 class="card-title">Recent Audit Logs</h3>
    <ul class="card-list">
      <li v-if="error" class="card-list-empty error-message">{{ error }}</li>
      <li v-else v-for="log in logs" :key="log.id" class="card-list-item">
        <span class="font-semibold">{{ log.action }}</span>
        <span class="text-xs text-gray-500 ml-2">{{ log.timestamp }}</span>
      </li>
      <li v-if="!error && logs.length === 0" class="card-list-empty">No recent audit logs. (Demo: User login)</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchRecentAuditLogs } from '@/services/auditLogService';
const logs = ref<any[]>([]);
const error = ref<string | null>(null);
onMounted(async () => {
  try {
    logs.value = await fetchRecentAuditLogs();
  } catch (e: any) {
    if (e?.response?.status === 404) {
      error.value = 'Audit log service unavailable.';
    } else if (e?.response?.status === 401) {
      error.value = 'You are not authorized to view audit logs.';
    } else {
      error.value = 'Failed to load audit logs.';
    }
    logs.value = [];
  }
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
.error-message {
  color: #e57373;
  font-size: 0.98rem;
  padding: 0.2rem 0;
}
</style>
