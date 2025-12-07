/**
 * Vue Router 設定
 */

import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '@/features/search/pages/SearchPage.vue'
import LyricsPage from '@/features/lyrics/pages/LyricsPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/search',
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
  },
  {
    path: '/lyrics/:id',
    name: 'lyrics',
    component: LyricsPage,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
