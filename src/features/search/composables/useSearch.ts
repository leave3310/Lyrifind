// 搜尋組合式函式
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { searchService } from '../services/searchService'
import { validateSearchQuery } from '@/shared/utils/validation'
import type { SearchResultItem, SearchState, SearchStatus } from '../types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types'

export function useSearch() {
  // 狀態管理
  const searchQuery = ref('')
  const searchResults = ref<SearchResultItem[]>([])
  const total = ref(0)
  const currentPage = ref(DEFAULT_PAGE)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 計算屬性
  const status = computed<SearchStatus>(() => {
    if (isLoading.value) return 'loading'
    if (error.value) return 'error'
    if (searchResults.value.length > 0) return 'success'
    return 'idle'
  })

  const totalPages = computed(() => 
    Math.ceil(total.value / DEFAULT_PAGE_SIZE)
  )

  const state = computed<SearchState>(() => ({
    status: status.value,
    query: searchQuery.value,
    results: searchResults.value,
    total: total.value,
    page: currentPage.value,
    error: error.value
  }))

  // 執行搜尋
  const performSearch = async (query: string, page: number = DEFAULT_PAGE) => {
    // 重置錯誤
    error.value = null

    // 驗證輸入
    const validation = validateSearchQuery(query)
    if (!validation.valid) {
      error.value = validation.error
      return
    }

    try {
      isLoading.value = true
      
      const response = await searchService.search({
        query: query.trim(),
        page,
        pageSize: DEFAULT_PAGE_SIZE
      })

      searchResults.value = response.items
      total.value = response.total
      currentPage.value = response.page
      searchQuery.value = query
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜尋失敗，請稍後再試'
      searchResults.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  // 防抖搜尋（400ms）
  const debouncedSearch = useDebounceFn((query: string) => {
    performSearch(query, DEFAULT_PAGE)
  }, 400)

  // 換頁
  const goToPage = (page: number) => {
    if (searchQuery.value) {
      performSearch(searchQuery.value, page)
    }
  }

  // 重試
  const retry = () => {
    if (searchQuery.value) {
      performSearch(searchQuery.value, currentPage.value)
    }
  }

  return {
    // 狀態
    searchQuery,
    searchResults,
    total,
    currentPage,
    isLoading,
    error,
    status,
    totalPages,
    state,
    
    // 方法
    performSearch,
    debouncedSearch,
    goToPage,
    retry
  }
}
