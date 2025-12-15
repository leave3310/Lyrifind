# Research: 歌詞搜尋功能

**Feature**: 004-lyrics-search  
**Date**: 2025-12-13  
**Status**: Complete

## Phase 0: Research & Decision Making

本文件記錄技術研究結果和關鍵決策，解決 Technical Context 中的所有未知項目。

---

## 1. 搜尋匹配演算法

### 決策：混合模式搜尋

**選擇**：歌名/歌手使用精確匹配（完全一致），歌詞使用部分匹配（包含即符合）

**理由**：
- 歌名和歌手名稱通常較短且明確，使用者期待精確結果
- 歌詞內容較長，使用者可能只記得片段，部分匹配提供更好的使用者體驗
- 符合 Clarifications 中的決策（Session 2025-12-13）

**實作方式**：
```typescript
// 精確匹配（歌名/歌手）
const exactMatch = (text: string, query: string): boolean => {
  return text.toLowerCase() === query.toLowerCase()
}

// 部分匹配（歌詞）
const partialMatch = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase())
}
```

**替代方案考慮**：
- ❌ 全部精確匹配：歌詞搜尋會失去實用性
- ❌ 全部部分匹配：歌名/歌手搜尋會返回過多不相關結果
- ❌ 模糊匹配（Fuzzy Search）：增加複雜度，本階段不需要

---

## 2. 歌詞片段擷取邏輯

### 決策：固定 3 行（匹配行 + 前後各 1 行）

**選擇**：當搜尋關鍵字匹配歌詞時，擷取匹配行及其前後各 1 行，總共 3 行

**理由**：
- 提供足夠上下文讓使用者識別歌曲
- 避免顯示過多歌詞，保持結果簡潔
- 符合多數搜尋引擎的做法（如 Google）
- 符合 Clarifications 中的決策

**實作邏輯**：
```typescript
interface LyricsSnippet {
  lines: string[]      // 擷取的 3 行歌詞
  matchIndex: number   // 匹配行在片段中的索引（通常是 1）
}

function extractSnippet(lyrics: string, query: string): LyricsSnippet | null {
  const lines = lyrics.split('\n')
  const matchLineIndex = lines.findIndex(line => 
    partialMatch(line, query)
  )
  
  if (matchLineIndex === -1) return null
  
  const start = Math.max(0, matchLineIndex - 1)
  const end = Math.min(lines.length, matchLineIndex + 2)
  
  return {
    lines: lines.slice(start, end),
    matchIndex: matchLineIndex - start
  }
}
```

**邊界情況處理**：
- 匹配行在第一行：只顯示前 2 行
- 匹配行在最後一行：只顯示後 2 行
- 歌詞少於 3 行：顯示全部歌詞

---

## 3. 高亮顯示實作

### 決策：黃色背景 + 粗體文字

**選擇**：使用 Tailwind CSS 的 `bg-yellow-200` 和 `font-bold` 類別

**理由**：
- 黃色背景是業界標準（Google、GitHub 等都使用）
- 結合粗體提供更強視覺對比，符合無障礙設計（色盲友善）
- Tailwind CSS 提供現成類別，無需自訂 CSS
- 符合 Clarifications 中的決策

**實作方式**：
```vue
<template>
  <span v-html="highlightedText"></span>
</template>

<script setup lang="ts">
function highlightText(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 font-bold">$1</mark>')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>
```

**安全性考量**：
- 使用 `escapeRegex` 處理特殊字元，避免 ReDoS 攻擊
- 使用 `<mark>` 標籤而非直接插入 HTML，提高語意化

---

## 4. 分頁機制

### 決策：傳統分頁按鈕（每頁 20 筆）

**選擇**：底部顯示頁碼按鈕，每頁固定 20 筆結果

**理由**：
- 使用者可以快速跳轉到特定頁面
- 適合桌面端操作，清楚顯示總頁數
- 實作簡單，效能可預測
- 符合 Clarifications 中的決策

**實作邏輯**：
```typescript
interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}

const totalPages = computed(() => 
  Math.ceil(paginationState.totalItems / paginationState.pageSize)
)

const paginatedResults = computed(() => {
  const start = (paginationState.currentPage - 1) * paginationState.pageSize
  const end = start + paginationState.pageSize
  return searchResults.value.slice(start, end)
})
```

**UI 設計**：
- 顯示「上一頁」、「下一頁」按鈕
- 顯示頁碼（當頁數 > 7 時，使用省略號）
- 目前頁面使用不同顏色高亮

**替代方案**：
- ❌ 無限滾動：不適合需要跳轉的場景
- ❌ 載入更多按鈕：使用者體驗不如分頁直觀

---

## 5. 防抖機制

### 決策：400ms 防抖延遲

**選擇**：使用 VueUse 的 `useDebounceFn`，延遲設定為 400ms

**理由**：
- 400ms 在回應速度和請求減少之間取得平衡
- 符合多數網站的最佳實踐（Twitter: 500ms, Google: 300-400ms）
- 使用者通常在 300-500ms 內完成輸入
- 符合 Clarifications 中的決策

**實作方式**：
```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((query: string) => {
  performSearch(query)
}, 400)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})
```

**效能影響**：
- 假設使用者平均每秒輸入 5 個字元，無防抖會產生 5 次請求
- 使用 400ms 防抖，每次搜尋只產生 1 次請求
- 減少約 80% 的不必要請求

---

## 6. Google Sheets 資料存取

### 決策：透過 Google Apps Script API 直接存取 Google Sheets 資料

**選擇**：前端直接呼叫 Google Apps Script 部署的 Web API，無需 Mock 資料

**理由**：
- **真實資料來源**：直接使用 Google Sheets 作為資料庫，無需模擬
- **即時更新**：資料變更即時生效，無需重新部署
- **簡化開發**：省去 Mock 資料維護成本
- **統一介面**：開發和生產環境使用相同 API

**前端服務實作**：
```typescript
// src/features/search/services/searchService.ts
import type { SearchRequest, SearchResponse, Song } from '../types'

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
      const error = await response.json()
      throw new Error(error.error?.message || '搜尋失敗')
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

**環境設定**：
```bash
# .env.local
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

**錯誤處理**：
- 網路錯誤：顯示「網路連線失敗，請檢查網路設定」
- 404 錯誤：顯示「查無此歌曲」
- 500 錯誤：顯示「伺服器錯誤，請稍後再試」
- 逾時處理：設定 10 秒逾時，超時顯示「請求逾時，請重試」

---

## 7. 效能優化策略

### 決策：元件層級優化 + 建構優化

**前端優化**：
1. **元件記憶化**：使用 `computed` 快取搜尋結果和分頁計算
2. **虛擬化**：若單頁 20 筆不足以滿足效能需求，考慮使用 `vue-virtual-scroller`
3. **懶載入**：歌曲詳細頁面使用動態 import
4. **防抖**：避免過度頻繁的搜尋請求

**建構優化**：
1. **Tree Shaking**：Vite 自動移除未使用程式碼
2. **程式碼分割**：按路由自動分割（Vue Router）
3. **Tailwind CSS PurgeCSS**：移除未使用的 CSS 類別
4. **Gzip 壓縮**：Vite 建構時啟用

**效能指標監控**：
- 使用 Lighthouse 測量 FCP、LCP、CLS
- 使用 Chrome DevTools Performance 分析渲染效能
- 確保符合憲章效能要求（FCP < 1.5s, LCP < 2.5s）

---

## 8. 響應式設計策略

### 決策：Mobile-First + Tailwind 斷點

**選擇**：使用 Tailwind CSS 的響應式斷點，採用 Mobile-First 設計

**斷點規劃**：
- **手機**（< 640px）：單欄佈局，搜尋框全寬
- **平板**（640px - 1024px）：維持單欄，增加左右間距
- **桌面**（> 1024px）：搜尋框置中，最大寬度 800px

**實作範例**：
```vue
<div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <SearchBar class="w-full md:w-3/4 lg:w-2/3 mx-auto" />
  <SearchResults class="mt-6" />
</div>
```

---

---

## 9. Google Apps Script API 整合

### 決策：使用 Google Sheets + Apps Script 作為資料來源

**選擇**：資料儲存於 Google Sheets（欄位：id, artist, title, lyrics），透過 Google Apps Script 提供 Web API

**理由**：
- **低成本**：免費額度足夠小型專案使用
- **易於管理**：非技術人員可直接在 Google Sheets 編輯歌詞資料
- **快速部署**：Apps Script 提供一鍵部署為 Web App
- **無需後端架設**：省去伺服器維護成本
- **自動備份**：Google Drive 自動版本控制

### Google Sheets 資料結構

**欄位定義**：

| 欄位名稱 | 型別 | 說明 | 範例 |
|---------|------|------|------|
| `id` | string | 歌曲唯一識別碼 | `song-001` |
| `artist` | string | 歌手名稱 | `周杰倫` |
| `title` | string | 歌曲名稱 | `青花瓷` |
| `lyrics` | string | 完整歌詞（使用 `\n` 表示換行） | `素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹...` |

**注意事項**：
- 歌詞換行符號在 Google Sheets 中以實際換行或 `\n` 儲存
- Apps Script 需處理換行符號轉換

### Apps Script API 實作

**端點設計**：
```javascript
// Code.gs
function doGet(e) {
  const action = e.parameter.action
  
  if (action === 'search') {
    return handleSearch(e.parameter.q, e.parameter.page)
  } else if (action === 'getSong') {
    return handleGetSong(e.parameter.id)
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON)
}

function handleSearch(query, page = 1) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs')
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const rows = data.slice(1)
  
  // 搜尋邏輯：精確匹配歌名/歌手，部分匹配歌詞
  const results = rows
    .map(row => ({
      id: row[0],
      artist: row[1],
      title: row[2],
      lyrics: row[3]
    }))
    .filter(song => {
      const q = query.toLowerCase()
      return song.title.toLowerCase() === q ||
             song.artist.toLowerCase() === q ||
             song.lyrics.toLowerCase().includes(q)
    })
  
  // 分頁處理
  const pageSize = 20
  const start = (page - 1) * pageSize
  const paginatedResults = results.slice(start, start + pageSize)
  
  return ContentService
    .createTextOutput(JSON.stringify({
      items: paginatedResults.map(song => ({
        song: song,
        lyricsSnippet: extractSnippet(song.lyrics, query),
        highlightedSnippet: highlightText(song.lyrics, query)
      })),
      total: results.length,
      page: parseInt(page),
      pageSize: pageSize,
      totalPages: Math.ceil(results.length / pageSize)
    }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

### CORS 處理

**問題**：Apps Script Web App 預設不允許跨域請求

**解決方案**：
```javascript
function doGet(e) {
  // ... 處理邏輯
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')  // 允許所有來源
    .setHeader('Access-Control-Allow-Methods', 'GET')
}
```

**生產環境建議**：
- 限制 `Access-Control-Allow-Origin` 為特定網域
- 使用 Apps Script 的「僅限特定使用者執行」權限

### 部署流程

1. **建立 Google Sheets**：
   - 新增工作表命名為 `Songs`
   - 設定標題列：`id | artist | title | lyrics`
   - 填入歌曲資料

2. **撰寫 Apps Script**：
   - 工具 → 指令碼編輯器
   - 貼上 `Code.gs` 程式碼
   - 儲存專案

3. **部署為 Web App**：
   - 部署 → 新增部署
   - 類型：Web 應用程式
   - 執行身分：我
   - 存取權：所有人
   - 部署後取得 URL：`https://script.google.com/macros/s/{SCRIPT_ID}/exec`

4. **測試 API**：
```bash
curl "https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=search&q=青花瓷&page=1"
```

### 效能考量

**限制**：
- Apps Script 執行時間上限：6 分鐘/請求
- URL Fetch 配額：20,000 次/日（免費帳戶）
- 回應大小上限：50MB

**優化策略**：
- 使用快取（`CacheService`）減少 Sheets 讀取
- 限制每次搜尋回傳筆數（最多 100 筆）
- 考慮將熱門搜尋結果快取 10 分鐘

**替代方案**：
- ❌ Firebase Firestore：需要額外設定和成本
- ❌ Supabase：需要學習新平台
- ✅ Google Apps Script：最適合本專案規模和需求

---

## 研究結論

所有技術決策已完成，無待釐清項目。Phase 0 研究產出可進入 Phase 1 設計階段。

**重要變更**：資料來源從 Mock 資料改為 Google Sheets + Apps Script，所有後續文件需相應調整。

**下一步**：建立 data-model.md 定義資料模型和型別結構（需移除 `createdAt` 欄位）。
