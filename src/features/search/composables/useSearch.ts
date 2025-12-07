/**
 * useSearch Composable
 * 
 * 搜尋歌曲的邏輯，使用 TanStack Query 和 VueUse
 */

import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { queryKeys } from '@/shared/services/queryKeys'
import type { SearchResult } from '@/shared/contracts/lyrics.contract'

export function useSearch() {
  const searchQuery = ref('')
  const currentPage = ref(1)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: computed(() =>
      queryKeys.search.results(searchQuery.value, currentPage.value)
    ),
    queryFn: async () => {
      // TODO: 呼叫 API
      return { data: [] as SearchResult[], total: 0 }
    },
    enabled: computed(() => searchQuery.value.length > 0),
  })

  const debouncedSearch = useDebounceFn((query: string) => {
    searchQuery.value = query.slice(0, 200)
    currentPage.value = 1
  }, 300)

  const results = computed(() => data.value?.data || [])
  const total = computed(() => data.value?.total || 0)

  return {
    searchQuery,
    currentPage,
    results,
    total,
    isLoading,
    error,
    search: debouncedSearch,
    refetch,
  }
}
