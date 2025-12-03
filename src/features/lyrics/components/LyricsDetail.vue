<script setup lang="ts">
/**
 * LyricsDetail 元件
 * @description 歌詞詳細資訊元件
 */
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import type { AppError, Song } from '@/shared/types'

import LyricsContent from './LyricsContent.vue'

interface Props {
  /** 歌曲資料 */
  song: Song | null
  /** 是否正在載入 */
  loading?: boolean
  /** 錯誤資訊 */
  error?: AppError | null
  /** 高亮關鍵字 */
  highlightKeyword?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  highlightKeyword: '',
})

interface Emits {
  (e: 'back'): void
  (e: 'retry'): void
}

const emit = defineEmits<Emits>()

function handleBack(): void {
  emit('back')
}

function handleRetry(): void {
  emit('retry')
}
</script>

<template>
  <div class="lyrics-detail" data-testid="lyrics-detail">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-16"
      data-testid="lyrics-loading"
    >
      <LoadingSpinner size="large" />
      <p class="mt-4 text-gray-500">載入歌詞中...</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
      <div v-if="error.code === 'NOT_FOUND'" class="text-center" data-testid="not-found-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="mt-4 text-lg font-medium text-gray-700">找不到歌曲</p>
        <p class="mt-2 text-sm text-gray-500">{{ error.message }}</p>
        <button
          type="button"
          class="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          data-testid="back-button"
          @click="handleBack"
        >
          返回搜尋
        </button>
      </div>

      <div v-else class="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-16 w-16 text-red-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p class="mt-4 text-lg font-medium text-gray-700">發生錯誤</p>
        <p class="mt-2 text-sm text-gray-500">{{ error.message }}</p>
        <div class="mt-6 flex justify-center gap-4">
          <button
            v-if="error.retryable"
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            data-testid="retry-button"
            @click="handleRetry"
          >
            重試
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            data-testid="back-button"
            @click="handleBack"
          >
            返回搜尋
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="song" class="space-y-6">
      <button
        type="button"
        class="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
        data-testid="back-button"
        @click="handleBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        返回搜尋結果
      </button>

      <header class="border-b border-gray-200 pb-4">
        <h1 class="text-2xl font-bold text-gray-900" data-testid="lyrics-title">
          {{ song.title }}
        </h1>
        <p class="mt-2 text-lg text-gray-600" data-testid="lyrics-artist">
          {{ song.artist }}
        </p>
      </header>

      <LyricsContent :lyrics="song.lyrics" :highlight-keyword="highlightKeyword" />
    </div>
  </div>
</template>
