/**
 * 歌詞服務
 * @description 負責歌詞相關的資料操作
 */
import { googleSheetsApi } from '@/shared/services/googleSheetsApi'
import type { AppError, Song } from '@/shared/types'

/**
 * 依 ID 取得歌詞
 * @param id - 歌曲 ID
 * @returns 歌曲資料，找不到時回傳 null
 * @throws AppError
 */
export async function getLyricsById(id: string): Promise<Song | null> {
  if (!id || id.trim() === '') {
    const error: AppError = {
      code: 'VALIDATION_ERROR',
      message: '請提供有效的歌曲 ID',
      retryable: false,
    }
    throw error
  }

  const songs = await googleSheetsApi.fetchAllSongs()
  return songs.find((song) => song.id === id) || null
}

/**
 * 取得所有歌曲
 * @returns 所有歌曲列表
 */
export async function getAllSongs(): Promise<Song[]> {
  return googleSheetsApi.fetchAllSongs()
}

/**
 * 清除快取
 */
export function clearCache(): void {
  googleSheetsApi.clearCache()
}

/**
 * 歌詞服務物件（便於模組匯入）
 */
export const lyricsService = {
  getLyricsById,
  getAllSongs,
  clearCache,
}

export default lyricsService
