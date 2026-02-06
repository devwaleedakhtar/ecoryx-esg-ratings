import prisma from '../utils/prisma';
import { generateESGReport } from './aiService';

export const generateReport = async (surveyId: string) => {
    console.log(`Generating Report for Survey: ${surveyId}`);

    const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
            kpis: true,
            groups: true,
            responses: {
                include: {
                    details: true,
                    group: true
                }
            }
        }
    });

    if (!survey) throw new Error("Survey not found");

    const kpiStats: Record<string, { internalSum: number, internalCount: number, externalSum: number, externalCount: number }> = {};

    survey.kpis.forEach(k => {
        kpiStats[k.id] = { internalSum: 0, internalCount: 0, externalSum: 0, externalCount: 0 };
    });

    survey.responses.forEach(response => {
        const isInternal = response.group.type === 'INTERNAL';
        response.details.forEach(detail => {
            const stats = kpiStats[detail.kpiId];
            if (stats) {
                if (isInternal) {
                    stats.internalSum += detail.score;
                    stats.internalCount++;
                } else {
                    stats.externalSum += detail.score;
                    stats.externalCount++;
                }
            }
        });
    });

    const matrixData = survey.kpis.map(kpi => {
        const stats = kpiStats[kpi.id];
        const internalAvg = stats.internalCount > 0 ? stats.internalSum / stats.internalCount : 0;
        const externalAvg = stats.externalCount > 0 ? stats.externalSum / stats.externalCount : 0;
        return {
            id: kpi.id,
            name: kpi.name,
            internalAvg: Number(internalAvg.toFixed(2)),
            externalAvg: Number(externalAvg.toFixed(2))
        };
    });

    const stakeholderKPIs = survey.groups.map(group => {
        const groupResponses = survey.responses.filter(r => r.stakeholderGroupId === group.id);
        const kpiAvgs: Record<string, number> = {};

        survey.kpis.forEach(kpi => {
            let sum = 0;
            let count = 0;
            groupResponses.forEach(r => {
                const detail = r.details.find(d => d.kpiId === kpi.id);
                if (detail) {
                    sum += detail.score;
                    count++;
                }
            });
            kpiAvgs[kpi.name] = count > 0 ? Number((sum / count).toFixed(2)) : 0;
        });

        return {
            groupName: group.name,
            averages: kpiAvgs
        };
    });

    const summaryText = await generateESGReport({
        surveyTitle: survey.title,
        totalResponses: survey.responses.length,
        matrixData: matrixData.map(m => ({
            name: m.name,
            internalAvg: m.internalAvg,
            externalAvg: m.externalAvg
        })),
        stakeholderData: stakeholderKPIs
    });

    await prisma.report.deleteMany({ where: { surveyId } });

    const report = await prisma.report.create({
        data: {
            surveyId,
            summaryText,
            matrixData: JSON.stringify(matrixData),
            stakeholderData: JSON.stringify(stakeholderKPIs)
        }
    });

    return report;
};

export const getReport = async (surveyId: string) => {
    return prisma.report.findUnique({ where: { surveyId } });
};

