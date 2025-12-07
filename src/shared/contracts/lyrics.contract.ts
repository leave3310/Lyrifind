/**
 * 歌詞搜尋 API Contract
 * 
 * 定義前端與 Google Apps Script 後端之間的 API 契約
 */

import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

// ============================================================
// Zod Schemas
// ============================================================

/** 歌曲完整資料 Schema */
export const SongSchema = z.object({
  id: z.string().min(1),
  artist: z.string().min(1),
  title: z.string().min(1),
  lyrics: z.string(),
})

/** 搜尋結果項目 Schema（不含歌詞） */
export const SearchResultSchema = z.object({
  id: z.string().min(1),
  artist: z.string().min(1),
  title: z.string().min(1),
})

/** 搜尋查詢參數 Schema */
export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

/** 搜尋回應 Schema */
export const SearchResponseSchema = z.object({
  data: z.array(SearchResultSchema),
  total: z.number().int().min(0),
})

/** 錯誤回應 Schema */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
})

// ============================================================
// Type Exports
// ============================================================

export type Song = z.infer<typeof SongSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>
export type SearchQuery = z.infer<typeof SearchQuerySchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ============================================================
// API Contract
// ============================================================

export const lyricsContract = c.router({
  /**
   * 搜尋歌曲
   * 
   * 根據關鍵字搜尋歌曲，關鍵字會比對歌名、歌手名稱和歌詞內容
   */
  search: {
    method: 'GET',
    path: '/search',
    query: SearchQuerySchema,
    responses: {
      200: SearchResponseSchema,
      400: ErrorResponseSchema,
    },
    summary: '搜尋歌曲',
  },

  /**
   * 取得歌曲詳情
   * 
   * 根據歌曲 ID 取得完整歌曲資料（含歌詞）
   */
  getById: {
    method: 'GET',
    path: '/lyrics/:id',
    pathParams: z.object({
      id: z.string().min(1),
    }),
    responses: {
      200: SongSchema,
      404: ErrorResponseSchema,
    },
    summary: '取得歌曲詳情',
  },
})

export type LyricsContract = typeof lyricsContract
