// 搜尋服務：與 Google Apps Script API 互動

import type { SearchQuery, SearchResponse, Song } from '../types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export class SearchService {
  /**
   * 搜尋歌曲
   * @param request 搜尋請求參數
   * @returns 搜尋結果
   */
  async search(request: SearchQuery): Promise<SearchResponse> {
    const params = new URLSearchParams({
      action: 'search',
      q: request.query,
      page: String(request.page ?? DEFAULT_PAGE),
      pageSize: String(request.pageSize ?? DEFAULT_PAGE_SIZE)
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || '搜尋失敗，請稍後再試')
    }
    
    return response.json()
  }
  
  /**
   * 根據 ID 取得歌曲
   * @param id 歌曲 ID
   * @returns 歌曲資訊，若不存在則返回 null
   */
  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id: id
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    
    if (response.status === 404) {
      console.warn(`Song ID ${id} not found (404)`)
      return null
    }
    
    if (!response.ok) {
      throw new Error('取得歌曲失敗')
    }
    
    const data = await response.json()
    if (data && data.id) {
      return data
    }
    
    throw new Error('取得歌曲失敗')
  }
}

// 匯出單例
export const searchService = new SearchService()
