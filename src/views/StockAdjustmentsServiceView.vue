<template>
  <div>
    <h2>Stock Adjustments</h2>
    <StockAdjustmentTable :adjustments="adjustments" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchStockAdjustments } from '../services/stockAdjustmentService';
import StockAdjustmentTable from '../components/StockAdjustmentTable.vue';
const adjustments = ref([]);
const token = localStorage.getItem('token') || '';
const loadAdjustments = async () => {
  const res = await fetchStockAdjustments(token);
  adjustments.value = res.data;
};
onMounted(loadAdjustments);
</script>
