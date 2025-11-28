# 資料模型：歌詞搜尋網站

**Feature Branch**: `001-lyrics-search`  
**建立日期**: 2025-11-27  
**狀態**: 完成

## 目錄

1. [實體定義](#實體定義)
2. [型別定義](#型別定義)
3. [資料流程](#資料流程)
4. [Google Sheets 結構](#google-sheets-結構)

---

## 實體定義

### Song（歌曲）

代表一首歌曲的完整資訊。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | `string` | ✅ | 唯一識別碼 |
| `title` | `string` | ✅ | 歌曲名稱 |
| `artist` | `string` | ✅ | 歌手名稱 |
| `lyrics` | `string` | ✅ | 完整歌詞內容 |

**驗證規則**：
- `id`：非空字串，唯一
- `title`：非空字串，最大長度 200 字元
- `artist`：非空字串，最大長度 100 字元
- `lyrics`：非空字串

---

### SearchResult（搜尋結果）

代表一筆搜尋結果，包含歌曲基本資訊和搜尋相關的 metadata。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `song` | `Song` | ✅ | 歌曲資訊 |
| `score` | `number` | ✅ | 相關性分數（用於排序） |
| `matchType` | `MatchType` | ✅ | 匹配類型 |
| `highlightedTitle` | `string` | ❌ | 標題中的關鍵字高亮 HTML |
| `highlightedArtist` | `string` | ❌ | 歌手名稱中的關鍵字高亮 HTML |
| `highlightedLyrics` | `string` | ❌ | 歌詞片段中的關鍵字高亮 HTML |

**MatchType 列舉**：
- `TITLE_EXACT`：標題完全匹配
- `TITLE_PARTIAL`：標題部分匹配
- `ARTIST`：歌手名稱匹配
- `LYRICS`：歌詞內容匹配

---

### SearchQuery（搜尋查詢）

代表使用者的搜尋請求。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `keyword` | `string` | ✅ | 搜尋關鍵字 |
| `page` | `number` | ❌ | 頁碼（預設 1） |
| `pageSize` | `number` | ❌ | 每頁筆數（預設 20） |

**驗證規則**：
- `keyword`：非空字串，至少 2 個字元
- `page`：正整數，最小值 1
- `pageSize`：正整數，範圍 10-50

---

### SearchResponse（搜尋回應）

代表搜尋 API 的回應結構。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `results` | `SearchResult[]` | ✅ | 搜尋結果陣列 |
| `total` | `number` | ✅ | 符合條件的總筆數 |
| `page` | `number` | ✅ | 目前頁碼 |
| `pageSize` | `number` | ✅ | 每頁筆數 |
| `totalPages` | `number` | ✅ | 總頁數 |
| `keyword` | `string` | ✅ | 搜尋關鍵字 |

---

### PaginationInfo（分頁資訊）

代表分頁狀態。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `currentPage` | `number` | ✅ | 目前頁碼 |
| `totalPages` | `number` | ✅ | 總頁數 |
| `totalItems` | `number` | ✅ | 總筆數 |
| `pageSize` | `number` | ✅ | 每頁筆數 |
| `hasNextPage` | `boolean` | ✅ | 是否有下一頁 |
| `hasPrevPage` | `boolean` | ✅ | 是否有上一頁 |

---

### AppState（應用程式狀態）

代表應用程式的全域狀態。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `isLoading` | `boolean` | ✅ | 是否正在載入 |
| `error` | `AppError \| null` | ✅ | 錯誤資訊 |

---

### AppError（應用程式錯誤）

代表應用程式錯誤資訊。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `code` | `ErrorCode` | ✅ | 錯誤代碼 |
| `message` | `string` | ✅ | 錯誤訊息（正體中文） |
| `retryable` | `boolean` | ✅ | 是否可重試 |

**ErrorCode 列舉**：
- `NETWORK_ERROR`：網路錯誤
- `API_ERROR`：API 錯誤
- `NOT_FOUND`：找不到資源
- `VALIDATION_ERROR`：驗證錯誤
- `RATE_LIMIT`：請求頻率限制

---

## 型別定義

### TypeScript 型別檔案

```typescript
// src/shared/types/index.ts

/**
 * 歌曲實體
 */
export interface Song {
  /** 唯一識別碼 */
  id: string
  /** 歌曲名稱 */
  title: string
  /** 歌手名稱 */
  artist: string
  /** 完整歌詞內容 */
  lyrics: string
}

/**
 * 匹配類型
 */
export type MatchType = 'TITLE_EXACT' | 'TITLE_PARTIAL' | 'ARTIST' | 'LYRICS'

/**
 * 搜尋結果
 */
export interface SearchResult {
  /** 歌曲資訊 */
  song: Song
  /** 相關性分數 */
  score: number
  /** 匹配類型 */
  matchType: MatchType
  /** 標題高亮 HTML */
  highlightedTitle?: string
  /** 歌手名稱高亮 HTML */
  highlightedArtist?: string
  /** 歌詞片段高亮 HTML */
  highlightedLyrics?: string
}

/**
 * 搜尋查詢參數
 */
export interface SearchQuery {
  /** 搜尋關鍵字 */
  keyword: string
  /** 頁碼 */
  page?: number
  /** 每頁筆數 */
  pageSize?: number
}

/**
 * 搜尋回應
 */
export interface SearchResponse {
  /** 搜尋結果陣列 */
  results: SearchResult[]
  /** 符合條件的總筆數 */
  total: number
  /** 目前頁碼 */
  page: number
  /** 每頁筆數 */
  pageSize: number
  /** 總頁數 */
  totalPages: number
  /** 搜尋關鍵字 */
  keyword: string
}

/**
 * 分頁資訊
 */
export interface PaginationInfo {
  /** 目前頁碼 */
  currentPage: number
  /** 總頁數 */
  totalPages: number
  /** 總筆數 */
  totalItems: number
  /** 每頁筆數 */
  pageSize: number
  /** 是否有下一頁 */
  hasNextPage: boolean
  /** 是否有上一頁 */
  hasPrevPage: boolean
}

/**
 * 錯誤代碼
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'

/**
 * 應用程式錯誤
 */
export interface AppError {
  /** 錯誤代碼 */
  code: ErrorCode
  /** 錯誤訊息（正體中文） */
  message: string
  /** 是否可重試 */
  retryable: boolean
}

/**
 * 應用程式狀態
 */
export interface AppState {
  /** 是否正在載入 */
  isLoading: boolean
  /** 錯誤資訊 */
  error: AppError | null
}
```

### 功能模組專屬型別

```typescript
// src/features/search/types/index.ts

import type { SearchQuery, SearchResponse, SearchResult } from '@/shared/types'

/**
 * 搜尋狀態
 */
export interface SearchState {
  /** 搜尋關鍵字 */
  keyword: string
  /** 搜尋結果 */
  results: SearchResult[]
  /** 是否正在搜尋 */
  isSearching: boolean
  /** 錯誤資訊 */
  error: string | null
  /** 分頁資訊 */
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * 搜尋服務介面
 */
export interface SearchService {
  /** 執行搜尋 */
  search: (query: SearchQuery) => Promise<SearchResponse>
}
```

```typescript
// src/features/lyrics/types/index.ts

import type { Song, AppError } from '@/shared/types'

/**
 * 歌詞狀態
 */
export interface LyricsState {
  /** 歌曲資訊 */
  song: Song | null
  /** 是否正在載入 */
  isLoading: boolean
  /** 錯誤資訊 */
  error: AppError | null
}

/**
 * 歌詞服務介面
 */
export interface LyricsService {
  /** 根據 ID 取得歌曲 */
  getSongById: (id: string) => Promise<Song>
}
```

---

## 資料流程

### 搜尋流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  使用者輸入  │ ──► │  驗證輸入    │ ──► │  呼叫 API   │ ──► │  處理回應    │
│  搜尋關鍵字  │     │  (≥2 字元)   │     │  (快取優先)  │     │  (排序/高亮) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  更新 URL   │ ◄── │  更新狀態    │ ◄── │  轉換資料    │ ◄── │  更新快取    │
│  Query Str  │     │  (reactive) │     │  (型別安全)  │     │  (L1/L2)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 歌詞詳細頁流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  路由導航   │ ──► │  取得歌曲 ID │ ──► │  檢查快取    │ ──► │  呼叫 API   │
│  /lyrics/id │     │  (params)   │     │  (L2 快取)  │     │  (若無快取) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  渲染頁面   │ ◄── │  更新狀態    │ ◄── │  更新快取    │
                    │  (歌詞顯示) │     │  (reactive) │     │  (L2 快取)  │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Google Sheets 結構

### 試算表欄位定義

| 欄位 | 欄位名稱 (Row 1) | 資料型別 | 範例 |
|------|-----------------|----------|------|
| A | id | 字串 | `song-001` |
| B | title | 字串 | `晴天` |
| C | artist | 字串 | `周杰倫` |
| D | lyrics | 字串 | `故事的小黃花...` |

### 試算表範例

| id | title | artist | lyrics |
|----|-------|--------|--------|
| song-001 | 晴天 | 周杰倫 | 故事的小黃花 從出生那年就飄著... |
| song-002 | 稻香 | 周杰倫 | 對這個世界如果你有太多的抱怨... |
| song-003 | 告白氣球 | 周杰倫 | 塞納河畔 左岸的咖啡... |

### Google Sheets API 回應格式

```json
{
  "range": "Sheet1!A2:D",
  "majorDimension": "ROWS",
  "values": [
    ["song-001", "晴天", "周杰倫", "故事的小黃花..."],
    ["song-002", "稻香", "周杰倫", "對這個世界如果你有太多的抱怨..."],
    ["song-003", "告白氣球", "周杰倫", "塞納河畔 左岸的咖啡..."]
  ]
}
```

### 資料轉換函式

```typescript
/**
 * 將 Google Sheets API 回應轉換為 Song 陣列
 * @param values - API 回應的 values 陣列
 * @returns Song 陣列
 */
function transformGoogleSheetsData(values: string[][]): Song[] {
  return values.map(row => ({
    id: row[0],
    title: row[1],
    artist: row[2],
    lyrics: row[3]
  }))
}
```

---

## 狀態管理

### 應用程式層級狀態

使用 Vue 3 的 `provide/inject` 或 `reactive` 物件管理全域狀態，不引入額外的狀態管理函式庫（符合簡單性原則）。

```typescript
// src/shared/composables/useAppState.ts

import { reactive, readonly } from 'vue'
import type { AppState, AppError } from '@/shared/types'

const state = reactive<AppState>({
  isLoading: false,
  error: null
})

export function useAppState() {
  function setLoading(loading: boolean) {
    state.isLoading = loading
  }

  function setError(error: AppError | null) {
    state.error = error
  }

  function clearError() {
    state.error = null
  }

  return {
    state: readonly(state),
    setLoading,
    setError,
    clearError
  }
}
```

### 功能層級狀態

每個功能模組使用自己的 composable 管理狀態，透過組合式 API 實現狀態封裝和重用。
