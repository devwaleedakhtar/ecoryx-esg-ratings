import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import SurveyView from '../views/SurveyView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminDashboard
        },
        {
          path: 'survey/:id/report',
          name: 'admin-report',
          component: () => import('../views/AdminReportView.vue')
        },
        {
          path: 'survey/:id',
          name: 'admin-survey-detail',
          component: () => import('../views/AdminSurveyDetail.vue')
        }
      ]
    },
    {
      path: '/survey/:id',
      name: 'survey',
      component: SurveyView
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const { user, checkAuth } = useAuth();

  if (to.meta.requiresAuth) {
    if (!user.value) {
      await checkAuth();
    }

    if (!user.value) {
      next('/login');
      return;
    }
  }

  if (to.path === '/login') {
    if (!user.value) await checkAuth();
    if (user.value) {
      next('/admin');
      return;
    }
  }

  next();
});

export default router
