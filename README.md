# LyriFind - 歌詞搜尋系統

LyriFind 是一個基於 Vue 3 + TypeScript 的歌詞搜尋應用程式，讓使用者能夠搜尋中文歌曲的歌名、歌手或歌詞內容。

## 功能特色

### 🎵 歌詞搜尋（Feature 004）
- **基本關鍵字搜尋**：搜尋歌名或歌手名稱
- **歌詞片段搜尋**：搜尋歌詞內容並顯示包含上下文的 3 行匹配片段
- **歌詞高亮顯示**：自動高亮匹配的關鍵字（黃色背景 + 粗體）
- **分頁功能**：每頁顯示 20 筆結果

### 🎶 歌曲詳細頁（Feature 005）
- **完整歌詞顯示**：點擊搜尋結果進入歌曲詳細頁，查看完整歌名、歌手及歌詞
- **歌詞關鍵字高亮**：透過歌詞關鍵字搜尋進入時，自動高亮所有匹配片段
- **自動捲動定位**：頁面自動捲動到第一個匹配的歌詞位置（置中顯示）
- **返回導航**：一鍵返回搜尋結果並保持搜尋狀態
- **載入狀態**：骨架屏動畫提供良好的載入體驗
- **錯誤處理**：歌曲不存在（404）和一般錯誤的友善提示

### 🛠️ 技術棧
- **前端框架**：Vue 3.5.24
- **開發語言**：TypeScript 5.9+
- **建置工具**：Vite (Rolldown 7.2.5)
- **路由管理**：Vue Router 4.6.3
- **CSS 框架**：Tailwind CSS v4
- **工具函式**：VueUse 14.1.0
- **測試框架**：
  - 單元測試：Vitest 4.0.14
  - E2E 測試：Playwright 1.57.0
- **程式碼品質**：OxLint 1.30.0

## 快速開始

### 環境需求
- Node.js v20+
- pnpm v9+
- Git v2+

### 安裝依賴
\`\`\`bash
pnpm install
\`\`\`

### 開發模式
\`\`\`bash
pnpm run dev
\`\`\`
應用程式將在 `http://localhost:5173` 運行

### 建置專案
\`\`\`bash
pnpm run build
\`\`\`

### 預覽建置結果
\`\`\`bash
pnpm run preview
\`\`\`

## 測試

### 單元測試
\`\`\`bash
# 執行所有單元測試
pnpm run test

# 監聽模式
pnpm run test:watch
\`\`\`

### E2E 測試
\`\`\`bash
# 執行 E2E 測試
pnpm run test:e2e
\`\`\`

## 程式碼品質

### Lint 檢查
\`\`\`bash
pnpm run lint
\`\`\`

### 型別檢查
\`\`\`bash
pnpm exec vue-tsc --noEmit
\`\`\`

## 專案結構
\`\`\`
src/
├── features/
│   ├── search/              # 搜尋功能模組
│   │   ├── components/      # Vue 元件（SearchBar、SearchResultItem 等）
│   │   ├── composables/     # Vue Composables（useSearch、useLyricsHighlight）
│   │   ├── services/        # API 服務（searchService）
│   │   ├── types/           # TypeScript 型別
│   │   ├── utils/           # 工具函式（extractSnippet）
│   │   ├── views/           # 頁面元件（SearchPage）
│   │   └── __tests__/       # 單元測試
│   └── song-detail/         # 歌曲詳細頁功能模組
│       ├── components/      # Vue 元件（SongHeader、LyricsContent、BackButton 等）
│       ├── composables/     # Vue Composables（useSongDetail、useLyricsHighlight、useAutoScroll）
│       ├── services/        # API 服務（songService）
│       ├── types/           # TypeScript 型別
│       ├── utils/           # 工具函式（escapeRegex、highlightText）
│       ├── SongDetailPage.vue # 歌曲詳細頁主頁面
│       └── __tests__/       # 單元測試
├── shared/                  # 跨功能共用模組
│   └── types/               # 共用型別定義（Song 介面等）
├── router/                  # 路由配置（/search、/songs/:id）
├── App.vue                  # 根元件
└── main.ts                  # 應用程式入口
\`\`\`

## 資料來源

本專案使用 Google Sheets 作為資料來源，透過 Google Apps Script 部署為 Web API。

詳細設定步驟請參考 \`specs/004-lyrics-search/quickstart.md\`。

## 開發指南

- **Feature-Based 架構**：功能模組化，易於維護和擴展
- **TDD 開發流程**：先寫測試，再實作功能
- **型別安全**：完整的 TypeScript 型別定義
- **Conventional Commits**：遵循標準的 commit 訊息格式

## 測試覆蓋率

- ✅ **單元測試**：85/85 通過 (100%)
- ✅ **E2E 測試**：配置完成（Playwright）

## 授權

This project is licensed under the MIT License.

## 相關文件

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - 實作進度追蹤
- [Tasks](./specs/004-lyrics-search/tasks.md) - 詳細任務清單
- [Quick Start](./specs/004-lyrics-search/quickstart.md) - 快速開始指南

