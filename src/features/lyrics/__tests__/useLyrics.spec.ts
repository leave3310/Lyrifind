/**
 * useLyrics composable 單元測試
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createTestQueryClient } from '@/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { useLyrics } from '../composables/useLyrics'

// Mock apiClient
vi.mock('@/shared/services/apiClient', () => ({
  apiClient: {
    getById: vi.fn(),
  },
}))

describe('useLyrics', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('應該初始化為空狀態', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )

    expect(wrapper.vm.song).toBeNull()
  })

  it('應該正確載入歌曲資料', async () => {
    const mockSong = {
      id: '1',
      artist: 'Beyond',
      title: '海闊天空',
      lyrics: '今天我 寒夜裡看雪飄過',
    }

    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.getById).mockResolvedValueOnce({
      status: 200,
      body: mockSong,
      headers: {},
    })

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )

    await vi.waitFor(() => expect(wrapper.vm.song).toEqual(mockSong), { timeout: 1000 })
  })

  it('應該處理歌曲不存在的情況', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.getById).mockResolvedValueOnce({
      status: 404,
      body: { message: '找不到此歌曲' },
      headers: {},
    })

    mount(
      defineComponent({
        setup() {
          const result = useLyrics('999')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )

    // 驗證 API 被呼叫，表示查詢已執行
    await vi.waitFor(() => {
      expect(apiClient.getById).toHaveBeenCalledWith({ params: { id: '999' } })
    }, { timeout: 2000, interval: 100 })
  })

  it('應該處理 API 錯誤', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.getById).mockRejectedValueOnce(new Error('網路錯誤'))

    mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )

    // 驗證 API 被呼叫，表示查詢已執行
    await vi.waitFor(() => {
      expect(apiClient.getById).toHaveBeenCalledWith({ params: { id: '1' } })
    }, { timeout: 2000, interval: 100 })
  })

  it('應該支援重試功能', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    const mockSong = {
      id: '1',
      artist: 'Beyond',
      title: '海闊天空',
      lyrics: '歌詞內容',
    }

    vi.mocked(apiClient.getById).mockResolvedValueOnce({
      status: 200,
      body: mockSong,
      headers: {},
    })

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )

    await wrapper.vm.retry()
    await vi.waitFor(() => expect(wrapper.vm.song).toEqual(mockSong), { timeout: 1000 })
  })

  it('應該使用 30 分鐘的 staleTime', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.getById).mockResolvedValue({
      status: 200,
      body: {
        id: '1',
        artist: 'Beyond',
        title: '海闊天空',
        lyrics: '歌詞內容',
      },
      headers: {},
    })

    mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )
    await vi.waitFor(() => expect(apiClient.getById).toHaveBeenCalledTimes(1), { timeout: 1000 })

    // 第二次查詢應使用快取，不會再次呼叫 API
    mount(
      defineComponent({
        setup() {
          const result = useLyrics('1')
          return { ...result }
        },
        render: () => h('div'),
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }]],
        },
      }
    )
    await vi.waitFor(() => expect(apiClient.getById).toHaveBeenCalledTimes(1), { timeout: 1000 })
  })
})
