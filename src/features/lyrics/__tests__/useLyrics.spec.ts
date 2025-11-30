/**
 * useLyrics composable 單元測試
 * @description 測試歌詞獲取與狀態管理邏輯
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLyrics } from '../composables/useLyrics'
import * as lyricsService from '../services/lyricsService'
import type { Song } from '@/shared/types'

// Mock lyricsService
vi.mock('../services/lyricsService')

const mockedLyricsService = vi.mocked(lyricsService)

/** 測試用歌曲資料 */
const mockSong: Song = {
  id: '1',
  title: '測試歌曲',
  artist: '測試歌手',
  lyrics: '這是測試歌詞內容',
}

describe('useLyrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始狀態', () => {
    it('初始時 song 應為 null', () => {
      const { song } = useLyrics()
      expect(song.value).toBeNull()
    })

    it('初始時 loading 應為 false', () => {
      const { loading } = useLyrics()
      expect(loading.value).toBe(false)
    })

    it('初始時 error 應為 null', () => {
      const { error } = useLyrics()
      expect(error.value).toBeNull()
    })
  })

  describe('fetchLyrics', () => {
    it('呼叫 fetchLyrics 時應設定 loading 為 true', async () => {
      mockedLyricsService.getLyricsById.mockImplementation(
        () => new Promise(() => {}) // 永不 resolve 的 Promise
      )

      const { fetchLyrics, loading } = useLyrics()
      fetchLyrics('1')

      expect(loading.value).toBe(true)
    })

    it('成功獲取歌詞後應設定 song', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(mockSong)

      const { fetchLyrics, song } = useLyrics()
      await fetchLyrics('1')

      expect(song.value).toEqual(mockSong)
    })

    it('成功獲取後 loading 應為 false', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(mockSong)

      const { fetchLyrics, loading } = useLyrics()
      await fetchLyrics('1')

      expect(loading.value).toBe(false)
    })

    it('成功獲取後 error 應為 null', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(mockSong)

      const { fetchLyrics, error } = useLyrics()
      await fetchLyrics('1')

      expect(error.value).toBeNull()
    })

    it('獲取失敗時應設定 error', async () => {
      const mockError = {
        code: 'NETWORK_ERROR' as const,
        message: '網路連線失敗',
        retryable: true,
      }
      mockedLyricsService.getLyricsById.mockRejectedValue(mockError)

      const { fetchLyrics, error } = useLyrics()
      await fetchLyrics('1')

      expect(error.value).toEqual(mockError)
    })

    it('獲取失敗後 loading 應為 false', async () => {
      mockedLyricsService.getLyricsById.mockRejectedValue(new Error('錯誤'))

      const { fetchLyrics, loading } = useLyrics()
      await fetchLyrics('1')

      expect(loading.value).toBe(false)
    })

    it('獲取失敗後 song 應為 null', async () => {
      mockedLyricsService.getLyricsById.mockRejectedValue(new Error('錯誤'))

      const { fetchLyrics, song } = useLyrics()
      await fetchLyrics('1')

      expect(song.value).toBeNull()
    })

    it('找不到歌曲時應設定 NOT_FOUND 錯誤', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(null)

      const { fetchLyrics, error } = useLyrics()
      await fetchLyrics('non-existent')

      expect(error.value?.code).toBe('NOT_FOUND')
    })
  })

  describe('clearError', () => {
    it('應能清除錯誤狀態', async () => {
      mockedLyricsService.getLyricsById.mockRejectedValue(new Error('錯誤'))

      const { fetchLyrics, clearError, error } = useLyrics()
      await fetchLyrics('1')

      expect(error.value).not.toBeNull()

      clearError()
      expect(error.value).toBeNull()
    })
  })

  describe('retry', () => {
    it('retry 應重新呼叫 fetchLyrics', async () => {
      mockedLyricsService.getLyricsById
        .mockRejectedValueOnce(new Error('第一次失敗'))
        .mockResolvedValueOnce(mockSong)

      const { fetchLyrics, retry, song, error } = useLyrics()

      // 第一次呼叫失敗
      await fetchLyrics('1')
      expect(error.value).not.toBeNull()
      expect(song.value).toBeNull()

      // 重試成功
      await retry()
      expect(song.value).toEqual(mockSong)
      expect(error.value).toBeNull()
    })

    it('retry 應使用上次的 songId', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(mockSong)

      const { fetchLyrics, retry } = useLyrics()
      await fetchLyrics('test-id')
      await retry()

      expect(mockedLyricsService.getLyricsById).toHaveBeenCalledTimes(2)
      expect(mockedLyricsService.getLyricsById).toHaveBeenNthCalledWith(2, 'test-id')
    })
  })

  describe('computed 狀態', () => {
    it('hasError 應正確反映錯誤狀態', async () => {
      mockedLyricsService.getLyricsById.mockRejectedValue(new Error('錯誤'))

      const { fetchLyrics, hasError } = useLyrics()

      expect(hasError.value).toBe(false)
      await fetchLyrics('1')
      expect(hasError.value).toBe(true)
    })

    it('hasSong 應正確反映歌曲狀態', async () => {
      mockedLyricsService.getLyricsById.mockResolvedValue(mockSong)

      const { fetchLyrics, hasSong } = useLyrics()

      expect(hasSong.value).toBe(false)
      await fetchLyrics('1')
      expect(hasSong.value).toBe(true)
    })

    it('isRetryable 應正確反映可重試狀態', async () => {
      const retryableError = {
        code: 'NETWORK_ERROR' as const,
        message: '網路連線失敗',
        retryable: true,
      }
      mockedLyricsService.getLyricsById.mockRejectedValue(retryableError)

      const { fetchLyrics, isRetryable } = useLyrics()
      await fetchLyrics('1')

      expect(isRetryable.value).toBe(true)
    })
  })
})
