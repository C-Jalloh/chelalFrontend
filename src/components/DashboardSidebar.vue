<template>
  <aside class="dashboard-sidebar">
    <nav>
      <ul>
        <li><router-link to="/app/dashboard">Dashboard Home</router-link></li>
        <li><router-link to="/app/dashboard/activity">Activity</router-link></li>
        <li><router-link to="/app/dashboard/quick-actions">Quick Actions</router-link></li>
        <li><router-link to="/app/dashboard/role-requests">Role Requests</router-link></li>
        <li><router-link to="/app/dashboard/login-details">Login Details</router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
// No logic for now, just a static sidebar for dashboard
</script>

<style scoped>
.dashboard-sidebar {
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  min-width: 220px;
  max-width: 260px;
  height: 100vh;
  padding: 2rem 1rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.dashboard-sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.dashboard-sidebar nav ul li a {
  color: #1e3a8a;
  font-weight: 500;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.15s;
}
.dashboard-sidebar nav ul li a.router-link-exact-active {
  color: #2563eb;
  font-weight: 700;
}
.dashboard-sidebar nav ul li a:hover {
  color: #1746a2;
}
</style>
