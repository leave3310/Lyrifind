<template>
  <div>
    <LoadingSpinner v-if="isLoading" />
    <ErrorMessage v-if="error" :message="error" />

    <div v-if="!isLoading && results.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-lg">沒有搜尋結果</p>
    </div>

    <div v-if="results.length > 0" class="space-y-2">
      <div
        v-for="result in results"
        :key="result.id"
        @click="goToLyrics(result.id)"
        class="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
      >
        <h3 class="text-lg font-semibold text-gray-900">{{ result.title }}</h3>
        <p class="text-sm text-gray-600">{{ result.artist }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'

interface Props {
  results: any[]
  isLoading: boolean
  error: string | null
}

defineProps<Props>()

const router = useRouter()

function goToLyrics(id: string) {
  router.push({ name: 'lyrics', params: { id } })
}
</script>
