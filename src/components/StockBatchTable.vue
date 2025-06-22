<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Batch Number</th>
        <th>Quantity</th>
        <th>Expiry Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="batch in batches" :key="batch.id">
        <td>{{ batch.id }}</td>
        <td>{{ batch.batch_number }}</td>
        <td>{{ batch.quantity }}</td>
        <td>{{ batch.expiry_date }}</td>
        <td>
          <button @click="$emit('edit', batch)">Edit</button>
          <button @click="$emit('delete', batch.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ batches: any[] }>();
defineEmits(['edit', 'delete']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
