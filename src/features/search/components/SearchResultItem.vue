<template>
  <div 
    class="search-result-item p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
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
      
      <!-- 歌詞片段（如果有匹配歌詞） -->
      <div 
        v-if="item.lyricsSnippet"
        class="text-sm text-gray-700 bg-gray-50 p-3 rounded"
        data-testid="lyrics-snippet"
      >
        <div 
          v-for="(line, index) in item.lyricsSnippet.lines"
          :key="index"
          :class="{ 'font-medium': index === item.lyricsSnippet.matchIndex }"
        >
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResultItem } from '../types'

defineProps<{
  item: SearchResultItem
}>()
</script>
