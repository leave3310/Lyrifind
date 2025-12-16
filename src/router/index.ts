import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '@/features/search/views/SearchPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'search',
      component: SearchPage
    }
  ]
})

export default router
