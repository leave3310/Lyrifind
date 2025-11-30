/**
 * useLyrics 組合式函式
 * @description 歌詞功能的狀態管理與邏輯封裝
 */
import { computed, ref } from 'vue'

import type { AppError, Song } from '@/shared/types'

import { getLyricsById } from '../services/lyricsService'

/**
 * 歌詞組合式函式
 * @returns 歌詞狀態與方法
 */
export function useLyrics() {
  // 狀態
  const song = ref<Song | null>(null)
  const loading = ref(false)
  const error = ref<AppError | null>(null)
  const lastSongId = ref<string | null>(null)

  // 計算屬性
  const hasError = computed(() => error.value !== null)
  const hasSong = computed(() => song.value !== null)
  const isRetryable = computed(() => error.value?.retryable ?? false)

  /**
   * 取得歌詞
   * @param songId - 歌曲 ID
   */
  async function fetchLyrics(songId: string): Promise<void> {
    lastSongId.value = songId
    loading.value = true
    error.value = null

    try {
      const result = await getLyricsById(songId)

      if (result === null) {
        song.value = null
        error.value = {
          code: 'NOT_FOUND',
          message: '找不到指定的歌曲',
          retryable: false,
        }
        return
      }

      song.value = result
    } catch (e) {
      song.value = null
      const appError = e as AppError
      error.value = {
        code: appError.code || 'NETWORK_ERROR',
        message: appError.message || '載入歌詞時發生錯誤，請稍後再試',
        retryable: appError.retryable ?? true,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 重試載入
   */
  async function retry(): Promise<void> {
    if (lastSongId.value) {
      await fetchLyrics(lastSongId.value)
    }
  }

  /**
   * 清除錯誤
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * 重設狀態
   */
  function reset(): void {
    song.value = null
    loading.value = false
    error.value = null
    lastSongId.value = null
  }

  return {
    // 狀態
    song,
    loading,
    error,

    // 計算屬性
    hasError,
    hasSong,
    isRetryable,

    // 方法
    fetchLyrics,
    retry,
    clearError,
    reset,
  }
}

export default useLyrics
