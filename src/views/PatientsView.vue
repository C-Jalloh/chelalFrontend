<template>
  <div class="patients-view-bg">
    <div class="patients-list-container">
      <PatientsList />
    </div>
  </div>
</template>

<script lang="ts">
import PatientsList from '../components/PatientsList.vue';
export default {
  name: 'PatientsView',
  components: { PatientsList },
};
</script>

<style scoped>
.patients-view-bg {
  background: #1e3a5c;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}
.patients-list-container {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
