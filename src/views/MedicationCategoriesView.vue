<template>
  <div>
    <h2>Medication Categories</h2>
    <button @click="openAddCategoryModal" class="add-btn">Add Category</button>
    <MedicationCategoryTable :categories="categories" @delete="deleteCategory" @edit="editCategory" />
    <MedicationCategoryModal v-if="showCategoryModal" :existing-category="categoryToEdit" @close="closeCategoryModal" @categoryCreated="refreshCategories" @categoryUpdated="refreshCategories" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchMedicationCategories, deleteMedicationCategory as deleteCategoryApi } from '../services/medicationCategoryService';
import MedicationCategoryTable from '../components/MedicationCategoryTable.vue';
import MedicationCategoryModal from '../components/MedicationCategoryModal.vue';

const categories = ref([]);
const showCategoryModal = ref(false);
const categoryToEdit = ref(undefined as Record<string, any> | undefined);

const loadCategories = async () => {
  const res = await fetchMedicationCategories();
  categories.value = res.data;
};

const openAddCategoryModal = () => {
  categoryToEdit.value = undefined;
  showCategoryModal.value = true;
};

const editCategory = (cat: any) => {
  categoryToEdit.value = cat;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  categoryToEdit.value = undefined;
};

const refreshCategories = () => {
  loadCategories();
  closeCategoryModal();
};

const deleteCategory = async (id: string|number) => {
  await deleteCategoryApi(id);
  loadCategories();
};

onMounted(loadCategories);
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
