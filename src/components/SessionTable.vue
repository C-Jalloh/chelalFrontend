<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>Session Key</th>
        <th>User</th>
        <th>Expire Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="session in sessions" :key="session.session_key">
        <td>{{ session.session_key }}</td>
        <td>{{ session.user }}</td>
        <td>{{ session.expire_date }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ sessions: any[] }>();
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
