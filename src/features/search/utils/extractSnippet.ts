// 歌詞片段擷取工具
import type { LyricsSnippet } from '../types'

/**
 * 從歌詞中擷取包含匹配關鍵字的片段
 * @param lyrics 完整歌詞
 * @param query 搜尋關鍵字
 * @returns 歌詞片段（固定 3 行：匹配行 + 前後各 1 行），若無匹配則返回 null
 */
export function extractSnippet(lyrics: string, query: string): LyricsSnippet | null {
  if (!query || !lyrics) return null
  
  const lines = lyrics.split('\n')
  const lowerQuery = query.toLowerCase()
  
  // 找到第一個匹配的行
  const matchLineIndex = lines.findIndex(line => 
    line.toLowerCase().includes(lowerQuery)
  )
  
  if (matchLineIndex === -1) return null
  
  // 計算片段範圍（匹配行 + 前後各 1 行）
  const start = Math.max(0, matchLineIndex - 1)
  const end = Math.min(lines.length, matchLineIndex + 2)
  
  return {
    lines: lines.slice(start, end),
    matchIndex: matchLineIndex - start
  }
}
