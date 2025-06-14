import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from "./views/LoginView.vue";
import SelectView from "./views/SelectView.vue";
import MainDialogView from "./views/MainDialogView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/main' },
    { path: '/login', component: LoginView },
    { path: '/select', component: SelectView, meta: { requiresAuth: true } },
    { path: '/main', component: MainDialogView, meta: { requiresAuth: true } },
    { path: '/logout', 
      beforeEnter: (to, from, next) => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('organizationId');
        localStorage.removeItem('departmentId');
        next('/login'); 
      } 
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/select');
  } else {
    next();
  }
});

export default router