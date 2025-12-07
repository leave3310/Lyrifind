/**
 * useLyrics Composable
 * 
 * 取得歌詞詳情的邏輯，使用 TanStack Query
 */

import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/services/queryKeys'
import type { Song } from '@/shared/contracts/lyrics.contract'
import { http } from '@/shared/services/http'

export function useLyrics(id: string) {
  // 調用歌詞詳情 API 的函式
  const fetchLyrics = async (): Promise<Song> => {
    try {
      const response = await http.get<Song>(`/lyrics/${id}`)
      return response.data
    } catch (error) {
      console.error('取得歌詞失敗:', error)
      throw error
    }
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.lyrics.detail(id),
    queryFn: fetchLyrics,
    staleTime: 30 * 60 * 1000, // 30 分鐘
    enabled: !!id,
  })

  return {
    song: data,
    isLoading,
    error,
    refetch,
  }
}
