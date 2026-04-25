/**
 * 跳脫正則表達式特殊字元
 * 將輸入字串中的所有正則特殊字元加上反斜線跳脫，
 * 使其可安全用於 new RegExp() 中進行字面比對。
 *
 * @param str - 要跳脫的字串
 * @returns 跳脫後可安全用於正則表達式的字串
 *
 * @example
 * escapeRegex('hello.world') // 'hello\\.world'
 * escapeRegex('(test)')      // '\\(test\\)'
 * escapeRegex('a+b*c?')      // 'a\\+b\\*c\\?'
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
