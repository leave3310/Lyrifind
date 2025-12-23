// T021: 單元測試 - 驗證輸入驗證邏輯
import { describe, it, expect } from 'vitest'
import { validateSearchQuery, validatePage } from '../validation'

describe('Validation Utils', () => {
  describe('validateSearchQuery', () => {
    it('應接受有效的搜尋查詢', () => {
      const result = validateSearchQuery('周杰倫')
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('應拒絕空白字串', () => {
      const result = validateSearchQuery('   ')
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請輸入搜尋關鍵字')
    })

    it('應拒絕空字串', () => {
      const result = validateSearchQuery('')
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請輸入搜尋關鍵字')
    })

    it('應拒絕超過 200 字元的查詢', () => {
      const longQuery = 'a'.repeat(201)
      const result = validateSearchQuery(longQuery)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('不可超過 200 字元')
    })

    it('應接受恰好 200 字元的查詢', () => {
      const query = 'a'.repeat(200)
      const result = validateSearchQuery(query)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('應自動去除前後空白', () => {
      const result = validateSearchQuery('  周杰倫  ')
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })
  })

  describe('validatePage', () => {
    it('應接受有效的頁碼', () => {
      const result = validatePage(1, 10)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('應拒絕小於 1 的頁碼', () => {
      const result = validatePage(0, 10)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('頁碼必須大於 0')
    })

    it('應拒絕負數頁碼', () => {
      const result = validatePage(-1, 10)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('頁碼必須大於 0')
    })

    it('應拒絕超過總頁數的頁碼', () => {
      const result = validatePage(11, 10)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('不可超過總頁數 10')
    })

    it('應接受等於總頁數的頁碼', () => {
      const result = validatePage(10, 10)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('應在總頁數為 0 時允許任何正數頁碼', () => {
      const result = validatePage(5, 0)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })
  })
})
