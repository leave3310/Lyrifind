<template>
  <div>
    <LoadingSpinner v-if="isLoading" />
    <ErrorMessage v-if="error" :message="error?.message || '發生錯誤'" />

    <div v-if="!isLoading && results.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-lg">沒有搜尋結果</p>
    </div>

    <div v-if="results.length > 0" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div
          v-for="result in results"
          :key="result.id"
          @click="goToLyrics(result.id)"
          class="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 cursor-pointer transition-all bg-white"
        >
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{{ result.title }}</h3>
          <p class="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1">{{ result.artist }}</p>
        </div>
      </div>

      <!-- 分頁控制 -->
      <div v-if="total > 20" class="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
        <button
          :disabled="currentPage === 1"
          @click="$emit('prev-page')"
          class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一頁
        </button>
        <span class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
          第 {{ currentPage }} 頁 / 共 {{ Math.ceil(total / 20) }} 頁
        </span>
        <button
          :disabled="!hasNextPage"
          @click="$emit('next-page')"
          class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一頁 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'
import { useRouter } from 'vue-router'

interface Props {
  results: any[]
  isLoading: boolean
  error: any
  hasNextPage: boolean
  currentPage: number
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  'next-page': []
  'prev-page': []
}>()

const router = useRouter()

function goToLyrics(id: string) {
  router.push({ name: 'lyrics', params: { id } })
}
</script>
