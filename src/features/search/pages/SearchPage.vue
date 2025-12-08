<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- 標題 -->
      <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">
        歌詞搜尋
      </h1>

      <!-- 搜尋框 -->
      <SearchInput
        v-model="keyword"
        :disabled="isLoading"
        @search="handleSearch"
        @input="handleDebouncedSearch"
      />

      <!-- 關鍵字提示 -->
      <div v-if="!keyword.trim() && !hasSearched" class="mt-12 text-center">
        <p class="text-gray-500 text-lg">請輸入搜尋關鍵字</p>
        <p class="text-gray-400 text-sm mt-2">
          支援搜尋歌曲名稱、歌手名稱或歌詞內容
        </p>
      </div>

      <!-- 搜尋結果 -->
      <div class="mt-8">
        <SearchResults
          :results="results"
          :is-loading="isLoading"
          :error="error"
          :has-more="hasMore"
          :total="total"
          :has-searched="hasSearched"
          @retry="retry"
          @load-more="loadMore"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearch } from '../composables/useSearch'
import SearchInput from '../components/SearchInput.vue'
import SearchResults from '../components/SearchResults.vue'

const route = useRoute()
const router = useRouter()

// 從 URL query 讀取初始關鍵字
const initialKeyword = (route.query.q as string) || ''

// 使用搜尋 composable
const {
  keyword,
  results,
  total,
  isLoading,
  error,
  hasMore,
  search,
  debouncedSearch,
  loadMore,
  retry,
} = useSearch(initialKeyword)

// 是否已執行過搜尋
const hasSearched = ref(false)

// 搜尋處理
const handleSearch = async () => {
  try {
    await search()
    hasSearched.value = true
    // 更新 URL
    router.push({
      path: '/search',
      query: { q: keyword.value },
    })
  } catch (err) {
    console.error('搜尋失敗:', err)
  }
}

// 防抖搜尋處理
const handleDebouncedSearch = () => {
  if (keyword.value.trim()) {
    debouncedSearch()
    hasSearched.value = true
  }
}

// 監聽 URL query 變化
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery && newQuery !== keyword.value) {
      keyword.value = newQuery as string
      handleSearch()
    }
  }
)

// 初始化時如果有關鍵字則搜尋
onMounted(() => {
  if (initialKeyword) {
    hasSearched.value = true
    handleSearch()
  }
})
</script>

