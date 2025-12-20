// 搜尋結果緩存管理
import type { SearchResultItem, Song } from '../types'

class SearchCache {
  private cache = new Map<string, Song>()

  // 將搜尋結果加入緩存
  cacheSearchResults(items: SearchResultItem[]) {
    items.forEach(item => {
      this.cache.set(String(item.song.id), item.song)
    })
  }

  // 從緩存取得歌曲
  getSong(id: string): Song | null {
    return this.cache.get(id) || null
  }

  // 清除緩存
  clear() {
    this.cache.clear()
  }
}

export const searchCache = new SearchCache()
