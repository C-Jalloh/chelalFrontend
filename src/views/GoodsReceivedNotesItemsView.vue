<template>
  <div>
    <h2>Goods Received Note Items</h2>
    <button @click="openCreateModal">Add GRN Item</button>
    <GRNItemTable :items="items" @edit="openEditModal" @delete="confirmDelete" />
    <GRNItemModal
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
import { fetchGRNItems, deleteGRNItem } from '../services/grnItemService';
import GRNItemTable from '../components/GRNItemTable.vue';
import GRNItemModal from '../components/GRNItemModal.vue';
const items = ref([]);
const showModal = ref(false);
const editingItem = ref<any | undefined>(undefined);
const loadItems = async () => {
  const res = await fetchGRNItems();
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
    await deleteGRNItem(item.id);
    loadItems();
  }
};
onMounted(loadItems);
</script>
