<template>
  <main class="song-detail-page max-w-4xl mx-auto px-4 py-8">
    <BackButton @click="goBack" />

    <!-- 載入中 -->
    <LoadingState v-if="isLoading" />

    <!-- 歌曲不存在 -->
    <ErrorState
      v-else-if="error && !song"
      type="not-found"
      data-testid="song-not-found"
      @back="goBack"
    />

    <!-- 其他錯誤 -->
    <ErrorState
      v-else-if="error && song"
      type="error"
      :message="error"
      data-testid="song-detail-error"
      @retry="loadSong"
    />

    <!-- 歌曲詳細內容 -->
    <article v-else-if="song" class="song-detail">
      <SongHeader :title="song.title" :artist="song.artist" />
      <LyricsContent :lyrics="song.lyrics" :highlighted-lyrics="highlightedLyrics" />
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTitle } from '@vueuse/core'
import { useSongDetail } from './composables/useSongDetail'
import { useLyricsHighlight } from './composables/useLyricsHighlight'
import { useAutoScroll } from './composables/useAutoScroll'
import BackButton from './components/BackButton.vue'
import LoadingState from './components/LoadingState.vue'
import ErrorState from './components/ErrorState.vue'
import SongHeader from './components/SongHeader.vue'
import LyricsContent from './components/LyricsContent.vue'

const { song, isLoading, error, highlightKeyword, goBack, loadSong } = useSongDetail()

// 歌詞文字 ref（供 useLyricsHighlight 使用）
const lyricsText = computed(() => song.value?.lyrics ?? '')

// 高亮邏輯
const { hasHighlight, highlightedLyrics } = useLyricsHighlight(lyricsText, highlightKeyword)

// 自動捲動到第一個高亮位置（依賴高亮完成後觸發）
useAutoScroll(hasHighlight, isLoading)

// 動態設定頁面標題
useTitle(computed(() =>
  song.value ? `${song.value.title} - ${song.value.artist} | LyriFind` : 'LyriFind'
))
</script>
