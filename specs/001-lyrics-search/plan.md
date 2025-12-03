# Implementation Plan: 歌詞搜尋網站

**Branch**: `001-lyrics-search` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lyrics-search/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立一個歌詞搜尋網站，使用者可以透過歌名、歌手名稱或歌詞片段進行搜尋，並在詳細頁面查看完整歌詞、歌曲名稱和歌手資訊。技術方案採用 Vue 3 + TypeScript 前端框架，搭配 Axios 統一 HTTP instance 呼叫 Google Sheets API 作為資料來源，使用 Tailwind CSS v4 進行樣式開發，並採用 VueUse 提供的組合式函式。

## Technical Context

**Language/Version**: TypeScript 5.9+（嚴格模式）  
**Primary Dependencies**: Vue 3.5+（Composition API）、Vue Router、Axios、VueUse、Tailwind CSS v4、@unhead/vue  
**Storage**: Google Sheets（作為歌詞資料庫）+ LocalStorage（快取）  
**Testing**: Playwright（E2E 測試）、Vitest + @vue/test-utils（單元測試）  
**Target Platform**: 現代瀏覽器（Chrome、Firefox、Safari、Edge 最新版本）、行動裝置  
**Project Type**: web（純前端單頁應用程式）  
**Performance Goals**: FCP < 1.5s、LCP < 2.5s、CLS < 0.1、FID < 100ms、搜尋回應 < 3s  
**Constraints**: 主套件 < 200KB (gzip)、支援 100 位同時使用者  
**Scale/Scope**: 3 個主要頁面（首頁/搜尋、搜尋結果、歌詞詳細頁）、約 1000 首歌詞初期規模

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 初始檢查（Phase 0 前）

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 測試優先 | ✅ PASS | 計畫包含 E2E 測試（Playwright）和單元測試（Vitest）的實作順序 |
| II. 程式碼品質 | ✅ PASS | 使用 TypeScript 5.9+ 嚴格模式、OxLint 檢查 |
| III. 使用者體驗一致性 | ✅ PASS | 規格已定義載入狀態、錯誤訊息、響應式設計需求 |
| IV. 效能要求 | ✅ PASS | 符合 Core Web Vitals 指標要求 |
| V. 國際化與語系規範 | ✅ PASS | 所有文件使用正體中文、程式碼命名使用英文 |
| VI. Feature-Based 架構 | ✅ PASS | 採用 Feature-Based 資料夾結構 |
| VII. Git Commit 規範 | ✅ PASS | 遵循 Conventional Commits v1.0.0 |
| VIII. HTTP 請求規範 | ✅ PASS | 使用 Axios 統一 instance（`src/shared/services/http.ts`） |
| IX. 樣式規範 | ✅ PASS | 使用 Tailwind CSS v4 |
| X. 組合式函式規範 | ✅ PASS | 使用 VueUse 並按需引入 |

### 設計後檢查（Phase 1 後）

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 測試優先 | ✅ PASS | research.md 定義完整的 E2E 和單元測試策略，使用 Playwright 和 Vitest |
| II. 程式碼品質 | ✅ PASS | 採用 TypeScript 5.9+ 嚴格模式，定義完整型別系統於 data-model.md |
| III. 使用者體驗一致性 | ✅ PASS | contracts/api.md 定義完整的錯誤訊息（正體中文）和載入狀態處理 |
| IV. 效能要求 | ✅ PASS | research.md 定義快取策略、程式碼分割和效能優化方案 |
| V. 國際化與語系規範 | ✅ PASS | 所有文件使用正體中文，型別定義使用正體中文註解 |
| VI. Feature-Based 架構 | ✅ PASS | Project Structure 採用 Feature-Based 資料夾結構（search/、lyrics/） |
| VII. Git Commit 規範 | ✅ PASS | quickstart.md 說明使用 Conventional Commits 格式 |
| VIII. HTTP 請求規範 | ✅ PASS | contracts/api.md 定義 Axios instance 和攔截器規範 |
| IX. 樣式規範 | ✅ PASS | research.md 確認使用 Tailwind CSS v4 |
| X. 組合式函式規範 | ✅ PASS | research.md 確認使用 VueUse `useDebounceFn`、`useLocalStorage` |

## Project Structure

### Documentation (this feature)

```text
specs/001-lyrics-search/
├── plan.md              # 本文件（/speckit.plan 指令輸出）
├── research.md          # Phase 0 輸出（/speckit.plan 指令）✅ 已完成
├── data-model.md        # Phase 1 輸出（/speckit.plan 指令）✅ 已完成
├── quickstart.md        # Phase 1 輸出（/speckit.plan 指令）✅ 已完成
├── contracts/           # Phase 1 輸出（/speckit.plan 指令）✅ 已完成
│   └── api.md           # API 契約定義
├── checklists/          # 需求檢查清單
│   └── requirements.md
└── tasks.md             # Phase 2 輸出（/speckit.tasks 指令 - 非 /speckit.plan 建立）
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── search/                    # 搜尋功能模組
│   │   ├── components/
│   │   │   ├── SearchBar.vue      # 搜尋輸入框元件
│   │   │   ├── SearchResults.vue  # 搜尋結果列表元件
│   │   │   └── SearchResultItem.vue # 單筆搜尋結果元件
│   │   ├── composables/
│   │   │   └── useSearch.ts       # 搜尋邏輯組合式函式
│   │   ├── services/
│   │   │   └── searchService.ts   # 搜尋 API 服務
│   │   ├── types/
│   │   │   └── index.ts           # 搜尋相關型別定義
│   │   ├── __tests__/
│   │   │   ├── SearchBar.spec.ts
│   │   │   ├── SearchResults.spec.ts
│   │   │   └── useSearch.spec.ts
│   │   └── index.ts               # 功能入口
│   │
│   └── lyrics/                    # 歌詞功能模組
│       ├── components/
│       │   ├── LyricsDetail.vue   # 歌詞詳細頁元件
│       │   └── LyricsContent.vue  # 歌詞內容顯示元件
│       ├── composables/
│       │   └── useLyrics.ts       # 歌詞邏輯組合式函式
│       ├── services/
│       │   └── lyricsService.ts   # 歌詞 API 服務
│       ├── types/
│       │   └── index.ts           # 歌詞相關型別定義
│       ├── __tests__/
│       │   ├── LyricsDetail.spec.ts
│       │   └── useLyrics.spec.ts
│       └── index.ts               # 功能入口
│
├── shared/                        # 共用程式碼
│   ├── components/
│   │   ├── LoadingSpinner.vue     # 載入指示器
│   │   ├── ErrorMessage.vue       # 錯誤訊息元件
│   │   ├── Pagination.vue         # 分頁導覽元件
│   │   └── AppHeader.vue          # 應用程式標頭
│   ├── composables/
│   │   └── useErrorHandler.ts     # 錯誤處理組合式函式
│   ├── services/
│   │   ├── http.ts                # Axios 統一 instance
│   │   └── googleSheetsApi.ts     # Google Sheets API 服務
│   ├── types/
│   │   └── index.ts               # 共用型別定義
│   └── utils/
│       └── validators.ts          # 驗證工具函式
│
├── router/
│   └── index.ts                   # Vue Router 設定
│
├── pages/
│   ├── HomePage.vue               # 首頁（含搜尋框）
│   ├── SearchResultsPage.vue      # 搜尋結果頁
│   └── LyricsDetailPage.vue       # 歌詞詳細頁
│
├── App.vue                        # 根元件
├── main.ts                        # 應用程式入口
└── style.css                      # 全域樣式（Tailwind CSS v4）

e2e/
├── fixtures/
│   ├── search-results.json        # 搜尋結果模擬資料
│   ├── lyrics-detail.json         # 歌詞詳細模擬資料
│   └── empty-results.json         # 空結果模擬資料
├── search.spec.ts                 # 搜尋功能 E2E 測試
├── lyrics-detail.spec.ts          # 歌詞詳細頁 E2E 測試
└── navigation.spec.ts             # 導航功能 E2E 測試
```

**Structure Decision**: 採用 Feature-Based 架構，將搜尋功能和歌詞功能分為獨立模組，共用程式碼放置於 `shared/` 目錄。HTTP 請求透過統一的 Axios instance（`src/shared/services/http.ts`）管理。頁面元件放置於 `pages/` 目錄，由 Vue Router 管理路由。此結構符合專案憲章第 VI 條 Feature-Based 架構原則和第 VIII 條 HTTP 請求規範。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 無 | - | - |
