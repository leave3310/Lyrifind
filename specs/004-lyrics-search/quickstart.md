# Quickstart Guide: 歌詞搜尋功能

**Feature**: 004-lyrics-search  
**Date**: 2025-12-13  
**Audience**: 開發者

## 目標

本指南協助開發者快速設置並驗證歌詞搜尋功能的開發環境，確保所有相依項正確安裝，**Google Apps Script API 正確設定**，並能成功執行測試。

---

## 前置需求

### 必要軟體

- **Node.js**: v20.x 或更高版本
- **pnpm**: v9.x 或更高版本
- **Git**: v2.x 或更高版本

### 驗證安裝

```bash
node --version   # 應顯示 v20.x.x
pnpm --version   # 應顯示 9.x.x
git --version    # 應顯示 2.x.x
```

---

## 步驟 1: 複製專案並切換分支

```bash
# 如果尚未複製專案
git clone <repository-url>
cd LyriFind

# 切換到功能分支
git checkout 004-lyrics-search

# 確認當前分支
git branch  # 應顯示 * 004-lyrics-search
```

---

## 步驟 2: 安裝相依套件

```bash
# 安裝所有相依套件
pnpm install

# 驗證安裝完成
pnpm list --depth=0
```

**預期看到的核心套件**：
- `vue@^3.5.24`
- `vite@npm:rolldown-vite@7.2.5`
- `typescript@~5.9.3`
- `@playwright/test@^1.57.0`
- `vitest@^4.0.14`
- `oxlint@^1.30.0`

---

## 步驟 3: 新增必要相依套件（本功能需要）

歌詞搜尋功能需要額外的套件，執行以下命令安裝：

```bash
# 安裝 VueUse（組合式函式工具庫，用於防抖等）
pnpm add @vueuse/core

# 安裝 Vue Router（路由管理）
pnpm add vue-router

# 安裝 Tailwind CSS v4 相關套件（如尚未安裝）
pnpm add -D tailwindcss@next @tailwindcss/vite@next

# 驗證套件已安裝
pnpm list @vueuse/core vue-router tailwindcss
```

---

## 步驟 4: 設定 Tailwind CSS v4（如尚未設定）

### 4.1 更新 vite.config.ts

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ]
})
```

### 4.2 更新 src/style.css

```css
/* src/style.css */
@import "tailwindcss";

@theme {
  /* 自訂主題變數（如需要） */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
}
```

### 4.3 確認 main.ts 引入樣式

```typescript
// src/main.ts
import { createApp } from 'vue'
import './style.css'  // 確保此行存在
import App from './App.vue'

createApp(App).mount('#app')
```

---

## 步驟 5: 驗證開發環境

### 5.1 啟動開發伺服器

```bash
pnpm run dev
```

**預期輸出**：
```
VITE v7.2.5  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

在瀏覽器開啟 `http://localhost:5173/`，應能看到預設的 Vue 應用程式頁面。

按 `Ctrl + C` 停止伺服器。

### 5.2 執行程式碼檢查

```bash
pnpm run lint
```

**預期輸出**：
```
✓ No linting errors found
```

如有錯誤，請根據錯誤訊息修正。

### 5.3 執行型別檢查

```bash
pnpm run build
```

**預期輸出**：
```
vite v7.2.5 building for production...
✓ XXX modules transformed.
dist/index.html                  X.XX kB
dist/assets/index-XXXXX.js      XX.XX kB │ gzip: XX.XX kB
✓ built in XXXms
```

如有型別錯誤，請根據錯誤訊息修正。

---

## 步驟 6: 執行測試（確保測試框架運作正常）

### 6.1 執行單元測試

```bash
pnpm run test
```

**預期輸出**（目前應無測試檔案）：
```
No test files found, exiting with code 0
```

### 6.2 執行 E2E 測試

```bash
# 首次執行需安裝 Playwright 瀏覽器
pnpm exec playwright install

# 執行 E2E 測試
pnpm run test:e2e
```

**預期輸出**（目前應有範例測試）：
```
Running X test using X worker
  X passing (XXs)
```

---

## 步驟 7：設定 Google Apps Script API（後端資料來源）

### 7.1 建立 Google Sheets 資料來源

1. **開啟 Google Sheets**：
   - 前往 [Google Sheets](https://sheets.google.com)
   - 建立新試算表，命名為「LyriFind Songs」

2. **設定資料結構**：
   - 工作表名稱：`Songs`
   - 第一列（標題列）：
     | id | artist | title | lyrics |
     |----|--------|-------|--------|

3. **填入測試資料**：
   ```
   | id       | artist  | title    | lyrics                                      |
   |----------|---------|----------|---------------------------------------------|
   | song-001 | 周杰倫  | 青花瓷   | 素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹... |
   | song-002 | 五月天  | 倒帶     | 愛進到留白\n才發現過去多愛你一天...      |
   ```
   
   **注意**：歌詞換行使用 `\n` 表示，或在 Google Sheets 中使用 `Alt+Enter`（Mac：`Cmd+Enter`）實際換行。

### 7.2 建立 Google Apps Script

1. **開啟 Apps Script 編輯器**：
   - 在 Google Sheets 中，點擊「擴充功能」→「Apps Script」

2. **貼上 API 程式碼**：
   - 刪除預設的 `myFunction()`
   - 貼上完整 API 程式碼（參見 [contracts/search.contract.md](./contracts/search.contract.md) 的「Google Apps Script 實作範例」章節）

3. **儲存專案**：
   - 專案名稱：「LyriFind API」
   - 點擊「儲存」圖示（磁碟圖示）

### 7.3 部署為 Web App

1. **開始部署**：
   - 點擊「部署」→「新增部署」

2. **設定部署參數**：
   - **類型**：選擇「Web 應用程式」
   - **說明**：「LyriFind API v1.0」
   - **執行身分**：選擇「我」
   - **存取權**：選擇「所有人」（允許匯名存取）

3. **授權存取權**：
   - 點擊「授權存取權」
   - 選擇您的 Google 帳戶
   - 點擊「進階」→「前往 LyriFind API（不安全）」
   - 點擊「允許」

4. **複製 Web App URL**：
   - 部署完成後，複製「網頁應用程式網址」
   - 格式：`https://script.google.com/macros/s/{SCRIPT_ID}/exec`

### 7.4 測試 API

在終端機執行以下指令（替換 `{YOUR_SCRIPT_ID}` 為實際 URL）：

```bash
# 測試搜尋 API
curl "https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec?action=search&q=青花瓷&page=1"

# 預期輸出：JSON 格式的搜尋結果
```

### 7.5 設定環境變數

在專案根目錄建立 `.env.local` 檔案：

```bash
# .env.local
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

**重要**：將 `{YOUR_SCRIPT_ID}` 替換為實際的 Script ID。

**驗證**：
```bash
# 確認環境變數已設定
cat .env.local
```

---

## 步驟 8：建立功能結構（準備開始開發）

按照 [plan.md](./plan.md) 中的專案結構建立資料夾：

```bash
# 建立搜尋功能目錄結構
mkdir -p src/features/search/{components,composables,services,types,utils,views,__tests__}
mkdir -p src/shared/{components,composables,utils,types}
mkdir -p src/router

# 驗證結構
tree src/features/search -L 1
```

**預期輸出**：
```
src/features/search
├── components
├── composables
├── services
├── types
├── utils
├── views
└── __tests__
```

---

## 步驟 9：建立基本型別定義（第一個檔案）

建立 `src/features/search/types/search.types.ts`：

```typescript
// src/features/search/types/search.types.ts

// 對應 Google Sheets 欄位：id, artist, title, lyrics
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

export interface SearchQuery {
  query: string
  page?: number
  pageSize?: number
}

export interface SearchResponse {
  items: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SearchState {
  status: SearchStatus
  query: string
  results: SearchResultItem[]
  total: number
  page: number
  error: string | null
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_QUERY_LENGTH = 200
```

### 驗證型別定義

```bash
# 執行型別檢查
pnpm exec vue-tsc --noEmit
```

**預期輸出**：無錯誤訊息

---

## 步驟 10：建立第一個測試檔案（驗證測試框架）

建立 `src/features/search/__tests__/search.types.test.ts`：

```typescript
// src/features/search/__tests__/search.types.test.ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_QUERY_LENGTH } from '../types/search.types'

describe('Search Types Constants', () => {
  it('應定義正確的預設值', () => {
    expect(DEFAULT_PAGE).toBe(1)
    expect(DEFAULT_PAGE_SIZE).toBe(20)
    expect(MAX_QUERY_LENGTH).toBe(200)
  })
})
```

### 執行測試

```bash
pnpm run test
```

**預期輸出**：
```
✓ src/features/search/__tests__/search.types.test.ts (1)
  ✓ Search Types Constants (1)
    ✓ 應定義正確的預設值

Test Files  1 passed (1)
     Tests  1 passed (1)
```

---

## 步驟 11：建立第一個 E2E 測試（驗證 Playwright）

建立 `e2e/search.spec.ts`：

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('歌詞搜尋功能', () => {
  test('應顯示搜尋頁面', async ({ page }) => {
    await page.goto('/')
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/LyriFind/)
  })
})
```

### 執行 E2E 測試

```bash
pnpm run test:e2e
```

**預期輸出**：
```
Running 1 test using 1 worker
  1 passed (XXs)
```

---

## 常見問題排除

### Q1: `pnpm install` 失敗

**解決方案**：
```bash
# 清除快取並重新安裝
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q2: Playwright 測試失敗「Browser not found」

**解決方案**：
```bash
# 安裝 Playwright 瀏覽器
pnpm exec playwright install
```

### Q3: OxLint 顯示錯誤

**解決方案**：
```bash
# 檢查 .oxlintrc.json 設定是否正確
cat .oxlintrc.json

# 如需要，手動修正錯誤或調整規則
```

### Q4: Tailwind CSS 樣式未生效

**解決方案**：
1. 確認 `vite.config.ts` 包含 `tailwindcss()` plugin
2. 確認 `src/style.css` 使用 `@import "tailwindcss"`
3. 確認 `main.ts` 引入 `./style.css`
4. 重新啟動開發伺服器

---

## 下一步

環境設置完成後，請參考以下文件繼續開發：

1. **[plan.md](./plan.md)** - 完整實作計畫和架構說明
2. **[data-model.md](./data-model.md)** - 資料模型和型別定義
3. **[research.md](./research.md)** - 技術決策和實作細節
4. **[contracts/search.contract.md](./contracts/search.contract.md)** - API 契約規範

開始實作前，請先閱讀專案憲章：
- **[.specify/memory/constitution.md](../../.specify/memory/constitution.md)** - 專案開發規範

---

## 驗證清單

完成 Quickstart 後，請確認以下項目皆已完成：

- [ ] Node.js、pnpm、Git 已安裝並驗證版本
- [ ] 成功切換到 `004-lyrics-search` 分支
- [ ] 所有相依套件已安裝（包含 VueUse、Vue Router、Tailwind CSS）
- [ ] Tailwind CSS v4 已正確設定
- [ ] 開發伺服器可成功啟動（`pnpm run dev`）
- [ ] 程式碼檢查通過（`pnpm run lint`）
- [ ] 型別檢查通過（`pnpm run build`）
- [ ] 單元測試框架運作正常（`pnpm run test`）
- [ ] E2E 測試框架運作正常（`pnpm run test:e2e`）
- [ ] **Google Sheets 資料來源已建立（Songs 工作表，欄位：id, artist, title, lyrics）**
- [ ] **Google Apps Script API 已部署為 Web App**
- [ ] **Apps Script URL 已複製並設定至 `.env.local`**
- [ ] **API 端點測試成功（curl 測試回傳 JSON）**
- [ ] 功能目錄結構已建立（`src/features/search/`）
- [ ] 基本型別定義已建立並通過型別檢查
- [ ] 第一個單元測試已建立並通過
- [ ] 第一個 E2E 測試已建立並通過

所有項目打勾後，即可開始實作歌詞搜尋功能！🎉

---

## 支援

如遇到問題，請參考：
- **專案 README**: [README.md](../../README.md)
- **專案憲章**: [constitution.md](../../.specify/memory/constitution.md)
- **功能規格**: [spec.md](./spec.md)
