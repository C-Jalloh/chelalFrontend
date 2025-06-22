<template>
  <div class="dashboard-view bg-primary min-h-screen p-0">
    <div class="dashboard-content-wrapper">
      <!-- Top row: Statistics Cards -->
      <div class="dashboard-row dashboard-stats-row">
        <DashboardCard>
          <template #value>{{ stats?.totalPatients ?? '--' }}</template>
          <template #label>Total Patients</template>
        </DashboardCard>
        <DashboardCard>
          <template #value>{{ stats?.totalRevenue ? (stats.totalRevenue | currency) : '--' }}</template>
          <template #label>Total Revenue</template>
        </DashboardCard>
        <DashboardCard>
          <template #value>{{ stats?.newPatientsThisMonth ?? '--' }}</template>
          <template #label>New Patients (This Month)</template>
        </DashboardCard>
      </div>

      <!-- Quick Actions Section -->
      <div class="dashboard-row dashboard-quick-actions-row">
        <QuickLinksWidget />
      </div>

      <!-- Activity Widgets -->
      <div class="dashboard-row dashboard-activity-row">
        <RecentPatientsWidget />
        <UpcomingAppointmentsWidget />
        <RecentBillingWidget />
        <RecentAuditLogsWidget />
      </div>

      <!-- Alerts Section -->
      <div class="dashboard-row dashboard-alerts-row">
        <AlertsWidget />
      </div>

      <!-- Role Change Request Section (Admin only, and only if no pending/approved request) -->
      <div v-if="userRole === 'Admin' && !hideRoleChangeForm" class="dashboard-row dashboard-rolechange-row">
        <div class="dashboard-rolechange-col">
          <div class="role-change-card standardized-card">
            <div class="role-change-title">Role Change Request</div>
            <div class="role-change-form-group">
              <label class="role-change-label">Select Role</label>
              <select v-model="selectedRoleId" class="role-change-select">
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
            <div class="role-change-form-group">
              <label class="role-change-label">Reason for Change</label>
              <textarea v-model="requestReason" class="role-change-textarea"></textarea>
            </div>
            <div class="role-change-actions">
              <button @click="submitRoleChangeRequest" class="role-change-btn">
                Submit Request
              </button>
              <div v-if="requestSuccess" class="role-change-success">
                {{ requestSuccess }}
              </div>
              <div v-if="requestError" class="role-change-error">
                {{ requestError }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Role Change Requests Table -->
      <div class="dashboard-row dashboard-rolechangetable-row">
        <div class="dashboard-rolechangetable-col">
          <div class="role-change-requests-title">My Role Change Requests</div>
          <div class="role-change-requests-table standardized-card">
            <BaseTable
              :columns="roleChangeColumns"
              :data="userRoleChangeRequests"
              :idKey="'id'"
            />
          </div>
        </div>
      </div>

      <!-- Login Details Section -->
      <div class="dashboard-row dashboard-logindetails-row">
        <div class="dashboard-logindetails-col">
          <div class="login-details-title">Login Details</div>
          <BaseTable
            :columns="loginDetailsColumns"
            :data="loginDetailsData"
            :idKey="'id'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { fetchRoles } from '@/services/roleService';
import { fetchRoleChangeRequests, createRoleChangeRequest, approveRoleChangeRequest, rejectRoleChangeRequest } from '@/services/roleChangeRequestService';
import { fetchDashboardStats, type DashboardStats } from '@/services/dashboardService';
import type { Role } from '@/services/roleService';
import type { RoleChangeRequest } from '@/services/roleChangeRequestService';
import DashboardCard from '@/components/DashboardCard.vue';
import RecentPatientsWidget from '@/components/RecentPatientsWidget.vue';
import QuickLinksWidget from '@/components/QuickLinksWidget.vue';
import AlertsWidget from '@/components/AlertsWidget.vue';
import UpcomingAppointmentsWidget from '@/components/UpcomingAppointmentsWidget.vue';
import RecentBillingWidget from '@/components/RecentBillingWidget.vue';
import RecentAuditLogsWidget from '@/components/RecentAuditLogsWidget.vue';
import BaseTable from '@/components/BaseTable.vue';

const sidebarOpen = ref(false);
const store = useStore();
const token = computed(() => store.state.token);
const user = computed(() => store.state.user);
const userRole = computed(() => user.value?.role?.name || null);

// Role change request state
const roles = ref<Role[]>([]);
const roleChangeRequests = ref<RoleChangeRequest[]>([]);
const requestReason = ref('');
const selectedRoleId = ref<number | null>(null);
const requestError = ref('');
const requestSuccess = ref('');
const loadingRequests = ref(false);

// Statistics state
const stats = ref<DashboardStats | null>(null);
const statsLoading = ref(false);

// Table columns for role change requests
const roleChangeColumns = [
  { key: 'role', label: 'Role', render: (row: any) => row.role?.name },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Requested At', render: (row: any) => new Date(row.created_at).toLocaleString() },
];

// Table columns and data for login details (example, replace with real data)
const loginDetailsColumns = [
  { key: 'ip', label: 'IP Address' },
  { key: 'device', label: 'Device' },
  { key: 'location', label: 'Location' },
  { key: 'login_time', label: 'Login Time' },
];
const loginDetailsData = ref([
  { id: 1, ip: '192.168.1.1', device: 'Chrome on Linux', location: 'Lagos, NG', login_time: '2025-06-18 09:00' },
  { id: 2, ip: '192.168.1.2', device: 'Firefox on Windows', location: 'Abuja, NG', login_time: '2025-06-17 18:30' },
]);

const isAdmin = computed(() => userRole.value === 'Admin');

const loadRoles = async () => {
  if (!token.value) return;
  roles.value = await fetchRoles(token.value);
};

const loadRoleChangeRequests = async () => {
  if (!token.value) return;
  loadingRequests.value = true;
  try {
    roleChangeRequests.value = await fetchRoleChangeRequests(token.value);
  } finally {
    loadingRequests.value = false;
  }
};

const loadDashboardStats = async () => {
  if (!token.value) return;
  statsLoading.value = true;
  try {
    stats.value = await fetchDashboardStats(token.value);
  } finally {
    statsLoading.value = false;
  }
};

const submitRoleChangeRequest = async () => {
  if (!selectedRoleId.value || !requestReason.value) {
    requestError.value = 'Please select a role and provide a reason.';
    return;
  }
  try {
    await createRoleChangeRequest(selectedRoleId.value, requestReason.value, token.value);
    requestSuccess.value = 'Request submitted!';
    requestError.value = '';
    requestReason.value = '';
    selectedRoleId.value = null;
    await loadRoleChangeRequests();
  } catch (e: any) {
    requestError.value = e.message || 'Failed to submit request.';
  }
};

const handleApprove = async (id: number) => {
  await approveRoleChangeRequest(id, '', token.value);
  await loadRoleChangeRequests();
};
const handleReject = async (id: number) => {
  await rejectRoleChangeRequest(id, '', token.value);
  await loadRoleChangeRequests();
};

const userRoleChangeRequests = computed(() =>
  roleChangeRequests.value.filter(r => r.user?.id === user.value?.id)
);
const latestUserRoleChangeRequest = computed(() => {
  if (!userRoleChangeRequests.value.length) return null;
  // Sort by created_at descending
  return [...userRoleChangeRequests.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
});
const hideRoleChangeForm = computed(() => {
  const req = latestUserRoleChangeRequest.value;
  // Hide if approved or pending
  return req && (req.status === 'approved' || req.status === 'pending');
});

onMounted(() => {
  loadRoles();
  loadRoleChangeRequests();
  loadDashboardStats();
});
</script>

<style scoped>
.bg-primary {
  background-color: #f5f6fa;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.dashboard-content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
  justify-content: center;
  align-items: stretch;
}
.dashboard-stats-row > * {
  flex: 1 1 320px;
  min-width: 260px;
  max-width: 420px;
}
.dashboard-quick-actions-row {
  justify-content: center;
  width: 100%;
  display: flex;
}
.dashboard-activity-row > * {
  flex: 1 1 220px;
  min-width: 220px;
  max-width: 320px;
}
.dashboard-rolechange-row {
  justify-content: flex-start;
}
.dashboard-rolechange-col {
  flex: 1 1 420px;
  min-width: 320px;
  max-width: 520px;
}
.dashboard-rolechangetable-row {
  justify-content: flex-start;
}
.dashboard-rolechangetable-col {
  flex: 1 1 720px;
  min-width: 320px;
  max-width: 900px;
}
.standardized-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
  padding: 2rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.role-change-title {
  color: #2563eb;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  text-align: left;
}
.role-change-form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}
.role-change-label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #1e3a8a;
}
.role-change-select,
.role-change-textarea {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  background: #f9fafb;
  color: #222;
  transition: border 0.18s;
}
.role-change-select:focus,
.role-change-textarea:focus {
  border-color: #2563eb;
  outline: none;
}
.role-change-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.role-change-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.role-change-btn:hover {
  background: #1746a2;
}
.role-change-success {
  color: #10b981;
  font-weight: 500;
}
.role-change-error {
  color: #ef4444;
  font-weight: 500;
}
.dashboard-section-separator {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2.5rem 0 2.5rem 0;
  width: 100%;
}
</style>
