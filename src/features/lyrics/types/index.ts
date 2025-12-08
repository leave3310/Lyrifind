/**
 * 歌詞功能型別定義
 */

export type { Song } from '@/shared/types'

/**
 * 歌詞狀態
 */
export interface LyricsState {
  song: Song | null
  isLoading: boolean
  error: Error | null
}

import type { Song } from '@/shared/types'
