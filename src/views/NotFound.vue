<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for a simple Not Found page
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 100px;
}
h1 {
  font-size: 2.5rem;
  color: #e74c3c;
}
p {
  margin: 20px 0;
  color: #555;
}
</style>
