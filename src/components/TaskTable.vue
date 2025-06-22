<template>
  <table class="service-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="task in tasks" :key="task.id">
        <td>{{ task.id }}</td>
        <td>{{ task.title }}</td>
        <td>{{ task.status }}</td>
        <td>
          <button @click="$emit('edit', task)">Edit</button>
          <button @click="$emit('delete', task.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ tasks: any[] }>();
defineEmits(['edit', 'delete']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
