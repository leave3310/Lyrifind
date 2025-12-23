// 歌詞高亮組合式函式

/**
 * 歌詞高亮功能
 */
export function useLyricsHighlight() {
  /**
   * 跳脫正則表達式特殊字元
   * @param str 要跳脫的字串
   * @returns 跳脫後的字串
   */
  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 高亮文字中的匹配部分
   * @param text 原始文字
   * @param query 搜尋關鍵字
   * @returns 包含高亮標記的 HTML 字串
   */
  function highlightText(text: string, query: string): string {
    if (!query || !text) return text
    
    const escapedQuery = escapeRegex(query)
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    
    return text.replace(regex, '<mark class="bg-yellow-200 font-bold">$1</mark>')
  }

  return {
    highlightText,
    escapeRegex
  }
}
