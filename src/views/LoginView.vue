<template>
  <div class="login-container">
    <div class="login-topbar">
      <span>Chelal HMS</span>
    </div>
    <form @submit.prevent="handleLogin" class="login-form">
      <h1>Login</h1>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required placeholder="Enter your password" />
      </div>

      <div v-if="show2FA" class="form-group">
        <label for="otp">One-Time Password (OTP)</label>
        <input type="text" id="otp" v-model="otp" required placeholder="Enter the OTP sent to your email" />
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <button type="submit" class="login-button">Login</button>

      <p class="dummy-credentials">Use dummy account: test@example.com / password123</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const otp = ref('');
    const show2FA = ref(false);
    const errorMessage = ref('');
    const router = useRouter();

    // Dummy account credentials for testing
    const DUMMY_EMAIL = 'test@example.com';
    const DUMMY_PASSWORD = 'password123';

    const handleLogin = async () => {
      errorMessage.value = ''; // Clear previous errors

      // Always use dummy account for now
      if (email.value === DUMMY_EMAIL && password.value === DUMMY_PASSWORD) {
        const dummyToken = 'dummy-test-token';
        store.commit('setToken', dummyToken);
        store.commit('setUser', { name: 'Test User', role: 'admin' });

        router.push('/patients');
        console.log('*** login successfull ***')

        console.log('*** redirecting to patients view ***')
      } else {
        errorMessage.value = 'Invalid dummy credentials';
      }
    };

    return {
      email,
      password,
      otp,
      show2FA,
      errorMessage,
      handleLogin,
    };
  },
});
</script>

<style scoped>
.login-topbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--white);
  color: var(--primary-blue);
  padding: 1rem 2rem;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  /* Use flexbox */
  align-items: center;
  /* Vertically align items */
}

.login-topbar span {
  font-size: 2.4rem;
  /* Increased font size by a factor of 2 */
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--primary-blue);
  color: var(--white);
  padding-top: 60px;
  /* Add padding to prevent content from being hidden behind the topbar */
}

.login-form {
  background: var(--white);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  margin-bottom: 1.5rem;
  color: var(--primary-blue);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-blue);
  color: var(--white);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.login-button:hover {
  background-color: var(--teal);
}

.dummy-credentials {
  text-align: center;
  margin-top: 1rem;
  color: var(--primary-blue);
  font-size: 0.9rem;
}
</style>
