import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAutoScroll } from '../composables/useAutoScroll'

describe('useAutoScroll', () => {
  let mockScrollIntoView: ReturnType<typeof vi.fn>
  let mockQuerySelector: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockScrollIntoView = vi.fn()
    mockQuerySelector = vi.fn()

    // 模擬 document.querySelector
    vi.spyOn(document, 'querySelector').mockImplementation(mockQuerySelector)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('當有高亮關鍵字時應呼叫 scrollIntoView', async () => {
    const mockMarkElement = {
      scrollIntoView: mockScrollIntoView,
      tagName: 'MARK'
    }
    mockQuerySelector.mockReturnValue(mockMarkElement)

    const hasHighlight = ref(true)
    const isLoading = ref(false)

    useAutoScroll(hasHighlight, isLoading)

    await nextTick()

    expect(document.querySelector).toHaveBeenCalledWith('mark')
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    })
  })

  it('當無高亮關鍵字時不應呼叫 scrollIntoView', async () => {
    mockQuerySelector.mockReturnValue(null)

    const hasHighlight = ref(false)
    const isLoading = ref(false)

    useAutoScroll(hasHighlight, isLoading)

    await nextTick()

    expect(mockScrollIntoView).not.toHaveBeenCalled()
  })

  it('當找不到 mark 元素時不應拋出錯誤', async () => {
    mockQuerySelector.mockReturnValue(null)

    const hasHighlight = ref(true)
    const isLoading = ref(false)

    expect(() => useAutoScroll(hasHighlight, isLoading)).not.toThrow()

    await nextTick()

    expect(mockScrollIntoView).not.toHaveBeenCalled()
  })

  it('在載入中時不應執行捲動', async () => {
    const mockMarkElement = {
      scrollIntoView: mockScrollIntoView,
      tagName: 'MARK'
    }
    mockQuerySelector.mockReturnValue(mockMarkElement)

    const hasHighlight = ref(true)
    const isLoading = ref(true)

    useAutoScroll(hasHighlight, isLoading)

    await nextTick()

    // 載入中時不應捲動
    expect(mockScrollIntoView).not.toHaveBeenCalled()
  })

  it('當載入由 true 轉為 false 且有 mark 時應觸發 scrollIntoView', async () => {
    const mockMarkElement = {
      scrollIntoView: mockScrollIntoView,
      tagName: 'MARK'
    }
    mockQuerySelector.mockReturnValue(mockMarkElement)

    const hasHighlight = ref(true)
    const isLoading = ref(true)

    useAutoScroll(hasHighlight, isLoading)
    await nextTick()
    // 載入中尚未捲動
    expect(mockScrollIntoView).not.toHaveBeenCalled()

    // 模擬載入完成
    isLoading.value = false
    await nextTick()
    await nextTick()

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    })
  })

  it('當 prefers-reduced-motion: reduce 時應使用 behavior: "auto"', async () => {
    const mockMarkElement = {
      scrollIntoView: mockScrollIntoView,
      tagName: 'MARK'
    }
    mockQuerySelector.mockReturnValue(mockMarkElement)

    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null
    }))
    vi.stubGlobal('matchMedia', matchMediaMock)

    const hasHighlight = ref(true)
    const isLoading = ref(false)

    useAutoScroll(hasHighlight, isLoading)
    await nextTick()
    await nextTick()

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center'
    })

    vi.unstubAllGlobals()
  })
})
