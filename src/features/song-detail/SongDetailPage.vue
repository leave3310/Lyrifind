<template>
  <main class="song-detail-page max-w-4xl mx-auto px-4 py-8">
    <BackButton @click="goBack" />

    <!-- 載入中 -->
    <LoadingState v-if="state.status === 'loading'" />

    <!-- 錯誤狀態 -->
    <ErrorState
      v-else-if="state.status === 'error'"
      type="error"
      :message="state.message"
      data-testid="song-detail-error"
      @retry="loadSong"
      @back="goBack"
    />

    <!-- 歌曲詳細內容 -->
    <article v-else class="song-detail">
      <SongHeader :title="state.song.title" :artist="state.song.artist" />
      <LyricsContent
        :lyrics="state.song.lyrics"
        :highlighted-lyrics="state.highlightedLyrics"
      />
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTitle } from '@vueuse/core'
import { useSongDetail } from './composables/useSongDetail'
import { useAutoScroll } from './composables/useAutoScroll'
import BackButton from './components/BackButton.vue'
import LoadingState from './components/LoadingState.vue'
import ErrorState from './components/ErrorState.vue'
import SongHeader from './components/SongHeader.vue'
import LyricsContent from './components/LyricsContent.vue'

const { state, goBack, loadSong } = useSongDetail()

// 衍生 refs 以相容當前 useAutoScroll 簽名；
// 另一個 agent 將更新 useAutoScroll 直接消費 state shape。
const hasHighlight = computed(
  () => state.value.status === 'loaded' && !!state.value.highlightKeyword
)
const isLoading = computed(() => state.value.status === 'loading')
useAutoScroll(hasHighlight, isLoading)

// 動態設定頁面標題
useTitle(
  computed(() =>
    state.value.status === 'loaded'
      ? `${state.value.song.title} - ${state.value.song.artist} | LyriFind`
      : 'LyriFind'
  )
)
</script>
