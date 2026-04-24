// 歌曲詳細頁功能專屬型別定義

import type { Song } from '@/shared/types/common.types'

/**
 * 高亮參數
 * 從 URL query parameter 取得的高亮關鍵字
 * URL 範例：/songs/song-001?highlight=愛
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
}

/**
 * Vue Router 路由參數型別
 */
export interface SongDetailRouteParams {
  /** 歌曲 ID（從 URL params 取得） */
  id: string
}

/**
 * Vue Router 路由查詢參數型別
 */
export interface SongDetailRouteQuery {
  /** 高亮關鍵字（從 URL query 取得），可選 */
  highlight?: string
}

export type { Song }
