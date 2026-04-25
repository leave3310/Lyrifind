import { describe, it, expect } from 'vitest'
import { highlightText } from '../utils/highlight-text'

describe('highlightText()', () => {
  it('應在文字中高亮匹配關鍵字', () => {
    const result = highlightText('我愛你', '愛')
    expect(result).toBe('我<mark class="bg-yellow-200 font-bold">愛</mark>你')
  })

  it('應高亮所有匹配位置（全域搜尋）', () => {
    const result = highlightText('愛你愛我', '愛')
    expect(result).toBe(
      '<mark class="bg-yellow-200 font-bold">愛</mark>你<mark class="bg-yellow-200 font-bold">愛</mark>我'
    )
  })

  it('應不分大小寫進行搜尋', () => {
    const result = highlightText('Hello World', 'hello')
    expect(result).toBe('<mark class="bg-yellow-200 font-bold">Hello</mark> World')
  })

  it('當 text 為空字串時應直接回傳空字串', () => {
    expect(highlightText('', '愛')).toBe('')
  })

  it('當 keyword 為空字串時應直接回傳原始文字', () => {
    expect(highlightText('我愛你', '')).toBe('我愛你')
  })

  it('應正確處理含正則特殊字元的關鍵字', () => {
    const result = highlightText('hello (world)', '(world)')
    expect(result).toBe('hello <mark class="bg-yellow-200 font-bold">(world)</mark>')
  })

  it('應正確處理含 . 特殊字元的關鍵字', () => {
    const result = highlightText('a.b.c', '.')
    // 應只匹配字面點，不是任意字元
    expect(result).toBe(
      'a<mark class="bg-yellow-200 font-bold">.</mark>b<mark class="bg-yellow-200 font-bold">.</mark>c'
    )
  })

  it('應處理多行歌詞文字', () => {
    const lyrics = '這是一首\n簡單的小情歌\n唱著人們心腸'
    const result = highlightText(lyrics, '小情歌')
    expect(result).toContain('<mark class="bg-yellow-200 font-bold">小情歌</mark>')
    expect(result).toContain('這是一首\n簡單的')
  })

  it('應在 100+ 處匹配時正常運作', () => {
    const text = '的'.repeat(200)
    const result = highlightText(text, '的')
    const matches = result.match(/<mark/g)
    expect(matches?.length).toBe(200)
  })
})
