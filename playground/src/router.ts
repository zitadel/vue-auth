import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { createAuthGuard, zitadelRoutes } from '@zitadel/vue-auth/routes';

import HomePage from './pages/HomePage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import ApiDemo from './pages/ApiDemo.vue';

const appRoutes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/api-demo', component: ApiDemo },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: [...appRoutes, ...zitadelRoutes],
});

router.beforeEach(createAuthGuard());
