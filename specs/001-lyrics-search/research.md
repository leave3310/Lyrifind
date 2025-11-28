# 技術研究報告：歌詞搜尋網站

**Feature Branch**: `001-lyrics-search`  
**研究日期**: 2025-11-27  
**狀態**: 完成

## 目錄

1. [Google Sheets API 整合](#1-google-sheets-api-整合)
2. [Vue 3 搜尋功能實作模式](#2-vue-3-搜尋功能實作模式)
3. [Vue Router 與 SEO 最佳實踐](#3-vue-router-與-seo-最佳實踐)
4. [效能優化策略](#4-效能優化策略)
5. [E2E 測試（Playwright）最佳實踐](#5-e2e-測試playwright最佳實踐)
6. [單元測試（Vitest）最佳實踐](#6-單元測試vitest最佳實踐)
7. [總結建議](#總結建議)

---

## 1. Google Sheets API 整合

### 決策：使用 Google Sheets API v4 搭配公開發布的試算表

### 理由

- **純前端安全性**：在純前端應用中，API 金鑰無法完全隱藏。最安全的做法是將 Google Sheet 設為「任何人皆可檢視」，並使用受限的 API 金鑰
- **簡化架構**：無需後端伺服器，降低維護成本
- **API 金鑰限制**：透過 Google Cloud Console 設定 HTTP Referrer 限制，僅允許特定網域使用

### API 金鑰管理策略

1. 建立僅限讀取的 API 金鑰
2. 設定 HTTP Referrer 限制（僅允許生產網域）
3. 使用環境變數 (`VITE_GOOGLE_API_KEY`) 儲存金鑰
4. 在 `.gitignore` 中排除 `.env` 檔案

### 效能優化技巧

- 使用 `fields` 參數僅請求需要的欄位
- 實作本地快取（LocalStorage 或 IndexedDB）
- 批次請求多個 range

### 錯誤處理機制

| HTTP 狀態碼 | 處理方式 |
|------------|----------|
| 429 (Rate Limit) | 指數退避重試 (Exponential Backoff) |
| 503 (Service Unavailable) | 最多重試 3 次 |
| 網路錯誤 | 顯示離線提示，使用快取資料 |

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| 建立後端 Proxy | 完全隱藏 API 金鑰 | 增加架構複雜度、需維護伺服器 | ❌ 拒絕 |
| 使用 Cloudflare Workers | 無伺服器、低成本 | 需額外學習成本 | ❌ 拒絕 |
| 直接嵌入 CSV | 無 API 限制 | 無法即時更新資料 | ❌ 拒絕 |
| 公開試算表 + 受限 API Key | 簡單、符合需求 | 金鑰可見（已限制來源） | ✅ 採用 |

---

## 2. Vue 3 搜尋功能實作模式

### 決策：使用 VueUse 的 `useDebounceFn` + Composable 模式

### 理由

- VueUse 是 Vue 生態系最成熟的工具函式庫，已納入專案憲章核准的技術堆疊
- 提供 TypeScript 完整支援
- 社群活躍，維護良好
- 按需引入不會增加過多套件大小

### 防抖 (Debounce) 最佳實踐

- **建議延遲時間**：300ms（平衡回應速度與 API 請求次數）
- **觸發方式**：按下搜尋按鈕或 Enter 鍵（非即時搜尋）
- **實作方式**：使用 VueUse 的 `useDebounceFn`

### 搜尋結果快取策略

| 層級 | 儲存位置 | 用途 | TTL |
|------|----------|------|-----|
| L1 快取 | `Map` 物件 | 最近 50 筆搜尋結果 | Session 生命週期 |
| L2 快取 | LocalStorage（使用 VueUse `useLocalStorage`） | 完整歌詞資料 | 1 小時 |

### 關鍵字高亮顯示

- 使用正則表達式匹配關鍵字
- 以 `<mark>` 標籤包裹匹配文字
- 注意 XSS 防護：進行 HTML 實體編碼後再使用 `v-html`

### 相關性排序演算法

| 匹配類型 | 權重 |
|----------|------|
| 標題完全匹配 | 100 |
| 標題部分匹配 | 80 |
| 歌手名稱匹配 | 60 |
| 歌詞內容匹配 | 40 |
| 每次額外匹配 | +5 |

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| VueUse `useDebounceFn` | 穩定可靠、功能豐富、已納入憲章 | - | ✅ 採用 |
| Lodash debounce | 穩定可靠 | 需額外安裝、無 Vue 整合 | ❌ 拒絕 |
| 自行實作 debounce | 無相依性 | 維護成本較高 | ❌ 拒絕 |
| Fuse.js 模糊搜尋 | 強大的模糊匹配 | 大量資料效能較差 | ❌ 拒絕 |

---

## 3. Vue Router 與 SEO 最佳實踐

### 決策：使用動態路由 + `@unhead/vue` 管理 Meta

### 路由設計

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | 搜尋入口頁面 |
| `/search` | 搜尋結果頁 | Query: `?q=關鍵字&page=1` |
| `/lyrics/:id` | 歌詞詳細頁 | 動態路由 |

### 理由

- 路由結構簡潔，易於理解
- Query String 用於搜尋參數，便於分享和書籤
- 動態路由使用 `:id` 確保唯一性

### 路由守衛與載入狀態

- 使用 `beforeResolve` 守衛進行資料預載
- 全域載入狀態透過 Vue 的 `provide/inject` 管理
- 頁面級載入使用元件內 `ref` 狀態

### SEO 考量

1. **動態 Meta 標籤**：使用 `@unhead/vue` 管理
2. **Open Graph 標籤**：設定分享預覽資訊
3. **語意化 HTML**：使用適當的標籤結構

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| Nuxt 3 | SSR/SSG 內建支援 | 需遷移框架、學習曲線 | ❌ 拒絕 |
| 純 CSR | 架構簡單 | SEO 較差 | ✅ 採用（搭配 Meta 管理） |
| vite-ssg | 建構時產生靜態頁面 | 需預知所有路由 | ❌ 拒絕 |

---

## 4. 效能優化策略

### 決策：採用程式碼分割 + 傳統分頁

### 程式碼分割和懶載入

| 分割策略 | 說明 |
|----------|------|
| 路由級分割 | 每個路由獨立 chunk |
| 元件級分割 | 使用 `defineAsyncComponent` |
| 第三方函式庫 | 獨立打包 vendor chunk |

### 搜尋結果分頁

- **分頁方式**：傳統分頁導覽（根據規格要求）
- **每頁數量**：20 筆
- **分頁元件**：顯示頁碼和上/下頁按鈕

### 理由

- 傳統分頁符合規格要求（FR-016）
- 實作簡單，UX 明確
- 避免無限滾動的複雜度

### 資源優化

| 資源類型 | 優化策略 |
|----------|----------|
| JavaScript | 程式碼分割、Tree Shaking |
| CSS | 移除未使用樣式 |
| 圖片 | 懶載入（如有需要） |

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| 虛擬滾動 | 處理大量資料 | 實作複雜 | ❌ 拒絕 |
| 無限滾動 | UX 流暢 | 不符合規格要求 | ❌ 拒絕 |
| 傳統分頁 | 符合規格、實作簡單 | UX 稍差 | ✅ 採用 |

---

## 5. E2E 測試（Playwright）最佳實踐

### 決策：使用 Page Object Model + `page.route()` 模擬 API

### 搜尋功能測試策略

```text
1. 驗證搜尋輸入框存在且可聚焦
2. 輸入關鍵字後按 Enter 或點擊搜尋按鈕
3. 驗證載入狀態顯示
4. 驗證搜尋結果正確顯示
5. 驗證空結果狀態
6. 驗證錯誤狀態處理
7. 驗證分頁功能
```

### 模擬 API 回應

- 使用 Playwright 的 `page.route()` 攔截請求
- 建立 `e2e/fixtures/` 資料夾存放模擬資料
- 區分成功、失敗、空結果等情境

### 理由

- `page.route()` 是 Playwright 原生功能，穩定可靠
- 不需額外相依套件
- 可精確控制回應時機與內容

### 頁面導航測試

```text
1. 驗證路由切換正確
2. 驗證瀏覽器返回按鈕行為
3. 驗證深層連結可直接存取
4. 驗證搜尋結果點擊導航至詳細頁
```

### 測試檔案結構

```text
e2e/
├── fixtures/
│   ├── search-results.json      # 搜尋結果模擬資料
│   ├── lyrics-detail.json       # 歌詞詳細模擬資料
│   └── empty-results.json       # 空結果模擬資料
├── search.spec.ts               # 搜尋功能測試
├── lyrics-detail.spec.ts        # 歌詞詳細頁測試
└── navigation.spec.ts           # 導航功能測試
```

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| MSW (Mock Service Worker) | 在瀏覽器層攔截 | 需額外設定 | ❌ 拒絕 |
| 真實 API | 測試真實行為 | 不穩定、速度慢 | ❌ 拒絕 |
| `page.route()` | 原生支援、穩定 | 功能較基礎（但足夠） | ✅ 採用 |

---

## 6. 單元測試（Vitest）最佳實踐

### 決策：使用 Vitest + Vue Test Utils + 模組化測試

### Vue 3 Composition API 測試模式

| 測試類型 | 工具 | 說明 |
|----------|------|------|
| 元件測試 | `@vue/test-utils` | `mount`/`shallowMount` |
| 快照測試 | Vitest | 驗證 UI 結構穩定性 |
| 事件測試 | `trigger` | 模擬使用者互動 |

### Composables 測試方式

```typescript
// 範例：測試 composable
import { renderComposable } from '../test-utils'
import { useSearch } from '@/features/search/composables/useSearch'

test('useSearch 應回傳正確的搜尋結果', async () => {
  const { result } = renderComposable(() => useSearch())
  
  await result.search('周杰倫')
  
  expect(result.results.value).toHaveLength(5)
})
```

### 理由

- Vitest 與 Vite 完美整合，設定簡單
- 執行速度快（使用 esbuild）
- 相容 Jest API，學習曲線低

### 服務層測試策略

```text
1. Mock 外部 API 呼叫（使用 vi.mock）
2. 測試資料轉換邏輯
3. 測試錯誤處理流程
4. 測試快取機制
```

### 測試覆蓋率目標

| 層級 | 覆蓋率目標 |
|------|-----------|
| 服務層 | ≥ 90% |
| Composables | ≥ 85% |
| 元件 | ≥ 70%（著重邏輯，非樣式） |

### 測試檔案結構

```text
src/features/search/__tests__/
├── SearchBar.spec.ts            # SearchBar 元件測試
├── SearchResults.spec.ts        # SearchResults 元件測試
├── useSearch.spec.ts            # useSearch composable 測試
└── searchService.spec.ts        # searchService 服務測試
```

### 考慮的替代方案

| 方案 | 優點 | 缺點 | 決策 |
|------|------|------|------|
| Jest | 成熟穩定 | 與 Vite 整合需額外設定 | ❌ 拒絕 |
| Cypress Component Testing | 真實瀏覽器環境 | 速度較慢 | ❌ 拒絕 |
| Vitest | Vite 原生整合、速度快 | - | ✅ 採用 |

---

## 總結建議

| 主題 | 推薦方案 | 優先級 |
|------|----------|--------|
| Google Sheets API | 公開試算表 + 受限 API Key | 🔴 高 |
| HTTP 請求 | Axios 統一 instance | 🔴 高 |
| 搜尋防抖 | VueUse `useDebounceFn` | 🔴 高 |
| 快取策略 | Map + VueUse `useLocalStorage` 雙層快取 | 🟡 中 |
| 路由設計 | `/search?q=` + `/lyrics/:id` 格式 | 🔴 高 |
| SEO | @unhead/vue 管理 Meta | 🟡 中 |
| 效能優化 | 傳統分頁 + 程式碼分割 | 🟡 中 |
| 樣式框架 | Tailwind CSS v4 | 🔴 高 |
| E2E 測試 | Playwright + page.route() | 🔴 高 |
| 單元測試 | Vitest + Vue Test Utils | 🔴 高 |

---

## 需要的額外相依套件

| 套件名稱 | 用途 | 類型 |
|----------|------|------|
| `vue-router` | 路由管理 | dependencies |
| `axios` | HTTP 請求 | dependencies |
| `@vueuse/core` | 組合式函式工具 | dependencies |
| `@unhead/vue` | SEO Meta 管理 | dependencies |
| `tailwindcss` | CSS 樣式框架 | devDependencies |
| `@tailwindcss/vite` | Tailwind Vite 整合 | devDependencies |
| `clsx` | 條件式樣式組合 | dependencies |
| `@vue/test-utils` | 單元測試工具 | devDependencies |
