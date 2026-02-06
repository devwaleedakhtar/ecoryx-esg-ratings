import prisma from '../utils/prisma';

export const submitResponse = async (surveyId: string, groupId: string, ratings: { kpiId: string, score: number }[]) => {
    return prisma.response.create({
        data: {
            surveyId,
            stakeholderGroupId: groupId,
            details: {
                create: ratings.map(r => ({
                    kpiId: r.kpiId,
                    score: r.score
                }))
            }
        }
    });
};
