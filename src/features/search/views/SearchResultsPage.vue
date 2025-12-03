<script setup lang="ts">
/**
 * 搜尋結果頁面
 * @description 顯示搜尋結果列表
 */
import { onMounted, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useHead } from '@unhead/vue'

import { SearchBar, SearchResults, useSearch } from '@/features/search'
import ErrorMessage from '@/shared/components/ErrorMessage.vue'
import Pagination from '@/shared/components/Pagination.vue'

const route = useRoute()
const router = useRouter()

/** 搜尋邏輯 */
const {
  keyword,
  results,
  loading,
  error,
  totalCount,
  hasSearched,
  currentPage,
  totalPages,
  search,
  updateKeyword,
  retry,
  goToPage,
} = useSearch({ autoSearch: false, pageSize: 20 })

/** SEO Meta */
useHead({
  title: () =>
    keyword.value ? `「${keyword.value}」的搜尋結果 - LyriFind` : '搜尋結果 - LyriFind',
  meta: [
    {
      name: 'description',
      content: () => (keyword.value ? `搜尋「${keyword.value}」的歌詞結果` : '搜尋歌詞結果'),
    },
  ],
})

/**
 * 處理搜尋
 * @param searchKeyword - 搜尋關鍵字
 */
function handleSearch(searchKeyword: string): void {
  if (searchKeyword.trim()) {
    // 更新 URL
    router.push({
      name: 'SearchResults',
      query: { q: searchKeyword },
    })
    // 執行搜尋
    updateKeyword(searchKeyword)
    search()
  }
}

/**
 * 處理結果項目選擇
 * @param songId - 歌曲 ID
 */
function handleSelect(songId: string): void {
  router.push({
    name: 'LyricsDetail',
    params: { id: songId },
    query: { q: keyword.value },
  })
}

/**
 * 處理分頁變更
 * @param page - 目標頁碼
 */
async function handlePageChange(page: number): Promise<void> {
  await goToPage(page)
  // 滾動至頁面頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 從 URL 取得關鍵字並執行搜尋
 */
function searchFromUrl(): void {
  const q = route.query.q as string | undefined
  if (q && q.trim()) {
    updateKeyword(q)
    search()
  }
}

// 監聽路由變化
watch(
  () => route.query.q,
  () => {
    searchFromUrl()
  }
)

// 初始載入時執行搜尋
onMounted(() => {
  searchFromUrl()
})
</script>

<template>
  <div class="search-results-page">
    <div class="mb-6">
      <SearchBar v-model="keyword" :loading="loading" @search="handleSearch" />
    </div>

    <ErrorMessage v-if="error" :error="error" @retry="retry" />

    <template v-else>
      <SearchResults
        :results="results"
        :loading="loading"
        :keyword="hasSearched ? keyword : ''"
        :total-count="totalCount"
        @select="handleSelect"
      />

      <div v-if="hasSearched && totalPages > 1 && !loading" class="mt-8">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :disabled="loading"
          @change="handlePageChange"
        />
      </div>
    </template>
  </div>
</template>
