// useLyricsHighlight composable
// 負責歌詞高亮邏輯：依關鍵字生成帶 <mark> 標籤的 HTML

import { computed } from 'vue'
import type { Ref } from 'vue'
import { highlightText } from '../utils/highlight-text'

interface HighlightResult {
  html: string
  ok: boolean
}

export function useLyricsHighlight(
  lyrics: Ref<string>,
  keyword: Ref<string | null>
) {
  /**
   * 內部計算：嘗試套用高亮，並標示是否成功
   * - 若無關鍵字或歌詞為空：html 為空字串、ok 為 false
   * - 若 regex 建構失敗（例如非預期的特殊字元組合）：fallback 回原歌詞、ok 為 false
   */
  const result = computed<HighlightResult>(() => {
    if (!keyword.value || !lyrics.value) {
      return { html: '', ok: false }
    }
    try {
      return { html: highlightText(lyrics.value, keyword.value), ok: true }
    } catch (err) {
      console.warn('[useLyricsHighlight] regex build failed', err)
      return { html: lyrics.value, ok: false }
    }
  })

  /** 是否有有效的高亮關鍵字（且高亮計算成功） */
  const hasHighlight = computed<boolean>(() => {
    if (!keyword.value || !lyrics.value) return false
    return result.value.ok
  })

  /**
   * 套用高亮標記後的歌詞 HTML 字串
   * - 若無關鍵字或歌詞為空，回傳空字串
   * - 否則回傳包含 <mark> 標籤的 HTML（高亮失敗時則為原始歌詞）
   */
  const highlightedLyrics = computed<string>(() => result.value.html)

  return {
    hasHighlight,
    highlightedLyrics
  }
}
