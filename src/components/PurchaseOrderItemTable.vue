<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Quantity</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.quantity }}</td>
        <td>
          <button @click="$emit('edit', item)">Edit</button>
          <button @click="$emit('delete', item)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ items: any[] }>();
defineEmits(['edit', 'delete']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
