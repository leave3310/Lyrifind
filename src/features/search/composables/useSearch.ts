/**
 * useSearch Composable
 * 
 * 搜尋歌曲的邏輯，使用 TanStack Query 和 VueUse
 */

import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { queryKeys } from '@/shared/services/queryKeys'
import type { SearchResponse } from '@/shared/contracts/lyrics.contract'
import { http } from '@/shared/services/http'

export function useSearch() {
  const searchQuery = ref('')
  const currentPage = ref(1)

  // 調用搜尋 API 的函式
  const fetchSearchResults = async (): Promise<SearchResponse> => {
    if (!searchQuery.value.trim()) {
      return { data: [], total: 0 }
    }

    try {
      const response = await http.get<SearchResponse>('/search', {
        params: {
          q: searchQuery.value,
          page: currentPage.value,
          limit: 20,
        },
      })
      return response.data
    } catch (error) {
      console.error('搜尋失敗:', error)
      throw error
    }
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: computed(() =>
      queryKeys.search.results(searchQuery.value, currentPage.value)
    ),
    queryFn: fetchSearchResults,
    enabled: computed(() => searchQuery.value.trim().length > 0),
    staleTime: 5 * 60 * 1000, // 5 分鐘
  })

  // 防抖搜尋函式，限制關鍵字長度為 200 字元
  const debouncedSearch = useDebounceFn((query: string) => {
    // 自動截斷超過 200 字元的關鍵字
    searchQuery.value = query.slice(0, 200)
    currentPage.value = 1
  }, 300)

  const results = computed(() => data.value?.data || [])
  const total = computed(() => data.value?.total || 0)
  const hasNextPage = computed(() => {
    const itemsShown = currentPage.value * 20
    return itemsShown < total.value
  })

  const goToNextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  return {
    searchQuery,
    currentPage,
    results,
    total,
    isLoading,
    error,
    hasNextPage,
    search: debouncedSearch,
    refetch,
    goToNextPage,
    goToPreviousPage,
  }
}
