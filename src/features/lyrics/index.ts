/**
 * 歌詞功能模組入口
 * @description 匯出歌詞功能相關的元件、服務與組合式函式
 */

// 元件
export { default as LyricsDetail } from './components/LyricsDetail.vue'
export { default as LyricsContent } from './components/LyricsContent.vue'

// 組合式函式
export { useLyrics } from './composables/useLyrics'

// 服務
export { getLyricsById, getAllSongs, clearCache, lyricsService } from './services/lyricsService'

// 型別
export type { LyricsState, LyricsDisplayOptions, LyricsLine, ParsedLyrics } from './types'
