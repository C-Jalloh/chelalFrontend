<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="bed in beds" :key="bed.id">
        <td>{{ bed.id }}</td>
        <td>{{ bed.name }}</td>
        <td>{{ bed.status }}</td>
        <td>
          <button v-if="bed.status === 'available'" @click="$emit('assign', bed.id)">Assign Patient</button>
          <button v-if="bed.status === 'occupied'" @click="$emit('discharge', bed.id)">Discharge</button>
          <button @click="$emit('edit', bed)">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ beds: any[] }>();
defineEmits(['assign', 'discharge', 'edit']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
