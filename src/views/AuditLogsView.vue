<template>
  <div class="audit-logs-bg">
    <div class="audit-logs-view">
      <div class="audit-module-title-row">
        <h2 class="audit-module-title">Audit Module</h2>
      </div>
      <div class="audit-header">
        <div class="audit-header-row">
          <h1><svg class="icon-header" style="width:1.3em;height:1.3em;margin-right:0.5em;vertical-align:middle;color:var(--primary-blue);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>Audit Logs</h1>
          <AddButton label="Add Audit Log" @click="openAddAuditLogModal" style="margin-left:auto;" />
        </div>
        <div class="audit-filters">
          <input v-model="filterUser" class="audit-search" type="search" placeholder="Search by user..." aria-label="Search by user" />
          <input v-model="filterAction" class="audit-search" type="search" placeholder="Search by action..." aria-label="Search by action" />
          <input v-model="filterDescription" class="audit-search" type="search" placeholder="Search by description..." aria-label="Search by description" />
          <ClearButton @click="clearFilters">Clear</ClearButton>
        </div>
      </div>
      <AuditLogTable :logs="filteredAuditLogs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchAuditLogs } from '../services/auditLogService';
import AuditLogTable from '../components/AuditLogTable.vue';
import ClearButton from '../components/buttons/ClearButton.vue';
import AddButton from '../components/buttons/AddButton.vue';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  description: string;
  timestamp: string;
}

const auditLogs = ref<AuditLog[]>([]);
const filterUser = ref('');
const filterAction = ref('');
const filterDescription = ref('');

const loadAuditLogs = async () => {
  try {
    const res = await fetchAuditLogs();
    auditLogs.value = res.data;
  } catch (e) {
    auditLogs.value = [];
  }
};

const clearFilters = () => {
  filterUser.value = '';
  filterAction.value = '';
  filterDescription.value = '';
};

const openAddAuditLogModal = () => {
  // Placeholder for add modal logic
  alert('Add Audit Log modal (not implemented)');
};

const filteredAuditLogs = computed(() => {
  return auditLogs.value.filter((log) => {
    const userMatch = !filterUser.value || (log.user && log.user.toLowerCase().includes(filterUser.value.toLowerCase()));
    const actionMatch = !filterAction.value || (log.action && log.action.toLowerCase().includes(filterAction.value.toLowerCase()));
    const descMatch = !filterDescription.value || (log.description && log.description.toLowerCase().includes(filterDescription.value.toLowerCase()));
    return userMatch && actionMatch && descMatch;
  });
});

onMounted(loadAuditLogs);
</script>

<style scoped>
.audit-logs-view {
  padding: 2rem;
}
.audit-logs-bg {
  background: var(--primary-blue);
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}
.audit-module-title-row {
  margin-bottom: 0.5rem;
  width: 100%;
}
.audit-module-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
  margin: 0;
  width: 100%;
  max-width: 900px;
  text-align: left;
  display: block;
}
.audit-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.audit-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.audit-header h1 {
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}
.audit-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.audit-search {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 180px;
}
</style>

<title>Audit Logs | Chelal HMS</title>
