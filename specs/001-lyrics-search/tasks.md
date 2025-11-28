# Tasks: 歌詞搜尋網站

**Input**: Design documents from `/specs/001-lyrics-search/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Tests**: 本專案採用測試優先開發（憲章 I），所有功能須先撰寫 E2E 測試，再撰寫單元測試，最後實作功能。

**Organization**: 任務依使用者故事分組，確保每個故事可獨立實作與測試。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[Story]**: 對應的使用者故事（US1、US2、US3）
- 包含精確檔案路徑

## Path Conventions

專案採用 Feature-Based 架構：
- `src/features/search/` - 搜尋功能模組
- `src/features/lyrics/` - 歌詞功能模組
- `src/shared/` - 共用程式碼
- `src/pages/` - 頁面元件
- `e2e/` - E2E 測試

---

## Phase 1: Setup（專案初始化）

**Purpose**: 專案初始化與基本結構建立

- [ ] T001 建立專案資料夾結構，依 plan.md 定義的 Feature-Based 架構
- [ ] T002 安裝核心相依套件（vue-router、axios、@vueuse/core、@unhead/vue）
- [ ] T003 [P] 安裝開發相依套件（tailwindcss、@tailwindcss/vite、@vue/test-utils）
- [ ] T004 [P] 設定 Tailwind CSS v4 於 `src/style.css`
- [ ] T005 [P] 設定 Vite 環境變數（`VITE_GOOGLE_API_KEY`、`VITE_SPREADSHEET_ID`）
- [ ] T006 設定 TypeScript 路徑別名（`@/` → `src/`）於 `tsconfig.app.json`
- [ ] T007 設定 Vitest 測試框架於 `vite.config.ts`

---

## Phase 2: Foundational（基礎建設）

**Purpose**: 所有使用者故事共用的核心基礎建設

**⚠️ 重要**: 必須完成此階段後才能開始實作使用者故事

- [ ] T008 建立共用型別定義於 `src/shared/types/index.ts`（Song、SearchResult、SearchQuery、SearchResponse、PaginationInfo、AppError、MatchType、ErrorCode）
- [ ] T009 [P] 建立 Axios 統一 instance 於 `src/shared/services/http.ts`
- [ ] T010 [P] 建立 Google Sheets API 服務於 `src/shared/services/googleSheetsApi.ts`
- [ ] T011 [P] 建立錯誤處理組合式函式於 `src/shared/composables/useErrorHandler.ts`
- [ ] T012 [P] 建立輸入驗證工具於 `src/shared/utils/validators.ts`
- [ ] T013 [P] 建立 LoadingSpinner 元件於 `src/shared/components/LoadingSpinner.vue`
- [ ] T014 [P] 建立 ErrorMessage 元件於 `src/shared/components/ErrorMessage.vue`
- [ ] T015 [P] 建立 AppHeader 元件於 `src/shared/components/AppHeader.vue`
- [ ] T016 設定 Vue Router 於 `src/router/index.ts`（定義 `/`、`/search`、`/lyrics/:id` 路由）
- [ ] T017 更新 `src/App.vue` 整合 Router 和全域樣式
- [ ] T018 更新 `src/main.ts` 初始化應用程式（Router、Head Manager）
- [ ] T019 建立 E2E 測試 fixtures 目錄與模擬資料於 `e2e/fixtures/`

**Checkpoint**: 基礎建設完成，可開始實作使用者故事

---

## Phase 3: User Story 1 - 歌名搜尋 (Priority: P1) 🎯 MVP

**Goal**: 使用者可透過歌名搜尋歌曲，並在詳細頁面查看完整歌詞

**Independent Test**: 輸入已知歌名進行搜尋，驗證是否能顯示正確的搜尋結果並導航至詳細頁面

### E2E 測試（先寫測試，確保失敗後再實作）

- [ ] T020 [P] [US1] 建立搜尋功能 E2E 測試於 `e2e/search.spec.ts`（搜尋輸入、結果顯示、空結果處理）
- [ ] T021 [P] [US1] 建立歌詞詳細頁 E2E 測試於 `e2e/lyrics-detail.spec.ts`（完整歌詞、歌曲名稱、歌手顯示）
- [ ] T022 [P] [US1] 建立導航功能 E2E 測試於 `e2e/navigation.spec.ts`（搜尋結果點擊導航、返回功能）

### 單元測試（先寫測試，確保失敗後再實作）

- [ ] T023 [P] [US1] 建立 SearchBar 元件單元測試於 `src/features/search/__tests__/SearchBar.spec.ts`
- [ ] T024 [P] [US1] 建立 SearchResults 元件單元測試於 `src/features/search/__tests__/SearchResults.spec.ts`
- [ ] T025 [P] [US1] 建立 useSearch composable 單元測試於 `src/features/search/__tests__/useSearch.spec.ts`
- [ ] T026 [P] [US1] 建立 searchService 單元測試於 `src/features/search/__tests__/searchService.spec.ts`
- [ ] T027 [P] [US1] 建立 LyricsDetail 元件單元測試於 `src/features/lyrics/__tests__/LyricsDetail.spec.ts`
- [ ] T028 [P] [US1] 建立 useLyrics composable 單元測試於 `src/features/lyrics/__tests__/useLyrics.spec.ts`

### 搜尋功能實作

- [ ] T029 [P] [US1] 建立搜尋相關型別定義於 `src/features/search/types/index.ts`
- [ ] T030 [US1] 建立搜尋服務於 `src/features/search/services/searchService.ts`（搜尋邏輯、相關性排序、高亮標記）
- [ ] T031 [US1] 建立 useSearch 組合式函式於 `src/features/search/composables/useSearch.ts`
- [ ] T032 [US1] 建立 SearchBar 元件於 `src/features/search/components/SearchBar.vue`
- [ ] T033 [US1] 建立 SearchResultItem 元件於 `src/features/search/components/SearchResultItem.vue`
- [ ] T034 [US1] 建立 SearchResults 元件於 `src/features/search/components/SearchResults.vue`
- [ ] T035 [US1] 建立搜尋功能入口於 `src/features/search/index.ts`

### 歌詞功能實作

- [ ] T036 [P] [US1] 建立歌詞相關型別定義於 `src/features/lyrics/types/index.ts`
- [ ] T037 [US1] 建立歌詞服務於 `src/features/lyrics/services/lyricsService.ts`
- [ ] T038 [US1] 建立 useLyrics 組合式函式於 `src/features/lyrics/composables/useLyrics.ts`
- [ ] T039 [US1] 建立 LyricsContent 元件於 `src/features/lyrics/components/LyricsContent.vue`
- [ ] T040 [US1] 建立 LyricsDetail 元件於 `src/features/lyrics/components/LyricsDetail.vue`
- [ ] T041 [US1] 建立歌詞功能入口於 `src/features/lyrics/index.ts`

### 頁面整合

- [ ] T042 [US1] 建立首頁於 `src/pages/HomePage.vue`（搜尋入口）
- [ ] T043 [US1] 建立搜尋結果頁於 `src/pages/SearchResultsPage.vue`
- [ ] T044 [US1] 建立歌詞詳細頁於 `src/pages/LyricsDetailPage.vue`（包含返回搜尋結果/首頁導航，FR-011）
- [ ] T045 [US1] 設定頁面 SEO Meta（使用 @unhead/vue）

**Checkpoint**: User Story 1 完成，可獨立測試歌名搜尋功能

> **MVP 範圍說明**：US1 MVP 版本暫不含分頁功能（FR-016），搜尋結果將顯示全部匹配項目。分頁功能將於 Phase 6 (T055-T056) 實作。

---

## Phase 4: User Story 2 - 歌手名稱搜尋 (Priority: P2)

**Goal**: 使用者可輸入歌手名稱搜尋該歌手的所有歌曲

**Independent Test**: 輸入已知歌手名稱進行搜尋，驗證是否能顯示該歌手的歌曲列表

### E2E 測試

- [ ] T046 [US2] 擴充 `e2e/search.spec.ts` 加入歌手名稱搜尋測試案例

### 單元測試

- [ ] T047 [US2] 擴充 `src/features/search/__tests__/searchService.spec.ts` 加入歌手搜尋測試

### 實作

- [ ] T048 [US2] 擴充 searchService 的相關性排序，優化歌手名稱匹配權重
- [ ] T049 [US2] 確保搜尋結果項目清楚顯示歌手名稱（優化 SearchResultItem）

**Checkpoint**: User Story 2 完成，可獨立測試歌手名稱搜尋功能

---

## Phase 5: User Story 3 - 歌詞片段搜尋 (Priority: P3)

**Goal**: 使用者可輸入歌詞片段找到完整歌曲，並在結果中高亮顯示匹配片段

**Independent Test**: 輸入某首歌的部分歌詞，驗證是否能找到並顯示正確的歌曲

### E2E 測試

- [ ] T050 [US3] 擴充 `e2e/search.spec.ts` 加入歌詞片段搜尋測試案例（包含高亮驗證）

### 單元測試

- [ ] T051 [US3] 擴充 `src/features/search/__tests__/searchService.spec.ts` 加入歌詞片段搜尋與高亮測試

### 實作

- [ ] T052 [US3] 擴充 searchService 加入歌詞內容搜尋邏輯
- [ ] T053 [US3] 實作關鍵字高亮顯示功能（XSS 防護）
- [ ] T054 [US3] 更新 SearchResultItem 顯示高亮歌詞片段（使用 `v-html` 搭配消毒處理）

**Checkpoint**: User Story 3 完成，可獨立測試歌詞片段搜尋功能

---

## Phase 6: Polish & 橫切關注點

**Purpose**: 跨使用者故事的優化與完善

- [ ] T055 [P] 建立分頁元件於 `src/shared/components/Pagination.vue`
- [ ] T056 整合分頁功能至 SearchResultsPage（每頁 20 筆，FR-016）
- [ ] T057 [P] 實作 L1 快取（Map 物件，最近 50 筆搜尋結果）
- [ ] T058 [P] 實作 L2 快取（LocalStorage，使用 VueUse useLocalStorage）
- [ ] T059 [P] 建立 404 頁面於 `src/pages/NotFoundPage.vue`
- [ ] T060 效能優化：程式碼分割（路由級懶載入）
- [ ] T061 [P] 更新 README.md 使用說明（正體中文）
- [ ] T062 執行 `quickstart.md` 驗證所有功能（包含 Core Web Vitals 效能驗證：FCP < 1.5s、LCP < 2.5s、CLS < 0.1、搜尋回應 < 3s）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無相依性，可立即開始
- **Foundational (Phase 2)**: 相依於 Setup 完成，**阻塞**所有使用者故事
- **User Stories (Phase 3-5)**: 全部相依於 Foundational 完成
  - 可依優先順序循序執行（P1 → P2 → P3）
  - 或多人同時平行開發不同故事
- **Polish (Phase 6)**: 相依於所需的使用者故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成後可開始，無其他故事相依
- **User Story 2 (P2)**: Foundational 完成後可開始，可獨立測試
- **User Story 3 (P3)**: Foundational 完成後可開始，可獨立測試

### Within Each User Story

1. E2E 測試**必須**先寫且失敗後才能實作
2. 單元測試**必須**先寫且失敗後才能實作
3. 型別定義 → 服務 → Composables → 元件 → 頁面整合
4. 故事完成後再進入下一優先級

### Parallel Opportunities

- Phase 1: T003、T004、T005 可平行執行
- Phase 2: T009-T015、T019 可平行執行
- Phase 3 E2E: T020、T021、T022 可平行執行
- Phase 3 單元測試: T023-T028 可平行執行
- Phase 3 型別: T029、T036 可平行執行
- Phase 6: T055、T057、T058、T059、T061 可平行執行

---

## Parallel Example: User Story 1

```bash
# 同時啟動所有 E2E 測試任務：
Task: T020 "建立搜尋功能 E2E 測試於 e2e/search.spec.ts"
Task: T021 "建立歌詞詳細頁 E2E 測試於 e2e/lyrics-detail.spec.ts"
Task: T022 "建立導航功能 E2E 測試於 e2e/navigation.spec.ts"

# 同時啟動所有單元測試任務：
Task: T023 "建立 SearchBar 元件單元測試"
Task: T024 "建立 SearchResults 元件單元測試"
Task: T025 "建立 useSearch composable 單元測試"
Task: T026 "建立 searchService 單元測試"
Task: T027 "建立 LyricsDetail 元件單元測試"
Task: T028 "建立 useLyrics composable 單元測試"

# 同時啟動型別定義任務：
Task: T029 "建立搜尋相關型別定義"
Task: T036 "建立歌詞相關型別定義"
```

---

## Implementation Strategy

### MVP First（僅 User Story 1）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（**關鍵** - 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **停止並驗證**：獨立測試 User Story 1
5. 可部署/展示 MVP

### Incremental Delivery

1. Setup + Foundational → 基礎就緒
2. User Story 1 → 獨立測試 → 部署/展示（MVP！）
3. User Story 2 → 獨立測試 → 部署/展示
4. User Story 3 → 獨立測試 → 部署/展示
5. 每個故事獨立增加價值，不影響已完成的故事

### Parallel Team Strategy

多人開發時：

1. 團隊共同完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A: User Story 1（歌名搜尋）
   - 開發者 B: User Story 2（歌手搜尋）
   - 開發者 C: User Story 3（歌詞片段搜尋）
3. 各故事獨立完成後整合

---

## Notes

- [P] 任務 = 不同檔案、無相依性，可平行執行
- [Story] 標籤對應特定使用者故事，便於追蹤
- 每個使用者故事應可獨立完成與測試
- 測試必須先寫且失敗後才能實作
- 每個任務或邏輯群組完成後提交 commit
- 在任何 checkpoint 可停止並獨立驗證故事
- 避免：模糊的任務描述、同一檔案衝突、破壞故事獨立性的跨故事相依
