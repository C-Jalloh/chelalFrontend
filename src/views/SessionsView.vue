<template>
  <div>
    <h2>Active Sessions</h2>
    <SessionTable :sessions="sessions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchSessions } from '../services/sessionService';
import SessionTable from '../components/SessionTable.vue';
import store from '@/store';

const sessions = ref([]);
const token = store.getters.getToken;

const loadSessions = async () => {
  const res = await fetchSessions(token);
  sessions.value = res.data;
};

onMounted(loadSessions);
</script>
