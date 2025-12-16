<template>
  <router-link
    :to="{ name: 'song-detail', params: { id: item.song.id } }"
    class="search-result-item block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    data-testid="search-result-item"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline gap-2">
        <h3 
          class="text-lg font-semibold text-gray-900"
          data-testid="song-title"
        >
          {{ item.song.title }}
        </h3>
        <span 
          class="text-sm text-gray-600"
          data-testid="song-artist"
        >
          {{ item.song.artist }}
        </span>
      </div>
      
      <!-- 歌詞片段（使用高亮元件） -->
      <div 
        v-if="item.lyricsSnippet"
        class="lyrics-snippet-container bg-gray-50 p-3 rounded"
        data-testid="lyrics-snippet"
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
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { SearchResultItem } from '../types'
import LyricsHighlight from './LyricsHighlight.vue'

defineProps<{
  item: SearchResultItem
}>()

// 從 useSearch 注入搜尋查詢（用於高亮）
const searchQuery = inject<string>('searchQuery', '')
</script>
