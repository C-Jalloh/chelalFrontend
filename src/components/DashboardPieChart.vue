<template>
  <div class="pie-chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { ref, watchEffect } from 'vue';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps<{
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
}>();

const chartData = ref({
  labels: props.labels,
  datasets: [
    {
      data: props.values,
      backgroundColor: props.colors || [
        '#2563eb', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'
      ],
      borderWidth: 1,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: props.title ? { display: true, text: props.title } : undefined,
  },
});

watchEffect(() => {
  chartData.value.labels = props.labels;
  chartData.value.datasets[0].data = props.values;
  if (props.colors) chartData.value.datasets[0].backgroundColor = props.colors;
  chartOptions.value.plugins.title = props.title ? { display: true, text: props.title } : undefined;
});
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(37,99,235,0.10);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
