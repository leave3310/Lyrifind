/**
 * 錯誤處理組合式函式
 * @description 提供統一的錯誤處理和重試機制
 */

import { ref, readonly } from 'vue'
import type { AppError } from '@/shared/types'

/**
 * 錯誤處理 composable
 */
export function useErrorHandler() {
  const error = ref<AppError | null>(null)
  const isRetrying = ref(false)

  /**
   * 設定錯誤
   * @param appError - 錯誤物件
   */
  function setError(appError: AppError | null) {
    error.value = appError
  }

  /**
   * 清除錯誤
   */
  function clearError() {
    error.value = null
  }

  /**
   * 執行帶有錯誤處理的非同步操作
   * @param fn - 非同步函式
   * @returns 執行結果或 null（若發生錯誤）
   */
  async function executeWithErrorHandling<T>(
    fn: () => Promise<T>
  ): Promise<T | null> {
    try {
      clearError()
      return await fn()
    } catch (err) {
      const appError = err as AppError
      setError(appError)
      return null
    }
  }

  /**
   * 執行帶有重試機制的非同步操作
   * @param fn - 非同步函式
   * @param maxRetries - 最大重試次數（預設 3）
   * @param delay - 重試延遲（毫秒，預設 1000）
   * @returns 執行結果或 null（若所有重試都失敗）
   */
  async function executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T | null> {
    let lastError: AppError | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        clearError()
        isRetrying.value = attempt > 0
        return await fn()
      } catch (err) {
        lastError = err as AppError

        // 如果錯誤不可重試，直接退出
        if (!lastError.retryable) {
          setError(lastError)
          isRetrying.value = false
          return null
        }

        // 最後一次重試失敗
        if (attempt === maxRetries) {
          setError(lastError)
          isRetrying.value = false
          return null
        }

        // 指數退避延遲
        const backoffDelay = delay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      }
    }

    isRetrying.value = false
    return null
  }

  return {
    error: readonly(error),
    isRetrying: readonly(isRetrying),
    setError,
    clearError,
    executeWithErrorHandling,
    executeWithRetry,
  }
}
