/**
 * API 客戶端
 * 
 * 提供型別安全的 API 呼叫方法
 */

import type { Song, SearchResponse } from '../types'
import { httpClient } from './http'

export const apiClient = {
  /**
   * 搜尋歌曲
   */
  async search(params: { query: { q: string; page?: number; limit?: number } }) {
    try {
      const response = await httpClient.get<SearchResponse>('', {
        params: {
          action: 'search',
          ...params.query,
        },
      })

      return {
        status: 200 as const,
        body: response.data,
        headers: response.headers as Record<string, string>,
      }
    } catch (error: any) {
      return {
        status: error.response?.status || 500,
        body: error.response?.data || { message: '搜尋失敗', data: [], total: 0 },
        headers: error.response?.headers || {},
      }
    }
  },

  /**
   * 取得歌曲詳情
   */
  async getById(params: { params: { id: string } }) {
    try {
      const response = await httpClient.get<Song>('', {
        params: {
          action: 'get',
          id: params.params.id,
        },
      })

      return {
        status: 200 as const,
        body: response.data,
        headers: response.headers as Record<string, string>,
      }
    } catch (error: any) {
      const status = error.response?.status || 500
      return {
        status: status as 404 | 500,
        body: error.response?.data || { message: '載入失敗' },
        headers: error.response?.headers || {},
      }
    }
  },
}
