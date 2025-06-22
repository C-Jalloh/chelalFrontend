<template>
  <div>
    <h2>Stock Batches</h2>
    <button @click="openAddBatchModal" class="add-btn">Add Stock Batch</button>
    <StockBatchTable :batches="batches" @edit="editBatch" @delete="deleteBatch" />
    <StockBatchModal v-if="showBatchModal" :existing-batch="batchToEdit" @close="closeBatchModal" @batchCreated="refreshBatches" @batchUpdated="refreshBatches" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchStockBatches, deleteStockBatch } from '../services/stockBatchService';
import StockBatchTable from '../components/StockBatchTable.vue';
import StockBatchModal from '../components/StockBatchModal.vue';
import store from '@/store';
const batches = ref([]);
const showBatchModal = ref(false);
const batchToEdit = ref(undefined as Record<string, any> | undefined);
const token = store.getters.getToken;
const loadBatches = async () => {
  const res = await fetchStockBatches(token);
  batches.value = res.data;
};
const openAddBatchModal = () => {
  batchToEdit.value = undefined;
  showBatchModal.value = true;
};
const editBatch = (batch: any) => {
  batchToEdit.value = batch;
  showBatchModal.value = true;
};
const closeBatchModal = () => {
  showBatchModal.value = false;
  batchToEdit.value = undefined;
};
const refreshBatches = () => {
  loadBatches();
  closeBatchModal();
};
const deleteBatch = async (id: string|number) => {
  await deleteStockBatch(id, token);
  loadBatches();
};
onMounted(loadBatches);
</script>
<style scoped>
.add-btn {
  margin-bottom: 1rem;
  padding: 0.5rem 1.2rem;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}
.add-btn:hover {
  background: var(--teal);
}
</style>
