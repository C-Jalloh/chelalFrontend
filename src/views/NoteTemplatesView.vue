<template>
  <div>
    <h2>Note Templates</h2>
    <ul>
      <li v-for="note in noteTemplates" :key="note.id">
        {{ note.title }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchNoteTemplates } from '../services/noteTemplateService';
const noteTemplates = ref([]);
const token = localStorage.getItem('token') || '';
const loadNoteTemplates = async () => {
  const res = await fetchNoteTemplates(token);
  noteTemplates.value = res.data;
};
onMounted(loadNoteTemplates);
</script>
