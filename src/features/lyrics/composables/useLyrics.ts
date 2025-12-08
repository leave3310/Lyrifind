/**
 * 歌詞詳情 Composable
 * 
 * 使用 TanStack Query 進行 API 請求與快取
 * staleTime 設定為 30 分鐘
 */

import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiClient } from '@/shared/services/apiClient'
import { queryKeys } from '@/shared/services/queryKeys'
import type { Song } from '@/shared/types'

export function useLyrics(id: string) {
  // TanStack Query 取得歌詞
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.lyrics.detail(id),
    queryFn: async () => {
      const response = await apiClient.getById({
        params: { id },
      })

      if (response.status === 404) {
        throw new Error(response.body.message || '找不到此歌曲')
      }

      if (response.status !== 200) {
        throw new Error(response.body.message || '載入失敗')
      }

      return response.body as Song
    },
    staleTime: 30 * 60 * 1000, // 30 分鐘
    retry: 2,
  })

  // 歌曲資料
  const song = computed(() => data.value || null)

  // 重試
  const retry = async () => {
    await refetch()
  }

  return {
    song,
    isLoading: computed(() => isLoading.value),
    error,
    retry,
  }
}
