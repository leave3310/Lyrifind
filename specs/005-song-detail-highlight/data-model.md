# Data Model: 歌曲詳細頁與歌詞高亮顯示

**Feature**: 005-song-detail-highlight  
**Date**: 2025-12-28  
**Status**: Complete

## 實體關係概述

本功能延伸 004-lyrics-search 的 `Song` 實體，新增歌詞高亮和視圖狀態管理。

```
┌─────────────────┐
│   Song          │  (來自 004-lyrics-search)
│                 │
│ - id            │
│ - artist        │
│ - title         │
│ - lyrics        │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────────┐         ┌───────────────────┐
│ SongDetailView      │◄────────│ HighlightParams   │
│                     │         │                   │
│ - song              │         │ - keyword         │
│ - highlightKeyword  │         └───────────────────┘
│ - highlightedLyrics │
│ - firstMarkPosition │
└─────────────────────┘
```

---

## 實體定義

### 1. Song（歌曲）

**來源**：繼承自 `004-lyrics-search` 的定義

代表一首完整的歌曲資訊。此實體已在搜尋功能中定義，本功能直接複用。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `id` | `string` | ✅ | 歌曲唯一識別碼 |
| `artist` | `string` | ✅ | 歌手名稱 |
| `title` | `string` | ✅ | 歌曲名稱 |
| `lyrics` | `string` | ✅ | 完整歌詞內容（包含換行符號 `\n`） |

**TypeScript 定義**：
```typescript
// 此型別應移至 src/shared/types/common.types.ts，供多個 feature 共用
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

### 2. HighlightParams（高亮參數）

代表從 URL query parameter 傳遞的高亮關鍵字。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `keyword` | `string \| null` | ❌ | 要高亮的關鍵字，來自 URL `?highlight=關鍵字` |

**TypeScript 定義**：
```typescript
interface HighlightParams {
  keyword: string | null
}
```

**來源**：Vue Router 的 `route.query.highlight`

**驗證規則**：
- 若 `query.highlight` 不存在或非字串，則 `keyword` 為 `null`
- 若存在但為空字串，視為無效，`keyword` 為 `null`
- 若為有效字串，直接使用（不進行 trim 或長度驗證，因為來自 URL 分享）

**範例**：
```typescript
// URL: /song/song-001?highlight=愛
const params: HighlightParams = { keyword: '愛' }

// URL: /song/song-001
const params: HighlightParams = { keyword: null }
```

---

### 3. SongDetailView（歌曲詳細頁視圖狀態）

代表歌曲詳細頁的完整視圖狀態，整合歌曲資料和高亮邏輯。

**欄位**：

| 欄位名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `song` | `Song \| null` | ✅ | 當前顯示的歌曲（載入中或錯誤時為 `null`） |
| `highlightKeyword` | `string \| null` | ✅ | 從 URL 取得的高亮關鍵字 |
| `highlightedLyrics` | `string` | ✅ | 套用高亮標記後的歌詞 HTML |
| `isLoading` | `boolean` | ✅ | 是否正在載入歌曲資料 |
| `error` | `string \| null` | ✅ | 錯誤訊息（如歌曲不存在） |
| `firstMarkPosition` | `HTMLElement \| null` | ❌ | 第一個 `<mark>` 元素的 DOM 參考（用於自動捲動） |

**TypeScript 定義**：
```typescript
interface SongDetailView {
  song: Song | null
  highlightKeyword: string | null
  highlightedLyrics: string
  isLoading: boolean
  error: string | null
  firstMarkPosition: HTMLElement | null
}
```

**欄位說明**：
- `highlightedLyrics`：
  - 若 `highlightKeyword` 為 `null`，則等於 `song.lyrics`（原始歌詞）
  - 若 `highlightKeyword` 有值，則為套用 `<mark class="bg-yellow-200 font-bold">` 標記的 HTML 字串
- `firstMarkPosition`：
  - 由 `document.querySelector('mark')` 取得
  - 用於 `scrollIntoView` API 自動捲動

**狀態轉換**：
```
Loading (isLoading=true) 
    │
    ├─ 成功 ─► Loaded (song 有值, error=null)
    │           │
    │           ├─ 有高亮關鍵字 ─► 產生 highlightedLyrics, 自動捲動
    │           │
    │           └─ 無高亮關鍵字 ─► highlightedLyrics = song.lyrics
    │
    └─ 失敗 ─► Error (song=null, error 有訊息)
```

**範例**：
```typescript
// 載入中
const viewState: SongDetailView = {
  song: null,
  highlightKeyword: '愛',
  highlightedLyrics: '',
  isLoading: true,
  error: null,
  firstMarkPosition: null
}

// 載入成功且有高亮
const viewState: SongDetailView = {
  song: {
    id: 'song-001',
    artist: '周杰倫',
    title: '青花瓷',
    lyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝'
  },
  highlightKeyword: '牡丹',
  highlightedLyrics: '素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的<mark class="bg-yellow-200 font-bold">牡丹</mark>一如妳初妝',
  isLoading: false,
  error: null,
  firstMarkPosition: document.querySelector('mark')
}

// 載入失敗（404）
const viewState: SongDetailView = {
  song: null,
  highlightKeyword: null,
  highlightedLyrics: '',
  isLoading: false,
  error: '找不到歌曲',
  firstMarkPosition: null
}
```

---

## 資料流

### 完整頁面載入流程

```
進入路由 /song/:id?highlight=關鍵字
    │
    ▼
1. 解析 URL 參數
    ├─ id: 從 params 取得
    └─ highlightKeyword: 從 query.highlight 取得
    │
    ▼
2. 載入歌曲資料 (isLoading=true)
    │
    ├─ 成功 ─► 取得 Song 物件
    │           │
    │           ▼
    │         3. 生成高亮歌詞
    │           │
    │           ├─ 有 highlightKeyword ─► highlightText(song.lyrics, keyword)
    │           │
    │           └─ 無 highlightKeyword ─► 原始歌詞
    │           │
    │           ▼
    │         4. 渲染頁面 (isLoading=false)
    │           │
    │           ▼
    │         5. 自動捲動（若有高亮）
    │           │
    │           ├─ 找到第一個 <mark> 元素
    │           │
    │           └─ scrollIntoView({ behavior: 'smooth', block: 'center' })
    │
    └─ 失敗 ─► 顯示 404 或錯誤訊息 (error 有值)
```

---

## 型別匯出結構

**檔案組織**：

```
src/
├── shared/types/
│   └── common.types.ts           # ✨ Song 型別移至此處（共用於 search 和 song-detail）
│
└── features/
    └── song-detail/
        └── types/
            └── song-detail.types.ts   # 本功能專屬型別
```

**common.types.ts**（共用型別）：
```typescript
// src/shared/types/common.types.ts
export interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}
```

**song-detail.types.ts**（本功能型別）：
```typescript
// src/features/song-detail/types/song-detail.types.ts
import type { Song } from '@/shared/types/common.types'

export interface HighlightParams {
  keyword: string | null
}

export interface SongDetailView {
  song: Song | null
  highlightKeyword: string | null
  highlightedLyrics: string
  isLoading: boolean
  error: string | null
  firstMarkPosition: HTMLElement | null
}

// 工具函式型別
export type HighlightTextFn = (text: string, keyword: string) => string
export type EscapeRegexFn = (text: string) => string
```

---

## 資料驗證

### 輸入驗證函式

```typescript
// src/features/song-detail/utils/validation.ts

export function validateHighlightKeyword(keyword: unknown): string | null {
  // 型別檢查
  if (typeof keyword !== 'string') {
    return null
  }
  
  // 空字串檢查
  if (keyword.trim().length === 0) {
    return null
  }
  
  return keyword
}

export function validateSongId(id: unknown): string {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('無效的歌曲 ID')
  }
  return id
}
```

**使用範例**：
```typescript
import { useRoute } from 'vue-router'

const route = useRoute()
const highlightKeyword = computed(() => 
  validateHighlightKeyword(route.query.highlight)
)
```

---

## 與搜尋功能的資料關係

### 資料複用

- **Song 型別**：完全複用 `004-lyrics-search` 的定義
- **API 端點**：複用相同的 Google Apps Script API（`/api/lyrics/:id`）
- **型別定義位置變更**：
  - 原位置：`src/features/search/types/search.types.ts`
  - 新位置：`src/shared/types/common.types.ts`（供兩個 feature 共用）

### 導航資料傳遞

從搜尋結果跳轉到詳細頁時，透過 Vue Router 傳遞：
```typescript
// SearchResultItem.vue
import { useRouter } from 'vue-router'

const router = useRouter()

function viewDetails(song: Song, searchQuery: string) {
  router.push({
    name: 'song-detail',
    params: { id: song.id },
    query: { highlight: searchQuery }  // 傳遞搜尋關鍵字作為高亮參數
  })
}
```

---

## Edge Cases 資料處理

### 1. 特殊字元處理

**問題**：搜尋關鍵字包含正則特殊字元（`*`, `?`, `/` 等）

**解決方案**：
```typescript
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 在 highlightText 中使用
const escapedKeyword = escapeRegex(keyword)
const regex = new RegExp(escapedKeyword, 'gi')
```

### 2. 多個高亮參數

**問題**：URL 包含多個 `highlight` 參數（`?highlight=愛&highlight=情`）

**解決方案**：
```typescript
function getHighlightKeyword(query: LocationQuery): string | null {
  const highlight = query.highlight
  
  // 若為陣列，取第一個
  if (Array.isArray(highlight)) {
    return validateHighlightKeyword(highlight[0])
  }
  
  return validateHighlightKeyword(highlight)
}
```

### 3. 大量匹配效能

**問題**：關鍵字在歌詞中出現 100+ 次

**解決方案**：
- 使用 `computed` 快取高亮結果
- 正則替換效能優異（< 10ms for 100+ matches）
- 瀏覽器渲染 100+ `<mark>` 元素無顯著效能影響

---

## 未來擴充考量

### 潛在欄位擴充

當需要更多功能時，可擴充以下欄位：

**Song**（在 `common.types.ts`）：
- `albumCover`: 專輯封面 URL（用於詳細頁頂部顯示）
- `releaseDate`: 發行日期（用於資訊顯示）
- `youtubeUrl`: YouTube 連結（用於播放按鈕）

**SongDetailView**：
- `isFavorite`: 是否已收藏（用於收藏功能）
- `playbackPosition`: 播放位置（用於音訊播放器）

這些擴充不影響目前的資料模型設計，可向後相容。

---

## 資料模型完整性檢查

- ✅ 所有實體皆有明確定義
- ✅ 所有欄位皆有型別和必填標記
- ✅ 所有關係皆有清楚說明
- ✅ 所有驗證規則皆已記錄
- ✅ 所有狀態轉換皆已定義
- ✅ 所有資料流皆已圖解
- ✅ 與現有功能的資料複用已記錄

**下一步**：建立 `contracts/` 目錄定義完整的 TypeScript 型別檔案
