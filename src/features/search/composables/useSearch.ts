/**
 * 搜尋功能 Composable
 * 
 * 使用 TanStack Query 進行 API 請求與快取
 * 使用 VueUse useDebounceFn 實作搜尋防抖
 */

import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { apiClient } from '@/shared/services/apiClient'
import { queryKeys } from '@/shared/services/queryKeys'
import type { SearchResult } from '@/shared/types'

export function useSearch(initialKeyword = '') {
  const keyword = ref(initialKeyword)
  const page = ref(1)
  const limit = ref(20)

  // 驗證關鍵字
  const validatedKeyword = computed(() => {
    const trimmed = keyword.value.trim()
    if (trimmed.length > 200) {
      return trimmed.slice(0, 200)
    }
    return trimmed
  })

  // TanStack Query 搜尋
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: computed(() => 
      queryKeys.search.results(validatedKeyword.value, page.value)
    ),
    queryFn: async () => {
      if (!validatedKeyword.value) {
        throw new Error('請輸入搜尋關鍵字')
      }

      const response = await apiClient.search({
        query: {
          q: validatedKeyword.value,
          page: page.value,
          limit: limit.value,
        },
      })

      if (response.status !== 200) {
        throw new Error(response.body.message || '搜尋失敗')
      }

      return response.body
    },
    enabled: computed(() => validatedKeyword.value.length > 0),
    staleTime: 5 * 60 * 1000, // 5 分鐘
  })
  console.log(data.value);
  
  
  // 搜尋結果
  const results = computed<SearchResult[]>(() => data.value || [])
  const total = computed(() => data.value?.total || 0)
  const hasMore = computed(() => results.value.length < total.value)

  // 搜尋函式
  const search = async () => {
    if (!validatedKeyword.value) {
      throw new Error('請輸入搜尋關鍵字')
    }
    page.value = 1
    await refetch()
  }

  // 防抖搜尋（300ms）
  const debouncedSearch = useDebounceFn(search, 300)

  // 載入更多
  const loadMore = async () => {
    if (hasMore.value && !isFetching.value) {
      page.value += 1
      await refetch()
    }
  }

  // 重試
  const retry = () => {
    refetch()
  }

  // 清除搜尋
  const clear = () => {
    keyword.value = ''
    page.value = 1
  }

  return {
    keyword,
    validatedKeyword,
    results,
    total,
    isLoading: computed(() => isLoading.value || isFetching.value),
    error,
    hasMore,
    search,
    debouncedSearch,
    loadMore,
    retry,
    clear,
  }
}
