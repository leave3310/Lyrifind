<template>
  <div class="space-y-8">
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">歌詞搜尋</h1>
      <SearchInput @search="handleSearch" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <SearchResults
        :results="results"
        :is-loading="isLoading"
        :error="error"
        :has-next-page="hasNextPage"
        :current-page="currentPage"
        :total="total"
        @next-page="goToNextPage"
        @prev-page="goToPreviousPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import SearchInput from '../components/SearchInput.vue'
import SearchResults from '../components/SearchResults.vue'
import { useSearch } from '../composables/useSearch'

const route = useRoute()
const router = useRouter()
const { searchQuery, results, isLoading, error, currentPage, total, hasNextPage, search, goToNextPage, goToPreviousPage } = useSearch()

function handleSearch(query: string) {
  search(query)
  // 更新 URL query parameter
  router.push({ name: 'search', query: { q: query, page: '1' } })
}

// 從 URL query parameter 讀取搜尋關鍵字
onMounted(() => {
  const q = route.query.q as string
  if (q) {
    searchQuery.value = q
  }
})
</script>

