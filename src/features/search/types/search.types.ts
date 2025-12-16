// 歌詞搜尋功能型別定義
// 對應 Google Sheets 欄位：id, artist, title, lyrics

// 核心實體
export interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}

// 歌詞片段
export interface LyricsSnippet {
  lines: string[]      // 擷取的歌詞行（固定 3 行）
  matchIndex: number   // 匹配行在 lines 陣列中的索引
}

// 搜尋結果項目
export interface SearchResultItem {
  song: Song
  lyricsSnippet: LyricsSnippet | null
  highlightedSnippet: string | null
}

// 搜尋查詢
export interface SearchQuery {
  query: string
  page?: number
  pageSize?: number
}

// 搜尋回應
export interface SearchResponse {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 搜尋狀態
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SearchState {
  status: SearchStatus
  query: string
  results: SearchResultItem[]
  total: number
  page: number
  error: string | null
}

// 常數
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_QUERY_LENGTH = 200
