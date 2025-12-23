// 搜尋組合式函式
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { searchService } from '../services/searchService'
import { validateSearchQuery } from '@/shared/utils/validation'
import type { SearchResultItem, SearchState, SearchStatus } from '../types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types'

export function useSearch() {
  const router = useRouter()
  const route = useRoute()

  // 狀態管理
  const searchQuery = ref('')
  const searchResults = ref<SearchResultItem[]>([])
  const total = ref(0)
  const currentPage = ref(DEFAULT_PAGE)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 從 URL 初始化狀態
  const initializeFromUrl = () => {
    const q = route.query.q as string
    const page = parseInt(route.query.page as string) || DEFAULT_PAGE
    
    if (q) {
      searchQuery.value = q
      currentPage.value = page
    }
  }

  // 更新 URL
  const updateUrl = (query: string, page: number = DEFAULT_PAGE) => {
    router.push({
      name: 'search',
      query: {
        q: query,
        page: page > 1 ? page : undefined
      }
    }).catch(() => {})
  }

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

  const performSearch = async (query: string, page: number = DEFAULT_PAGE) => {
    error.value = null

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

      // API 已處理歌詞片段擷取和高亮（由 Google Apps Script 完成）
      // response.items 包含 lyricsSnippet 和 highlightedSnippet
      searchResults.value = response.items
      total.value = response.total
      currentPage.value = response.page
      searchQuery.value = query

      // 更新 URL
      updateUrl(query, page)
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

  // 監聽 URL 變化
  watch(() => route.query, () => {
    initializeFromUrl()
  })

  initializeFromUrl()

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

