# 🎵 LyriFind - 歌詞搜尋網站

一個現代化的歌詞搜尋平台，使用 Vue 3、TypeScript 與 Tailwind CSS 建構。

## 🚀 快速開始

### 環境需求

- Node.js 18+
- pnpm (推薦) 或 npm

### 安裝與啟動

```bash
# 1. 安裝相依套件
pnpm install

# 2. 設定環境變數（複製 .env.example 並修改）
cp .env.example .env.local

# 編輯 .env.local，設定 API 基礎 URL
# VITE_API_BASE_URL=https://your-api-endpoint.com

# 3. 啟動開發伺服器
pnpm dev

# 開啟 http://localhost:5173
```

### 建構生產版本

```bash
pnpm build

# 預覽生產版本
pnpm preview
```

## 📋 專案結構

```
src/
├── features/               # 功能模組
│   ├── search/            # 搜尋功能
│   │   ├── components/    # 搜尋 UI 元件
│   │   ├── composables/   # useSearch 邏輯
│   │   ├── pages/         # SearchPage 頁面
│   │   ├── types/         # 搜尋相關型別
│   │   └── __tests__/     # 單元測試
│   └── lyrics/            # 歌詞詳情功能
│       ├── components/    # 歌詞 UI 元件
│       ├── composables/   # useLyrics 邏輯
│       ├── pages/         # LyricsPage 頁面
│       ├── types/         # 歌詞相關型別
│       └── __tests__/     # 單元測試
├── shared/                # 共用資源
│   ├── components/        # 共用元件 (LoadingSpinner, ErrorMessage)
│   ├── contracts/         # API 契約定義
│   ├── services/          # HTTP 客戶端、Query Key Factory
│   └── types/             # 全域型別定義
├── router/                # Vue Router 路由配置
├── pages/                 # 全域頁面 (404)
├── App.vue                # 根元件
├── main.ts                # 應用入口點
└── style.css              # 全域樣式 (Tailwind CSS)
e2e/                       # E2E 測試（Playwright）
```

## ✨ 核心功能

### 🔍 搜尋歌曲
- 輸入歌曲名稱、歌手或歌詞片段進行搜尋
- 實時防抖搜尋（300ms 延遲）
- 自動截斷超過 200 字元的搜尋關鍵字
- 支援分頁瀏覽（每頁 20 筆結果）

### 📖 檢視歌詞詳情
- 點擊搜尋結果導向詳情頁面
- 顯示完整歌詞、歌曲名稱與歌手資訊
- 自動快取歌詞內容（30 分鐘）

### 🔙 返回搜尋結果
- 從詳情頁返回搜尋結果，保留搜尋狀態
- 支援瀏覽器返回按鈕

## 🛠️ 技術棧

| 類別 | 技術 | 說明 |
|------|------|------|
| **前端框架** | Vue 3 | 使用 Composition API + `<script setup>` |
| **語言** | TypeScript 5.9+ | strict mode，完全型別安全 |
| **UI 樣式** | Tailwind CSS v4 | utility-first CSS framework |
| **路由管理** | Vue Router | 單頁應用路由 |
| **HTTP 請求** | Axios | 支援攔截器與統一錯誤處理 |
| **API 定義** | ts-rest + Zod | 型別安全的 API 契約 |
| **狀態管理** | @tanstack/vue-query | 伺服器狀態快取管理 |
| **工具函式庫** | VueUse | 搜尋防抖等實用 composables |
| **單元測試** | Vitest | 高效的單元測試框架 |
| **E2E 測試** | Playwright | 端對端自動化測試 |

## 📝 API 整合

### 搜尋 API

```
GET /search?q={query}&page={page}&limit={limit}

Response:
{
  "data": [
    {
      "id": "1",
      "title": "歌曲名稱",
      "artist": "歌手名稱"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 詳情 API

```
GET /lyrics/{id}

Response:
{
  "id": "1",
  "title": "歌曲名稱",
  "artist": "歌手名稱",
  "lyrics": "歌詞內容..."
}
```

## 📱 響應式設計

應用支援全裝置無障礙瀏覽：

- **行動設備** (320px+)：單列網格，最佳化觸控操作
- **平板設備** (768px+)：雙列網格，舒適的閱讀體驗
- **桌面設備** (1920px+)：三列網格，充分利用屏幕空間

使用 Tailwind CSS 響應式前綴 (`sm:`, `md:`, `lg:`) 實現流暢的佈局切換。

## 🧪 測試

### 單元測試

```bash
# 執行所有單元測試
pnpm test

# 監看模式
pnpm test:watch

# 產生覆蓋率報告
pnpm test:coverage
```

### E2E 測試

```bash
# 執行 Playwright E2E 測試
pnpm test:e2e

# 以 UI 模式執行測試
pnpm test:e2e:ui
```

## 🎯 驗收標準

✅ **搜尋功能**
- 支援多種搜尋條件（歌名、歌手、歌詞片段）
- 實時防抖搜尋，操作流暢
- 完整的分頁支援

✅ **詳情功能**
- 正確顯示完整歌詞與元資料
- 快取自動失效（30 分鐘）

✅ **導航功能**
- 順暢的頁面切換與返回
- URL 狀態同步，支援書籤

✅ **設計品質**
- 全裝置適配，無障礙操作
- 流暢的載入動畫與錯誤提示

## 📖 相關文件

- [specification](./specs/002-lyrics-search/spec.md) - 完整功能規格
- [技術方案](./specs/002-lyrics-search/plan.md) - 技術架構與實作計畫
- [快速驗證](./specs/002-lyrics-search/quickstart.md) - 端到端驗收清單

## 📄 License

MIT
