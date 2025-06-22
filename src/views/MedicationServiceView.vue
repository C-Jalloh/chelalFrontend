<template>
  <div>
    <h2>Medications</h2>
    <button @click="openAddMedicationModal" class="add-btn">Add Medication</button>
    <MedicationTable :medications="medications" @delete="deleteMedication" @edit="editMedication" />
    <MedicationModal v-if="showMedicationModal" :existing-medication="medicationToEdit" @close="closeMedicationModal" @medicationCreated="refreshMedications" @medicationUpdated="refreshMedications" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchMedications, deleteMedication as deleteMedicationApi } from '../services/medicationService';
import MedicationTable from '../components/MedicationTable.vue';
import MedicationModal from '../components/MedicationModal.vue';
const medications = ref([]);
const showMedicationModal = ref(false);
const medicationToEdit = ref(undefined as Record<string, any> | undefined);
const loadMedications = async () => {
  const res = await fetchMedications();
  medications.value = res.data;
};
const openAddMedicationModal = () => {
  medicationToEdit.value = undefined;
  showMedicationModal.value = true;
};
const editMedication = (med: any) => {
  medicationToEdit.value = med;
  showMedicationModal.value = true;
};
const closeMedicationModal = () => {
  showMedicationModal.value = false;
  medicationToEdit.value = undefined;
};
const refreshMedications = () => {
  loadMedications();
  closeMedicationModal();
};
const deleteMedication = async (id: string|number) => {
  await deleteMedicationApi(id);
  loadMedications();
};
onMounted(loadMedications);
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
