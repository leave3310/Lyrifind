/**
 * useLyrics Composable
 * 
 * 取得歌詞詳情的邏輯，使用 TanStack Query
 */

import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/services/queryKeys'
import type { Song } from '@/shared/contracts/lyrics.contract'

export function useLyrics(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.lyrics.detail(id),
    queryFn: async () => {
      // TODO: 呼叫 API
      return {} as Song
    },
    staleTime: 30 * 60 * 1000,
  })

  return {
    song: data,
    isLoading,
    error,
    refetch,
  }
}
