<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 返回按鈕 -->
      <button
        @click="handleBack"
        class="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span class="font-medium">返回</span>
      </button>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="py-12">
        <LoadingSpinner data-testid="loading-spinner" />
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="py-8">
        <ErrorMessage
          data-testid="error-message"
          :message="errorMessage"
          show-retry
          @retry="retry"
        />
      </div>

      <!-- 歌詞內容 -->
      <div v-else-if="song">
        <SongHeader :title="song.title" :artist="song.artist" />
        <LyricsContent :lyrics="song.lyrics" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLyrics } from '../composables/useLyrics'
import SongHeader from '../components/SongHeader.vue'
import LyricsContent from '../components/LyricsContent.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()

// 從路由參數取得歌曲 ID
const songId = route.params.id as string

// 使用歌詞 composable
const { song, isLoading, error, retry } = useLyrics(songId)

// 錯誤訊息
const errorMessage = computed(() => {
  if (!error.value) return ''
  return error.value.message || '載入失敗，請稍後再試'
})

// 返回處理
const handleBack = () => {
  // 如果有 history 記錄，使用 back()
  if (window.history.length > 1) {
    router.back()
  } else {
    // 否則導向搜尋頁
    router.push('/search')
  }
}
</script>
