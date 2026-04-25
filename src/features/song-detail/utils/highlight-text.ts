import { escapeRegex } from './escape-regex'

/**
 * 將字串中的 HTML 特殊字元轉換為對應的實體，避免 XSS 注入。
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 在文字中以 <mark> 標籤標記所有匹配關鍵字
 * 使用正則表達式全域搜尋（不分大小寫），支援 100+ 處匹配。
 *
 * 安全性：先對 text 與 keyword 做 HTML 跳脫，再建構正則執行替換，
 * 避免使用者輸入造成 XSS（輸出會餵給 v-html）。
 *
 * @param text - 原始文字（歌詞）
 * @param keyword - 要高亮的關鍵字
 * @returns 包含 `<mark class="bg-yellow-200 font-bold">` 標籤的 HTML 字串；
 *          若 text 或 keyword 為空則直接回傳原始 text
 *
 * @example
 * highlightText('我愛你', '愛')
 * // '我<mark class="bg-yellow-200 font-bold">愛</mark>你'
 *
 * highlightText('Hello World', 'hello')
 * // '<mark class="bg-yellow-200 font-bold">Hello</mark> World'
 */
export function highlightText(text: string, keyword: string): string {
  if (!text || !keyword) return text

  const escapedText = escapeHtml(text)
  const escapedKeywordHtml = escapeHtml(keyword)
  const escapedKeyword = escapeRegex(escapedKeywordHtml)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')

  return escapedText.replace(regex, '<mark class="bg-yellow-200 font-bold">$1</mark>')
}
