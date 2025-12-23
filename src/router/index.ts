import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '@/features/search/views/SearchPage.vue'
import SongDetailPage from '@/features/search/views/SongDetailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'search',
      component: SearchPage
    },
    {
      path: '/songs/:id',
      name: 'song-detail',
      component: SongDetailPage
    }
  ]
})

export default router
