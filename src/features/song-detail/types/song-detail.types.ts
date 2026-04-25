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
 * 歌曲詳細頁視圖狀態（discriminated union）
 * - loading：載入中
 * - error：載入失敗或歌曲不存在
 * - loaded：成功載入歌曲
 */
export type SongDetailView =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; song: Song; highlightKeyword: string | null; highlightedLyrics: string }

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
