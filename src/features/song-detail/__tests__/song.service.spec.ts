import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SongService } from '../services/song.service'
import type { Song } from '@/shared/types/common.types'

// 模擬 fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// 模擬環境變數
vi.stubEnv('VITE_APPS_SCRIPT_URL', 'https://example.com/api')

const mockSong: Song = {
  id: 'song-001',
  artist: '蘇打綠',
  title: '小情歌',
  lyrics: '這是一首簡單的小情歌\n唱著人們心腸\n他說把我的憂愁'
}

describe('SongService', () => {
  let service: SongService

  beforeEach(() => {
    service = new SongService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSongById()', () => {
    it('應成功取得歌曲資訊', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSong
      })

      const result = await service.getSongById('song-001')

      expect(result).toEqual(mockSong)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('action=getSong')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('id=song-001')
      )
    })

    it('應在歌曲不存在時回傳 null（404 回應）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { code: 'SONG_NOT_FOUND', message: '找不到此歌曲' } })
      })

      const result = await service.getSongById('invalid-id')

      expect(result).toBeNull()
    })

    it('應在 API 回傳 SONG_NOT_FOUND 錯誤時回傳 null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ error: { code: 'SONG_NOT_FOUND', message: '找不到此歌曲' } })
      })

      const result = await service.getSongById('invalid-id')

      expect(result).toBeNull()
    })

    it('應在網路錯誤時拋出例外', async () => {
      mockFetch.mockRejectedValueOnce(new Error('網路連線失敗'))

      await expect(service.getSongById('song-001')).rejects.toThrow('網路連線失敗')
    })

    it('應在伺服器錯誤時拋出例外', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: '伺服器內部錯誤' } })
      })

      await expect(service.getSongById('song-001')).rejects.toThrow('伺服器內部錯誤')
    })

    it('應在 200 OK 但 error.code 非 SONG_NOT_FOUND 時拋出 error.message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ error: { code: 'INTERNAL_ERROR', message: '伺服器內部錯誤 (200)' } })
      })

      await expect(service.getSongById('song-001')).rejects.toThrow('伺服器內部錯誤 (200)')
    })

    it('應將包含特殊字元的 id 正確編碼於 URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSong
      })

      const specialId = 'a/b?c#d'
      await service.getSongById(specialId)

      const calledUrl = mockFetch.mock.calls[0][0] as string
      // URLSearchParams 應將 / ? # 編碼
      expect(calledUrl).toContain('id=a%2Fb%3Fc%23d')
      expect(calledUrl).not.toContain('id=a/b?c#d')
    })

    it('應在回應無法解析時拋出預設錯誤訊息', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('JSON parse error') }
      })

      await expect(service.getSongById('song-001')).rejects.toThrow('取得歌曲失敗，請稍後再試')
    })
  })
})
