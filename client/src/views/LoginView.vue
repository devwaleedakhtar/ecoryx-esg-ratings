<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { Lock } from 'lucide-vue-next';

const password = ref('');
const error = ref('');
const router = useRouter();
const { login } = useAuth();

const handleLogin = async () => {
    if (await login(password.value)) {
        router.push('/admin');
    } else {
        error.value = 'Invalid password (hint: admin123)';
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-100">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <div class="flex justify-center mb-6">
                <div class="bg-violet-100 p-4 rounded-full">
                    <Lock class="w-8 h-8 text-primary" />
                </div>
            </div>
            
            <h1 class="text-2xl font-bold text-center text-slate-800 mb-2">Admin Access</h1>
            <p class="text-center text-slate-500 mb-8">Please enter the secure key.</p>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <input 
                        v-model="password" 
                        type="password" 
                        placeholder="Enter Password" 
                        class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        autofocus
                    >
                </div>
                
                <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

                <button 
                    type="submit"
                    class="w-full bg-primary hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-[0.98]"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
</template>
