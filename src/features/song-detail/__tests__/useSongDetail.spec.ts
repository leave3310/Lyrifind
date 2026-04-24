import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

// 使用 vi.hoisted 避免提升問題
const mockGetSongById = vi.hoisted(() => vi.fn())

// 模擬 SongService
vi.mock('../services/song.service', () => ({
  songService: {
    getSongById: mockGetSongById
  }
}))

// 模擬 Vue Router
const mockRoute = vi.hoisted(() => ({
  params: { id: 'song-001' } as Record<string, string>,
  query: {} as Record<string, string>
}))
const mockRouter = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn()
}))
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

import { useSongDetail } from '../composables/useSongDetail'

const mockSong = {
  id: 'song-001',
  artist: '蘇打綠',
  title: '小情歌',
  lyrics: '這是一首簡單的小情歌\n唱著人們心腸'
}

describe('useSongDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockRoute.params = { id: 'song-001' }
    mockRoute.query = {}
  })

  it('應在初始化時開始載入', () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { isLoading } = useSongDetail()
    expect(isLoading.value).toBe(true)
  })

  it('應成功載入歌曲後設定 song', async () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { song, isLoading, loadSong } = useSongDetail()

    await loadSong()

    expect(song.value).toEqual(mockSong)
    expect(isLoading.value).toBe(false)
  })

  it('應在歌曲不存在時設定 error', async () => {
    mockGetSongById.mockResolvedValueOnce(null)
    const { song, error, isLoading, loadSong } = useSongDetail()

    await loadSong()

    expect(song.value).toBeNull()
    expect(error.value).toBeTruthy()
    expect(isLoading.value).toBe(false)
  })

  it('應在 API 發生錯誤時設定 error 訊息', async () => {
    mockGetSongById.mockRejectedValueOnce(new Error('網路連線失敗'))
    const { error, isLoading, loadSong } = useSongDetail()

    await loadSong()

    expect(error.value).toContain('網路連線失敗')
    expect(isLoading.value).toBe(false)
  })

  it('應從 URL query 讀取 highlight 關鍵字', async () => {
    mockRoute.query = { highlight: '簡單' }
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { highlightKeyword } = useSongDetail()

    await nextTick()

    expect(highlightKeyword.value).toBe('簡單')
  })

  it('應在 highlight query 為空時回傳 null', async () => {
    mockRoute.query = { highlight: '' }
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { highlightKeyword } = useSongDetail()

    await nextTick()

    expect(highlightKeyword.value).toBeNull()
  })

  it('goBack 應呼叫 router.back()', async () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { goBack } = useSongDetail()

    goBack()

    expect(mockRouter.back).toHaveBeenCalled()
  })
})
