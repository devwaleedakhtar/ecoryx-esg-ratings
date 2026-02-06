<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-vue-next';

const { logout } = useAuth();
const router = useRouter();

const isSidebarOpen = ref(false);

const handleLogout = async () => {
    await logout();
    router.push('/login');
};
</script>

<template>
    <div class="flex h-screen bg-background font-sans overflow-hidden">

        <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-4">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
                <span class="text-xl font-bold text-slate-800">Ecoryx<span class="text-primary">.ai</span></span>
            </div>
            <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu v-if="!isSidebarOpen" class="w-6 h-6" />
                <X v-else class="w-6 h-6" />
            </button>
        </div>

        <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm transition-all"></div>


        <aside 
            class="fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out h-full"
            :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
        >
            <div class="p-6 border-b border-slate-100 items-center gap-2 md:flex hidden">
                <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
                <span class="text-xl font-bold text-slate-800">Ecoryx<span class="text-primary">.ai</span></span>
            </div>


            <div class="p-6 border-b border-slate-100 flex items-center gap-2 md:hidden">
                 <span class="text-xl font-bold text-slate-800">Menu</span>
                 <button @click="isSidebarOpen = false" class="ml-auto p-2 text-slate-400 hover:text-slate-600">
                    <X class="w-5 h-5" />
                 </button>
            </div>

            <nav class="flex-1 p-4 space-y-2">
                <router-link to="/admin" @click="isSidebarOpen = false" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors" active-class="bg-violet-50 text-primary font-semibold">
                    <LayoutDashboard class="w-5 h-5" />
                    <span>Dashboard</span>
                </router-link>
            </nav>

            <div class="p-4 border-t border-slate-100">
                <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut class="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        <main class="flex-1 p-4 md:p-8 overflow-y-auto h-full pt-20 md:pt-8 w-full">
            <router-view></router-view>
        </main>
    </div>
</template>
