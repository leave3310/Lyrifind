/**
 * 共用型別定義
 */

export type {
  Song,
  SearchResult,
  SearchQuery,
  SearchResponse,
  ErrorResponse,
} from '../contracts/lyrics.contract'

/**
 * API 錯誤型別
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
}

/**
 * 載入狀態型別
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
