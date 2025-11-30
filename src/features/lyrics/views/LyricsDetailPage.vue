<script setup lang="ts">
/**
 * 歌詞詳情頁面
 * @description 顯示完整歌詞內容
 */

import { watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { LyricsDetail, useLyrics } from '@/features/lyrics'

const route = useRoute()
const router = useRouter()

/** 歌詞邏輯 */
const {
  song,
  loading,
  error,
  fetchLyrics,
  retry,
} = useLyrics()

/** 從 URL 取得高亮關鍵字 */
const highlightKeyword = computed(() => route.query.q as string | undefined || '')

/** SEO Meta */
useHead({
  title: () => song.value ? `${song.value.title} - ${song.value.artist} | LyriFind` : '歌詞詳情 - LyriFind',
  meta: [
    {
      name: 'description',
      content: () => song.value
        ? `${song.value.title} - ${song.value.artist} 的歌詞`
        : '歌詞詳情',
    },
    {
      property: 'og:title',
      content: () => song.value ? `${song.value.title} - ${song.value.artist}` : '歌詞詳情',
    },
    {
      property: 'og:description',
      content: () => song.value
        ? `查看 ${song.value.title} 的完整歌詞`
        : '查看歌詞詳情',
    },
  ],
})

/**
 * 處理返回
 */
function handleBack(): void {
  const q = route.query.q as string | undefined
  if (q) {
    router.push({
      name: 'SearchResults',
      query: { q },
    })
  } else {
    router.push({ name: 'Home' })
  }
}

/**
 * 從 URL 取得歌曲 ID 並載入歌詞
 */
function loadLyrics(): void {
  const songId = route.params.id as string
  if (songId) {
    fetchLyrics(songId)
  }
}

// 監聽路由變化
watch(
  () => route.params.id,
  () => {
    loadLyrics()
  }
)

// 初始載入時取得歌詞
onMounted(() => {
  loadLyrics()
})
</script>

<template>
  <div class="lyrics-detail-page">
    <LyricsDetail
      :song="song"
      :loading="loading"
      :error="error"
      :highlight-keyword="highlightKeyword"
      @back="handleBack"
      @retry="retry"
    />
  </div>
</template>
