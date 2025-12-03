/**
 * 歌詞功能型別定義
 * @description 歌詞模組專用型別
 */
import type { AppError, Song } from '@/shared/types'

/**
 * 歌詞狀態介面
 * @description 描述歌詞功能的完整狀態
 */
export interface LyricsState {
  /** 歌曲資料 */
  song: Song | null
  /** 是否正在載入 */
  loading: boolean
  /** 錯誤資訊 */
  error: AppError | null
}

/**
 * 歌詞顯示選項
 * @description 歌詞顯示的可選配置
 */
export interface LyricsDisplayOptions {
  /** 是否顯示行號 */
  showLineNumbers?: boolean
  /** 字體大小 */
  fontSize?: 'small' | 'medium' | 'large'
  /** 是否高亮搜尋關鍵字 */
  highlightKeyword?: string
}

/**
 * 歌詞行資訊
 * @description 單行歌詞的結構
 */
export interface LyricsLine {
  /** 行號（從 1 開始） */
  lineNumber: number
  /** 歌詞內容 */
  content: string
  /** 是否為空行 */
  isEmpty: boolean
}

/**
 * 解析後的歌詞
 * @description 將歌詞文字解析為結構化資料
 */
export interface ParsedLyrics {
  /** 歌詞行列表 */
  lines: LyricsLine[]
  /** 總行數 */
  totalLines: number
  /** 非空行數 */
  nonEmptyLines: number
}

// 重新匯出共用型別以便使用
export type { Song, AppError }
