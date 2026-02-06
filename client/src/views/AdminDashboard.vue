<script setup lang="ts">
import { ref } from 'vue';
import { useSurveys, useCreateSurvey, useUpdateStatus, useMetadata } from '../composables/useSurvey';
import { useRouter } from 'vue-router';
import Card from '../components/ui/Card.vue';
import StatusBadge from '../components/ui/StatusBadge.vue';
import Modal from '../components/ui/Modal.vue';
import { Plus, FileBarChart, Check, BarChart3, Play, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const { data: surveys, isLoading, refetch } = useSurveys();
const { data: metadata } = useMetadata();
const { mutate: createSurvey, isPending: isCreating } = useCreateSurvey();
const { mutate: updateStatus } = useUpdateStatus();

const isModalOpen = ref(false);
const newTitle = ref('');
const selectedKpis = ref<string[]>([]);
const selectedGroups = ref<string[]>([]);

const showAnalyzeConfirm = ref(false);
const isAnalyzing = ref(false);
const analyzingSurveyId = ref<string | null>(null);

const openModal = () => {
    newTitle.value = '';
    selectedKpis.value = metadata.value?.kpis.map((k: any) => k.id) || [];
    selectedGroups.value = metadata.value?.groups.map((g: any) => g.id) || [];
    isModalOpen.value = true;
};

const handleCreate = () => {
    if (newTitle.value.trim()) {
        createSurvey({
            title: newTitle.value,
            kpis: selectedKpis.value,
            groups: selectedGroups.value
        }, {
            onSuccess: () => {
                isModalOpen.value = false;
            }
        });
    }
}

const goToSurvey = (survey: any) => {
    router.push(`/admin/survey/${survey.id}`);
}

const handleAnalyzeClick = (id: string, e: Event) => {
    e.stopPropagation();
    analyzingSurveyId.value = id;
    showAnalyzeConfirm.value = true;
};

const confirmAnalyze = () => {
    if (!analyzingSurveyId.value) return;
    
    isAnalyzing.value = true;
    showAnalyzeConfirm.value = false;
    
    updateStatus({ id: analyzingSurveyId.value, status: 'COMPLETED' }, {
        onSuccess: () => {
            refetch();
            isAnalyzing.value = false;
            isAnalyzing.value = false;
             router.push(`/admin/survey/${analyzingSurveyId.value}`);
            analyzingSurveyId.value = null;
        },
        onError: () => {
            isAnalyzing.value = false;
            analyzingSurveyId.value = null;
        }
    });
};

const handlePublish = (id: string, e: Event) => {
    e.stopPropagation();
    updateStatus({ id, status: 'ACTIVE' }, {
        onSuccess: () => refetch()
    });
};

</script>

<template>
    <div class="container mx-auto px-6 py-12 max-w-6xl">
        <header class="flex justify-between items-center mb-10">
            <div>
                <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">ESG Materiality</h1>
                <p class="text-slate-500 mt-2 text-lg">Manage your assessments and view analytics.</p>
            </div>
            <button 
                @click="openModal" 
                class="flex items-center gap-2 bg-primary hover:bg-violet-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-violet-200">
                <Plus class="w-5 h-5" />
                <span>New Survey</span>
            </button>
        </header>


        <div v-if="isAnalyzing" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl p-10 shadow-2xl max-w-md text-center">
                <Loader2 class="w-12 h-12 text-violet-600 animate-spin mx-auto mb-6" />
                <h3 class="text-xl font-bold text-slate-900 mb-2">Generating Report</h3>
                <p class="text-slate-500">Analyzing stakeholder responses and creating insights...</p>
                <p class="text-slate-400 text-sm mt-4">This may take a few moments</p>
            </div>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="surveys && surveys.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="survey in surveys" :key="survey.id" class="flex flex-col h-full cursor-pointer group relative hover:-translate-y-1 transition-transform duration-200" @click="goToSurvey(survey)">
                <div class="flex justify-between items-start mb-4">
                    <StatusBadge :status="survey.status" />
                </div>
                
                <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">{{ survey.title }}</h3>
                <p class="text-slate-400 text-sm mb-4">Created {{ new Date(survey.createdAt).toLocaleDateString() }}</p>

                <div class="mt-auto pt-6 flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-500 font-medium">
                        <FileBarChart class="w-4 h-4" />
                        <span>{{ survey._count?.responses || 0 }} Responses</span>
                    </div>

                    <div class="flex gap-2">
                        <button v-if="survey.status === 'DRAFT'" @click="handlePublish(survey.id, $event)" 
                                class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                            <Play class="w-3 h-3" />
                            Publish
                        </button>
                        
                        <button v-if="survey.status === 'ACTIVE'" @click="handleAnalyzeClick(survey.id, $event)" 
                                class="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-violet-100">
                            <BarChart3 class="w-3 h-3" />
                            Analyze & Close
                        </button>

                        <button v-if="survey.status === 'COMPLETED'" class="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <BarChart3 class="w-3 h-3" />
                            View Report
                        </button>
                    </div>
                </div>
            </Card>
        </div>

        <div v-else class="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <h3 class="text-xl font-semibold text-slate-700">No surveys found</h3>
            <p class="text-slate-400 mt-2">Get started by creating your first assessment.</p>
            <button @click="openModal" class="mt-6 text-primary font-bold hover:underline">Create One Now</button>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
            <div class="bg-white rounded-2xl w-full max-w-2xl p-8 relative z-10 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
                <h3 class="text-2xl font-bold text-slate-900 mb-6">Configure New Assessment</h3>
                
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Survey Title</label>
                        <input v-model="newTitle" class="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-lg transition-all" placeholder="e.g. 2024 ESG Materiality Review" autofocus>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Stakeholder Groups</label>
                            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                <div v-for="group in metadata?.groups" :key="group.id" 
                                     @click="selectedGroups.includes(group.id) ? selectedGroups = selectedGroups.filter(id => id !== group.id) : selectedGroups.push(group.id)"
                                     class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all border-transparent hover:bg-slate-50"
                                     :class="selectedGroups.includes(group.id) ? 'bg-violet-50/50 border-violet-100' : 'hover:border-slate-100'">
                                    <div class="w-5 h-5 rounded border flex items-center justify-center transition-colors"
                                         :class="selectedGroups.includes(group.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'">
                                        <Check v-if="selectedGroups.includes(group.id)" class="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <div>
                                        <p class="font-semibold text-slate-800 text-sm">{{ group.name }}</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">{{ group.type }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">ESG KPIs</label>
                            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                <div v-for="kpi in metadata?.kpis" :key="kpi.id" 
                                     @click="selectedKpis.includes(kpi.id) ? selectedKpis = selectedKpis.filter(id => id !== kpi.id) : selectedKpis.push(kpi.id)"
                                     class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all border-transparent hover:bg-slate-50"
                                     :class="selectedKpis.includes(kpi.id) ? 'bg-emerald-50/50 border-emerald-100' : 'hover:border-slate-100'">
                                    <div class="w-5 h-5 rounded border flex items-center justify-center transition-colors"
                                         :class="selectedKpis.includes(kpi.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'">
                                        <Check v-if="selectedKpis.includes(kpi.id)" class="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <p class="font-semibold text-slate-800 text-sm">{{ kpi.name }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-4 justify-end pt-6 border-t border-slate-100">
                        <p class="mr-auto text-sm text-slate-400 flex items-center">
                            {{ selectedGroups.length }} Groups & {{ selectedKpis.length }} KPIs selected
                        </p>
                        <button @click="isModalOpen = false" class="px-6 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-colors">Cancel</button>
                        <button @click="handleCreate" :disabled="!newTitle.trim() || selectedGroups.length === 0 || selectedKpis.length === 0 || isCreating" 
                                class="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:shadow-none">
                            {{ isCreating ? 'Creating...' : 'Initialize' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <Modal :isOpen="showAnalyzeConfirm" title="Close & Analyze" maxWidth="max-w-md" @close="showAnalyzeConfirm = false">
            <p class="text-slate-600 mb-8">
                This will officially close the survey for responses and generate the final materiality report.
            </p>
            <div class="flex justify-end gap-3">
                <button @click="showAnalyzeConfirm = false" class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors">Cancel</button>
                <button @click="confirmAnalyze" class="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-lg shadow-violet-100 transition-all">Generate Report</button>
            </div>
        </Modal>
    </div>
</template>
