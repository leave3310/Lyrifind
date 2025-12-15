# Search API Contract

**Feature**: 004-lyrics-search  
**Date**: 2025-12-13  
**Protocol**: REST API  
**Format**: JSON

## 概述

本契約定義歌詞搜尋功能的 API 端點規範。**本專案使用 Google Sheets 作為資料來源，透過 Google Apps Script 部署為 Web API**。

**資料來源**：Google Sheets（欄位：id, artist, title, lyrics）  
**API 提供者**：Google Apps Script Web App  
**端點 URL 格式**：`https://script.google.com/macros/s/{SCRIPT_ID}/exec?action={action}&...`

---

## 端點定義

### 1. 搜尋歌曲

#### 請求

**端點**：`GET {APPS_SCRIPT_URL}?action=search`

**完整 URL 範例**：`https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=search&q=青花瓷&page=1`

**查詢參數**：

| 參數名稱 | 型別 | 必填 | 預設值 | 說明 |
|---------|------|------|--------|------|
| `action` | `string` | ✅ | - | 固定值 `search` |
| `q` | `string` | ✅ | - | 搜尋關鍵字（歌名、歌手或歌詞） |
| `page` | `number` | ❌ | `1` | 頁碼（從 1 開始） |
| `pageSize` | `number` | ❌ | `20` | 每頁筆數（固定 20） |

**範例請求**：
```
GET https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=search&q=青花瓷&page=1&pageSize=20
```

#### 成功回應

**狀態碼**：`200 OK`

**回應結構**：
```json
{
  "items": [
    {
      "song": {
        "id": "song-001",
        "artist": "周杰倫",
        "title": "青花瓷",
        "lyrics": "素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝..."
      },
      "lyricsSnippet": {
        "lines": [
          "素胚勾勒出青花筆鋒濃轉淡",
          "瓶身描繪的牡丹一如妳初妝",
          "冉冉檀香透過窗心事我了然"
        ],
        "matchIndex": 1
      },
      "highlightedSnippet": "素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的<mark class=\"bg-yellow-200 font-bold\">牡丹</mark>一如妳初妝\n冉冉檀香透過窗心事我了然"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

**欄位說明**：
- `items`：搜尋結果陣列
  - `song`：歌曲完整資訊
  - `lyricsSnippet`：歌詞片段（僅當匹配歌詞時存在）
  - `highlightedSnippet`：已高亮的歌詞片段 HTML（僅當匹配歌詞時存在）
- `total`：總結果數量
- `page`：目前頁碼
- `pageSize`：每頁筆數
- `totalPages`：總頁數

#### 錯誤回應

**400 Bad Request** - 請求參數錯誤
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "請輸入搜尋關鍵字"
  }
}
```

可能的錯誤碼：
- `INVALID_QUERY`：查詢參數為空或格式錯誤
- `QUERY_TOO_LONG`：查詢字串超過 200 字元
- `INVALID_PAGE`：頁碼不合法（< 1 或超過總頁數）

**500 Internal Server Error** - 伺服器錯誤
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "搜尋失敗，請稍後再試"
  }
}
```

---

### 2. 取得歌曲詳情

#### 請求

**端點**：`GET {APPS_SCRIPT_URL}?action=getSong`

**完整 URL 範例**：`https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=getSong&id=song-001`

**查詢參數**：

| 參數名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `action` | `string` | ✅ | 固定值 `getSong` |
| `id` | `string` | ✅ | 歌曲 ID |

**範例請求**：
```
GET https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=getSong&id=song-001
```

#### 成功回應

**狀態碼**：`200 OK`

**回應結構**：
```json
{
  "id": "song-001",
  "artist": "周杰倫",
  "title": "青花瓷",
  "lyrics": "素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝\n冉冉檀香透過窗心事我了然..."
}
```

#### 錯誤回應

**404 Not Found** - 歌曲不存在
```json
{
  "error": {
    "code": "SONG_NOT_FOUND",
    "message": "找不到此歌曲"
  }
}
```

---

## TypeScript 型別定義

以下型別定義可用於前端與後端，確保契約一致性。

```typescript
// ===== 請求型別 =====

export interface SearchRequest {
  q: string
  page?: number
  pageSize?: number
}

export interface GetSongRequest {
  id: string
}

// ===== 回應型別 =====

export interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}

export interface LyricsSnippet {
  lines: string[]
  matchIndex: number
}

export interface SearchResultItem {
  song: Song
  lyricsSnippet: LyricsSnippet | null
  highlightedSnippet: string | null
}

export interface SearchResponse {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

// ===== 錯誤碼列舉 =====

export enum SearchErrorCode {
  INVALID_QUERY = 'INVALID_QUERY',
  QUERY_TOO_LONG = 'QUERY_TOO_LONG',
  INVALID_PAGE = 'INVALID_PAGE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SONG_NOT_FOUND = 'SONG_NOT_FOUND'
}
```

---

## 使用 Zod Schema 驗證（未來整合 ts-rest 時使用）

```typescript
import { z } from 'zod'

// ===== Schema 定義 =====

export const SongSchema = z.object({
  id: z.string(),
  artist: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  lyrics: z.string().min(1).max(10000)
})

export const LyricsSnippetSchema = z.object({
  lines: z.array(z.string()).length(3),  // 固定 3 行
  matchIndex: z.number().int().min(0).max(2)
})

export const SearchResultItemSchema = z.object({
  song: SongSchema,
  lyricsSnippet: LyricsSnippetSchema.nullable(),
  highlightedSnippet: z.string().nullable()
})

export const SearchRequestSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(20)
})

export const SearchResponseSchema = z.object({
  items: z.array(SearchResultItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
})

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
})

// ===== 型別推斷 =====

export type Song = z.infer<typeof SongSchema>
export type LyricsSnippet = z.infer<typeof LyricsSnippetSchema>
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>
export type SearchRequest = z.infer<typeof SearchRequestSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
```

---

## Google Apps Script 實作範例

本專案使用 Google Apps Script 作為後端 API，以下為實作參考：

### Code.gs - 主要邏輯

```javascript
// Google Apps Script Web App 入口
function doGet(e) {
  const action = e.parameter.action
  
  try {
    if (action === 'search') {
      return handleSearch(e.parameter.q, e.parameter.page || 1)
    } else if (action === 'getSong') {
      return handleGetSong(e.parameter.id)
    } else {
      return createJsonResponse({ error: { code: 'INVALID_ACTION', message: '無效的操作' } }, 400)
    }
  } catch (error) {
    return createJsonResponse({ error: { code: 'INTERNAL_ERROR', message: '伺服器錯誤' } }, 500)
  }
}

// 搜尋處理
function handleSearch(query, page) {
  if (!query || query.trim().length === 0) {
    return createJsonResponse({ error: { code: 'INVALID_QUERY', message: '請輸入搜尋關鍵字' } }, 400)
  }
  
  if (query.length > 200) {
    return createJsonResponse({ error: { code: 'QUERY_TOO_LONG', message: '搜尋關鍵字不可超過 200 字元' } }, 400)
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs')
  const data = sheet.getDataRange().getValues()
  const headers = data[0] // ['id', 'artist', 'title', 'lyrics']
  const rows = data.slice(1)
  
  // 轉換為物件陣列
  const songs = rows.map(row => ({
    id: row[0],
    artist: row[1],
    title: row[2],
    lyrics: row[3]
  }))
  
  // 搜尋邏輯：精確匹配歌名/歌手，部分匹配歌詞
  const q = query.toLowerCase().trim()
  const results = songs
    .filter(song => {
      return song.title.toLowerCase() === q ||
             song.artist.toLowerCase() === q ||
             song.lyrics.toLowerCase().includes(q)
    })
    .map(song => {
      const lyricsMatch = song.lyrics.toLowerCase().includes(q)
      return {
        song: song,
        lyricsSnippet: lyricsMatch ? extractSnippet(song.lyrics, query) : null,
        highlightedSnippet: lyricsMatch ? highlightText(song.lyrics, query) : null
      }
    })
  
  // 分頁處理
  const pageSize = 20
  const pageNum = parseInt(page)
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const paginatedResults = results.slice(start, end)
  
  return createJsonResponse({
    items: paginatedResults,
    total: results.length,
    page: pageNum,
    pageSize: pageSize,
    totalPages: Math.ceil(results.length / pageSize)
  })
}

// 取得單一歌曲
function handleGetSong(id) {
  if (!id) {
    return createJsonResponse({ error: { code: 'INVALID_QUERY', message: '缺少歌曲 ID' } }, 400)
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs')
  const data = sheet.getDataRange().getValues()
  const rows = data.slice(1)
  
  const songRow = rows.find(row => row[0] === id)
  
  if (!songRow) {
    return createJsonResponse({ error: { code: 'SONG_NOT_FOUND', message: '找不到此歌曲' } }, 404)
  }
  
  return createJsonResponse({
    id: songRow[0],
    artist: songRow[1],
    title: songRow[2],
    lyrics: songRow[3]
  })
}

// 擷取歌詞片段（3 行）
function extractSnippet(lyrics, query) {
  const lines = lyrics.split('\n')
  const q = query.toLowerCase()
  
  const matchIndex = lines.findIndex(line => line.toLowerCase().includes(q))
  if (matchIndex === -1) return null
  
  const start = Math.max(0, matchIndex - 1)
  const end = Math.min(lines.length, matchIndex + 2)
  
  return {
    lines: lines.slice(start, end),
    matchIndex: matchIndex - start
  }
}

// 高亮文字
function highlightText(text, query) {
  if (!query) return text
  
  const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 font-bold">$1</mark>')
}

// 跳脫正則表達式特殊字元
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 建立 JSON 回應（支援 CORS）
function createJsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')  // 允許所有來源（開發用）
    .setHeader('Access-Control-Allow-Methods', 'GET')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
```

### 部署步驟

1. **建立 Google Sheets**：
   - 新增工作表命名為 `Songs`
   - 第一列設定標題：`id` | `artist` | `title` | `lyrics`
   - 填入歌曲資料（歌詞使用實際換行或 `\n` 表示換行）

2. **開啟 Apps Script 編輯器**：
   - 工具 → 指令碼編輯器
   - 貼上上述 `Code.gs` 程式碼
   - 儲存專案（命名為 "LyriFind API"）

3. **部署為 Web App**：
   - 點擊「部署」→「新增部署」
   - 類型：選擇「Web 應用程式」
   - 執行身分：選擇「我」
   - 存取權：選擇「所有人」
   - 部署
   - 複製「網頁應用程式網址」（即 `SCRIPT_ID` URL）

4. **測試 API**：
```bash
# 搜尋測試
curl "https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec?action=search&q=測試&page=1"

# 取得歌曲測試
curl "https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec?action=getSong&id=song-001"
```

### 前端服務整合

```typescript
// src/features/search/services/searchService.ts

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export class SearchService {
  async search(request: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams({
      action: 'search',
      q: request.q,
      page: String(request.page ?? 1),
      pageSize: String(request.pageSize ?? 20)
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    if (!response.ok) {
      throw new Error('搜尋失敗')
    }
    
    return response.json()
  }
  
  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id: id
    })
    
    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error('取得歌曲失敗')
    }
    
    return response.json()
  }
}
```

### 環境變數設定

```bash
# .env.local
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

---

## 契約測試

### E2E 測試範例（Playwright）

```typescript
test('搜尋 API 應返回符合契約的回應', async ({ request }) => {
  const response = await request.get('/api/search?q=青花瓷&page=1')
  
  expect(response.status()).toBe(200)
  
  const data = await response.json()
  expect(data).toHaveProperty('items')
  expect(data).toHaveProperty('total')
  expect(data).toHaveProperty('page', 1)
  expect(data).toHaveProperty('pageSize', 20)
  expect(data).toHaveProperty('totalPages')
  
  // 驗證回應結構
  expect(Array.isArray(data.items)).toBe(true)
  if (data.items.length > 0) {
    const item = data.items[0]
    expect(item).toHaveProperty('song')
    expect(item.song).toHaveProperty('id')
    expect(item.song).toHaveProperty('title')
    expect(item.song).toHaveProperty('artist')
    expect(item.song).toHaveProperty('lyrics')
    expect(item.song).toHaveProperty('createdAt')
  }
})
```

---

## 未來整合 ts-rest 時的契約定義

```typescript
// src/shared/contracts/search.contract.ts

import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  SearchRequestSchema,
  SearchResponseSchema,
  SongSchema,
  ErrorResponseSchema
} from './schemas'

const c = initContract()

export const searchContract = c.router({
  search: {
    method: 'GET',
    path: '/api/search',
    query: SearchRequestSchema,
    responses: {
      200: SearchResponseSchema,
      400: ErrorResponseSchema,
      500: ErrorResponseSchema
    },
    summary: '搜尋歌曲'
  },
  getSong: {
    method: 'GET',
    path: '/api/songs/:id',
    pathParams: z.object({
      id: z.string()
    }),
    responses: {
      200: SongSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema
    },
    summary: '取得歌曲詳情'
  }
})

export type SearchContract = typeof searchContract
```

---

## 契約版本控制

**當前版本**：v1.0.0  
**最後更新**：2025-12-13

**變更歷史**：
- v1.0.0 (2025-12-13): 初始版本，定義搜尋和取得歌曲詳情端點

**未來變更考量**：
- 新增進階搜尋篩選（音樂類型、發行年份）
- 新增排序選項（相關性、標題、日期）
- 新增搜尋建議（自動完成）

所有變更將遵循語意化版本控制，並更新此契約文件。
