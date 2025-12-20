<template>
  <div class="search-page max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">LyriFind 歌詞搜尋</h1>

    <SearchBar
      v-model="searchQuery"
      @search="handleSearch"
      class="mb-6"
    />

    <div 
      v-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
      role="alert"
    >
      <p>{{ error }}</p>
      <button
        class="mt-2 text-sm underline hover:no-underline"
        @click="retry"
      >
        重試
      </button>
    </div>

    <LoadingSpinner v-if="isLoading" />

    <template v-else-if="!error">
      <div v-if="searchResults.length > 0" class="mb-4">
        <p class="text-sm text-gray-600">
          找到 {{ total }} 筆結果
        </p>
      </div>

      <SearchResults :results="searchResults" />

      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue'
import SearchBar from '../components/SearchBar.vue'
import SearchResults from '../components/SearchResults.vue'
import Pagination from '../components/Pagination.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useSearch } from '../composables/useSearch'

const {
  searchQuery: internalQuery,
  searchResults,
  total,
  currentPage,
  isLoading,
  error,
  totalPages,
  performSearch,
  goToPage,
  retry
} = useSearch()

// 用於雙向綁定的本地查詢字串
const searchQuery = ref('')

// 提供 searchQuery 給子元件（用於歌詞高亮）
provide('searchQuery', searchQuery)

// 同步內部查詢字串
watch(internalQuery, (newValue) => {
  searchQuery.value = newValue
})

// 處理搜尋
const handleSearch = (query: string) => {
  if (query.trim()) {
    performSearch(query)
  }
}

// 處理換頁
const handlePageChange = (page: number) => {
  goToPage(page)
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
