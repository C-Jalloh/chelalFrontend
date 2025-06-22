<template>
  <table class="service-catalog-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Description</th>
        <th>Price</th>
        <th>Active</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="service in services" :key="service.id">
        <td>{{ service.id }}</td>
        <td>{{ service.name }}</td>
        <td>{{ service.description }}</td>
        <td>{{ service.price }}</td>
        <td>{{ service.is_active ? 'Yes' : 'No' }}</td>
        <td>
          <button @click="$emit('edit', service)">Edit</button>
          <button @click="$emit('delete', service)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ services: any[] }>();
defineEmits(['edit', 'delete']);
</script>
<style scoped>
.service-catalog-table { width: 100%; border-collapse: collapse; }
.service-catalog-table th, .service-catalog-table td { border: 1px solid #ccc; padding: 8px; }
</style>
