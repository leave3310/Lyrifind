/**
 * 搜尋功能模組入口
 * @description 匯出搜尋功能相關的元件、服務與組合式函式
 */

// 元件
export { default as SearchBar } from './components/SearchBar.vue'
export { default as SearchResults } from './components/SearchResults.vue'
export { default as SearchResultItem } from './components/SearchResultItem.vue'

// 組合式函式
export { useSearch } from './composables/useSearch'

// 服務
export {
  search,
  searchById,
  clearSearchCache,
  highlightText,
  parseHighlightedText,
  searchService,
} from './services/searchService'

// 型別
export type {
  SearchState,
  SearchOptions,
  SearchServiceConfig,
  HighlightedText,
  SortOption,
  SortDirection,
  SortConfig,
} from './types'
