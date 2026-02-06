import { useMutation } from '@tanstack/vue-query';
import api from '../api';

export const useSubmitResponse = () => {
    return useMutation({
        mutationFn: (payload: { surveyId: string, groupId: string, ratings: { kpiId: string, score: number }[] }) => 
            api.post('/responses', payload)
    });
};
