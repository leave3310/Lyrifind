// T042-T043: 單元測試 - 高亮文字邏輯與特殊字元跳脫
import { describe, it, expect } from 'vitest'
import { useLyricsHighlight } from '../composables/useLyricsHighlight'

describe('useLyricsHighlight', () => {
  const { highlightText, escapeRegex } = useLyricsHighlight()

  describe('highlightText', () => {
    it('應正確高亮匹配文字', () => {
      const text = '這是一段測試文字'
      const query = '測試'
      
      const result = highlightText(text, query)
      
      expect(result).toContain('<mark class="bg-yellow-200 font-bold">測試</mark>')
      expect(result).toContain('這是一段')
      expect(result).toContain('文字')
    })

    it('應進行不區分大小寫的高亮', () => {
      const text = 'Hello World'
      const query = 'hello'
      
      const result = highlightText(text, query)
      
      expect(result).toContain('<mark class="bg-yellow-200 font-bold">Hello</mark>')
    })

    it('應高亮多處匹配', () => {
      const text = 'test test test'
      const query = 'test'
      
      const result = highlightText(text, query)
      
      const matchCount = (result.match(/<mark/g) || []).length
      expect(matchCount).toBe(3)
    })

    it('應在查詢為空時返回原文', () => {
      const text = '測試文字'
      const query = ''
      
      const result = highlightText(text, query)
      
      expect(result).toBe(text)
    })

    it('應在沒有匹配時返回原文', () => {
      const text = '測試文字'
      const query = '不存在'
      
      const result = highlightText(text, query)
      
      expect(result).toBe(text)
    })
  })

  describe('escapeRegex', () => {
    it('應正確跳脫正則表達式特殊字元', () => {
      const specialChars = '.*+?^${}()|[]\\'.split('')
      
      specialChars.forEach(char => {
        const escaped = escapeRegex(char)
        expect(escaped).toBe(`\\${char}`)
      })
    })

    it('應處理包含特殊字元的字串', () => {
      const text = 'test (abc) [def]'
      const escaped = escapeRegex(text)
      
      expect(escaped).toBe('test \\(abc\\) \\[def\\]')
    })

    it('應不影響普通字元', () => {
      const text = 'hello world 123'
      const escaped = escapeRegex(text)
      
      expect(escaped).toBe(text)
    })

    it('應處理混合特殊字元和普通字元', () => {
      const text = 'price: $100 (USD)'
      const escaped = escapeRegex(text)
      
      expect(escaped).toBe('price: \\$100 \\(USD\\)')
    })
  })

  describe('高亮與特殊字元整合測試', () => {
    it('應正確處理包含特殊字元的查詢', () => {
      const text = '價格是 $100 (美元)'
      const query = '$100'
      
      const result = highlightText(text, query)
      
      expect(result).toContain('<mark class="bg-yellow-200 font-bold">$100</mark>')
    })

    it('應正確處理包含括號的查詢', () => {
      const text = '這是 (測試) 內容'
      const query = '(測試)'
      
      const result = highlightText(text, query)
      
      expect(result).toContain('<mark class="bg-yellow-200 font-bold">(測試)</mark>')
    })
  })
})
