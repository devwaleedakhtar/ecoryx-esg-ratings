import prisma from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';

export const getAllSurveys = async () => {
    return prisma.survey.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { responses: true } } }
    });
};

export const getSurveyById = async (id: string) => {
    return prisma.survey.findUnique({
        where: { id },
        include: {
            kpis: true,
            groups: true,
            _count: { select: { responses: true } }
        }
    });
};

export const getMetadata = async () => {
    const firstSurvey = await prisma.survey.findFirst({
        include: {
            kpis: { select: { id: true, name: true, description: true } },
            groups: { select: { id: true, name: true, type: true } }
        }
    });

    if (!firstSurvey) {
        return { kpis: [], groups: [] };
    }

    return {
        kpis: firstSurvey.kpis,
        groups: firstSurvey.groups
    };
};

export const createSurvey = async (title: string, kpiIds?: string[], groupIds?: string[]) => {
    const metadata = await getMetadata();

    const survey = await prisma.survey.create({
        data: {
            title,
            status: 'DRAFT',
        }
    });

    const selectedKpis = kpiIds && kpiIds.length > 0
        ? metadata.kpis.filter(k => kpiIds.includes(k.id))
        : metadata.kpis;

    const selectedGroups = groupIds && groupIds.length > 0
        ? metadata.groups.filter(g => groupIds.includes(g.id))
        : metadata.groups;

    const kpiPromises = selectedKpis.map(k => prisma.kPI.create({
        data: { name: k.name, description: k.description, surveyId: survey.id }
    }));

    const groupPromises = selectedGroups.map(g => prisma.stakeholderGroup.create({
        data: { name: g.name, type: g.type as any, surveyId: survey.id }
    }));

    await Promise.all([...kpiPromises, ...groupPromises]);

    return survey;
};

export const updateStatus = async (id: string, status: string) => {
    return prisma.survey.update({
        where: { id },
        data: { status }
    });
};
