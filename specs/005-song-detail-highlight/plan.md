# Implementation Plan: 歌曲詳細頁與歌詞高亮顯示

**Branch**: `005-song-detail-highlight` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-song-detail-highlight/spec.md`

## Summary

本功能實作從搜尋結果到歌曲詳細頁的導航，並在詳細頁中高亮顯示匹配的歌詞片段。核心需求包括：

1. **導航功能**：從搜尋結果點擊歌曲進入詳細頁，顯示完整歌曲資訊（歌名、歌手、完整歌詞）
2. **高亮顯示**：透過 URL query parameter (`?highlight=關鍵字`) 傳遞搜尋關鍵字，在歌詞中使用黃色背景 + 粗體標記所有匹配處
3. **自動捲動**：頁面載入後自動捲動到第一個匹配位置，顯示在視窗中央

**技術方案**：
- 使用正則表達式全域搜尋配合 `<mark>` 標籤實作高亮（效能優異，支援 100+ 匹配）
- 使用 `scrollIntoView` API + VueUse 的 `useScroll` 實作平滑自動捲動
- 複用 004-lyrics-search 的 Google Apps Script `getSong` API（無需後端修改）
- Vue Router query parameters 管理 URL 狀態，支援直接 URL 訪問和分享

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode enabled)  
**Framework**: Vue 3.5+ (Composition API with `<script setup>`)  
**Router**: Vue Router 4.6+  
**Primary Dependencies**: 
- @vueuse/core 14.1+ (composables: useTitle, useScroll, useEventListener)
- Tailwind CSS v4 (styling with utility classes)

**Storage**: N/A（使用 Google Apps Script API，無本地資料庫）  
**API Integration**: 
- Google Apps Script Web App (複用 004-lyrics-search 的 `getSong` 端點)
- HTTP 請求透過 Fetch API（Google Apps Script 已包含 CORS 支援）

**Testing**: 
- E2E: Playwright 1.57+（完整使用者流程測試）
- Unit: Vitest 4.0+ with jsdom（組件和工具函式測試）

**Build Tools**:
- Vite (Rolldown variant 7.2.5)
- vue-tsc 3.1+ (TypeScript type checking)
- OxLint 1.30+ (type-aware linting)

**Package Manager**: pnpm

**Target Platform**: 現代網頁瀏覽器（Chrome, Firefox, Safari, Edge）支援 ES6+ 和 CSS3  

**Project Type**: 單頁應用程式 (SPA) - 前端專案  

**Performance Goals**: 
- 頁面載入時間（從點擊到顯示完整內容）< 2 秒 (SC-001)
- 首次內容繪製 (FCP) < 1.5 秒（Constitution IV）
- 最大內容繪製 (LCP) < 2.5 秒（Constitution IV）
- 高亮顯示處理時間 < 10ms（即使 100+ 匹配）
- 自動捲動準確率 100%（SC-004）

**Constraints**: 
- 必須支援響應式設計（桌面、平板、手機）
- 必須支援直接 URL 訪問（透過 query parameter 傳遞高亮關鍵字）
- 必須保持搜尋結果頁的狀態（返回時關鍵字、捲動位置不變）
- Google Apps Script API 冷啟動可能 1-2 秒，需提供適當載入指示器

**Scale/Scope**: 
- 預計支援 1000+ 歌曲
- 歌詞長度最長 200 行
- 關鍵字匹配最多 100+ 處
- 預計 100+ 並發使用者（Google Apps Script 限制）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 符合狀態 | 驗證方式 | 備註 |
|-----|---------|---------|------|
| **I. Test-First** | ✅ 完全符合 | tasks.md 要求 E2E 和單元測試先於實作 | 遵循 Red-Green-Refactor 循環 |
| **II. 程式碼品質** | ✅ 完全符合 | TypeScript strict mode, OxLint type-aware | 變數使用英文 camelCase，註解使用正體中文 |
| **III. 使用者體驗** | ✅ 完全符合 | UI 文字和錯誤訊息使用正體中文 | 提供載入指示器、404 錯誤頁面 |
| **IV. 效能要求** | ✅ 完全符合 | SC-001 要求 < 2s，高亮處理 < 10ms | 符合 FCP < 1.5s, LCP < 2.5s 標準 |
| **V. 國際化與語系** | ✅ 完全符合 | 文件和 UI 使用正體中文，程式碼使用英文 | 註解使用正體中文 |
| **VI. Feature-Based 架構** | ✅ 完全符合 | src/features/song-detail/ 結構 | 共用 Song 型別移至 src/shared/types/ |
| **VII. Git Commit 規範** | ✅ 完全符合 | 遵循 Conventional Commits v1.0.0 | 使用正體中文 description |
| **VIII. HTTP 請求 (Axios)** | ⚠️ **部分適用** | 使用 Fetch API 呼叫 Google Apps Script | **豁免理由**：Google Apps Script 已提供 CORS 支援的 REST API，無需 Axios instance 統一管理（見 Complexity Tracking） |
| **IX. Tailwind CSS v4** | ✅ 完全符合 | 使用 bg-yellow-200 font-bold utility classes | 響應式設計使用 Tailwind 斷點 |
| **X. VueUse** | ✅ 完全符合 | 使用 useTitle, useScroll, useEventListener | 按需引入避免套件膨脹 |
| **XI. TanStack Query** | ⚠️ **不適用** | 未使用 TanStack Query | **豁免理由**：簡單的一次性資料請求，使用 Vue computed 快取即可（見 Complexity Tracking） |
| **XII. ts-rest + Zod** | ⚠️ **部分適用** | 手動定義 TypeScript 型別，無 Zod schema | **豁免理由**：Google Apps Script 無 TypeScript 支援，API contract 已在 contracts/api.contract.md 手動定義（見 Complexity Tracking） |

**閘門評估**：
- ✅ **通過**：9 項原則完全符合
- ⚠️ **豁免**：3 項原則（VIII, XI, XII）因技術限制或簡單性需求申請豁免
- ❌ **違反**：0 項

**Phase 1 設計後重新檢查**：
- Constitution Check 在 Phase 0 (research.md) 和 Phase 1 (data-model.md, contracts/) 完成後保持一致
- 豁免理由已記錄在 Complexity Tracking 章節

## Project Structure

### Documentation (this feature)

```text
specs/005-song-detail-highlight/
├── spec.md              # 功能規格（3 個使用者故事，12 個功能需求）
├── plan.md              # 本文件 (技術規劃與憲法檢查)
├── research.md          # Phase 0 技術研究（7 項決策）
├── data-model.md        # Phase 1 資料模型（3 個實體）
├── quickstart.md        # Phase 1 開發者快速開始指南
├── contracts/           # Phase 1 API 契約與型別定義
│   ├── api.contract.md          # Google Apps Script getSong API 規範
│   ├── api-integration.md       # 前端整合指南
│   └── song-detail.types.ts     # TypeScript 型別定義（200+ 行）
├── checklists/          # 品質檢查清單
│   └── requirements.md          # 需求驗證清單
└── tasks.md             # Phase 2 任務分解（56 個任務）
```

### Source Code (repository root)

本專案採用 **Feature-Based 架構**（Constitution VI），單頁應用程式結構：

```text
src/
├── features/
│   ├── search/                      # 004-lyrics-search 功能（已存在）
│   │   ├── components/
│   │   │   └── SearchResultItem.vue   # 需修改：新增點擊導航到詳細頁
│   │   └── types/
│   │       └── search.types.ts        # Song 型別將遷移至 shared/types/
│   │
│   └── song-detail/                 # 005 功能（本功能，待建立）
│       ├── components/
│       │   ├── SongHeader.vue         # 顯示歌名、歌手
│       │   ├── LyricsContent.vue      # 顯示歌詞（支援高亮）
│       │   ├── BackButton.vue         # 返回搜尋結果
│       │   ├── LoadingState.vue       # 載入指示器（Phase 6）
│       │   └── ErrorState.vue         # 錯誤訊息（Phase 6）
│       ├── composables/
│       │   ├── useSongDetail.ts       # 載入歌曲資料
│       │   ├── useLyricsHighlight.ts  # 高亮邏輯
│       │   └── useAutoScroll.ts       # 自動捲動
│       ├── services/
│       │   └── song.service.ts        # Google Apps Script API 整合
│       ├── utils/
│       │   ├── escape-regex.ts        # 正則特殊字元轉義
│       │   └── highlight-text.ts      # 文字高亮函式
│       ├── types/
│       │   └── song-detail.types.ts   # 本功能專屬型別
│       ├── __tests__/                 # 單元測試
│       │   ├── song.service.spec.ts
│       │   ├── useSongDetail.spec.ts
│       │   ├── useLyricsHighlight.spec.ts
│       │   ├── useAutoScroll.spec.ts
│       │   ├── highlight-text.spec.ts
│       │   └── escape-regex.spec.ts
│       └── SongDetailPage.vue         # 主頁面元件
│
├── shared/                          # 共用程式碼
│   ├── components/                  # 共用元件（如需）
│   ├── composables/                 # 共用組合式函式（如需）
│   ├── utils/                       # 工具函式（如需）
│   └── types/
│       └── common.types.ts          # Song 型別（從 search 遷移而來）
│
├── router/
│   └── index.ts                     # Vue Router 設定（新增 /song/:id 路由）
│
├── assets/
│   └── style.css                    # Tailwind CSS 主檔案
│
├── App.vue                          # 根元件
└── main.ts                          # 應用程式入口

e2e/
├── song-detail.spec.ts              # 本功能 E2E 測試（11 個測試）
└── search.spec.ts                   # 搜尋功能測試（已存在）

test-results/                        # Playwright 測試結果
playwright-report/                   # Playwright 測試報告
```

**Structure Decision**: 

採用 Feature-Based 架構，將歌曲詳細頁相關的所有程式碼（元件、composables、服務、工具函式、型別、測試）集中在 `src/features/song-detail/` 目錄下。

**重要決策**：
1. **Song 型別遷移**：將 `Song` 介面從 `src/features/search/types/search.types.ts` 遷移到 `src/shared/types/common.types.ts`，因為此型別被搜尋和詳細頁兩個功能共用。
2. **API 複用**：複用 004-lyrics-search 的 Google Apps Script `getSong` 端點，無需新增或修改後端程式碼。
3. **元件粒度**：將頁面分解為小型、可測試的元件（SongHeader, LyricsContent, BackButton），遵循單一職責原則。
4. **測試組織**：E2E 測試放在 `e2e/`，單元測試放在功能目錄內的 `__tests__/`，符合測試金字塔原則。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本功能有 3 項憲法原則申請豁免，理由如下：

| 憲法原則 | 為何需要豁免 | 為何排除更簡單的替代方案 |
|---------|------------|------------------------|
| **VIII. HTTP 請求規範 (Axios)** | Google Apps Script 提供簡單的 REST API，使用瀏覽器原生 Fetch API 即可完成所有請求，無需複雜的攔截器或錯誤處理邏輯 | **為何不使用 Axios**：(1) Google Apps Script 已內建 CORS 支援，無需統一設定請求標頭；(2) 本功能僅有一個 `getSong` API 端點，無需統一的錯誤轉換或載入狀態管理；(3) 增加 Axios 依賴會增加打包大小（~13KB），對單一 API 呼叫來說過度設計 |
| **XI. TanStack Query** | 本功能的資料需求極為簡單：使用者點擊歌曲後一次性載入歌曲詳情，不需要背景更新、重試、或複雜的快取策略 | **為何不使用 TanStack Query**：(1) 歌曲詳情不會頻繁變動，無需自動背景重新取得；(2) 使用 Vue 的 `computed` 已足以快取高亮後的歌詞（依賴 `song` 和 `highlightKeyword`）；(3) TanStack Query 的複雜快取邏輯（staleTime, gcTime, invalidation）對「一次性載入」場景無實質幫助；(4) 增加 ~40KB 依賴但僅使用 < 10% 功能，違反簡單性原則 |
| **XII. API Contract (ts-rest + Zod)** | Google Apps Script 是 JavaScript 執行環境，無 TypeScript 支援，無法在後端使用 Zod schema 驗證。API contract 已在 `contracts/api.contract.md` 手動定義並包含完整的請求/回應範例 | **為何不使用 ts-rest + Zod**：(1) 後端無法使用 TypeScript，無法共用 contract 定義；(2) 前端僅需定義 TypeScript interface（已在 `contracts/song-detail.types.ts`），無需執行時 schema 驗證（因為 API 由我們自己控制且已在 004 功能中驗證）；(3) ts-rest + Zod 增加 ~20KB 依賴，對手動定義的單一端點來說過度複雜 |

**豁免決策原則**：

1. **Google Apps Script 限制**：作為第三方 API 提供者，我們無法控制其技術棧，必須適應其 JavaScript 環境和簡單的 REST 介面。

2. **簡單性優先**：對於「一次性資料請求 + 客戶端快取」的場景，使用 Vue 原生能力（computed, reactive）比引入重量級快取函式庫更符合 YAGNI (You Aren't Gonna Need It) 原則。

3. **型別安全保證**：雖然不使用 ts-rest/Zod，但透過 TypeScript interface 定義、手動 API contract 文件、和完整的單元測試（T015: SongService.getSongById()）仍可確保型別安全和契約一致性。

4. **效能與打包大小**：避免引入未充分使用的大型依賴（Axios 13KB, TanStack Query 40KB, ts-rest + Zod 20KB），對 LCP < 2.5s 的效能目標有正面影響。

**審查檢查點**：

- ✅ 所有豁免理由已明確記錄
- ✅ 已評估更簡單的替代方案（原生 Fetch, Vue computed）
- ✅ 豁免不影響核心品質目標（型別安全、測試覆蓋、效能）
- ✅ 團隊已知曉並同意豁免決策

**未來重新評估觸發條件**：

- 若新增 3+ 個 API 端點，考慮引入 Axios 統一管理
- 若需要背景更新或複雜快取策略（如離線支援），考慮引入 TanStack Query
- 若後端遷移至 TypeScript 環境，考慮引入 ts-rest + Zod
