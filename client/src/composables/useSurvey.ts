import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import api from '../api';

export interface Survey {
    id: string;
    title: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
    createdAt: string;
    _count?: { responses: number };
    kpis?: any[];
    groups?: any[];
}

export const useSurveys = () => {
    return useQuery({
        queryKey: ['surveys'],
        queryFn: async (): Promise<Survey[]> => {
            return api.get('/surveys');
        }
    });
};

export const useSurvey = (id: string) => {
    return useQuery({
        queryKey: ['survey', id],
        queryFn: async (): Promise<Survey> => {
            return api.get(`/surveys/${id}`);
        },
        enabled: !!id
    });
};

export interface Metadata {
    kpis: { id: string, name: string, description: string }[];
    groups: { id: string, name: string, type: 'INTERNAL' | 'EXTERNAL' }[];
}

export const useMetadata = () => {
    return useQuery({
        queryKey: ['metadata'],
        queryFn: async (): Promise<Metadata> => api.get('/metadata')
    });
};

export const useCreateSurvey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { title: string, kpis: string[], groups: string[] }) => 
            api.post('/surveys', data),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['surveys'] });
        }
    });
};

export const useUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => 
            api.patch(`/surveys/${id}/status`, { status }),
        onSuccess: (_data, variables) => {
             queryClient.invalidateQueries({ queryKey: ['survey', variables.id] });
             queryClient.invalidateQueries({ queryKey: ['surveys'] });
             queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
        }
    });
};
