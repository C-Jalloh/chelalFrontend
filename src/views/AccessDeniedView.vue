<template>
  <div class="access-denied-view">
    <h1>Access Denied</h1>
    <p>You do not have permission to view this page.</p>
    <router-link to="/">Go to Dashboard</router-link>
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
.access-denied-view {
  text-align: center;
  margin-top: 100px;
}
h1 {
  font-size: 2.2rem;
  color: #e53e3e;
}
p {
  margin: 20px 0;
  color: #555;
}
</style>
