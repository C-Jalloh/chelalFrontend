<template>
  <table class="grnitem-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>GRN</th>
        <th>Medication</th>
        <th>Batch No.</th>
        <th>Expiry Date</th>
        <th>Qty Received</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.grn_id }}</td>
        <td>{{ item.medication_name || item.medication_item_id }}</td>
        <td>{{ item.batch_number }}</td>
        <td>{{ item.expiry_date }}</td>
        <td>{{ item.quantity_received }}</td>
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
.grnitem-table { width: 100%; border-collapse: collapse; }
.grnitem-table th, .grnitem-table td { border: 1px solid #ccc; padding: 8px; }
</style>
