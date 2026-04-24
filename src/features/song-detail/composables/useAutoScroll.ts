// useAutoScroll composable
// 當歌詞高亮完成後，自動捲動到第一個 <mark> 元素

import { watch, nextTick } from 'vue'
import type { Ref } from 'vue'

/**
 * 自動捲動到歌詞第一個高亮位置
 *
 * @param hasHighlight - 是否有高亮關鍵字（computed ref）
 * @param isLoading - 是否正在載入（用於避免在 DOM 未就緒時捲動）
 */
export function useAutoScroll(
  hasHighlight: Ref<boolean>,
  isLoading: Ref<boolean>
) {
  const scrollToFirstMark = () => {
    if (!hasHighlight.value || isLoading.value) return

    // 等待 DOM 更新後再查詢
    void nextTick(() => {
      const firstMark = document.querySelector('mark')
      if (firstMark) {
        firstMark.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    })
  }

  // 當高亮狀態或載入狀態改變時觸發捲動
  watch(
    [hasHighlight, isLoading],
    ([newHasHighlight, newIsLoading]) => {
      if (newHasHighlight && !newIsLoading) {
        scrollToFirstMark()
      }
    },
    { immediate: true }
  )

  return { scrollToFirstMark }
}
