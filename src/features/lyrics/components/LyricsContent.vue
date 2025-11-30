<script setup lang="ts">
/**
 * LyricsContent 元件
 * @description 歌詞內容顯示元件
 */
import { computed } from 'vue'

import type { LyricsLine, ParsedLyrics } from '../types'

/** Props 定義 */
interface Props {
  /** 歌詞內容 */
  lyrics: string
  /** 是否顯示行號 */
  showLineNumbers?: boolean
  /** 高亮關鍵字 */
  highlightKeyword?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLineNumbers: false,
  highlightKeyword: '',
})

/**
 * 解析歌詞為結構化資料
 */
const parsedLyrics = computed<ParsedLyrics>(() => {
  if (!props.lyrics) {
    return {
      lines: [],
      totalLines: 0,
      nonEmptyLines: 0,
    }
  }

  const rawLines = props.lyrics.split('\n')
  const lines: LyricsLine[] = rawLines.map((content, index) => ({
    lineNumber: index + 1,
    content,
    isEmpty: content.trim() === '',
  }))

  return {
    lines,
    totalLines: lines.length,
    nonEmptyLines: lines.filter((l) => !l.isEmpty).length,
  }
})

/**
 * 高亮文字
 * @param text - 原始文字
 * @returns 高亮後的 HTML
 */
function highlightText(text: string): string {
  if (!props.highlightKeyword || props.highlightKeyword.trim() === '') {
    return escapeHtml(text)
  }

  const keyword = props.highlightKeyword
  const escapedKeyword = escapeRegex(keyword)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')

  return escapeHtml(text).replace(
    regex,
    '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>'
  )
}

/**
 * HTML 特殊字元跳脫
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char)
}

/**
 * 正規表達式特殊字元跳脫
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<template>
  <div class="lyrics-content" data-testid="lyrics-content">
    <div
      v-if="parsedLyrics.lines.length > 0"
      class="whitespace-pre-line font-sans text-gray-800 leading-relaxed"
    >
      <template v-for="line in parsedLyrics.lines" :key="line.lineNumber">
        <div class="lyrics-line py-0.5" :class="{ 'text-gray-400': line.isEmpty }">
          <!-- 行號 -->
          <span
            v-if="showLineNumbers"
            class="inline-block w-8 text-right text-xs text-gray-400 mr-4 select-none"
          >
            {{ line.lineNumber }}
          </span>

          <!-- 歌詞內容 -->
          <span v-if="highlightKeyword && !line.isEmpty" v-html="highlightText(line.content)" />
          <span v-else-if="line.isEmpty">&nbsp;</span>
          <span v-else>{{ line.content }}</span>
        </div>
      </template>
    </div>

    <!-- 無歌詞狀態 -->
    <div v-else class="text-center py-8 text-gray-500" data-testid="no-lyrics">暫無歌詞內容</div>
  </div>
</template>
