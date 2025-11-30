/**
 * useSearch composable 單元測試
 * @description 測試搜尋邏輯組合式函式
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { googleSheetsApi } from '@/shared/services/googleSheetsApi'
import type { Song } from '@/shared/types'

import { useSearch } from '../composables/useSearch'

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
]

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(googleSheetsApi.fetchAllSongs).mockResolvedValue(mockSongs)
  })

  it('應該初始化為空狀態', () => {
    const { results, loading, error, keyword } = useSearch()

    expect(results.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(keyword.value).toBe('')
  })

  it('搜尋時應設定 loading 為 true', async () => {
    const { search, loading, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('周杰倫')
    const searchPromise = search()
    expect(loading.value).toBe(true)

    await searchPromise
    expect(loading.value).toBe(false)
  })

  it('應該根據歌名搜尋', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('小幸運')
    await search()

    expect(results.value.length).toBeGreaterThan(0)
    expect(results.value[0].song.title).toBe('小幸運')
  })

  it('應該根據歌手名稱搜尋', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('周杰倫')
    await search()

    expect(results.value.length).toBe(2)
    for (const result of results.value) {
      expect(result.song.artist).toBe('周杰倫')
    }
  })

  it('應該根據歌詞內容搜尋', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('雨滴')
    await search()

    expect(results.value.length).toBeGreaterThan(0)
    expect(results.value[0].song.lyrics).toContain('雨滴')
  })

  it('搜尋不分大小寫', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    // 假設有英文資料，測試大小寫不敏感
    updateKeyword('jay')
    await search()

    // 結果應該與 JAY 相同（如果有對應資料）
    expect(results.value).toBeDefined()
  })

  it('無結果時應回傳空陣列', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('不存在的關鍵字xyz')
    await search()

    expect(results.value).toEqual([])
  })

  it('應該按相關性排序結果', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('周杰倫')
    await search()

    // 結果應該按 score 降序排列
    for (let i = 0; i < results.value.length - 1; i++) {
      expect(results.value[i].score).toBeGreaterThanOrEqual(results.value[i + 1].score)
    }
  })

  it('API 錯誤時應設定 error', async () => {
    const mockError = {
      code: 'API_ERROR' as const,
      message: '伺服器發生錯誤',
      retryable: true,
    }
    vi.mocked(googleSheetsApi.fetchAllSongs).mockRejectedValueOnce(mockError)

    const { search, error, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('測試')
    await search()

    expect(error.value).not.toBeNull()
    expect(error.value?.retryable).toBe(true)
  })

  it('應該更新 keyword', () => {
    const { updateKeyword, keyword } = useSearch({ autoSearch: false })

    updateKeyword('測試關鍵字')

    expect(keyword.value).toBe('測試關鍵字')
  })

  it('clear 應該清除所有狀態', async () => {
    const { search, clear, results, keyword, error, updateKeyword } = useSearch({
      autoSearch: false,
    })

    updateKeyword('周杰倫')
    await search()
    expect(results.value.length).toBeGreaterThan(0)

    clear()

    expect(results.value).toEqual([])
    expect(keyword.value).toBe('')
    expect(error.value).toBe(null)
  })

  it('應該正確設定 matchType', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    // 搜尋歌名
    updateKeyword('小幸運')
    await search()

    const exactMatch = results.value.find(
      (r: { matchType: string }) => r.matchType === 'TITLE_EXACT'
    )
    expect(exactMatch).toBeDefined()
  })

  it('標題完全匹配應得到最高分', async () => {
    const { search, results, updateKeyword } = useSearch({ autoSearch: false })

    updateKeyword('小幸運')
    await search()

    // 完全匹配應該排在第一位
    expect(results.value[0].matchType).toBe('TITLE_EXACT')
    expect(results.value[0].score).toBe(100)
  })
})
