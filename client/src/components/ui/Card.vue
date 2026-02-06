<script setup lang="ts">
defineProps<{
    title?: string;
}>();
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div v-if="title" class="px-6 py-4 border-b border-slate-50">
      <h3 class="font-semibold text-lg text-slate-800">{{ title }}</h3>
    </div>
    <div class="p-6">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <slot name="footer"></slot>
    </div>
  </div>
</template>
