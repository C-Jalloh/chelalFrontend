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
      <tr v-for="cat in categories" :key="cat.id">
        <td>{{ cat.id }}</td>
        <td>{{ cat.name }}</td>
        <td>
          <button @click="$emit('delete', cat.id)">Delete</button>
          <button @click="$emit('edit', cat)">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
defineProps<{ categories: any[] }>();
defineEmits(['delete', 'edit']);
</script>
<style scoped>
.service-table { width: 100%; border-collapse: collapse; }
.service-table th, .service-table td { border: 1px solid #ccc; padding: 8px; }
</style>
