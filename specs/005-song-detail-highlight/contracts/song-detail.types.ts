/**
 * TypeScript 型別定義：歌曲詳細頁與歌詞高亮顯示
 * Feature: 005-song-detail-highlight
 * Date: 2025-12-28
 * 
 * 此檔案包含本功能所需的所有 TypeScript 型別定義。
 * 實際開發時，應將這些型別分散到對應的 src/ 目錄中。
 */

// ============================================================================
// 共用型別（應放置於 src/shared/types/common.types.ts）
// ============================================================================

/**
 * 歌曲實體
 * 代表一首完整的歌曲資訊
 * 來源：Google Sheets（欄位順序：id, artist, title, lyrics）
 */
export interface Song {
  /** 歌曲唯一識別碼 */
  id: string
  
  /** 歌手名稱 */
  artist: string
  
  /** 歌曲名稱 */
  title: string
  
  /** 完整歌詞內容（包含換行符號 \n） */
  lyrics: string
}

// ============================================================================
// 歌曲詳細頁型別（應放置於 src/features/song-detail/types/song-detail.types.ts）
// ============================================================================

/**
 * 高亮參數
 * 從 URL query parameter 取得的高亮關鍵字
 * URL 範例：/song/song-001?highlight=愛
 */
export interface HighlightParams {
  /** 要高亮的關鍵字，若無則為 null */
  keyword: string | null
}

/**
 * 歌曲詳細頁視圖狀態
 * 包含歌曲資料、高亮邏輯和頁面狀態
 */
export interface SongDetailView {
  /** 當前顯示的歌曲（載入中或錯誤時為 null） */
  song: Song | null
  
  /** 從 URL 取得的高亮關鍵字（無高亮時為 null） */
  highlightKeyword: string | null
  
  /** 套用高亮標記後的歌詞 HTML 字串 */
  highlightedLyrics: string
  
  /** 是否正在載入歌曲資料 */
  isLoading: boolean
  
  /** 錯誤訊息（如歌曲不存在），無錯誤時為 null */
  error: string | null
  
  /** 第一個 <mark> 元素的 DOM 參考（用於自動捲動），可選 */
  firstMarkPosition?: HTMLElement | null
}

/**
 * 路由參數
 * Vue Router 的 params 和 query 型別
 */
export interface SongDetailRouteParams {
  /** 歌曲 ID（從 URL params 取得） */
  id: string
}

export interface SongDetailRouteQuery {
  /** 高亮關鍵字（從 URL query 取得），可選 */
  highlight?: string
}

// ============================================================================
// 工具函式型別（應放置於對應的 utils 檔案中）
// ============================================================================

/**
 * 文字高亮函式型別
 * 在文字中標記所有匹配關鍵字為 <mark> 標籤
 * 
 * @param text - 原始文字
 * @param keyword - 要高亮的關鍵字
 * @returns 包含 <mark> 標籤的 HTML 字串
 */
export type HighlightTextFn = (text: string, keyword: string) => string

/**
 * 正則表達式轉義函式型別
 * 轉義正則特殊字元，確保關鍵字被視為純文字
 * 
 * @param text - 要轉義的文字
 * @returns 轉義後的文字
 */
export type EscapeRegexFn = (text: string) => string

/**
 * 關鍵字驗證函式型別
 * 驗證並標準化高亮關鍵字
 * 
 * @param keyword - 未驗證的關鍵字（可能是任意型別）
 * @returns 有效的關鍵字字串或 null
 */
export type ValidateHighlightKeywordFn = (keyword: unknown) => string | null

/**
 * 歌曲 ID 驗證函式型別
 * 驗證歌曲 ID 是否有效
 * 
 * @param id - 未驗證的歌曲 ID
 * @returns 有效的歌曲 ID 字串
 * @throws 若 ID 無效則拋出錯誤
 */
export type ValidateSongIdFn = (id: unknown) => string

// ============================================================================
// Composable 回傳型別（應放置於對應的 composables 檔案中）
// ============================================================================

/**
 * useSongDetail composable 回傳型別
 * 管理歌曲資料的載入和狀態
 */
export interface UseSongDetailReturn {
  /** 歌曲資料（載入中或錯誤時為 null） */
  song: Ref<Song | null>
  
  /** 是否正在載入 */
  isLoading: Ref<boolean>
  
  /** 錯誤訊息 */
  error: Ref<string | null>
  
  /** 重新載入歌曲 */
  reload: () => Promise<void>
}

/**
 * useLyricsHighlight composable 回傳型別
 * 處理歌詞高亮邏輯
 */
export interface UseLyricsHighlightReturn {
  /** 套用高亮標記後的歌詞 HTML */
  highlightedLyrics: ComputedRef<string>
  
  /** 是否有高亮關鍵字 */
  hasHighlight: ComputedRef<boolean>
}

/**
 * useAutoScroll composable 回傳型別
 * 處理自動捲動到第一個高亮位置
 */
export interface UseAutoScrollReturn {
  /** 第一個 <mark> 元素的參考 */
  firstMarkRef: Ref<HTMLElement | null>
  
  /** 執行捲動 */
  scrollToFirstMark: () => void
}

// ============================================================================
// 元件 Props 型別（應放置於對應的 component 檔案中）
// ============================================================================

/**
 * SongHeader 元件 Props
 * 顯示歌曲標題和歌手
 */
export interface SongHeaderProps {
  /** 歌曲名稱 */
  title: string
  
  /** 歌手名稱 */
  artist: string
}

/**
 * LyricsContent 元件 Props
 * 顯示歌詞內容（支援高亮）
 */
export interface LyricsContentProps {
  /** 歌詞內容（可能包含 <mark> 標籤的 HTML） */
  lyrics: string
  
  /** 是否包含高亮標記 */
  hasHighlight: boolean
}

/**
 * BackButton 元件 Props
 * 返回按鈕
 */
export interface BackButtonProps {
  /** 按鈕文字 */
  label?: string
}

/**
 * BackButton 元件 Emits
 */
export interface BackButtonEmits {
  /** 點擊事件 */
  (event: 'click'): void
}

// ============================================================================
// 錯誤型別
// ============================================================================

/**
 * 歌曲詳細頁錯誤型別
 */
export enum SongDetailError {
  /** 歌曲不存在（404） */
  NOT_FOUND = 'NOT_FOUND',
  
  /** 載入失敗（網路或伺服器錯誤） */
  LOAD_FAILED = 'LOAD_FAILED',
  
  /** 無效的歌曲 ID */
  INVALID_ID = 'INVALID_ID',
}

/**
 * 錯誤訊息對映
 */
export const ERROR_MESSAGES: Record<SongDetailError, string> = {
  [SongDetailError.NOT_FOUND]: '找不到歌曲',
  [SongDetailError.LOAD_FAILED]: '載入歌曲失敗，請稍後再試',
  [SongDetailError.INVALID_ID]: '無效的歌曲 ID',
}

// ============================================================================
// 常數
// ============================================================================

/**
 * 高亮樣式的 CSS class
 */
export const HIGHLIGHT_CLASS = 'bg-yellow-200 font-bold'

/**
 * 捲動行為設定
 */
export const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
}

/**
 * URL query parameter 名稱
 */
export const HIGHLIGHT_QUERY_KEY = 'highlight'

// ============================================================================
// Vue 型別匯入（用於型別宣告）
// ============================================================================

// 以下型別應從 Vue 匯入，此處僅用於文件說明
// import type { Ref, ComputedRef } from 'vue'

declare type Ref<T> = import('vue').Ref<T>
declare type ComputedRef<T> = import('vue').ComputedRef<T>
