<template>
  <div class="patients-view-bg">
    <PatientsList />
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
  background: #eaf4fb; /* blueish white */
  color: #111;
  min-height: 100vh;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
}
</style>
