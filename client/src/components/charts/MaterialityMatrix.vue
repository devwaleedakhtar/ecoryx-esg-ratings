<script setup lang="ts">
import { computed } from 'vue';
import { Scatter } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LinearScale } from 'chart.js';
import type { KPIPoint } from '../../composables/useReport';

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

const props = defineProps<{
    data: KPIPoint[];
}>();

const chartData = computed(() => {
    return {
        datasets: [{
            label: 'ESG KPIs',
            data: props.data.map(k => ({ x: k.internalAvg, y: k.externalAvg, kpi: k.name })),
            backgroundColor: '#7c3aed',
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    }
});

const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            title: { display: true, text: 'Importance to Internal Stakeholders →', font: { weight: 'bold' as const, size: 12 } },
            min: 0,
            max: 10,
            grid: { 
                color: (context: any) => context.tick.value === 5 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                lineWidth: (context: any) => context.tick.value === 5 ? 2 : 1
            },
            ticks: { stepSize: 1 }
        },
        y: {
            title: { display: true, text: 'Importance to External Stakeholders ↑', font: { weight: 'bold' as const, size: 12 } },
            min: 0,
            max: 10,
            grid: { 
                color: (context: any) => context.tick.value === 5 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                lineWidth: (context: any) => context.tick.value === 5 ? 2 : 1
            },
            ticks: { stepSize: 1 }
        }
    },
    plugins: {
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: (context: any) => {
                    const point = context.raw;
                    return ` ${point.kpi}: [Int: ${point.x}, Ext: ${point.y}]`; 
                }
            }
        },
        legend: { display: false }
    }
};
</script>

<template>
  <div class="h-[400px] w-full">
    <Scatter :data="chartData" :options="options" />
  </div>
</template>
