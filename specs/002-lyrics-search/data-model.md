# Data Model: 歌詞搜尋網站

**Feature**: 002-lyrics-search  
**Date**: 2025-12-05

## 實體定義

### Song（歌曲）

代表一首完整的歌曲資料。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| id | string | 唯一識別碼 | 必填、非空 |
| artist | string | 歌手名稱 | 必填、非空 |
| title | string | 歌曲名稱 | 必填、非空 |
| lyrics | string | 完整歌詞內容 | 必填 |

**來源**: Google Sheet

```typescript
// Zod Schema
const SongSchema = z.object({
  id: z.string().min(1),
  artist: z.string().min(1),
  title: z.string().min(1),
  lyrics: z.string(),
})

type Song = z.infer<typeof SongSchema>
```

### SearchResult（搜尋結果項目）

搜尋 API 回傳的單筆結果，用於列表顯示（不含完整歌詞）。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | string | 歌曲識別碼（用於導向詳情頁） |
| artist | string | 歌手名稱 |
| title | string | 歌曲名稱 |

```typescript
const SearchResultSchema = z.object({
  id: z.string().min(1),
  artist: z.string().min(1),
  title: z.string().min(1),
})

type SearchResult = z.infer<typeof SearchResultSchema>
```

### SearchResponse（搜尋回應）

搜尋 API 的完整回應結構。

| 欄位 | 型別 | 說明 |
|------|------|------|
| data | SearchResult[] | 搜尋結果陣列 |
| total | number | 總筆數 |

```typescript
const SearchResponseSchema = z.object({
  data: z.array(SearchResultSchema),
  total: z.number().int().min(0),
})

type SearchResponse = z.infer<typeof SearchResponseSchema>
```

### SearchQuery（搜尋查詢參數）

搜尋請求的參數結構。

| 欄位 | 型別 | 說明 | 預設值 |
|------|------|------|--------|
| q | string | 搜尋關鍵字 | 必填 |
| page | number | 頁碼 | 1 |
| limit | number | 每頁筆數 | 20 |

```typescript
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
})

type SearchQuery = z.infer<typeof SearchQuerySchema>
```

### ErrorResponse（錯誤回應）

API 錯誤回應結構。

| 欄位 | 型別 | 說明 |
|------|------|------|
| message | string | 錯誤訊息（正體中文） |
| code | string | 錯誤代碼（可選） |

```typescript
const ErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
})

type ErrorResponse = z.infer<typeof ErrorResponseSchema>
```

## 實體關係圖

```
┌─────────────────┐
│   SearchQuery   │
│  (搜尋查詢參數)  │
└────────┬────────┘
         │ 請求
         ▼
┌─────────────────┐         ┌─────────────────┐
│ SearchResponse  │────────▶│  SearchResult   │
│   (搜尋回應)    │  1:N    │  (搜尋結果項)   │
└─────────────────┘         └────────┬────────┘
                                     │ id 對應
                                     ▼
                            ┌─────────────────┐
                            │      Song       │
                            │  (完整歌曲資料) │
                            └─────────────────┘
```

## Google Sheet 欄位對應

| Sheet 欄位 | 實體欄位 | 說明 |
|------------|----------|------|
| id | Song.id, SearchResult.id | A 欄 |
| artist | Song.artist, SearchResult.artist | B 欄 |
| title | Song.title, SearchResult.title | C 欄 |
| lyrics | Song.lyrics | D 欄 |

## 狀態定義

### 搜尋狀態

```typescript
interface SearchState {
  keyword: string           // 搜尋關鍵字
  results: SearchResult[]   // 搜尋結果
  isLoading: boolean        // 載入中
  error: Error | null       // 錯誤
  hasMore: boolean          // 是否有更多結果
}
```

### 歌詞詳情狀態

```typescript
interface LyricsState {
  song: Song | null         // 歌曲資料
  isLoading: boolean        // 載入中
  error: Error | null       // 錯誤
}
```
