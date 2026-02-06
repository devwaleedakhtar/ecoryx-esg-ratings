<script setup lang="ts">


defineProps<{
    isOpen: boolean;
    title: string;
    maxWidth?: string;
}>();

const emit = defineEmits(['close']);
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>
        <div 
            class="bg-white rounded-2xl w-full relative z-10 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]"
            :class="maxWidth || 'max-w-2xl'"
        >
            <div class="p-8">
                <h3 class="text-2xl font-bold text-slate-900 mb-6">{{ title }}</h3>
                <slot></slot>
            </div>
        </div>
    </div>
</template>
