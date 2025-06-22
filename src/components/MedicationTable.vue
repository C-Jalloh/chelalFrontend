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
      <tr v-for="med in medications" :key="med.id">
        <td>{{ med.id }}</td>
        <td>{{ med.name }}</td>
        <td>
          <button @click="$emit('delete', med.id)">Delete</button>
          <button @click="$emit('edit', med)">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ medications: any[] }>();
defineEmits(['delete', 'edit']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
