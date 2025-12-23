import type { SearchQuery, SearchResponse, Song } from '../types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

if (!APPS_SCRIPT_URL) {
  throw new Error('VITE_APPS_SCRIPT_URL is not defined in environment variables')
}

export class SearchService {
  async search(request: SearchQuery): Promise<SearchResponse> {
    const { query, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = request

    const params = new URLSearchParams({
      action: 'search',
      q: query,
      page: String(page),
      pageSize: String(pageSize)
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || '搜尋失敗，請稍後再試')
    }
    
    return response.json()
  }

  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id: id
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || '取得歌曲失敗')
    }
    
    return response.json()
  }
}

export const searchService = new SearchService()
