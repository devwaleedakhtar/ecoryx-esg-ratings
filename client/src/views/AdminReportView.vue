<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSurvey } from '../composables/useSurvey';
import { useReport } from '../composables/useReport';
import { ArrowLeft, BarChart2, Share2, Download, MessageSquare, Target, Check } from 'lucide-vue-next';
import MaterialityMatrix from '../components/charts/MaterialityMatrix.vue';
import StakeholderComparison from '../components/charts/StakeholderComparison.vue';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const surveyId = route.params.id as string;

const { data: survey, isLoading } = useSurvey(surveyId);
const { data: report } = useReport(surveyId);

const parsedMatrixData = computed(() => report.value?.matrixData ? JSON.parse(report.value.matrixData) : []);
const parsedStakeholderData = computed(() => report.value?.stakeholderData ? JSON.parse(report.value.stakeholderData) : []);

const renderedSummary = computed(() => {
    if (!report.value?.summaryText) return '';
    return marked(report.value.summaryText);
});

const criticalPriorities = computed(() => 
    parsedMatrixData.value.filter((k: any) => k.internalAvg > 7 && k.externalAvg > 7)
);

const exportCSV = () => {
    if (!parsedMatrixData.value.length) return;
    const headers = "KPI Name,Internal Importance,External Importance\n";
    const rows = parsedMatrixData.value.map((k: any) => `"${k.name}",${k.internalAvg},${k.externalAvg}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ecoryx_Report_${survey.value?.title || 'ESG'}.csv`;
    a.click();
};

const isCopied = ref(false);

const copyReportLink = () => {
    navigator.clipboard.writeText(window.location.href);
    isCopied.value = true;
    setTimeout(() => isCopied.value = false, 2000);
};
</script>

<template>
    <div class="max-w-7xl mx-auto animate-fade-in">
        <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <button @click="router.push('/admin')" class="flex items-center gap-2 text-slate-400 hover:text-primary mb-4 transition-colors font-semibold uppercase tracking-wider text-xs">
                    <ArrowLeft class="w-4 h-4" /> Back to Dashboard
                </button>
                <div class="flex items-center gap-4 mb-2" v-if="survey">
                    <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ survey.title }}</h1>
                    <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200">Completed</span>
                </div>
                <p class="text-slate-500 text-lg">Finalized Materiality Assessment & AI Insights</p>
            </div>

            <div class="flex gap-3">
                <button @click="copyReportLink" class="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary text-slate-600 hover:text-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                    <Check v-if="isCopied" class="w-4 h-4 text-emerald-500" />
                    <Share2 v-else class="w-4 h-4" />
                    <span>{{ isCopied ? 'Copied!' : 'Share Report' }}</span>
                </button>
                <button @click="exportCSV" class="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-200">
                    <Download class="w-4 h-4" />
                    <span>Export CSV</span>
                </button>
            </div>
        </header>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="h-[500px] bg-white rounded-3xl animate-pulse"></div>
            <div class="h-[500px] bg-white rounded-3xl animate-pulse"></div>
        </div>

        <div v-else-if="report" class="space-y-8 pb-12">
            <div class="grid lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-primary">
                            <Target class="w-6 h-6" />
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-slate-900">Materiality Matrix</h2>
                            <p class="text-slate-400 text-sm font-medium">Internal vs External Strategic Importance</p>
                        </div>
                    </div>
                    <MaterialityMatrix :data="parsedMatrixData" />
                </div>

                <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <BarChart2 class="w-6 h-6" />
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-slate-900">Stakeholder Comparison</h2>
                            <p class="text-slate-400 text-sm font-medium">Granular View by Participant Group</p>
                        </div>
                    </div>
                    <StakeholderComparison :data="parsedStakeholderData" />
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                                <MessageSquare class="w-6 h-6" />
                            </div>
                            <h2 class="text-2xl font-bold text-slate-900">Executive Summary</h2>
                        </div>
                        <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed" v-html="renderedSummary"></div>
                    </div>

                    <div v-if="criticalPriorities.length > 0" class="bg-violet-50 border border-violet-100 rounded-3xl p-8">
                        <div class="flex items-center gap-2 mb-6">
                            <Target class="w-6 h-6 text-primary" />
                            <h3 class="text-xl font-bold text-slate-900">Critical Priority Areas</h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                v-for="kpi in criticalPriorities" 
                                :key="kpi.name"
                                class="bg-white p-4 rounded-2xl border border-violet-200 shadow-sm flex items-center justify-between"
                            >
                                <span class="font-bold text-slate-800">{{ kpi.name }}</span>
                                <div class="flex gap-2">
                                    <span class="bg-violet-100 text-primary text-[10px] px-2 py-1 rounded font-black">MATCHED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="bg-violet-950 text-white rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform">
                        <h3 class="font-bold text-violet-300 uppercase tracking-widest text-xs mb-6">Engagement Overview</h3>
                        <div class="space-y-8">
                            <div>
                                <div class="text-5xl font-black mb-1">{{ survey?._count?.responses || 0 }}</div>
                                <div class="text-violet-400 font-bold text-sm tracking-wide">TOTAL PARTICIPANTS</div>
                            </div>
                            <div class="flex items-center justify-between pt-6 border-t border-violet-800">
                                <div>
                                    <div class="text-xl font-bold">{{ parsedMatrixData.length }}</div>
                                    <div class="text-violet-400 text-xs font-bold">KPIs TRACKED</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xl font-bold">{{ parsedStakeholderData.length }}</div>
                                    <div class="text-violet-400 text-xs font-bold">STAKEHOLDER GROUPS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <BarChart2 class="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 class="text-xl font-bold text-slate-700">Analytics Not Available</h3>
            <p class="text-slate-400 mt-2">Finish the survey status update to generate this report.</p>
        </div>
    </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>
