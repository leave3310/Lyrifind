<template>
  <div data-testid="search-results" class="w-full max-w-4xl mx-auto">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="py-8">
      <LoadingSpinner data-testid="loading-spinner" />
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="py-4">
      <ErrorMessage
        data-testid="error-message"
        :message="errorMessage"
        show-retry
        @retry="$emit('retry')"
      />
    </div>

    <!-- 空結果 -->
    <div
      v-else-if="!isLoading && results.length === 0 && hasSearched"
      class="py-12 text-center text-gray-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-lg font-medium">找不到符合的歌曲</p>
      <p class="mt-2 text-sm">請嘗試其他關鍵字</p>
    </div>

    <!-- 搜尋結果列表 -->
     
    <div
      v-else-if="results.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4"
    >
      <router-link
        v-for="song in results"
        :key="song.id"
        :to="`/lyrics/${song.id}`"
        data-testid="search-result-item"
        class="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
      >
        <h3
          data-testid="song-title"
          class="text-lg font-semibold text-gray-900 mb-1 truncate"
        >
          {{ song.title }}
        </h3>
        <p
          data-testid="song-artist"
          class="text-sm text-gray-600 truncate"
        >
          {{ song.artist }}
        </p>
      </router-link>
    </div>

    <!-- 載入更多 -->
    <div v-if="hasMore && !isLoading" class="py-4 text-center">
      <button
        @click="$emit('loadMore')"
        class="px-6 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        載入更多
      </button>
    </div>

    <!-- 總筆數 -->
    <div v-if="total > 0" class="py-4 text-center text-sm text-gray-500">
      共 {{ total }} 筆結果，已顯示 {{ results.length }} 筆
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResult } from '@/shared/types'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'

interface Props {
  results: SearchResult[]
  isLoading?: boolean
  error?: Error | null
  hasMore?: boolean
  total?: number
  hasSearched?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  hasMore: false,
  total: 0,
  hasSearched: false,
})

defineEmits<{
  retry: []
  loadMore: []
}>()

const errorMessage = computed(() => {
  if (!props.error) return ''
  return props.error.message || '網路連線失敗，請檢查網路後重試'
})
</script>
