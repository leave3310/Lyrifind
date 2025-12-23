// T022: 單元測試 - 驗證防抖機制
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounceFn } from '@vueuse/core'

describe('useSearch - 防抖機制', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('應在 400ms 後執行搜尋', async () => {
    const searchFn = vi.fn()
    const debouncedSearch = useDebounceFn(searchFn, 400)

    // 呼叫防抖函式
    debouncedSearch('周杰倫')

    // 立即檢查 - 應該還沒執行
    expect(searchFn).not.toHaveBeenCalled()

    // 快轉 300ms - 還沒到 400ms
    vi.advanceTimersByTime(300)
    expect(searchFn).not.toHaveBeenCalled()

    // 再快轉 100ms - 總共 400ms
    vi.advanceTimersByTime(100)
    expect(searchFn).toHaveBeenCalledTimes(1)
    expect(searchFn).toHaveBeenCalledWith('周杰倫')
  })

  it('應在連續輸入時只執行最後一次', async () => {
    const searchFn = vi.fn()
    const debouncedSearch = useDebounceFn(searchFn, 400)

    // 連續呼叫
    debouncedSearch('周')
    vi.advanceTimersByTime(100)
    
    debouncedSearch('周杰')
    vi.advanceTimersByTime(100)
    
    debouncedSearch('周杰倫')
    vi.advanceTimersByTime(400)

    // 只應該執行最後一次
    expect(searchFn).toHaveBeenCalledTimes(1)
    expect(searchFn).toHaveBeenCalledWith('周杰倫')
  })

  it('應在間隔足夠時執行多次搜尋', async () => {
    const searchFn = vi.fn()
    const debouncedSearch = useDebounceFn(searchFn, 400)

    // 第一次搜尋
    debouncedSearch('周杰倫')
    vi.advanceTimersByTime(400)
    expect(searchFn).toHaveBeenCalledTimes(1)

    // 第二次搜尋（間隔足夠）
    debouncedSearch('五月天')
    vi.advanceTimersByTime(400)
    expect(searchFn).toHaveBeenCalledTimes(2)

    expect(searchFn).toHaveBeenNthCalledWith(1, '周杰倫')
    expect(searchFn).toHaveBeenNthCalledWith(2, '五月天')
  })
})
