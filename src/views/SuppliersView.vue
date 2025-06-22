<template>
  <div>
    <h2>Suppliers</h2>
    <button @click="openAddSupplierModal" class="add-btn">Add Supplier</button>
    <SupplierTable :suppliers="suppliers" @delete="deleteSupplier" @edit="editSupplier" />
    <SupplierModal v-if="showSupplierModal" :existing-supplier="supplierToEdit" @close="closeSupplierModal" @supplierCreated="refreshSuppliers" @supplierUpdated="refreshSuppliers" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchSuppliers, deleteSupplier as deleteSupplierApi } from '../services/supplierService';
import SupplierTable from '../components/SupplierTable.vue';
import SupplierModal from '../components/SupplierModal.vue';
import store from '@/store';

const suppliers = ref([]);
const showSupplierModal = ref(false);
const supplierToEdit = ref(undefined as Record<string, any> | undefined);
const token = store.getters.getToken;

const loadSuppliers = async () => {
  const res = await fetchSuppliers(token);
  suppliers.value = res.data;
};

const openAddSupplierModal = () => {
  supplierToEdit.value = undefined;
  showSupplierModal.value = true;
};

const editSupplier = (supplier: any) => {
  supplierToEdit.value = supplier;
  showSupplierModal.value = true;
};

const closeSupplierModal = () => {
  showSupplierModal.value = false;
  supplierToEdit.value = undefined;
};

const refreshSuppliers = () => {
  loadSuppliers();
  closeSupplierModal();
};

const deleteSupplier = async (id: string|number) => {
  await deleteSupplierApi(id, token);
  loadSuppliers();
};

onMounted(loadSuppliers);
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
