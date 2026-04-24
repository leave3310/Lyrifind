<template>
  <section
    class="lyrics-container bg-gray-50 rounded-lg p-4 sm:p-6"
    data-testid="song-detail-lyrics"
    aria-labelledby="lyrics-heading"
  >
    <h2 id="lyrics-heading" class="text-lg font-semibold text-gray-900 mb-4">歌詞</h2>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      class="whitespace-pre-wrap text-sm sm:text-base text-gray-700 leading-relaxed"
      v-html="displayLyrics"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 原始歌詞文字 */
  lyrics: string
  /** 套用高亮後的 HTML（若有關鍵字則傳入） */
  highlightedLyrics?: string
}>()

// 優先使用高亮版本，否則使用原始歌詞（轉義 HTML 特殊字元）
const displayLyrics = computed(() => {
  if (props.highlightedLyrics) return props.highlightedLyrics
  // 無高亮時將換行轉為 HTML，並對原始文字進行基本 HTML 跳脫
  return props.lyrics
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
})
</script>
