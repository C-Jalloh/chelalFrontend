<template>
  <div class="standardized-card quick-links-wide">
    <h3 class="card-title">Quick Links</h3>
    <div class="quick-links-row">
      <router-link to="/app/patients" class="quick-link">Add Patient</router-link>
      <router-link to="/app/appointments" class="quick-link">New Appointment</router-link>
      <router-link to="/app/billing" class="quick-link">Billing</router-link>
      <router-link to="/app/pharmacy" class="quick-link">Pharmacy</router-link>
      <router-link to="/app/encounters" class="quick-link">Add Encounter</router-link>
      <router-link to="/app/prescriptions" class="quick-link">Add Prescription</router-link>
      <router-link to="/app/notifications" class="quick-link">Notifications</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed
</script>

<style scoped>
.standardized-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
  padding: 2rem 1.5rem;
  min-width: 180px;
  min-height: 100px;
  max-height: 160px;
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.quick-links-wide {
  min-width: 1000px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
.quick-links-row {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  margin-top: 0.5rem;
}
.card-title {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}
.quick-link {
  background: #2563eb11;
  color: #2563eb;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: box-shadow 0.22s cubic-bezier(.4,2,.6,1), transform 0.18s cubic-bezier(.4,2,.6,1), background 0.15s;
  white-space: nowrap;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(37,99,235,0.08), 0 1.5px 6px rgba(30,58,92,0.10);
}
.quick-link:hover, .quick-link:focus, .quick-link:active {
  background: #2563eb22;
  box-shadow: 0 12px 32px rgba(37,99,235,0.18), 0 4px 16px rgba(30,58,92,0.13);
  transform: translateY(-2px) scale(1.025);
  z-index: 2;
}
</style>
