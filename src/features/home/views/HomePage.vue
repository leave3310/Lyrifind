<script setup lang="ts">
/**
 * 首頁
 * @description 搜尋入口頁面
 */
import { useRouter } from 'vue-router'

import { SearchBar } from '@/features/search'

const router = useRouter()

/**
 * 處理搜尋
 * @param keyword - 搜尋關鍵字
 */
function handleSearch(keyword: string): void {
  if (keyword.trim()) {
    router.push({
      name: 'SearchResults',
      query: { q: keyword },
    })
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">LyriFind</h1>
      <p class="mt-4 text-lg text-gray-600">輸入歌曲名稱、歌手或歌詞，快速找到您想要的歌詞</p>
    </div>

    <div class="w-full max-w-2xl">
      <SearchBar placeholder="請輸入歌名、歌手或歌詞..." autofocus @search="handleSearch" />
    </div>

    <div class="mt-8 text-center text-sm text-gray-500">
      <p>提示：您可以搜尋</p>
      <ul class="mt-2 space-y-1">
        <li>🎵 歌曲名稱（如：「晴天」）</li>
        <li>🎤 歌手名稱（如：「周杰倫」）</li>
        <li>📝 歌詞片段（如：「我從來不想獨身」）</li>
      </ul>
    </div>
  </div>
</template>
