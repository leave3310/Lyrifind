<template>
  <router-link
    :to="songDetailRoute"
    class="search-result-item block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    data-testid="search-result-item"
    :aria-label="`${item.song.title} - ${item.song.artist}，點擊查看詳細資訊`"
  >
    <article class="flex flex-col gap-2">
      <header class="flex items-baseline gap-2">
        <h3 
          class="text-lg font-semibold text-gray-900"
          data-testid="song-title"
        >
          {{ item.song.title }}
        </h3>
        <span 
          class="text-sm text-gray-600"
          data-testid="song-artist"
          aria-label="歌手"
        >
          {{ item.song.artist }}
        </span>
      </header>
      
      <div 
        v-if="item.lyricsSnippet"
        class="lyrics-snippet-container bg-gray-50 p-3 rounded"
        data-testid="lyrics-snippet"
        role="region"
        aria-label="匹配的歌詞片段"
      >
        <LyricsHighlight
          v-for="(line, index) in item.lyricsSnippet.lines"
          :key="index"
          :text="line"
          :query="searchQuery"
          :class="{ 'font-medium': index === item.lyricsSnippet.matchIndex }"
          class="block"
        />
      </div>
    </article>
  </router-link>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import type { SearchResultItem } from '../types'
import LyricsHighlight from './LyricsHighlight.vue'

const props = defineProps<{
  item: SearchResultItem
}>()

// 從 useSearch 注入搜尋查詢 Ref（用於高亮）
const searchQuery = inject<Ref<string>>('searchQuery', ref(''))

// 若搜尋結果包含歌詞片段，傳遞 highlight 參數至詳細頁
const songDetailRoute = computed(() => {
  const base = { name: 'song-detail', params: { id: props.item.song.id } }
  const keyword = searchQuery.value.trim().slice(0, 100)
  if (props.item.lyricsSnippet && keyword) {
    return { ...base, query: { highlight: keyword } }
  }
  return base
})
</script>
