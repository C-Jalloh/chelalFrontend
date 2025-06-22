<template>
  <div>
    <h2>Purchase Order Items</h2>
    <button @click="openCreateModal">Add Purchase Order Item</button>
    <PurchaseOrderItemTable :items="items" @edit="openEditModal" @delete="confirmDelete" />
    <PurchaseOrderItemModal
      v-if="showModal"
      :existing-item="editingItem"
      @close="closeModal"
      @itemCreated="handleItemCreated"
      @itemUpdated="handleItemUpdated"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchPurchaseOrderItems, deletePurchaseOrderItem } from '../services/purchaseOrderItemService';
import PurchaseOrderItemTable from '../components/PurchaseOrderItemTable.vue';
import PurchaseOrderItemModal from '../components/PurchaseOrderItemModal.vue';
import store from '@/store';
const items = ref([]);
const showModal = ref(false);
const editingItem = ref<any | undefined>(undefined);
const token = store.getters.getToken;
const loadItems = async () => {
  const res = await fetchPurchaseOrderItems(token);
  items.value = res.data;
};
const openCreateModal = () => {
  editingItem.value = undefined;
  showModal.value = true;
};
const openEditModal = (item: any) => {
  editingItem.value = item;
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  editingItem.value = undefined;
};
const handleItemCreated = () => { loadItems(); };
const handleItemUpdated = () => { loadItems(); };
const confirmDelete = async (item: any) => {
  if (confirm('Delete this item?')) {
    await deletePurchaseOrderItem(item.id, token);
    loadItems();
  }
};
onMounted(loadItems);
</script>
