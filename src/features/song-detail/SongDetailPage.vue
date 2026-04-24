<template>
  <main class="song-detail-page max-w-4xl mx-auto px-4 py-8">
    <BackButton @click="goBack" />

    <!-- 載入中 -->
    <LoadingState v-if="isLoading" />

    <!-- 錯誤狀態 -->
    <div
      v-else-if="error && song"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
      role="alert"
      aria-live="assertive"
      data-testid="song-detail-error"
    >
      <p>{{ error }}</p>
      <button
        class="mt-2 text-sm underline hover:no-underline"
        aria-label="重新載入歌曲資訊"
        @click="loadSong"
      >
        重試
      </button>
    </div>

    <!-- 歌曲不存在 -->
    <div
      v-else-if="error && !song"
      class="text-center py-12"
      data-testid="song-not-found"
      role="status"
      aria-live="polite"
    >
      <p class="text-gray-500 text-lg">找不到此歌曲</p>
      <button
        class="mt-4 text-blue-500 hover:text-blue-700 underline"
        aria-label="返回搜尋結果頁面"
        @click="goBack"
      >
        返回搜尋結果
      </button>
    </div>

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
import BackButton from './components/BackButton.vue'
import LoadingState from './components/LoadingState.vue'
import SongHeader from './components/SongHeader.vue'
import LyricsContent from './components/LyricsContent.vue'

const { song, isLoading, error, highlightKeyword, goBack, loadSong } = useSongDetail()

// 歌詞文字 ref（供 useLyricsHighlight 使用）
const lyricsText = computed(() => song.value?.lyrics ?? '')

// 高亮邏輯
const { highlightedLyrics } = useLyricsHighlight(lyricsText, highlightKeyword)

// 動態設定頁面標題
useTitle(computed(() =>
  song.value ? `${song.value.title} - ${song.value.artist} | LyriFind` : 'LyriFind'
))
</script>
