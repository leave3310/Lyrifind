/**
 * 搜尋功能型別定義
 * @description 搜尋模組專用型別
 */
import type { AppError, SearchQuery, SearchResponse, SearchResult } from '@/shared/types'

/**
 * 搜尋狀態介面
 * @description 描述搜尋功能的完整狀態
 */
export interface SearchState {
  /** 搜尋查詢條件 */
  query: SearchQuery | null
  /** 搜尋結果列表 */
  results: SearchResult[]
  /** 是否正在載入 */
  loading: boolean
  /** 錯誤資訊 */
  error: AppError | null
  /** 總結果數量 */
  totalCount: number
  /** 是否已執行過搜尋 */
  hasSearched: boolean
}

/**
 * 搜尋選項介面
 * @description 搜尋行為的可選配置
 */
export interface SearchOptions {
  /** 是否自動執行搜尋（輸入時） */
  autoSearch?: boolean
  /** 防抖延遲時間（毫秒） */
  debounceMs?: number
  /** 最小搜尋字元數 */
  minQueryLength?: number
  /** 每頁結果數量 */
  pageSize?: number
}

/**
 * 搜尋服務配置
 * @description 搜尋服務的配置選項
 */
export interface SearchServiceConfig {
  /** 搜尋結果快取存活時間（毫秒） */
  cacheTTL?: number
  /** 最大快取項目數 */
  maxCacheSize?: number
}

/**
 * 高亮標記結果
 * @description 包含高亮標記的文字片段
 */
export interface HighlightedText {
  /** 原始文字 */
  text: string
  /** 是否為匹配片段 */
  isMatch: boolean
}

/**
 * 搜尋結果排序選項
 */
export type SortOption = 'relevance' | 'title' | 'artist'

/**
 * 搜尋結果排序方向
 */
export type SortDirection = 'asc' | 'desc'

/**
 * 搜尋排序配置
 */
export interface SortConfig {
  /** 排序欄位 */
  field: SortOption
  /** 排序方向 */
  direction: SortDirection
}

// 重新匯出共用型別以便使用
export type { SearchResult, SearchQuery, SearchResponse, AppError }
