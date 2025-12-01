<script setup lang="ts">
/**
 * SearchResults 元件
 * @description 搜尋結果列表元件
 */
import type { SearchResult } from '@/shared/types'

import SearchResultItem from './SearchResultItem.vue'

/** Props 定義 */
interface Props {
  /** 搜尋結果列表 */
  results: SearchResult[]
  /** 是否正在載入 */
  loading?: boolean
  /** 搜尋關鍵字（用於顯示空結果訊息） */
  keyword?: string
  /** 總結果數量 */
  totalCount?: number
}

withDefaults(defineProps<Props>(), {
  loading: false,
  keyword: '',
  totalCount: 0,
})

/** Emits 定義 */
interface Emits {
  (e: 'select', songId: string): void
}

const emit = defineEmits<Emits>()

/**
 * 處理結果項目點擊
 * @param songId - 歌曲 ID
 */
function handleItemClick(songId: string): void {
  emit('select', songId)
}
</script>

<template>
  <div class="search-results" data-testid="search-results">
    <!-- 載入中狀態 -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-12"
      data-testid="loading-spinner"
    >
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <p class="mt-4 text-gray-500">搜尋中...</p>
    </div>

    <!-- 空結果狀態 -->
    <div
      v-else-if="results.length === 0 && keyword"
      class="flex flex-col items-center justify-center py-12"
      data-testid="empty-results"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 text-gray-300"
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
      <p class="mt-4 text-lg font-medium text-gray-700">找不到相關結果</p>
      <p class="mt-2 text-sm text-gray-500" data-testid="no-results-message">
        找不到與「{{ keyword }}」相關的歌曲，請嘗試其他關鍵字
      </p>
    </div>

    <!-- 結果列表 -->
    <template v-else-if="results.length > 0">
      <!-- 結果統計 -->
      <div v-if="totalCount > 0" class="mb-4 text-sm text-gray-500" data-testid="results-count">
        共找到 {{ totalCount }} 首歌曲
      </div>

      <!-- 結果項目 -->
      <div class="space-y-3">
        <SearchResultItem
          v-for="result in results"
          :key="result.song.id"
          :result="result"
          @click="handleItemClick"
        />
      </div>
    </template>

    <!-- 初始狀態（尚未搜尋） -->
    <div v-else class="flex flex-col items-center justify-center py-12" data-testid="initial-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p class="mt-4 text-lg font-medium text-gray-700">開始搜尋歌詞</p>
      <p class="mt-2 text-sm text-gray-500">輸入歌名、歌手或歌詞片段開始搜尋</p>
    </div>
  </div>
</template>
