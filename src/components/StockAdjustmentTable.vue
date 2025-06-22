<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Quantity</th>
        <th>Reason</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="adj in adjustments" :key="adj.id">
        <td>{{ adj.id }}</td>
        <td>{{ adj.adjustment_type }}</td>
        <td>{{ adj.quantity }}</td>
        <td>{{ adj.reason }}</td>
        <td>{{ adj.date }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ adjustments: any[] }>();
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
