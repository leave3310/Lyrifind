/**
 * useSearch 組合式函式
 * @description 搜尋功能的狀態管理與邏輯封裝
 */

import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { search, clearSearchCache } from '../services/searchService'
import type { SearchResult, SearchResponse, AppError } from '@/shared/types'
import type { SearchOptions } from '../types'

/** 預設選項 */
const DEFAULT_OPTIONS: Required<SearchOptions> = {
  autoSearch: true,
  debounceMs: 300,
  minQueryLength: 1,
  pageSize: 20,
}

/**
 * 搜尋組合式函式
 * @param options - 搜尋選項
 * @returns 搜尋狀態與方法
 */
export function useSearch(options: SearchOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  // 狀態
  const keyword = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<AppError | null>(null)
  const totalCount = ref(0)
  const hasSearched = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(0)

  // 計算屬性
  const hasResults = computed(() => results.value.length > 0)
  const hasError = computed(() => error.value !== null)
  const isEmpty = computed(() => hasSearched.value && !hasResults.value && !loading.value)
  const isRetryable = computed(() => error.value?.retryable ?? false)

  /**
   * 執行搜尋
   * @param searchKeyword - 搜尋關鍵字（可選，預設使用 keyword ref 的值）
   */
  async function executeSearch(searchKeyword?: string): Promise<SearchResponse | null> {
    const query = searchKeyword ?? keyword.value
    const trimmedQuery = query.trim()

    // 檢查最小長度
    if (trimmedQuery.length < mergedOptions.minQueryLength) {
      results.value = []
      totalCount.value = 0
      hasSearched.value = false
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await search({
        keyword: trimmedQuery,
        page: currentPage.value,
        pageSize: mergedOptions.pageSize,
      })

      results.value = response.results
      totalCount.value = response.total
      totalPages.value = response.totalPages
      hasSearched.value = true

      return response
    } catch (e) {
      const appError = e as AppError
      error.value = {
        code: appError.code || 'NETWORK_ERROR',
        message: appError.message || '搜尋時發生錯誤，請稍後再試',
        retryable: appError.retryable ?? true,
      }
      results.value = []
      totalCount.value = 0
      return null
    } finally {
      loading.value = false
    }
  }

  // 防抖搜尋
  const debouncedSearch = useDebounceFn(
    () => executeSearch(),
    mergedOptions.debounceMs
  )

  /**
   * 更新關鍵字並觸發搜尋
   * @param newKeyword - 新的搜尋關鍵字
   */
  function updateKeyword(newKeyword: string): void {
    keyword.value = newKeyword
    currentPage.value = 1

    if (mergedOptions.autoSearch) {
      debouncedSearch()
    }
  }

  /**
   * 立即搜尋（不防抖）
   */
  async function searchNow(): Promise<SearchResponse | null> {
    return executeSearch()
  }

  /**
   * 重試搜尋
   */
  async function retry(): Promise<SearchResponse | null> {
    return executeSearch()
  }

  /**
   * 清除搜尋
   */
  function clear(): void {
    keyword.value = ''
    results.value = []
    error.value = null
    totalCount.value = 0
    hasSearched.value = false
    currentPage.value = 1
    totalPages.value = 0
  }

  /**
   * 清除錯誤
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * 跳轉至指定頁面
   * @param page - 頁碼
   */
  async function goToPage(page: number): Promise<void> {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    await executeSearch()
  }

  /**
   * 清除快取並重新搜尋
   */
  async function refreshSearch(): Promise<SearchResponse | null> {
    clearSearchCache()
    return executeSearch()
  }

  // 監聽關鍵字變化（若啟用自動搜尋）
  if (mergedOptions.autoSearch) {
    watch(keyword, () => {
      debouncedSearch()
    })
  }

  return {
    // 狀態
    keyword,
    results,
    loading,
    error,
    totalCount,
    hasSearched,
    currentPage,
    totalPages,

    // 計算屬性
    hasResults,
    hasError,
    isEmpty,
    isRetryable,

    // 方法
    search: searchNow,
    updateKeyword,
    retry,
    clear,
    clearError,
    goToPage,
    refreshSearch,
  }
}

export default useSearch
