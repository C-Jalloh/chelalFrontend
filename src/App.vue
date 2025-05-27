<script setup lang="ts">
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  const token = store.state.token;
  if (token && !store.state.user) { // If token exists but user is not yet loaded
    store.dispatch('fetchUser', token);
  }
  // Initialize session timeout if needed (already in your store, ensure it's called appropriately)
  // store.dispatch('initializeSessionTimeout'); 
});
</script>

<template>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
