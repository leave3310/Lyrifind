import { describe, it, expect } from 'vitest'

// 使用 vi.hoisted 避免提升問題
const mockHighlightText = vi.hoisted(() => vi.fn())
vi.mock('../utils/highlight-text', () => ({
  highlightText: mockHighlightText
}))

import { useLyricsHighlight } from '../composables/useLyricsHighlight'
import { ref } from 'vue'

describe('useLyricsHighlight', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('當 keyword 為 null 時應回傳空字串', () => {
    mockHighlightText.mockReturnValue('')
    const keyword = ref<string | null>(null)
    const lyrics = ref('這是一首小情歌')

    const { highlightedLyrics } = useLyricsHighlight(lyrics, keyword)

    expect(highlightedLyrics.value).toBe('')
    expect(mockHighlightText).not.toHaveBeenCalled()
  })

  it('當 lyrics 為空字串時應回傳空字串', () => {
    mockHighlightText.mockReturnValue('')
    const keyword = ref<string | null>('愛')
    const lyrics = ref('')

    const { highlightedLyrics } = useLyricsHighlight(lyrics, keyword)

    expect(highlightedLyrics.value).toBe('')
    expect(mockHighlightText).not.toHaveBeenCalled()
  })

  it('當有 keyword 和 lyrics 時應呼叫 highlightText', () => {
    const expectedHtml = '我<mark>愛</mark>你'
    mockHighlightText.mockReturnValue(expectedHtml)
    const keyword = ref<string | null>('愛')
    const lyrics = ref('我愛你')

    const { highlightedLyrics } = useLyricsHighlight(lyrics, keyword)

    // 先存取 .value 觸發 computed 計算，再驗證 mock 被呼叫
    expect(highlightedLyrics.value).toBe(expectedHtml)
    expect(mockHighlightText).toHaveBeenCalledWith('我愛你', '愛')
  })

  it('hasHighlight 在有 keyword 且有 lyrics 時應回傳 true', () => {
    mockHighlightText.mockReturnValue('<mark>愛</mark>')
    const keyword = ref<string | null>('愛')
    const lyrics = ref('我愛你')

    const { hasHighlight } = useLyricsHighlight(lyrics, keyword)

    expect(hasHighlight.value).toBe(true)
  })

  it('hasHighlight 在 keyword 為 null 時應回傳 false', () => {
    const keyword = ref<string | null>(null)
    const lyrics = ref('我愛你')

    const { hasHighlight } = useLyricsHighlight(lyrics, keyword)

    expect(hasHighlight.value).toBe(false)
  })

  it('當 keyword 改變時應自動重新計算高亮', () => {
    mockHighlightText.mockReturnValue('<mark>愛</mark>')
    const keyword = ref<string | null>(null)
    const lyrics = ref('我愛你')

    const { hasHighlight } = useLyricsHighlight(lyrics, keyword)
    expect(hasHighlight.value).toBe(false)

    keyword.value = '愛'
    expect(hasHighlight.value).toBe(true)
  })
})
