/**
 * Query Key Factory
 * 
 * 使用 Factory 模式集中管理 TanStack Query 的快取鍵
 */

export const queryKeys = {
  lyrics: {
    all: () => ['lyrics'] as const,
    lists: () => [...queryKeys.lyrics.all(), 'list'] as const,
    list: (filters: { q: string; page: number }) =>
      [...queryKeys.lyrics.lists(), filters] as const,
    details: () => [...queryKeys.lyrics.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.lyrics.details(), id] as const,
  },
  search: {
    all: () => ['search'] as const,
    results: (query: string, page: number) =>
      [...queryKeys.search.all(), query, page] as const,
  },
}
