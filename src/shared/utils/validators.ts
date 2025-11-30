/**
 * 輸入驗證工具
 * @description 提供搜尋輸入驗證功能
 */

/** 最小搜尋關鍵字長度 */
const MIN_KEYWORD_LENGTH = 2

/** 最大搜尋關鍵字長度 */
const MAX_KEYWORD_LENGTH = 100

/**
 * 驗證結果
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 錯誤訊息（若無效） */
  errorMessage?: string
}

/**
 * 驗證搜尋關鍵字
 * @param keyword - 搜尋關鍵字
 * @returns 驗證結果
 */
export function validateSearchKeyword(keyword: string): ValidationResult {
  // 移除前後空白
  const trimmed = keyword.trim()

  // 檢查是否為空
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: '請輸入搜尋關鍵字',
    }
  }

  // 檢查長度是否過短
  if (trimmed.length < MIN_KEYWORD_LENGTH) {
    return {
      isValid: false,
      errorMessage: `請輸入至少 ${MIN_KEYWORD_LENGTH} 個字元`,
    }
  }

  // 檢查長度是否過長
  if (trimmed.length > MAX_KEYWORD_LENGTH) {
    return {
      isValid: false,
      errorMessage: `搜尋關鍵字不可超過 ${MAX_KEYWORD_LENGTH} 個字元`,
    }
  }

  return { isValid: true }
}

/**
 * 驗證歌曲 ID
 * @param id - 歌曲 ID
 * @returns 驗證結果
 */
export function validateSongId(id: string): ValidationResult {
  if (!id || !id.trim()) {
    return {
      isValid: false,
      errorMessage: '歌曲 ID 不可為空',
    }
  }

  return { isValid: true }
}

/**
 * 驗證頁碼
 * @param page - 頁碼
 * @returns 驗證結果
 */
export function validatePage(page: number): ValidationResult {
  if (!Number.isInteger(page) || page < 1) {
    return {
      isValid: false,
      errorMessage: '頁碼必須為正整數',
    }
  }

  return { isValid: true }
}

/**
 * 驗證每頁筆數
 * @param pageSize - 每頁筆數
 * @returns 驗證結果
 */
export function validatePageSize(pageSize: number): ValidationResult {
  if (!Number.isInteger(pageSize) || pageSize < 10 || pageSize > 50) {
    return {
      isValid: false,
      errorMessage: '每頁筆數必須介於 10 至 50 之間',
    }
  }

  return { isValid: true }
}

/**
 * 清理搜尋關鍵字
 * @param keyword - 原始關鍵字
 * @returns 清理後的關鍵字
 */
export function sanitizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase()
}
