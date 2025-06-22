<template>
  <div class="register-view bg-primary min-h-screen flex flex-col items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-10 flex flex-col items-center">
      <h1 class="text-2xl font-bold mb-4 text-primary">Register</h1>
      <p class="mb-6 text-gray-600">Create your account</p>
      <form class="w-64 flex flex-col gap-4" @submit="handleRegister">
        <input v-model="fullName" type="text" placeholder="Full Name" class="border rounded px-3 py-2" required />
        <input v-model="email" type="email" placeholder="Email" class="border rounded px-3 py-2" required />
        <input v-model="password" type="password" placeholder="Password" class="border rounded px-3 py-2" required />
        <button :disabled="loading" type="submit" class="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <div v-if="errorMessage" class="text-red-600 mt-2">{{ errorMessage }}</div>
      <div v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</div>
      <router-link to="/login" class="mt-4 text-primary hover:underline">Already have an account? Login</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/registrationService';

const fullName = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const router = useRouter();

const handleRegister = async (e: Event) => {
  e.preventDefault();
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;
  try {
    const [first_name, ...lastArr] = fullName.value.split(' ');
    const last_name = lastArr.join(' ');
    await registerUser({
      username: email.value,
      email: email.value,
      password: password.value,
      first_name,
      last_name,
    });
    successMessage.value = 'Registration successful! Please log in.';
    setTimeout(() => router.push('/login'), 1500);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.detail || err.response?.data || 'Registration failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.bg-primary {
  background-color: #2563eb;
}
.text-primary {
  color: #2563eb;
}
</style>
