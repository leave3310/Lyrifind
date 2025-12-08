/**
 * Axios HTTP 客戶端
 * 
 * 設定 Axios instance 與攔截器
 */

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const httpClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
httpClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 回應攔截器
httpClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 統一錯誤處理
    if (error.response) {
      // 伺服器回應錯誤
      console.error('API 錯誤:', error.response.data)
    } else if (error.request) {
      // 請求已發送但無回應
      console.error('網路錯誤:', error.message)
    } else {
      // 其他錯誤
      console.error('請求錯誤:', error.message)
    }
    return Promise.reject(error)
  }
)
