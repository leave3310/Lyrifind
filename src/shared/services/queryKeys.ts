/**
 * Query Key Factory
 * 
 * 集中管理 TanStack Query 的 query keys
 */

export const queryKeys = {
  search: {
    all: ['search'] as const,
    results: (keyword: string, page: number = 1) =>
      [...queryKeys.search.all, 'results', keyword, page] as const,
  },
  lyrics: {
    all: ['lyrics'] as const,
    detail: (id: string) => [...queryKeys.lyrics.all, 'detail', id] as const,
  },
} as const
