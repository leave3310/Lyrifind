/**
 * 共用型別定義
 * @description 歌詞搜尋網站的核心型別定義
 */

/**
 * 歌曲實體
 */
export interface Song {
  /** 唯一識別碼 */
  id: string
  /** 歌曲名稱 */
  title: string
  /** 歌手名稱 */
  artist: string
  /** 完整歌詞內容 */
  lyrics: string
}

/**
 * 匹配類型
 */
export type MatchType = 'TITLE_EXACT' | 'TITLE_PARTIAL' | 'ARTIST' | 'LYRICS'

/**
 * 搜尋結果
 */
export interface SearchResult {
  /** 歌曲資訊 */
  song: Song
  /** 相關性分數 */
  score: number
  /** 匹配類型 */
  matchType: MatchType
  /** 標題高亮 HTML */
  highlightedTitle?: string
  /** 歌手名稱高亮 HTML */
  highlightedArtist?: string
  /** 歌詞片段高亮 HTML */
  highlightedLyrics?: string
}

/**
 * 搜尋查詢參數
 */
export interface SearchQuery {
  /** 搜尋關鍵字 */
  keyword: string
  /** 頁碼 */
  page?: number
  /** 每頁筆數 */
  pageSize?: number
}

/**
 * 搜尋回應
 */
export interface SearchResponse {
  /** 搜尋結果陣列 */
  results: SearchResult[]
  /** 符合條件的總筆數 */
  total: number
  /** 目前頁碼 */
  page: number
  /** 每頁筆數 */
  pageSize: number
  /** 總頁數 */
  totalPages: number
  /** 搜尋關鍵字 */
  keyword: string
}

/**
 * 分頁資訊
 */
export interface PaginationInfo {
  /** 目前頁碼 */
  currentPage: number
  /** 總頁數 */
  totalPages: number
  /** 總筆數 */
  totalItems: number
  /** 每頁筆數 */
  pageSize: number
  /** 是否有下一頁 */
  hasNextPage: boolean
  /** 是否有上一頁 */
  hasPrevPage: boolean
}

/**
 * 錯誤代碼
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'

/**
 * 應用程式錯誤
 */
export interface AppError {
  /** 錯誤代碼 */
  code: ErrorCode
  /** 錯誤訊息（正體中文） */
  message: string
  /** 是否可重試 */
  retryable: boolean
}

/**
 * 應用程式狀態
 */
export interface AppState {
  /** 是否正在載入 */
  isLoading: boolean
  /** 錯誤資訊 */
  error: AppError | null
}

/**
 * Google Sheets API 回應格式
 */
export interface GoogleSheetsResponse {
  /** 資料範圍 */
  range: string
  /** 資料方向 */
  majorDimension: string
  /** 資料值陣列 */
  values: string[][]
}
