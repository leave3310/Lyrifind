# Data Model: 歌詞搜尋功能

**Feature**: 004-lyrics-search  
**Date**: 2025-12-13  
**Status**: Complete

## 實體關係概述

本功能涉及三個核心實體：歌曲 (Song)、搜尋結果項目 (SearchResultItem)、搜尋查詢 (SearchQuery)。

```
┌─────────────┐
│   Song      │
│             │
│ - id        │
│ - artist    │
│ - title     │
│ - lyrics    │
└─────────────┘
       │
       │ 1:N
       ▼
┌──────────────────────┐         ┌────────────────┐
│ SearchResultItem     │◄────────│ SearchQuery    │
│                      │         │                │
│ - song               │         │ - query        │
│ - lyricsSnippet?     │         │ - page         │
│ - highlightedSnippet?│         │ - pageSize     │
└──────────────────────┘         └────────────────┘
```

---

## 實體定義

### 1. Song（歌曲）

代表一首完整的歌曲資訊。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `id` | `string` | ✅ | 歌曲唯一識別碼 |
| `artist` | `string` | ✅ | 歌手名稱，用於精確匹配搜尋 |
| `title` | `string` | ✅ | 歌曲名稱，用於精確匹配搜尋 |
| `lyrics` | `string` | ✅ | 完整歌詞內容（包含換行符號 `\n`），用於部分匹配搜尋 |

**驗證規則**：
- `id`：非空字串
- `artist`：非空字串，1-100 字元
- `title`：非空字串，1-200 字元
- `lyrics`：非空字串，最多 10000 字元

**資料來源**：Google Sheets（欄位順序：id, artist, title, lyrics）

**TypeScript 定義**：
```typescript
interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}
```

**範例**：
```typescript
const song: Song = {
  id: 'song-001',
  artist: '周杰倫',
  title: '青花瓷',
  lyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝\n冉冉檀香透過窗心事我了然'
}
```

---

### 2. SearchResultItem（搜尋結果項目）

代表單一搜尋結果，包含歌曲基本資訊和匹配的歌詞片段（如果有）。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `song` | `Song` | ✅ | 匹配的歌曲完整資訊 |
| `lyricsSnippet` | `LyricsSnippet \| null` | ❌ | 匹配的歌詞片段（僅當搜尋條件匹配歌詞時存在） |
| `highlightedSnippet` | `string \| null` | ❌ | 已套用高亮標記的歌詞片段 HTML（用於直接渲染） |

**TypeScript 定義**：
```typescript
interface SearchResultItem {
  song: Song
  lyricsSnippet: LyricsSnippet | null
  highlightedSnippet: string | null
}

interface LyricsSnippet {
  lines: string[]      // 擷取的歌詞行（固定 3 行）
  matchIndex: number   // 匹配行在 lines 陣列中的索引
}
```

**範例 1（匹配歌名）**：
```typescript
const resultItem: SearchResultItem = {
  song: {
    id: 'song-001',
    artist: '周杰倫',
    title: '青花瓷',
    lyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝...'
  },
  lyricsSnippet: null,  // 未匹配歌詞
  highlightedSnippet: null
}
```

**範例 2（匹配歌詞）**：
```typescript
const resultItem: SearchResultItem = {
  song: {
    id: 'song-001',
    artist: '周杰倫',
    title: '青花瓷',
    lyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝\n冉冉檀香透過窗心事我了然...'
  },
  lyricsSnippet: {
    lines: [
      '素胚勾勒出青花筆鋒濃轉淡',
      '瓶身描繪的牡丹一如妳初妝',
      '冉冉檀香透過窗心事我了然'
    ],
    matchIndex: 1  // 「牡丹」在第二行
  },
  highlightedSnippet: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的<mark class="bg-yellow-200 font-bold">牡丹</mark>一如妳初妝\n冉冉檀香透過窗心事我了然'
}
```

---

### 3. SearchQuery（搜尋查詢）

代表使用者的搜尋請求參數。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 預設值 | 說明 |
|---------|------|------|--------|------|
| `query` | `string` | ✅ | - | 搜尋關鍵字（歌名、歌手或歌詞） |
| `page` | `number` | ❌ | `1` | 目前頁碼（從 1 開始） |
| `pageSize` | `number` | ❌ | `20` | 每頁顯示筆數（固定 20） |

**驗證規則**：
- `query`：非空字串，1-200 字元，不可僅包含空白
- `page`：正整數，>= 1
- `pageSize`：固定為 20（本階段不可調整）

**TypeScript 定義**：
```typescript
interface SearchQuery {
  query: string
  page?: number
  pageSize?: number
}

// 預設值處理
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20

function normalizeQuery(query: SearchQuery): Required<SearchQuery> {
  return {
    query: query.query.trim(),
    page: query.page ?? DEFAULT_PAGE,
    pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE
  }
}
```

**範例**：
```typescript
const searchQuery: SearchQuery = {
  query: '青花瓷',
  page: 1,
  pageSize: 20
}
```

---

### 4. SearchResponse（搜尋回應）

代表搜尋 API 的回應結構（由 Google Apps Script API 回傳）。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `items` | `SearchResultItem[]` | ✅ | 目前頁的搜尋結果項目 |
| `total` | `number` | ✅ | 總共符合條件的結果數量 |
| `page` | `number` | ✅ | 目前頁碼 |
| `pageSize` | `number` | ✅ | 每頁顯示筆數 |
| `totalPages` | `number` | ✅ | 總頁數（計算得出：`Math.ceil(total / pageSize)`） |

**TypeScript 定義**：
```typescript
interface SearchResponse {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

**範例**：
```typescript
const response: SearchResponse = {
  items: [
    // ... SearchResultItem 陣列
  ],
  total: 45,
  page: 1,
  pageSize: 20,
  totalPages: 3  // Math.ceil(45 / 20) = 3
}
```

---

## 狀態轉換

### 搜尋流程狀態機

```
┌────────┐
│ Idle   │  初始狀態（無搜尋）
└────┬───┘
     │ 使用者輸入查詢 + 防抖完成
     ▼
┌────────┐
│Loading │  執行搜尋中
└────┬───┘
     │ 搜尋完成
     ▼
┌────────┐
│Success │  顯示結果 / 空結果
└────┬───┘
     │ 使用者修改查詢
     ▼
┌────────┐
│Loading │  重新搜尋
└────────┘

     │ 網路錯誤 / 超時
     ▼
┌────────┐
│ Error  │  顯示錯誤訊息
└────┬───┘
     │ 使用者重試
     ▼
┌────────┐
│Loading │
└────────┘
```

**狀態定義**：
```typescript
type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

interface SearchState {
  status: SearchStatus
  query: string
  results: SearchResultItem[]
  total: number
  page: number
  error: string | null
}
```

---

## 資料流

### 搜尋資料流

```
使用者輸入
    │
    ▼
防抖處理（400ms）
    │
    ▼
驗證輸入（非空、長度）
    │
    ├─ 無效 ─► 顯示錯誤訊息
    │
    ▼ 有效
執行搜尋（Google Apps Script API）
    │
    ├─ 成功 ─► 處理結果
    │           │
    │           ├─ 匹配歌名/歌手 ─► 建立 SearchResultItem（無歌詞片段）
    │           │
    │           ├─ 匹配歌詞 ─► 擷取片段 ─► 產生高亮 HTML ─► 建立 SearchResultItem
    │           │
    │           ▼
    │         分頁處理（每頁 20 筆）
    │           │
    │           ▼
    │         渲染搜尋結果
    │
    ├─ 錯誤 ─► 顯示錯誤訊息
```

---

## 型別匯出結構

**檔案組織**：

```
src/features/search/types/
├── search.types.ts          # 匯出所有搜尋相關型別
└── index.ts                 # 重新匯出

src/shared/types/
└── common.types.ts          # 共用型別（如果需要）
```

**search.types.ts**：
```typescript
// 核心實體（對應 Google Sheets 欄位：id, artist, title, lyrics）
export interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}

// 歌詞片段
export interface LyricsSnippet {
  lines: string[]
  matchIndex: number
}

// 搜尋結果項目
export interface SearchResultItem {
  song: Song
  lyricsSnippet: LyricsSnippet | null
  highlightedSnippet: string | null
}

// 搜尋查詢
export interface SearchQuery {
  query: string
  page?: number
  pageSize?: number
}

// 搜尋回應
export interface SearchResponse {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 搜尋狀態
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SearchState {
  status: SearchStatus
  query: string
  results: SearchResultItem[]
  total: number
  page: number
  error: string | null
}

// 常數
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_QUERY_LENGTH = 200
```

---

## 資料驗證

### 輸入驗證函式

```typescript
// src/shared/utils/validation.ts

export interface ValidationResult {
  valid: boolean
  error: string | null
}

export function validateSearchQuery(query: string): ValidationResult {
  // 空白檢查
  const trimmed = query.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '請輸入搜尋關鍵字'
    }
  }
  
  // 長度檢查
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `搜尋關鍵字不可超過 ${MAX_QUERY_LENGTH} 字元`
    }
  }
  
  return { valid: true, error: null }
}

export function validatePage(page: number, totalPages: number): ValidationResult {
  if (page < 1) {
    return {
      valid: false,
      error: '頁碼必須大於 0'
    }
  }
  
  if (page > totalPages) {
    return {
      valid: false,
      error: `頁碼不可超過總頁數 ${totalPages}`
    }
  }
  
  return { valid: true, error: null }
}
```

---

## 未來擴充考量

### 潛在欄位擴充

當整合後端 API 時，可能需要新增以下欄位：

**Song**：
- `createdAt`：資料建立時間（ISO 8601 格式）
- `albumCover`：專輯封面 URL
- `releaseDate`：發行日期
- `duration`：歌曲長度（秒）
- `genre`：音樂類型

**SearchResultItem**：
- `relevanceScore`：相關性分數（用於排序）
- `matchType`：匹配類型（`'title' | 'artist' | 'lyrics'`）

**SearchQuery**：
- `sortBy`：排序方式（`'relevance' | 'title' | 'date'`）
- `filters`：進階篩選條件

這些擴充不影響目前的資料模型設計，可向後相容。

---

## 資料模型完整性檢查

- ✅ 所有實體皆有明確定義
- ✅ 所有欄位皆有型別和必填標記
- ✅ 所有關係皆有清楚說明
- ✅ 所有驗證規則皆已記錄
- ✅ 所有狀態轉換皆已定義
- ✅ 所有資料流皆已圖解

**下一步**：建立 contracts/ 目錄定義 API 契約（定義 Google Apps Script API 規範）
