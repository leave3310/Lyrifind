<script setup lang="ts">
/**
 * SearchResultItem 元件
 * @description 搜尋結果項目元件
 */
import type { SearchResult } from '@/shared/types'

interface Props {
  /** 搜尋結果 */
  result: SearchResult
}

const props = defineProps<Props>()

interface Emits {
  (e: 'click', songId: string): void
}

const emit = defineEmits<Emits>()

function handleClick(): void {
  emit('click', props.result.song.id)
}

/**
 * 處理鍵盤事件
 * @param event - 鍵盤事件
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}

/**
 * 取得匹配類型標籤
 */
function getMatchTypeLabel(): string {
  switch (props.result.matchType) {
    case 'TITLE_EXACT':
      return '歌名完全匹配'
    case 'TITLE_PARTIAL':
      return '歌名部分匹配'
    case 'ARTIST':
      return '歌手匹配'
    case 'LYRICS':
      return '歌詞匹配'
    default:
      return ''
  }
}

/**
 * 取得匹配類型樣式
 */
function getMatchTypeClass(): string {
  switch (props.result.matchType) {
    case 'TITLE_EXACT':
      return 'bg-green-100 text-green-800'
    case 'TITLE_PARTIAL':
      return 'bg-blue-100 text-blue-800'
    case 'ARTIST':
      return 'bg-purple-100 text-purple-800'
    case 'LYRICS':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <article
    class="search-result-item cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    data-testid="search-result-item"
    tabindex="0"
    role="button"
    :aria-label="`檢視「${result.song.title}」歌詞`"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate" data-testid="song-title">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="result.highlightedTitle" v-html="result.highlightedTitle" />
          <span v-else>{{ result.song.title }}</span>
        </h3>

        <p class="mt-1 text-sm text-gray-600" data-testid="song-artist">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="result.highlightedArtist" v-html="result.highlightedArtist" />
          <span v-else>{{ result.song.artist }}</span>
        </p>

        <p
          v-if="result.highlightedLyrics"
          class="mt-2 text-sm text-gray-500 line-clamp-2"
          data-testid="result-lyrics-snippet"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="result.highlightedLyrics" />
        </p>
      </div>

      <span
        :class="[
          'ml-2 flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium',
          getMatchTypeClass(),
        ]"
        data-testid="match-type-badge"
      >
        {{ getMatchTypeLabel() }}
      </span>
    </div>
  </article>
</template>
