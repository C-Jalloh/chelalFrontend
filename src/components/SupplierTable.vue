<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="supplier in suppliers" :key="supplier.id">
        <td>{{ supplier.id }}</td>
        <td>{{ supplier.name }}</td>
        <td>
          <button @click="$emit('delete', supplier.id)">Delete</button>
          <button @click="$emit('edit', supplier)">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ suppliers: any[] }>();
defineEmits(['delete', 'edit']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
