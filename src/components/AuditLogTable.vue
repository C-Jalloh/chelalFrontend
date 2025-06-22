<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>User</th>
        <th>Action</th>
        <th>Description</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="log in logs" :key="log.id">
        <td>{{ log.id }}</td>
        <td>{{ log.user }}</td>
        <td>{{ log.action }}</td>
        <td>{{ log.description }}</td>
        <td>{{ log.timestamp }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ logs: any[] }>();
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
