<template>
  <div class="coming-soon">
    <h1>🚧 Coming Soon 🚧</h1>
    <p>This feature is under development and will be available in a future update.</p>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for a simple Coming Soon page
</script>

<style scoped>
.coming-soon {
  text-align: center;
  margin-top: 100px;
}
h1 {
  font-size: 2.5rem;
  color: #f59e42;
}
p {
  margin: 20px 0;
  color: #555;
}
</style>
