// useAutoScroll composable
// 當歌詞高亮完成後，自動捲動到第一個 <mark> 元素

import { watch, nextTick } from 'vue'
import type { Ref } from 'vue'

/**
 * 自動捲動到歌詞第一個高亮位置
 *
 * @param hasHighlight - 是否有高亮關鍵字（computed ref）
 * @param isLoading - 是否正在載入（用於避免在 DOM 未就緒時捲動）
 * @param songId - 可選的歌曲 ID ref，當 ID 變更（同頁導航）時重新觸發捲動
 */
export function useAutoScroll(
  hasHighlight: Ref<boolean>,
  isLoading: Ref<boolean>,
  songId?: Ref<string | undefined | null>
) {
  const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  }

  const scrollToFirstMark = () => {
    if (!hasHighlight.value || isLoading.value) return

    // 等待 DOM 更新後再查詢
    void nextTick(() => {
      const firstMark = document.querySelector('mark')
      if (firstMark) {
        firstMark.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'center'
        })
      } else if (hasHighlight.value) {
        console.debug('[useAutoScroll] no <mark> element found despite hasHighlight=true')
      }
    })
  }

  // 當高亮狀態、載入狀態或歌曲 ID 改變時觸發捲動（例如同頁導航至另一首歌）
  watch(
    [hasHighlight, isLoading, () => songId?.value],
    ([newHasHighlight, newIsLoading]) => {
      if (newHasHighlight && !newIsLoading) {
        scrollToFirstMark()
      }
    },
    { immediate: true }
  )

  return { scrollToFirstMark }
}
