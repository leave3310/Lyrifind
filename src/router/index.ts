/**
 * Vue Router 設定
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/search',
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../features/search/pages/SearchPage.vue'),
    },
    {
      path: '/lyrics/:id',
      name: 'lyrics',
      component: () => import('../features/lyrics/pages/LyricsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
})

export default router
