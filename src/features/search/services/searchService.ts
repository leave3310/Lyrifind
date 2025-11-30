/**
 * 搜尋服務
 * @description 負責搜尋邏輯、相關性排序與高亮標記
 */
import { googleSheetsApi } from '@/shared/services/googleSheetsApi'
import type { MatchType, SearchQuery, SearchResponse, SearchResult, Song } from '@/shared/types'

import type { HighlightedText, SearchServiceConfig } from '../types'

/** 預設配置 */
const DEFAULT_CONFIG: Required<SearchServiceConfig> = {
  cacheTTL: 5 * 60 * 1000, // 5 分鐘
  maxCacheSize: 50,
}

/** L1 快取（記憶體快取） */
interface CacheEntry {
  response: SearchResponse
  timestamp: number
}

const searchCache = new Map<string, CacheEntry>()

/**
 * 生成快取鍵
 * @param query - 搜尋條件
 * @returns 快取鍵
 */
function generateCacheKey(query: SearchQuery): string {
  const page = query.page || 1
  const pageSize = query.pageSize || 20
  return `${query.keyword.toLowerCase().trim()}:${page}:${pageSize}`
}

/**
 * 計算搜尋相關性分數
 * @param song - 歌曲資料
 * @param keyword - 搜尋關鍵字
 * @returns 相關性分數與匹配類型
 */
function calculateRelevance(song: Song, keyword: string): { score: number; matchType: MatchType } {
  const lowerKeyword = keyword.toLowerCase()
  const lowerTitle = song.title.toLowerCase()
  const lowerArtist = song.artist.toLowerCase()
  const lowerLyrics = song.lyrics.toLowerCase()

  // 完全匹配歌名 - 最高分
  if (lowerTitle === lowerKeyword) {
    return { score: 100, matchType: 'TITLE_EXACT' }
  }

  // 歌名開頭匹配
  if (lowerTitle.startsWith(lowerKeyword)) {
    return { score: 90, matchType: 'TITLE_EXACT' }
  }

  // 歌名包含關鍵字
  if (lowerTitle.includes(lowerKeyword)) {
    return { score: 80, matchType: 'TITLE_PARTIAL' }
  }

  // 完全匹配歌手名
  if (lowerArtist === lowerKeyword) {
    return { score: 70, matchType: 'ARTIST' }
  }

  // 歌手名開頭匹配
  if (lowerArtist.startsWith(lowerKeyword)) {
    return { score: 65, matchType: 'ARTIST' }
  }

  // 歌手名包含關鍵字
  if (lowerArtist.includes(lowerKeyword)) {
    return { score: 60, matchType: 'ARTIST' }
  }

  // 歌詞包含關鍵字
  if (lowerLyrics.includes(lowerKeyword)) {
    // 根據出現次數調整分數
    const matches = lowerLyrics.split(lowerKeyword).length - 1
    const baseScore = 50
    const bonusScore = Math.min(matches - 1, 10) * 2 // 最多加 20 分
    return { score: baseScore + bonusScore, matchType: 'LYRICS' }
  }

  return { score: 0, matchType: 'TITLE_PARTIAL' }
}

/**
 * 提取歌詞匹配片段
 * @param lyrics - 完整歌詞
 * @param keyword - 搜尋關鍵字
 * @param contextLength - 前後文長度
 * @returns 匹配片段
 */
function extractMatchedLyrics(lyrics: string, keyword: string, contextLength: number = 30): string {
  const lowerLyrics = lyrics.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const index = lowerLyrics.indexOf(lowerKeyword)

  if (index === -1) {
    return ''
  }

  const start = Math.max(0, index - contextLength)
  const end = Math.min(lyrics.length, index + keyword.length + contextLength)

  let snippet = lyrics.substring(start, end)

  // 加上省略號
  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < lyrics.length) {
    snippet = snippet + '...'
  }

  return snippet.replace(/\n/g, ' ').trim()
}

/**
 * 高亮標記文字
 * @param text - 原始文字
 * @param keyword - 要高亮的關鍵字
 * @returns 高亮標記後的 HTML（已消毒）
 */
export function highlightText(text: string, keyword: string): string {
  if (!keyword || keyword.trim() === '') {
    return escapeHtml(text)
  }

  const escapedKeywordHtml = escapeHtml(keyword)
  const escapedText = escapeHtml(text)

  // 使用安全的方式替換匹配項
  return escapedText.replace(
    new RegExp(`(${escapeRegex(escapedKeywordHtml)})`, 'gi'),
    '<mark class="bg-yellow-200 text-yellow-900">$1</mark>'
  )
}

/**
 * 解析高亮文字為結構化資料
 * @param text - 原始文字
 * @param keyword - 搜尋關鍵字
 * @returns 高亮標記結果陣列
 */
export function parseHighlightedText(text: string, keyword: string): HighlightedText[] {
  if (!keyword || keyword.trim() === '') {
    return [{ text, isMatch: false }]
  }

  const result: HighlightedText[] = []
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  let lastIndex = 0

  let index = lowerText.indexOf(lowerKeyword, lastIndex)
  while (index !== -1) {
    // 加入匹配前的文字
    if (index > lastIndex) {
      result.push({
        text: text.substring(lastIndex, index),
        isMatch: false,
      })
    }

    // 加入匹配的文字（保留原始大小寫）
    result.push({
      text: text.substring(index, index + keyword.length),
      isMatch: true,
    })

    lastIndex = index + keyword.length
    index = lowerText.indexOf(lowerKeyword, lastIndex)
  }

  // 加入剩餘的文字
  if (lastIndex < text.length) {
    result.push({
      text: text.substring(lastIndex),
      isMatch: false,
    })
  }

  return result
}

/**
 * HTML 特殊字元跳脫（XSS 防護）
 * @param text - 原始文字
 * @returns 跳脫後的文字
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
 * @param text - 原始文字
 * @returns 跳脫後的文字
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 執行搜尋
 * @param query - 搜尋條件
 * @param config - 服務配置
 * @returns 搜尋結果
 */
export async function search(
  query: SearchQuery,
  config: SearchServiceConfig = {}
): Promise<SearchResponse> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const keyword = query.keyword.trim()
  const page = query.page || 1
  const pageSize = query.pageSize || 20

  // 檢查最小字元數
  if (keyword.length < 1) {
    return {
      results: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
      keyword,
    }
  }

  // 檢查 L1 快取
  const cacheKey = generateCacheKey(query)
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < mergedConfig.cacheTTL) {
    return cached.response
  }

  // 取得所有歌曲
  const songs = await googleSheetsApi.fetchAllSongs()

  // 搜尋與計算相關性
  const results: SearchResult[] = []
  for (const song of songs) {
    const { score, matchType } = calculateRelevance(song, keyword)
    if (score > 0) {
      const highlightedLyrics =
        matchType === 'LYRICS'
          ? highlightText(extractMatchedLyrics(song.lyrics, keyword), keyword)
          : undefined

      results.push({
        song,
        matchType,
        score,
        highlightedTitle: highlightText(song.title, keyword),
        highlightedArtist: highlightText(song.artist, keyword),
        highlightedLyrics,
      })
    }
  }

  // 依相關性排序（高到低）
  results.sort((a, b) => b.score - a.score)

  // 計算分頁
  const total = results.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedResults = results.slice(startIndex, endIndex)

  const response: SearchResponse = {
    results: paginatedResults,
    total,
    page,
    pageSize,
    totalPages,
    keyword,
  }

  // 存入 L1 快取
  searchCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
  })

  // 限制快取大小
  if (searchCache.size > mergedConfig.maxCacheSize) {
    const oldestKey = searchCache.keys().next().value
    if (oldestKey) {
      searchCache.delete(oldestKey)
    }
  }

  return response
}

/**
 * 依 ID 搜尋單一歌曲
 * @param id - 歌曲 ID
 * @returns 歌曲資料，找不到時回傳 null
 */
export async function searchById(id: string): Promise<Song | null> {
  const songs = await googleSheetsApi.fetchAllSongs()
  return songs.find((song) => song.id === id) || null
}

/**
 * 清除搜尋快取
 */
export function clearSearchCache(): void {
  searchCache.clear()
}

/**
 * 搜尋服務物件（便於模組匯入）
 */
export const searchService = {
  search,
  searchById,
  getSongById: searchById, // 別名，為向後相容
  clearCache: clearSearchCache,
  highlightText,
  parseHighlightedText,
}

export default searchService
