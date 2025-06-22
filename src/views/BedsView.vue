<template>
  <div class="beds-view-bg">
    <h2>Beds</h2>
    <button @click="openAddBedModal" class="add-btn">Add Bed</button>
    <BedTable :beds="beds" @assign="assignPatient" @discharge="dischargePatient" @edit="editBed" />
    <BedModal v-if="showBedModal" :existing-bed="bedToEdit" @close="closeBedModal" @bedCreated="refreshBeds" @bedUpdated="refreshBeds" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchBeds, assignPatientToBed, dischargePatientFromBed } from '../services/bedService';
import BedTable from '../components/BedTable.vue';
import BedModal from '../components/BedModal.vue';

const beds = ref([]);
const showBedModal = ref(false);
const bedToEdit = ref(undefined as Record<string, any> | undefined);

const loadBeds = async () => {
  const res = await fetchBeds();
  beds.value = res.data;
};

const assignPatient = async (bedId: string|number) => {
  // TODO: Replace 1 with actual patient selection logic
  await assignPatientToBed(bedId, 1);
  loadBeds();
};

const dischargePatient = async (bedId: string|number) => {
  await dischargePatientFromBed(bedId);
  loadBeds();
};

const openAddBedModal = () => {
  bedToEdit.value = undefined;
  showBedModal.value = true;
};

const editBed = (bed: any) => {
  bedToEdit.value = bed;
  showBedModal.value = true;
};

const closeBedModal = () => {
  showBedModal.value = false;
  bedToEdit.value = undefined;
};

const refreshBeds = () => {
  loadBeds();
  closeBedModal();
};

onMounted(loadBeds);
</script>

<style scoped>
.beds-view-bg {
  background: var(--primary-blue);
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 2rem;
  box-sizing: border-box;
}

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
