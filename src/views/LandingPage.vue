<template>
  <div class="landing-page bg-primary min-h-screen flex flex-col items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-10 flex flex-col items-center">
      <img src="/vite.svg" alt="Chelal HMS Logo" class="w-20 h-20 mb-4" />
      <h1 class="text-3xl font-bold mb-4 text-primary">Welcome to Chelal HMS</h1>
      <p class="mb-8 text-gray-600">Modern Hospital Management System</p>
      <div class="flex gap-4">
        <router-link to="/login">
          <button class="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700 font-semibold">Login</button>
        </router-link>
        <router-link to="/register">
          <button class="px-6 py-2 bg-white text-primary border border-primary rounded hover:bg-primary hover:text-white font-semibold">Register</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple landing page with Login and Register buttons
</script>

<style scoped>
.bg-primary {
  background-color: #2563eb;
}
.text-primary {
  color: #2563eb;
}
.border-primary {
  border-color: #2563eb;
}
</style>
