import { useQuery } from '@tanstack/vue-query';
import api from '../api';

export interface KPIPoint {
    id: string;
    name: string;
    internalAvg: number;
    externalAvg: number;
}

export interface Report {
    id: string;
    surveyId: string;
    summaryText: string;
    matrixData: string;
    stakeholderData?: string;
}

export const useReport = (surveyId: string) => {
    return useQuery({
        queryKey: ['report', surveyId],
        queryFn: async (): Promise<Report> => {
            return api.get(`/reports/${surveyId}`);
        },
        enabled: !!surveyId,
        retry: 3,
        retryDelay: 1000
    });
};
