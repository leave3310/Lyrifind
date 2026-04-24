// useLyricsHighlight composable
// 負責歌詞高亮邏輯：依關鍵字生成帶 <mark> 標籤的 HTML

import { computed } from 'vue'
import type { Ref } from 'vue'
import { highlightText } from '../utils/highlight-text'

export function useLyricsHighlight(
  lyrics: Ref<string>,
  keyword: Ref<string | null>
) {
  /** 是否有有效的高亮關鍵字 */
  const hasHighlight = computed<boolean>(() =>
    !!keyword.value && !!lyrics.value
  )

  /**
   * 套用高亮標記後的歌詞 HTML 字串
   * - 若無關鍵字或歌詞為空，回傳空字串
   * - 否則回傳包含 <mark> 標籤的 HTML
   */
  const highlightedLyrics = computed<string>(() => {
    if (!keyword.value || !lyrics.value) return ''
    return highlightText(lyrics.value, keyword.value)
  })

  return {
    hasHighlight,
    highlightedLyrics
  }
}
