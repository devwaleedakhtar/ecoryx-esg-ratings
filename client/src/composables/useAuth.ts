import { ref } from 'vue';
import api from '../api';

const user = ref<any>(null);
const isLoading = ref(true);

export const useAuth = () => {
    const checkAuth = async () => {
        try {
            isLoading.value = true;
            const res: any = await api.get('/me');
            user.value = res.user;
            return true;
        } catch (e) {
            user.value = null;
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const login = async (password: string) => {
        try {
            await api.post('/login', { email: 'admin@ecoryx.com', password });
            await checkAuth();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            user.value = null;
        }
    };

    return {
        user,
        isLoading,
        login,
        logout,
        checkAuth
    };
};
