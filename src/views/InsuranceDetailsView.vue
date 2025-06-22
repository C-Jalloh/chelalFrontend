<template>
  <div>
    <h2>Insurance Details</h2>
    <ul>
      <li v-for="ins in insuranceDetails" :key="ins.id">
        {{ ins.provider_name }} - {{ ins.policy_number }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchInsuranceDetails } from '../services/insuranceService';
const insuranceDetails = ref([]);
const loadInsuranceDetails = async () => {
  const res = await fetchInsuranceDetails();
  insuranceDetails.value = res.data;
};
onMounted(loadInsuranceDetails);
</script>
