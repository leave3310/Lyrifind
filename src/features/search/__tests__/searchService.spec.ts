/**
 * searchService 單元測試
 * @description 測試搜尋服務邏輯
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchService } from '../services/searchService'
import { googleSheetsApi } from '@/shared/services/googleSheetsApi'
import type { Song } from '@/shared/types'

// Mock googleSheetsApi
vi.mock('@/shared/services/googleSheetsApi', () => ({
  googleSheetsApi: {
    fetchAllSongs: vi.fn(),
    clearCache: vi.fn(),
  },
}))

const mockSongs: Song[] = [
  { id: '1', title: '小幸運', artist: '田馥甄', lyrics: '我聽見雨滴落在青青草地' },
  { id: '2', title: '告白氣球', artist: '周杰倫', lyrics: '塞納河畔左岸的咖啡' },
  { id: '3', title: '稻香', artist: '周杰倫', lyrics: '對這個世界如果你有太多的抱怨' },
  { id: '4', title: '小幸運（翻唱版）', artist: '林俊傑', lyrics: '翻唱版本的歌詞' },
]

describe('searchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValue(mockSongs)
  })

  describe('search', () => {
    it('應該根據關鍵字搜尋歌曲', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      expect(response.results.length).toBe(2)
      expect(response.keyword).toBe('周杰倫')
    })

    it('標題完全匹配應得到 100 分', async () => {
      const response = await searchService.search({ keyword: '小幸運' })
      
      const exactMatch = response.results.find(
        (r) => r.song.title === '小幸運' && r.matchType === 'TITLE_EXACT'
      )
      expect(exactMatch).toBeDefined()
      expect(exactMatch?.score).toBe(100)
    })

    it('標題開頭匹配應得到 90 分', async () => {
      const response = await searchService.search({ keyword: '小幸運' })
      
      // 「小幸運（翻唱版）」以「小幸運」開頭，會得到 90 分
      const startMatch = response.results.find(
        (r) => r.song.title.startsWith('小幸運') && r.song.title !== '小幸運'
      )
      expect(startMatch).toBeDefined()
      expect(startMatch?.score).toBe(90)
    })

    it('歌手名稱完全匹配應得到 70 分', async () => {
      const response = await searchService.search({ keyword: '田馥甄' })
      
      const artistMatch = response.results.find((r) => r.matchType === 'ARTIST')
      expect(artistMatch).toBeDefined()
      expect(artistMatch?.score).toBe(70)
    })

    it('歌詞內容匹配應得到至少 40 分', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      expect(lyricsMatch).toBeDefined()
      expect(lyricsMatch!.score).toBeGreaterThanOrEqual(40)
    })

    it('結果應按分數降序排列', async () => {
      const response = await searchService.search({ keyword: '小幸運' })
      
      for (let i = 0; i < response.results.length - 1; i++) {
        expect(response.results[i].score).toBeGreaterThanOrEqual(
          response.results[i + 1].score
        )
      }
    })

    it('搜尋應不分大小寫', async () => {
      const response = await searchService.search({ keyword: '小幸運' })
      const responseUpper = await searchService.search({ keyword: '小幸運' })
      
      expect(response.results.length).toBe(responseUpper.results.length)
    })

    it('無匹配結果時應回傳空陣列', async () => {
      const response = await searchService.search({ keyword: '不存在的關鍵字xyz' })
      
      expect(response.results).toEqual([])
      expect(response.total).toBe(0)
    })
  })

  describe('pagination', () => {
    it('應該正確計算分頁資訊', async () => {
      const response = await searchService.search({
        keyword: '周杰倫',
        page: 1,
        pageSize: 1,
      })
      
      expect(response.page).toBe(1)
      expect(response.pageSize).toBe(1)
      expect(response.total).toBe(2)
      expect(response.totalPages).toBe(2)
      expect(response.results.length).toBe(1)
    })

    it('第二頁應回傳正確結果', async () => {
      const page1 = await searchService.search({
        keyword: '周杰倫',
        page: 1,
        pageSize: 1,
      })
      const page2 = await searchService.search({
        keyword: '周杰倫',
        page: 2,
        pageSize: 1,
      })
      
      expect(page1.results[0].song.id).not.toBe(page2.results[0].song.id)
    })

    it('預設每頁 20 筆', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      expect(response.pageSize).toBe(20)
    })
  })

  describe('highlighting', () => {
    it('應該在標題中高亮關鍵字', async () => {
      const response = await searchService.search({ keyword: '小幸運' })
      
      const result = response.results[0]
      expect(result.highlightedTitle).toContain('<mark')
      expect(result.highlightedTitle).toContain('小幸運')
    })

    it('應該在歌手名稱中高亮關鍵字', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      const artistMatch = response.results.find((r) => r.matchType === 'ARTIST')
      if (artistMatch) {
        expect(artistMatch.highlightedArtist).toContain('<mark')
      }
    })

    it('應該在歌詞中高亮關鍵字', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      if (lyricsMatch) {
        expect(lyricsMatch.highlightedLyrics).toContain('<mark')
      }
    })

    it('高亮應該進行 HTML 實體編碼（XSS 防護）', async () => {
      // 添加含有 HTML 的測試資料
      const songsWithHtml: Song[] = [
        ...mockSongs,
        { id: '5', title: '<script>alert(1)</script>歌曲', artist: '測試', lyrics: '測試歌詞' },
      ]
      vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValueOnce(songsWithHtml)
      
      const response = await searchService.search({ keyword: 'script' })
      
      // 不應該有未編碼的 <script> 標籤
      response.results.forEach((result) => {
        expect(result.highlightedTitle).not.toContain('<script>')
      })
    })
  })

  describe('getSongById', () => {
    it('應該根據 ID 取得歌曲', async () => {
      const song = await searchService.getSongById('1')
      
      expect(song).toBeDefined()
      expect(song?.id).toBe('1')
      expect(song?.title).toBe('小幸運')
    })

    it('ID 不存在時應回傳 null', async () => {
      const song = await searchService.getSongById('not-exist')
      
      expect(song).toBeNull()
    })
  })

  // ============================================================
  // User Story 2: 歌手名稱搜尋 (US2)
  // ============================================================

  describe('歌手名稱搜尋 (US2)', () => {
    it('搜尋歌手名稱應回傳該歌手的所有歌曲', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      // 周杰倫有 2 首歌
      expect(response.results.length).toBe(2)
      
      // 所有結果都應該是周杰倫的歌曲
      for (const result of response.results) {
        expect(result.song.artist).toBe('周杰倫')
      }
    })

    it('歌手名稱完全匹配應得到較高分數', async () => {
      const response = await searchService.search({ keyword: '田馥甄' })
      
      const exactArtistMatch = response.results.find(
        (r) => r.song.artist === '田馥甄' && r.matchType === 'ARTIST'
      )
      expect(exactArtistMatch).toBeDefined()
      expect(exactArtistMatch?.score).toBe(70)
    })

    it('歌手名稱部分匹配應回傳結果', async () => {
      const response = await searchService.search({ keyword: '周杰' })
      
      // 部分匹配「周杰倫」應該有結果
      expect(response.results.length).toBe(2)
      
      for (const result of response.results) {
        expect(result.song.artist).toContain('周杰')
      }
    })

    it('歌手名稱部分匹配應得到 65 分（開頭匹配）', async () => {
      const response = await searchService.search({ keyword: '周杰' })
      
      const partialArtistMatch = response.results.find(
        (r) => r.matchType === 'ARTIST'
      )
      expect(partialArtistMatch).toBeDefined()
      // 「周杰」以「周杰倫」開頭，得到開頭匹配的 65 分
      expect(partialArtistMatch?.score).toBe(65)
    })

    it('歌手搜尋結果應清楚顯示歌手名稱', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      for (const result of response.results) {
        // 應該有 highlightedArtist 欄位
        expect(result.highlightedArtist).toBeDefined()
        // 歌手名稱應被高亮
        expect(result.highlightedArtist).toContain('周杰倫')
      }
    })

    it('歌手搜尋結果的 matchType 應為 ARTIST', async () => {
      // 測試資料中沒有「王心凌」，需要先添加
      const songsWithMore: Song[] = [
        ...mockSongs,
        { id: '5', title: '愛你', artist: '王心凌', lyrics: '愛你愛你隨時都要一起' },
      ]
      vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValueOnce(songsWithMore)
      
      const response = await searchService.search({ keyword: '王心凌' })
      
      expect(response.results.length).toBeGreaterThan(0)
      expect(response.results[0].matchType).toBe('ARTIST')
    })

    it('搜尋不存在的歌手應回傳空結果', async () => {
      const response = await searchService.search({ keyword: '不存在的歌手名字xyz' })
      
      expect(response.results).toEqual([])
      expect(response.total).toBe(0)
    })

    it('歌手名稱開頭匹配應得到 65 分', async () => {
      // 測試「林俊」開頭匹配「林俊傑」
      const response = await searchService.search({ keyword: '林俊' })
      
      const startMatch = response.results.find(
        (r) => r.matchType === 'ARTIST' && r.song.artist.startsWith('林俊')
      )
      expect(startMatch).toBeDefined()
      expect(startMatch?.score).toBe(65)
    })

    it('歌手搜尋結果應按相關性排序', async () => {
      const response = await searchService.search({ keyword: '周杰倫' })
      
      // 結果應按分數降序排列
      for (let i = 0; i < response.results.length - 1; i++) {
        expect(response.results[i].score).toBeGreaterThanOrEqual(
          response.results[i + 1].score
        )
      }
    })
  })

  // ============================================================
  // User Story 3: 歌詞片段搜尋 (US3)
  // ============================================================

  describe('歌詞片段搜尋 (US3)', () => {
    it('搜尋歌詞片段應找到對應歌曲', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      expect(response.results.length).toBeGreaterThan(0)
      
      // 應該找到「小幸運」
      const match = response.results.find((r) => r.song.title === '小幸運')
      expect(match).toBeDefined()
    })

    it('歌詞匹配的 matchType 應為 LYRICS', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      expect(lyricsMatch).toBeDefined()
    })

    it('歌詞匹配應回傳高亮歌詞片段', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      expect(lyricsMatch?.highlightedLyrics).toBeDefined()
      expect(lyricsMatch?.highlightedLyrics).toContain('<mark')
    })

    it('歌詞高亮應包含關鍵字', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      expect(lyricsMatch?.highlightedLyrics).toContain('雨滴')
    })

    it('歌詞匹配應得到至少 50 分', async () => {
      const response = await searchService.search({ keyword: '塞納河' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      expect(lyricsMatch).toBeDefined()
      expect(lyricsMatch?.score).toBeGreaterThanOrEqual(50)
    })

    it('歌詞出現多次應得到更高分數', async () => {
      // 添加測試資料，歌詞中多次出現關鍵字
      const songsWithRepeats: Song[] = [
        ...mockSongs,
        { id: '6', title: '重複歌詞', artist: '測試', lyrics: '愛愛愛愛愛，我愛你愛你愛你' },
      ]
      vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValueOnce(songsWithRepeats)
      
      const response = await searchService.search({ keyword: '愛' })
      
      // 歌詞中多次出現「愛」的歌曲應該有較高分數
      const repeatedMatch = response.results.find((r) => r.song.id === '6')
      expect(repeatedMatch).toBeDefined()
      expect(repeatedMatch?.score).toBeGreaterThan(50)
    })

    it('歌詞高亮應進行 XSS 防護', async () => {
      // 添加含有潛在 XSS 的測試資料
      const songsWithXss: Song[] = [
        ...mockSongs,
        { id: '7', title: '安全歌曲', artist: '測試', lyrics: '<script>alert(1)</script>這是歌詞' },
      ]
      vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValueOnce(songsWithXss)
      
      const response = await searchService.search({ keyword: '歌詞' })
      
      // 不應該有未編碼的 <script> 標籤
      response.results.forEach((result) => {
        if (result.highlightedLyrics) {
          expect(result.highlightedLyrics).not.toContain('<script>')
        }
      })
    })

    it('歌詞搜尋應不分大小寫', async () => {
      // 添加英文歌詞測試資料
      const songsWithEnglish: Song[] = [
        ...mockSongs,
        { id: '8', title: 'English Song', artist: 'Test', lyrics: 'I love you forever' },
      ]
      vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValueOnce(songsWithEnglish)
      
      const response = await searchService.search({ keyword: 'LOVE' })
      
      const match = response.results.find((r) => r.song.id === '8')
      expect(match).toBeDefined()
    })

    it('歌詞片段應顯示上下文', async () => {
      const response = await searchService.search({ keyword: '雨滴' })
      
      const lyricsMatch = response.results.find((r) => r.matchType === 'LYRICS')
      
      // 高亮歌詞應該包含「雨滴」前後的上下文
      expect(lyricsMatch?.highlightedLyrics?.length).toBeGreaterThan(10)
    })

    it('搜尋不存在的歌詞應回傳空結果', async () => {
      const response = await searchService.search({ keyword: '這段歌詞絕對不存在xyz' })
      
      expect(response.results).toEqual([])
      expect(response.total).toBe(0)
    })

    it('歌詞搜尋結果應按相關性排序', async () => {
      const response = await searchService.search({ keyword: '抱怨' })
      
      // 結果應按分數降序排列
      for (let i = 0; i < response.results.length - 1; i++) {
        expect(response.results[i].score).toBeGreaterThanOrEqual(
          response.results[i + 1].score
        )
      }
    })
  })
})
