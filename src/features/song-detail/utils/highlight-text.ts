import { escapeRegex } from './escape-regex'

/**
 * 在文字中以 <mark> 標籤標記所有匹配關鍵字
 * 使用正則表達式全域搜尋（不分大小寫），支援 100+ 處匹配。
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

  const escapedKeyword = escapeRegex(keyword)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')

  return text.replace(regex, '<mark class="bg-yellow-200 font-bold">$1</mark>')
}
