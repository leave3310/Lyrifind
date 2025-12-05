# Implementation Plan: 歌詞搜尋網站

**Branch**: `002-lyrics-search` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-lyrics-search/spec.md`

## Summary

建立歌詞搜尋網站，使用者可透過歌名、歌手或歌詞片段搜尋歌曲，點擊搜尋結果可檢視完整歌詞詳情。資料來源為 Google Sheet 搭配 Apps Script 作為後端 API，前端採用 Vue 3 + TypeScript + TanStack Query + ts-rest 架構。

## Technical Context

**Language/Version**: TypeScript 5.9+, Vue 3  
**Primary Dependencies**: Vue 3, Vue Router, TanStack Query, ts-rest, Zod, Axios, VueUse, Tailwind CSS v4  
**Storage**: Google Sheet（透過 Apps Script API 存取）  
**Testing**: Playwright (E2E), Vitest (Unit)  
**Target Platform**: Web（現代瀏覽器，桌面與行動裝置）  
**Project Type**: Web（純前端 SPA）  
**Performance Goals**: FCP < 1.5s, LCP < 2.5s, 搜尋結果 < 3s  
**Constraints**: 主套件 < 200KB (gzip), 無使用者認證  
**Scale/Scope**: 歌詞資料庫規模由 Google Sheet 決定

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 測試優先 | ✅ PASS | 將遵循 E2E → Unit → 實作順序 |
| II. 程式碼品質 | ✅ PASS | TypeScript strict mode, OxLint |
| III. 使用者體驗一致性 | ✅ PASS | 正體中文 UI, 載入指示器, 響應式設計 |
| IV. 效能要求 | ✅ PASS | 符合 FCP/LCP/CLS 目標 |
| V. 國際化與語系規範 | ✅ PASS | 正體中文文件與 UI |
| VI. Feature-Based 架構 | ✅ PASS | search/lyrics 功能模組 |
| VII. Git Commit 規範 | ✅ PASS | Conventional Commits |
| VIII. HTTP 請求規範 | ✅ PASS | Axios instance |
| IX. 樣式規範 | ✅ PASS | Tailwind CSS v4 |
| X. 組合式函式規範 | ✅ PASS | VueUse 按需引入 |
| XI. 快取策略規範 | ✅ PASS | TanStack Query |
| XII. API Contract 規範 | ✅ PASS | ts-rest + Zod |

**閘門結果**: ✅ 全部通過，可進入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-lyrics-search/
├── plan.md              # 本檔案
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── lyrics.contract.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── search/                    # 搜尋功能模組
│   │   ├── components/
│   │   │   ├── SearchInput.vue    # 搜尋輸入框
│   │   │   └── SearchResults.vue  # 搜尋結果列表
│   │   ├── composables/
│   │   │   └── useSearch.ts       # 搜尋邏輯
│   │   ├── pages/
│   │   │   └── SearchPage.vue     # 搜尋頁面
│   │   ├── types/
│   │   │   └── index.ts           # 搜尋相關型別
│   │   └── index.ts               # 功能入口
│   └── lyrics/                    # 歌詞功能模組
│       ├── components/
│       │   ├── LyricsContent.vue  # 歌詞內容顯示
│       │   └── SongHeader.vue     # 歌曲標題資訊
│       ├── composables/
│       │   └── useLyrics.ts       # 歌詞詳情邏輯
│       ├── pages/
│       │   └── LyricsPage.vue     # 歌詞詳情頁面
│       ├── types/
│       │   └── index.ts           # 歌詞相關型別
│       └── index.ts               # 功能入口
├── shared/
│   ├── components/
│   │   ├── LoadingSpinner.vue     # 載入指示器
│   │   └── ErrorMessage.vue       # 錯誤訊息
│   ├── contracts/
│   │   └── lyrics.contract.ts     # API Contract 定義
│   ├── services/
│   │   ├── http.ts                # Axios instance
│   │   ├── apiClient.ts           # ts-rest client
│   │   └── queryKeys.ts           # Query Key Factory
│   └── types/
│       └── index.ts               # 共用型別
├── router/
│   └── index.ts                   # Vue Router 設定
├── App.vue
├── main.ts
└── style.css                      # Tailwind CSS

e2e/
├── search.spec.ts                 # 搜尋功能 E2E 測試
└── lyrics.spec.ts                 # 歌詞詳情 E2E 測試

src/features/search/__tests__/
└── useSearch.spec.ts              # 搜尋 composable 單元測試

src/features/lyrics/__tests__/
└── useLyrics.spec.ts              # 歌詞 composable 單元測試
```

**Structure Decision**: 採用 Feature-Based 架構，將 search 與 lyrics 分為獨立功能模組，共用元件與服務放置於 shared 目錄。

## Complexity Tracking

> **無違規項目，無需填寫**
