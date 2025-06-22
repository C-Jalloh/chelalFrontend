<template>
  <div class="profile-view max-w-xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6 text-primary">My Profile</h1>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="profile">
      <div class="mb-4">
        <span class="font-semibold">Username:</span> {{ profile.username }}
      </div>
      <div class="mb-4">
        <span class="font-semibold">Email:</span> {{ profile.email }}
      </div>
      <div class="mb-4">
        <span class="font-semibold">First Name:</span> {{ profile.first_name || '-' }}
      </div>
      <div class="mb-4">
        <span class="font-semibold">Last Name:</span> {{ profile.last_name || '-' }}
      </div>
      <div class="mb-4">
        <span class="font-semibold">Role:</span> {{ profile.role?.name || '-' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();
const token = computed(() => store.state.token);
const profile = ref<any>(null);
const loading = ref(false);
const error = ref('');

const fetchProfile = async () => {
  if (!token.value) return;
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get('/api/profile/', {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    profile.value = response.data;
  } catch (e: any) {
    error.value = e.message || 'Failed to load profile.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProfile);
</script>

<style scoped>
.profile-view {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 6px 24px rgba(37,99,235,0.10), 0 1.5px 6px rgba(30,58,92,0.10);
  padding: 2.5rem 2rem;
}
.text-primary {
  color: #2563eb;
}
</style>
