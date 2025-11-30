/**
 * E2E 測試 Fixtures
 * @description 提供測試用的資料與工具函式
 */

import type { Song, SearchResult, SearchResponse, MatchType } from '../../src/shared/types'

/** 測試用歌曲資料 */
export const mockSongs: Song[] = [
  {
    id: '1',
    title: '小幸運',
    artist: '田馥甄',
    lyrics: '我聽見雨滴落在青青草地，我聽見遠方下課鐘聲響起。',
  },
  {
    id: '2',
    title: '告白氣球',
    artist: '周杰倫',
    lyrics: '塞納河畔左岸的咖啡，我手一杯品嚐你的美。',
  },
  {
    id: '3',
    title: '愛你',
    artist: '王心凌',
    lyrics: '愛你愛你隨時都要一起，我喜歡愛你外套味道還有你的懷裡。',
  },
  {
    id: '4',
    title: '傷心太平洋',
    artist: '任賢齊',
    lyrics: '一波還未平息，一波又來侵襲，茫茫人海狂風暴雨。',
  },
  {
    id: '5',
    title: '稻香',
    artist: '周杰倫',
    lyrics: '對這個世界如果你有太多的抱怨，跌倒了就不敢繼續往前走。',
  },
]

/** 建立搜尋結果 */
export function createSearchResult(
  song: Song,
  matchType: MatchType = 'TITLE_EXACT',
  score = 100
): SearchResult {
  return {
    song,
    matchType,
    score,
    highlightedTitle: song.title,
    highlightedArtist: song.artist,
    highlightedLyrics: song.lyrics.slice(0, 50),
  }
}

/** 建立搜尋回應 */
export function createSearchResponse(
  results: SearchResult[],
  keyword: string,
  page = 1,
  pageSize = 10
): SearchResponse {
  const total = results.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedResults = results.slice(start, end)

  return {
    results: paginatedResults,
    total,
    page,
    pageSize,
    totalPages,
    keyword,
  }
}

/** 根據關鍵字搜尋 Mock 歌曲 */
export function searchMockSongs(keyword: string): SearchResult[] {
  const normalizedKeyword = keyword.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const song of mockSongs) {
    if (song.title.toLowerCase() === normalizedKeyword) {
      results.push(createSearchResult(song, 'TITLE_EXACT', 100))
    } else if (song.title.toLowerCase().includes(normalizedKeyword)) {
      results.push(createSearchResult(song, 'TITLE_PARTIAL', 80))
    } else if (song.artist.toLowerCase().includes(normalizedKeyword)) {
      results.push(createSearchResult(song, 'ARTIST', 60))
    } else if (song.lyrics.toLowerCase().includes(normalizedKeyword)) {
      results.push(createSearchResult(song, 'LYRICS', 40))
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

/** 根據 ID 取得 Mock 歌曲 */
export function getMockSongById(id: string): Song | undefined {
  return mockSongs.find((song) => song.id === id)
}

/** 測試常數 */
export const TEST_CONSTANTS = {
  /** 首頁 URL */
  HOME_URL: '/',
  /** 搜尋頁 URL */
  SEARCH_URL: '/search',
  /** 歌詞詳情頁 URL */
  LYRICS_URL: '/lyrics',
  /** 預設搜尋關鍵字 */
  DEFAULT_KEYWORD: '周杰倫',
  /** 載入逾時時間（毫秒） */
  LOAD_TIMEOUT: 5000,
  /** 動畫等待時間（毫秒） */
  ANIMATION_DELAY: 300,
}
