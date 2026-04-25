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
    const { state } = useSongDetail()
    expect(state.value.status).toBe('loading')
  })

  it('應成功載入歌曲後設定 loaded 狀態', async () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { state, loadSong } = useSongDetail()

    await loadSong()

    expect(state.value.status).toBe('loaded')
    if (state.value.status === 'loaded') {
      expect(state.value.song).toEqual(mockSong)
    }
  })

  it('應在歌曲不存在時設定 error 狀態', async () => {
    mockGetSongById.mockResolvedValueOnce(null)
    const { state, loadSong } = useSongDetail()

    await loadSong()

    expect(state.value.status).toBe('error')
    if (state.value.status === 'error') {
      expect(state.value.message).toBeTruthy()
    }
  })

  it('應在 API 發生錯誤時設定 error 訊息', async () => {
    mockGetSongById.mockRejectedValueOnce(new Error('網路連線失敗'))
    const { state, loadSong } = useSongDetail()

    await loadSong()

    expect(state.value.status).toBe('error')
    if (state.value.status === 'error') {
      expect(state.value.message).toContain('網路連線失敗')
    }
  })

  it('應從 URL query 讀取 highlight 關鍵字', async () => {
    mockRoute.query = { highlight: '簡單' }
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { state, loadSong } = useSongDetail()

    await loadSong()
    await nextTick()

    expect(state.value.status).toBe('loaded')
    if (state.value.status === 'loaded') {
      expect(state.value.highlightKeyword).toBe('簡單')
    }
  })

  it('應在 highlight query 為空時 highlightKeyword 為 null', async () => {
    mockRoute.query = { highlight: '' }
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { state, loadSong } = useSongDetail()

    await loadSong()
    await nextTick()

    expect(state.value.status).toBe('loaded')
    if (state.value.status === 'loaded') {
      expect(state.value.highlightKeyword).toBeNull()
    }
  })

  it('goBack 應在 history 長度大於 1 時呼叫 router.back()', async () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const originalLength = window.history.length
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: 5
    })

    const { goBack } = useSongDetail()
    goBack()

    expect(mockRouter.back).toHaveBeenCalled()

    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: originalLength
    })
  })

  it('應在 route.params.id 缺失時設定 error 狀態且不呼叫 service', async () => {
    mockRoute.params = {} as Record<string, string>
    const { state, loadSong } = useSongDetail()

    await loadSong()

    expect(state.value.status).toBe('error')
    if (state.value.status === 'error') {
      expect(state.value.message).toBe('無效的歌曲 ID')
    }
    expect(mockGetSongById).not.toHaveBeenCalled()
  })

  it('應在 route.params.id 為陣列時設定 error 狀態且不呼叫 service', async () => {
    mockRoute.params = { id: ['a', 'b'] } as unknown as Record<string, string>
    const { state, loadSong } = useSongDetail()

    await loadSong()

    expect(state.value.status).toBe('error')
    if (state.value.status === 'error') {
      expect(state.value.message).toBe('無效的歌曲 ID')
    }
    expect(mockGetSongById).not.toHaveBeenCalled()
  })

  it('應在 route.query.highlight 為陣列時 highlightKeyword 為 null', async () => {
    mockRoute.query = { highlight: ['a', 'b'] } as unknown as Record<string, string>
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const { state, loadSong } = useSongDetail()

    await loadSong()
    await nextTick()

    expect(state.value.status).toBe('loaded')
    if (state.value.status === 'loaded') {
      expect(state.value.highlightKeyword).toBeNull()
    }
  })

  it('goBack 應在 history 長度為 1 時呼叫 router.push("/") 而非 router.back()', async () => {
    mockGetSongById.mockResolvedValueOnce(mockSong)
    const originalLength = window.history.length
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: 1
    })

    const { goBack } = useSongDetail()
    goBack()

    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(mockRouter.back).not.toHaveBeenCalled()

    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: originalLength
    })
  })
})
