// 歌詞匹配工具

/**
 * 檢查文字是否部分匹配查詢（不區分大小寫）
 * @param text 要檢查的文字
 * @param query 查詢字串
 * @returns 是否匹配
 */
export function partialMatch(text: string, query: string): boolean {
  if (!text || !query) return false
  return text.toLowerCase().includes(query.toLowerCase())
}

/**
 * 檢查文字是否精確匹配查詢（不區分大小寫）
 * @param text 要檢查的文字
 * @param query 查詢字串
 * @returns 是否匹配
 */
export function exactMatch(text: string, query: string): boolean {
  if (!text || !query) return false
  return text.toLowerCase() === query.toLowerCase()
}
