/**
 * Axios HTTP 實例
 * 
 * 統一管理所有 HTTP 請求，包括攔截器設定、錯誤處理和載入狀態
 */

import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
http.interceptors.request.use(
  (config) => {
    // 可在此新增認證 token、請求日誌等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 回應攔截器
http.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // 統一錯誤處理
    if (error.response?.status === 404) {
      return Promise.reject(new Error('找不到此資源'))
    }
    if (error.response?.status === 500) {
      return Promise.reject(new Error('伺服器錯誤，請稍後重試'))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('請求逾時，請檢查網路連線'))
    }
    if (error.message === 'Network Error') {
      return Promise.reject(new Error('網路連線失敗，請檢查您的網路'))
    }
    return Promise.reject(error)
  }
)

export { http }
