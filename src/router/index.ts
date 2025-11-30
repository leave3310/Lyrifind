/**
 * Vue Router 設定
 * @description 設定應用程式路由
 */
import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

/** 路由設定 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/features/home/views/HomePage.vue'),
    meta: {
      title: 'LyriFind - 歌詞搜尋',
    },
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/features/search/views/SearchResultsPage.vue'),
    meta: {
      title: '搜尋結果 - LyriFind',
    },
  },
  {
    path: '/lyrics/:id',
    name: 'LyricsDetail',
    component: () => import('@/features/lyrics/views/LyricsDetailPage.vue'),
    meta: {
      title: '歌詞詳情 - LyriFind',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/shared/views/NotFoundPage.vue'),
    meta: {
      title: '頁面不存在 - LyriFind',
    },
  },
]

/** 建立 Router 實例 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

/** 路由守衛：更新頁面標題 */
router.beforeEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = title
  }
})

export default router
