<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: {
    groupName: string;
    averages: Record<string, number>;
  }[];
}>();

const chartData = computed(() => {
  if (!props.data || props.data.length === 0 || !props.data[0]?.averages) {
    return { labels: [], datasets: [] };
  }

  const labels = Object.keys(props.data[0].averages);
  
  const colors = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(14, 165, 233, 0.8)'
  ];

  return {
    labels,
    datasets: props.data.map((group, idx) => ({
      label: group.groupName,
      data: labels.map(label => group.averages[label] ?? 0),
      backgroundColor: colors[idx % colors.length]
    }))
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      displayColors: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 10,
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};
</script>

<template>
  <div class="h-[400px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
