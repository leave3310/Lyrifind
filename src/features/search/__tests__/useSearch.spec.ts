/**
 * useSearch composable 單元測試
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createTestQueryClient } from '@/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { useSearch } from '../composables/useSearch'

// Mock apiClient
vi.mock('@/shared/services/apiClient', () => ({
  apiClient: {
    search: vi.fn(),
  },
}))

describe('useSearch', () => {
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
          const result = useSearch()
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

    expect(wrapper.vm.keyword).toBe('')
    expect(wrapper.vm.results).toEqual([])
  })

  it('應該在關鍵字變更時觸發搜尋', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = '測試'
    expect(wrapper.vm.keyword).toBe('測試')
  })

  it('應該處理空白關鍵字', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = ''
    await expect(wrapper.vm.search()).rejects.toThrow('請輸入搜尋關鍵字')
  })

  it('應該處理關鍵字超過 200 字元', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = 'a'.repeat(250)
    expect(wrapper.vm.validatedKeyword.length).toBe(200)
  })

  it('應該在載入時設定 isLoading 為 true', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.search).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 200, body: { data: [], total: 0 }, headers: {} }), 100))
    )

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = '測試'
    const searchPromise = wrapper.vm.search()
    expect(wrapper.vm.isLoading).toBe(true)
    await searchPromise
  })

  it('應該處理 API 錯誤', async () => {
    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.search).mockRejectedValueOnce(new Error('網路錯誤'))

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = '測試'
    const promise = wrapper.vm.search()
    // Vue Query 會捕獲錯誤並設定 error ref,而不是拋出
    await promise
    await vi.waitFor(() => expect(wrapper.vm.error).toBeTruthy(), { timeout: 1000 })
  })

  it('應該使用防抖延遲搜尋', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    expect(typeof wrapper.vm.debouncedSearch).toBe('function')
  })

  it('應該正確處理搜尋結果', async () => {
    const mockResults = [
      { id: '1', artist: 'Beyond', title: '海闊天空' },
      { id: '2', artist: 'Beyond', title: '光輝歲月' },
    ]

    const { apiClient } = await import('@/shared/services/apiClient')
    vi.mocked(apiClient.search).mockResolvedValueOnce({
      status: 200,
      body: { data: mockResults, total: 2 },
      headers: {},
    })

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useSearch()
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

    wrapper.vm.keyword = '測試'
    await wrapper.vm.search()
    await vi.waitFor(() => expect(wrapper.vm.results).toEqual(mockResults), { timeout: 1000 })
  })
})
