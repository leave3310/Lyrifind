// T020: 單元測試 - searchService.search 基本功能
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchService } from '../services/searchService'
import type { SearchQuery, SearchResponse } from '../types'

describe('SearchService', () => {
  let searchService: SearchService
  
  beforeEach(() => {
    searchService = new SearchService()
    // 清除所有 mock
    vi.clearAllMocks()
  })

  describe('search', () => {
    it('應正確發送搜尋請求並返回結果', async () => {
      const mockResponse: SearchResponse = {
        items: [
          {
            song: {
              id: 'song-001',
              artist: '周杰倫',
              title: '青花瓷',
              lyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝'
            },
            lyricsSnippet: null,
            highlightedSnippet: null
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }

      // Mock fetch
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response))

      const query: SearchQuery = {
        query: '青花瓷',
        page: 1,
        pageSize: 20
      }

      const result = await searchService.search(query)

      expect(result).toEqual(mockResponse)
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
    })

    it('應在 API 回應錯誤時拋出例外', async () => {
      // Mock fetch 回傳錯誤
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: '搜尋失敗' } })
      } as Response))

      const query: SearchQuery = {
        query: '測試',
        page: 1
      }

      await expect(searchService.search(query)).rejects.toThrow('搜尋失敗')
    })

    it('應使用預設分頁參數', async () => {
      const mockResponse: SearchResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)
      
      vi.stubGlobal('fetch', mockFetch)

      const query: SearchQuery = {
        query: '測試'
        // 不提供 page 和 pageSize
      }

      await searchService.search(query)

      // 驗證呼叫時使用了預設值
      expect(mockFetch).toHaveBeenCalled()
      const fetchCall = mockFetch.mock.calls[0]?.[0]
      expect(fetchCall).toContain('page=1')
      expect(fetchCall).toContain('pageSize=20')
    })
  })

  describe('getSongById', () => {
    it('應正確取得歌曲資訊', async () => {
      const mockSong = {
        id: 'song-001',
        artist: '周杰倫',
        title: '青花瓷',
        lyrics: '素胚勾勒出青花筆鋒濃轉淡'
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSong
      } as Response))

      const result = await searchService.getSongById('song-001')

      expect(result).toEqual(mockSong)
    })

    it('應在歌曲不存在時返回 null', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      } as Response))

      const result = await searchService.getSongById('non-existent')

      expect(result).toBeNull()
    })

    it('應在其他錯誤時拋出例外', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      } as Response))

      await expect(searchService.getSongById('song-001')).rejects.toThrow('取得歌曲失敗')
    })
  })
})
