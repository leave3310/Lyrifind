/**
 * 測試工具函式
 */

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import type { App } from 'vue'

/**
 * 為測試建立新的 QueryClient
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })
}

/**
 * 設定測試用的 Vue Query Plugin
 */
export function setupVueQuery(app: App) {
  const queryClient = createTestQueryClient()
  app.use(VueQueryPlugin, { queryClient })
  return queryClient
}
