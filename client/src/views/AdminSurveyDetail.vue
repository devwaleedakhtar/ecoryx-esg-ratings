<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSurvey, useUpdateStatus } from '../composables/useSurvey';
import StatusBadge from '../components/ui/StatusBadge.vue';
import Modal from '../components/ui/Modal.vue';
import { 
    ArrowLeft, 
    Copy, 
    Play, 
    BarChart3, 
    Users, 
    Target,
    Calendar,
    FileText,
    Check,
    Loader2
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const surveyId = (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) as string;

const { data: survey, isLoading, refetch } = useSurvey(surveyId);
const { mutate: updateStatus } = useUpdateStatus();

const isCopied = ref(false);
const showPublishConfirm = ref(false);
const showAnalyzeConfirm = ref(false);
const isAnalyzing = ref(false);

const handleAnalyze = () => {
    isAnalyzing.value = true;
    showAnalyzeConfirm.value = false;
    updateStatus({ id: surveyId, status: 'COMPLETED' }, {
        onSuccess: () => {
            refetch();
            isAnalyzing.value = false;
        },
        onError: () => {
            isAnalyzing.value = false;
        }
    });
};

const handlePublish = () => {
    updateStatus({ id: surveyId, status: 'ACTIVE' }, {
        onSuccess: () => {
            refetch();
            showPublishConfirm.value = false;
        }
    });
};

const copyLink = () => {
    const url = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(url);
    isCopied.value = true;
    setTimeout(() => isCopied.value = false, 2000);
};

const goToReport = () => {
    router.push(`/admin/survey/${surveyId}/report`);
};
</script>

<template>
    <div class="container">
        <button @click="router.push('/admin')" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-8 transition-colors">
            <ArrowLeft class="w-4 h-4" />
            Back to Dashboard
        </button>

        <div v-if="isLoading" class="animate-pulse space-y-8">
            <div class="h-8 bg-slate-200 rounded w-1/3"></div>
            <div class="h-64 bg-slate-100 rounded-xl"></div>
        </div>


        <div v-if="isAnalyzing" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl p-10 shadow-2xl max-w-md text-center">
                <Loader2 class="w-12 h-12 text-violet-600 animate-spin mx-auto mb-6" />
                <h3 class="text-xl font-bold text-slate-900 mb-2">Generating AI Report</h3>
                <p class="text-slate-500">Analyzing stakeholder responses and creating insights...</p>
                <p class="text-slate-400 text-sm mt-4">This may take a few moments</p>
            </div>
        </div>

        <div v-if="!isLoading && survey" class="space-y-8">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <StatusBadge :status="survey.status" />
                        <span class="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                            <Calendar class="w-3.5 h-3.5" />
                            Created {{ new Date(survey.createdAt).toLocaleDateString() }}
                        </span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">{{ survey.title }}</h1>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <button v-if="survey.status !== 'DRAFT'" @click="copyLink" class="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm">
                        <Check v-if="isCopied" class="w-4 h-4 text-emerald-500" />
                        <Copy v-else class="w-4 h-4" />
                        {{ isCopied ? 'Copied!' : 'Share Link' }}
                    </button>

                    <button v-if="survey.status === 'DRAFT'" @click="showPublishConfirm = true" 
                            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100">
                        <Play class="w-4 h-4" />
                        Publish Survey
                    </button>
                    
                    <button v-if="isAnalyzing" disabled
                            class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-bold flex items-center gap-2 opacity-80 cursor-wait">
                        <Loader2 class="w-4 h-4 animate-spin" />
                        Generating Report...
                    </button>

                    <button v-else-if="survey.status === 'ACTIVE'" @click="showAnalyzeConfirm = true" 
                            class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-violet-100">
                        <BarChart3 class="w-4 h-4" />
                        Analyze & Close
                    </button>

                    <button v-else-if="survey.status === 'COMPLETED'" @click="goToReport" 
                            class="px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg font-bold flex items-center gap-2 transition-all">
                        <FileText class="w-4 h-4" />
                        View Full Report
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3 text-slate-500 mb-2">
                        <Users class="w-5 h-5" />
                        <span class="font-semibold text-sm uppercase tracking-wider">Stakeholders</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">{{ survey.groups?.length || 0 }}</p>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3 text-slate-500 mb-2">
                        <Target class="w-5 h-5" />
                        <span class="font-semibold text-sm uppercase tracking-wider">KPIs Tracked</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">{{ survey.kpis?.length || 0 }}</p>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3 text-slate-500 mb-2">
                        <FileText class="w-5 h-5" />
                        <span class="font-semibold text-sm uppercase tracking-wider">Responses</span>
                    </div>
                    <p class="text-3xl font-bold text-slate-800">{{ survey._count?.responses || 0 }}</p>
                </div>
            </div>

             <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users class="w-5 h-5 text-violet-500" />
                        Target Groups
                    </h3>
                    <div class="space-y-3">
                        <div v-for="group in survey.groups" :key="group.id" 
                             class="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <span class="font-medium text-slate-700">{{ group.name }}</span>
                            <span class="text-[10px] font-bold px-2 py-1 rounded bg-white text-slate-500 border border-slate-200 uppercase">
                                {{ group.type }}
                            </span>
                        </div>
                        <div v-if="!survey.groups?.length" class="text-slate-400 italic text-sm">No groups assigned</div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target class="w-5 h-5 text-emerald-500" />
                        Selected KPIs
                    </h3>
                    <div class="space-y-3">
                        <div v-for="kpi in survey.kpis" :key="kpi.id" 
                             class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span class="font-medium text-slate-700">{{ kpi.name }}</span>
                        </div>
                        <div v-if="!survey.kpis?.length" class="text-slate-400 italic text-sm">No KPIs selected</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!isLoading && !survey" class="text-center py-20">
            <h3 class="text-xl font-semibold text-slate-700">Survey Not Found</h3>
            <button @click="router.push('/admin')" class="mt-4 text-primary font-bold hover:underline">Return to Dashboard</button>
        </div>

        <Modal :isOpen="showPublishConfirm" title="Publish Survey" maxWidth="max-w-md" @close="showPublishConfirm = false">
            <p class="text-slate-600 mb-8">
                Are you sure you want to publish this survey? It will become accessible to all assigned stakeholders.
            </p>
            <div class="flex justify-end gap-3">
                <button @click="showPublishConfirm = false" class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors">Cancel</button>
                <button @click="handlePublish" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-100 transition-all">Publish Now</button>
            </div>
        </Modal>

        <Modal :isOpen="showAnalyzeConfirm" title="Close & Analyze" maxWidth="max-w-md" @close="showAnalyzeConfirm = false">
            <p class="text-slate-600 mb-8">
                This will officially close the survey for responses and generate the final materiality report.
            </p>
            <div class="flex justify-end gap-3">
                <button @click="showAnalyzeConfirm = false" class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors">Cancel</button>
                <button @click="handleAnalyze" class="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-lg shadow-violet-100 transition-all">Generate Report</button>
            </div>
        </Modal>
    </div>
</template>
