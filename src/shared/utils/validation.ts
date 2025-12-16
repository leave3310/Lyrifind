// 共用驗證工具函式

import { MAX_QUERY_LENGTH } from '@/features/search/types'

export interface ValidationResult {
  valid: boolean
  error: string | null
}

/**
 * 驗證搜尋查詢字串
 * @param query 搜尋查詢字串
 * @returns 驗證結果
 */
export function validateSearchQuery(query: string): ValidationResult {
  const trimmed = query.trim()
  
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '請輸入搜尋關鍵字'
    }
  }
  
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `搜尋關鍵字不可超過 ${MAX_QUERY_LENGTH} 字元`
    }
  }
  
  return { valid: true, error: null }
}

/**
 * 驗證頁碼
 * @param page 頁碼
 * @param totalPages 總頁數
 * @returns 驗證結果
 */
export function validatePage(page: number, totalPages: number): ValidationResult {
  if (page < 1) {
    return {
      valid: false,
      error: '頁碼必須大於 0'
    }
  }
  
  if (totalPages > 0 && page > totalPages) {
    return {
      valid: false,
      error: `頁碼不可超過總頁數 ${totalPages}`
    }
  }
  
  return { valid: true, error: null }
}
