<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    status: string;
}>();

const config = computed(() => {
    switch (props.status) {
        case 'ACTIVE': return 'bg-green-100 text-green-700';
        case 'COMPLETED': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-600';
    }
});
</script>

<template>
  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide" :class="config">
    {{ status }}
  </span>
</template>
