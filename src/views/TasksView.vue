<template>
  <div>
    <h2>Tasks</h2>
    <TaskTable :tasks="tasks" @edit="openEditModal" @delete="deleteTask" />
    <button @click="openCreateModal">Create Task</button>
    <TaskModal :show="showModal" :task="selectedTask" :isEdit="isEdit" @save="saveTask" @close="closeModal" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchTasks, createTask, updateTask, deleteTask as deleteTaskApi } from '../services/taskService';
import TaskTable from '../components/TaskTable.vue';
import TaskModal from '../components/TaskModal.vue';
import store from '@/store';

const tasks = ref([]);
const showModal = ref(false);
const selectedTask = ref(null);
const isEdit = ref(false);
const token = store.getters.getToken;

const loadTasks = async () => {
  const res = await fetchTasks(token);
  tasks.value = res.data;
};

const openCreateModal = () => {
  selectedTask.value = null;
  isEdit.value = false;
  showModal.value = true;
};

const openEditModal = (task: any) => {
  selectedTask.value = task;
  isEdit.value = true;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveTask = async (task: any) => {
  if (isEdit.value && task.id) await updateTask(task.id, task, token);
  else await createTask(task, token);
  showModal.value = false;
  loadTasks();
};

const deleteTask = async (id: string|number) => {
  await deleteTaskApi(id, token);
  loadTasks();
};

onMounted(loadTasks);
</script>
