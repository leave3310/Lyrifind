// 歌曲詳細頁 API 服務
// 整合 Google Apps Script getSong 端點

import type { Song } from '@/shared/types/common.types'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string

if (!APPS_SCRIPT_URL) {
  throw new Error('VITE_APPS_SCRIPT_URL 未設定於環境變數中')
}

export class SongService {
  /**
   * 依 ID 取得歌曲詳情
   * @param id 歌曲 ID
   * @returns 歌曲物件，找不到時回傳 null
   * @throws 網路或伺服器錯誤時拋出例外
   */
  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id
    })

    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
      throw new Error(errorData.error?.message ?? '取得歌曲失敗，請稍後再試')
    }

    const data = await response.json() as Song & { error?: { code: string; message: string } }

    // Google Apps Script 有時以 200 回傳錯誤
    if (data.error) {
      if (data.error.code === 'SONG_NOT_FOUND') {
        return null
      }
      throw new Error(data.error.message)
    }

    return data
  }
}

export const songService = new SongService()
