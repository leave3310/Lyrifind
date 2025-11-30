/**
 * Google Apps Script API 服務
 * @description 透過 Apps Script Web App 取得歌詞資料
 */

import { http } from './http'
import type { Song, AppError } from '@/shared/types'

/** Apps Script Web App URL */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/** L2 快取鍵 */
const CACHE_KEY = 'lyrifind:songs'
const CACHE_EXPIRY_KEY = 'lyrifind:songs:expiry'
const CACHE_TTL = 60 * 60 * 1000 // 1 小時

/**
 * Apps Script API 回應格式
 */
interface AppsScriptResponse {
  id: string | number
  title: string
  artist: string
  lyrics: string
}

/**
 * 將 Apps Script API 回應轉換為 Song 陣列
 * @param data - API 回應資料
 * @returns Song 陣列
 */
function transformAppsScriptData(data: AppsScriptResponse[]): Song[] {
  if (!data || !Array.isArray(data)) {
    return []
  }

  return data
    .filter((item) => 
      item.id !== undefined && 
      item.id !== '' &&
      item.title && 
      item.artist
    )
    .map((item) => ({
      id: String(item.id),
      title: item.title || '',
      artist: item.artist || '',
      lyrics: item.lyrics || '',
    }))
}

/**
 * 從 LocalStorage 取得快取資料
 * @returns 快取的歌曲陣列，若無快取或已過期則回傳 null
 */
function getCachedSongs(): Song[] | null {
  try {
    const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (!expiryStr) return null

    const expiry = parseInt(expiryStr, 10)
    if (Date.now() > expiry) {
      // 快取已過期，清除快取
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRY_KEY)
      return null
    }

    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    return JSON.parse(cached) as Song[]
  } catch {
    return null
  }
}

/**
 * 將歌曲資料存入 LocalStorage 快取
 * @param songs - 歌曲陣列
 */
function setCachedSongs(songs: Song[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(songs))
    localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_TTL))
  } catch {
    // LocalStorage 可能已滿，忽略錯誤
    console.warn('無法儲存快取資料至 LocalStorage')
  }
}

/**
 * Google Apps Script API 服務
 */
export const googleSheetsApi = {
  /**
   * 取得所有歌曲資料
   * @returns 所有歌曲陣列
   * @throws AppError
   */
  async fetchAllSongs(): Promise<Song[]> {
    // 檢查 L2 快取
    const cached = getCachedSongs()
    if (cached) {
      console.log('從快取讀取歌曲資料')
      return cached
    }

    // 驗證設定
    if (!API_BASE_URL) {
      const error: AppError = {
        code: 'API_ERROR',
        message: '請設定 VITE_API_BASE_URL 環境變數',
        retryable: false,
      }
      throw error
    }

    try {
      // 呼叫 Apps Script Web App
      const response = await http.get<AppsScriptResponse[] | { error: string }>(API_BASE_URL)

      // 檢查是否為錯誤回應
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
          const error: AppError = {
            code: 'API_ERROR',
            message: response.data.error,
            retryable: true,
          }
          throw error
        }
        const error: AppError = {
          code: 'API_ERROR',
          message: 'API 回應格式錯誤',
          retryable: true,
        }
        throw error
      }

      const songs = transformAppsScriptData(response.data)
      console.log(`成功載入 ${songs.length} 首歌曲`)

      // 存入 L2 快取
      setCachedSongs(songs)

      return songs
    } catch (err) {
      // 處理網路錯誤
      if (err instanceof Error && err.message.includes('Network Error')) {
        const error: AppError = {
          code: 'NETWORK_ERROR',
          message: '網路錯誤：請確認 Apps Script 已正確部署並設定為「任何人皆可存取」',
          retryable: true,
        }
        throw error
      }
      throw err
    }
  },

  /**
   * 清除快取
   */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
    console.log('已清除歌曲快取')
  },
}
