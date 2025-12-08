/**
 * 搜尋功能型別定義
 */

export type { SearchResult, SearchQuery, SearchResponse } from '@/shared/types'

/**
 * 搜尋狀態
 */
export interface SearchState {
  keyword: string
  results: SearchResult[]
  isLoading: boolean
  error: Error | null
  total: number
}

import type { SearchResult } from '@/shared/types'
