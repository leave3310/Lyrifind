<template>
  <div class="space-y-8">
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">歌詞搜尋</h1>
      <SearchInput @search="handleSearch" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <SearchResults :results="results" :is-loading="isLoading" :error="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchInput from '../components/SearchInput.vue'
import SearchResults from '../components/SearchResults.vue'

const results = ref([])
const isLoading = ref(false)
const error = ref<string | null>(null)

function handleSearch(query: string) {
  console.log('搜尋:', query)
  // TODO: 實作搜尋邏輯
}
</script>
