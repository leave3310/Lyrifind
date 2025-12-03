/**
 * Axios 統一 instance
 * @description 依據憲章 VIII. HTTP 請求規範建立
 */
import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import type { AppError, ErrorCode } from '@/shared/types'

/**
 * 請求逾時設定（毫秒）
 */
const TIMEOUT = 10000

/**
 * 建立 Axios instance
 */
export const http: AxiosInstance = axios.create({
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 請求攔截器
 */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可在此處加入請求前的處理邏輯
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * 回應攔截器
 */
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    const appError = transformError(error)
    return Promise.reject(appError)
  }
)

/**
 * 將 Axios 錯誤轉換為 AppError
 * @param error - Axios 錯誤
 * @returns AppError 物件
 */
function transformError(error: AxiosError): AppError {
  // 網路錯誤（無回應）
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: '網路連線失敗，請檢查網路設定',
      retryable: true,
    }
  }

  const status = error.response.status
  let code: ErrorCode
  let message: string
  let retryable: boolean

  switch (status) {
    case 400:
      code = 'VALIDATION_ERROR'
      message = '請求參數錯誤'
      retryable = false
      break
    case 403:
      code = 'API_ERROR'
      message = '權限不足，請檢查 API 金鑰設定'
      retryable = false
      break
    case 404:
      code = 'NOT_FOUND'
      message = '找不到指定的資源'
      retryable = false
      break
    case 429:
      code = 'RATE_LIMIT'
      message = '請求次數過多，請稍後再試'
      retryable = true
      break
    default:
      if (status >= 500) {
        code = 'API_ERROR'
        message = '伺服器發生錯誤，請稍後再試'
        retryable = true
      } else {
        code = 'API_ERROR'
        message = '發生未知錯誤'
        retryable = false
      }
  }

  return { code, message, retryable }
}
