<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSurvey, useUpdateStatus } from '../composables/useSurvey';
import { useSubmitResponse } from '../composables/useResponse';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const surveyId = route.params.id as string;


const { data: survey, isLoading, refetch } = useSurvey(surveyId);
const { mutate: updateStatus } = useUpdateStatus();
const { mutate: submitResponse, isPending: isSubmitting } = useSubmitResponse();

const selectedGroup = ref('');
const ratings = ref<Record<string, number>>({});
const submissionSuccess = ref(false);
const currentStep = ref(0);


const toggleStatus = (newStatus: string) => {
    updateStatus({ id: surveyId, status: newStatus }, { onSuccess: () => refetch() });
};

const nextStep = () => {
    if (currentStep.value === 0 && !selectedGroup.value) return;
    if (currentStep.value > 0) {
        const kpi = survey.value?.kpis?.[currentStep.value - 1];
        if (kpi && !ratings.value[kpi.id]) return; 
    }
    currentStep.value++;
};

const prevStep = () => currentStep.value--;

const handleSubmit = () => {
    const responses = Object.entries(ratings.value).map(([id, score]) => ({ kpiId: id, score }));
    submitResponse({ surveyId, groupId: selectedGroup.value, ratings: responses }, {
        onSuccess: () => {
            submissionSuccess.value = true;
            ratings.value = {};
            selectedGroup.value = '';
            currentStep.value = 0;
            refetch();
        }
    });
};

const progress = computed(() => {
    if (!survey.value?.kpis) return 0;
    return (currentStep.value / (survey.value.kpis.length + 1)) * 100;
});
</script>

<template>
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Loading Survey...
    </div>
    
    <div v-else-if="survey && survey.status === 'COMPLETED'" class="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div class="max-w-md bg-white p-12 rounded-3xl shadow-xl border border-slate-100 animate-fade-in">
            <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle class="w-12 h-12" />
            </div>
            <h1 class="text-3xl font-black text-slate-900 mb-4">Survey Closed</h1>
            <p class="text-slate-500 mb-8 leading-relaxed">This survey has been completed and is no longer accepting responses. Thank you for your interest!</p>
            <div class="pt-6 border-t border-slate-50">
                <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Powered by Ecoryx.ai</p>
            </div>
        </div>
    </div>

    <div v-else-if="survey && survey.status === 'ACTIVE'" class="min-h-screen bg-white flex flex-col">
        <div class="h-1 bg-slate-100 w-full fixed top-0 left-0 z-50">
            <div class="h-full bg-primary transition-all duration-500 ease-out" :style="{ width: `${progress}%` }"></div>
        </div>

        <div v-if="submissionSuccess" class="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-slate-50">
            <CheckCircle class="w-20 h-20 text-green-500 mb-6" />
            <h2 class="text-4xl font-bold text-slate-900 mb-4">Thank you!</h2>
            <p class="text-xl text-slate-500 mb-8 max-w-md">Your input is invaluable to our materiality assessment.</p>
            <button @click="submissionSuccess = false" class="text-primary font-bold hover:underline">Submit another response</button>
        </div>

        <div v-else class="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full p-6 md:p-12 relative">
            <button v-if="currentStep > 0" @click="prevStep" class="absolute top-8 left-6 md:left-0 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft class="w-8 h-8" />
            </button>

            <div v-if="currentStep === 0" class="space-y-8 animate-slide-up">
                <div>
                   <span class="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Step 1 of {{ (survey.kpis?.length || 0) + 1 }}</span>
                   <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">Which group best describes you?</h1>
                </div>
                
                <div class="space-y-3">
                    <button 
                        v-for="group in survey.groups" 
                        :key="group.id" 
                        @click="selectedGroup = group.id"
                        class="w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center group"
                        :class="selectedGroup === group.id ? 'border-primary bg-violet-50' : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50'"
                    >
                        <span class="text-lg font-semibold" :class="selectedGroup === group.id ? 'text-primary' : 'text-slate-700'">{{ group.name }}</span>
                        <span class="text-sm font-medium px-3 py-1 rounded-full" :class="selectedGroup === group.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'">{{ group.type }}</span>
                    </button>
                </div>

                <div class="pt-6">
                    <button 
                        @click="nextStep" 
                        :disabled="!selectedGroup"
                        class="bg-slate-900 text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start <ChevronRight class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div v-else class="space-y-12 animate-slide-up">
                <div v-if="survey.kpis && survey.kpis[currentStep - 1]">
                    <span class="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                        Factor {{ currentStep }} of {{ survey.kpis.length }}
                    </span>
                    <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                        {{ survey.kpis[currentStep - 1].name }}
                    </h2>
                    <p class="text-xl text-slate-500 leading-relaxed">
                        {{ survey.kpis[currentStep - 1].description }}
                    </p>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <span>Not Material</span>
                        <span>Critical</span>
                    </div>
                    <div class="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
                        <button 
                            v-for="num in 10" 
                            :key="num"
                            @click="ratings[survey.kpis![currentStep - 1].id] = num"
                            class="aspect-square rounded-xl text-lg font-bold border-2 transition-all flex items-center justify-center transform hover:scale-105 active:scale-95"
                            :class="ratings[survey.kpis![currentStep - 1].id] === num 
                                ? 'bg-primary border-primary text-white shadow-lg shadow-violet-300' 
                                : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'"
                        >
                            {{ num }}
                        </button>
                    </div>
                </div>

                <div class="pt-4 flex gap-4">
                   <button 
                        v-if="currentStep < (survey.kpis?.length || 0)"
                        @click="nextStep" 
                        :disabled="!ratings[survey.kpis![currentStep - 1].id]"
                        class="bg-slate-900 text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    >
                        Next <ChevronRight class="w-6 h-6" />
                    </button>
                    <button 
                        v-else
                        @click="handleSubmit" 
                        :disabled="!ratings[survey.kpis![currentStep - 1].id] || isSubmitting"
                        class="bg-green-600 text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all ml-auto shadow-lg shadow-green-200"
                    >
                        {{ isSubmitting ? 'Submitting...' : 'Finish' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Survey Not Active</h1>
        <p class="text-slate-500 mb-6">This survey is currently in draft mode or has been removed.</p>
        
        <div v-if="survey?.status === 'DRAFT'" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full">
            <h3 class="font-bold text-slate-800 mb-4">Admin Controls</h3>
            <button @click="toggleStatus('ACTIVE')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
                Publish Now
            </button>
        </div>
    </div>
</template>

<style>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
