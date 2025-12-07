# Tasks: 歌詞搜尋網站

**Input**: Design documents from `/specs/002-lyrics-search/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 依據專案憲章 I. 測試優先原則，所有功能開發 MUST 遵循 E2E 測試 → 單元測試 → 實作 的順序。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 安裝專案相依套件：vue-router, @tanstack/vue-query, @ts-rest/core, zod, axios, @vueuse/core, tailwindcss
- [x] T002 [P] 設定 Tailwind CSS v4 於 src/style.css
- [x] T003 [P] 建立環境變數設定檔 .env.example 含 VITE_API_BASE_URL
- [x] T004 [P] 設定 TanStack Query Client 於 src/main.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 建立 API Contract 定義於 src/shared/contracts/lyrics.contract.ts
- [x] T006 [P] 建立 Axios instance 於 src/shared/services/http.ts
- [x] T007 [P] 建立 ts-rest API Client 於 src/shared/services/apiClient.ts
- [x] T008 [P] 建立 Query Key Factory 於 src/shared/services/queryKeys.ts
- [x] T009 [P] 建立共用型別定義於 src/shared/types/index.ts
- [x] T010 [P] 建立 LoadingSpinner 元件於 src/shared/components/LoadingSpinner.vue
- [x] T011 [P] 建立 ErrorMessage 元件於 src/shared/components/ErrorMessage.vue
- [x] T012 設定 Vue Router 於 src/router/index.ts（含 /search 和 /lyrics/:id 路由）

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 搜尋歌曲 (Priority: P1) 🎯 MVP

**Goal**: 使用者可透過歌名、歌手或歌詞片段搜尋歌曲，系統顯示符合條件的結果列表

**Independent Test**: 輸入關鍵字並驗證搜尋結果是否正確顯示

### E2E Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [US1] 撰寫搜尋功能 E2E 測試於 e2e/search.spec.ts
  - 測試：輸入歌曲名稱並送出搜尋，顯示包含該歌名的歌曲列表
  - 測試：輸入歌手名稱並送出搜尋，顯示該歌手的所有歌曲列表
  - 測試：輸入一段歌詞片段並送出搜尋,顯示包含該歌詞的歌曲列表
  - 測試：搜尋過程中顯示載入指示器
  - 測試：搜尋無結果時顯示提示訊息
  - 測試：搜尋關鍵字為空白時顯示提示訊息
  - 測試：網路請求失敗時顯示錯誤訊息並提供重試選項
  - 測試：搜尋關鍵字超過 200 字元時自動截斷並提示使用者
  - 測試：輸入特殊字元（如 @#$%）時正確處理並回傳結果

### Unit Tests for User Story 1 ⚠️

- [x] T014 [P] [US1] 撰寫 useSearch composable 單元測試於 src/features/search/__tests__/useSearch.spec.ts

### Implementation for User Story 1

- [x] T015 [P] [US1] 建立搜尋功能型別定義於 src/features/search/types/index.ts
- [ ] T016 [US1] 實作 useSearch composable 於 src/features/search/composables/useSearch.ts
  - 使用 TanStack Query 進行 API 請求與快取
  - 使用 VueUse useDebounceFn 實作搜尋防抖（300ms）
  - 處理載入狀態與錯誤狀態
- [x] T017 [P] [US1] 建立 SearchInput 元件於 src/features/search/components/SearchInput.vue
  - 搜尋輸入框，支援 Enter 送出
  - 使用 Tailwind CSS 樣式
- [x] T018 [P] [US1] 建立 SearchResults 元件於 src/features/search/components/SearchResults.vue
  - 顯示搜尋結果列表（歌名、歌手）
  - 支援點擊導向詳情頁
  - 處理空結果與載入狀態
- [x] T019 [US1] 建立 SearchPage 頁面於 src/features/search/pages/SearchPage.vue
  - 整合 SearchInput 與 SearchResults
  - 使用 URL query parameter 保存搜尋狀態
- [x] T020 [US1] 建立搜尋功能入口於 src/features/search/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 檢視歌詞詳情 (Priority: P2)

**Goal**: 使用者點擊搜尋結果後導向詳情頁，顯示完整歌詞、歌名、歌手

**Independent Test**: 直接存取歌詞詳情頁面 URL，驗證頁面正確顯示

### E2E Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [US2] 撰寫歌詞詳情 E2E 測試於 e2e/lyrics.spec.ts
  - 測試：從搜尋結果點擊歌曲，導向詳情頁面
  - 測試：詳情頁面顯示完整歌詞內容
  - 測試：詳情頁面顯示歌曲名稱與歌手名稱
  - 測試：頁面載入中顯示載入指示器
  - 測試：歌曲 ID 不存在時顯示錯誤頁面

### Unit Tests for User Story 2 ⚠️

- [x] T022 [P] [US2] 撰寫 useLyrics composable 單元測試於 src/features/lyrics/__tests__/useLyrics.spec.ts

### Implementation for User Story 2

- [x] T023 [P] [US2] 建立歌詞功能型別定義於 src/features/lyrics/types/index.ts
- [ ] T024 [US2] 實作 useLyrics composable 於 src/features/lyrics/composables/useLyrics.ts
  - 使用 TanStack Query 進行 API 請求與快取
  - staleTime 設定為 30 分鐘
  - 處理載入狀態與錯誤狀態
- [x] T025 [P] [US2] 建立 SongHeader 元件於 src/features/lyrics/components/SongHeader.vue
  - 顯示歌曲名稱與歌手名稱
  - 使用 Tailwind CSS 樣式
- [x] T026 [P] [US2] 建立 LyricsContent 元件於 src/features/lyrics/components/LyricsContent.vue
  - 顯示完整歌詞內容
  - 使用適當的排版樣式
- [x] T027 [US2] 建立 LyricsPage 頁面於 src/features/lyrics/pages/LyricsPage.vue
  - 整合 SongHeader 與 LyricsContent
  - 處理載入與錯誤狀態
- [x] T028 [US2] 建立歌詞功能入口於 src/features/lyrics/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 從詳情頁返回搜尋 (Priority: P3)

**Goal**: 使用者可從詳情頁返回搜尋結果頁，並保留先前的搜尋狀態

**Independent Test**: 從詳情頁點擊返回，驗證回到搜尋結果頁並保留搜尋狀態

### E2E Tests for User Story 3 ⚠️

- [x] T029 [US3] 擴充 e2e/lyrics.spec.ts 增加返回功能測試
  - 測試：點擊返回按鈕返回搜尋結果頁
  - 測試：返回後保留先前的搜尋結果

### Implementation for User Story 3

- [x] T030 [US3] 在 LyricsPage 新增返回按鈕功能於 src/features/lyrics/pages/LyricsPage.vue
  - 使用 router.back() 或導向 /search?q=keyword
  - 確保搜尋狀態透過 URL query parameter 保留
- [ ] T031 [US3] 在 SearchPage 處理從詳情頁返回的情境於 src/features/search/pages/SearchPage.vue
  - 從 URL query parameter 讀取搜尋關鍵字
  - TanStack Query 快取自動保留搜尋結果

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T032 [P] 更新 App.vue 設定全域樣式與路由容器
- [x] T033 [P] 建立 404 NotFound 頁面於 src/pages/NotFoundPage.vue
- [ ] T034 響應式設計調整：確保所有元件在桌面與行動裝置正常顯示
  - 驗收標準：320px（行動）、768px（平板）、1920px（桌面）三個斷點測試
  - 確認 SearchInput、SearchResults、LyricsPage 在所有斷點正常排版
  - 使用 Tailwind 響應式前綴（sm:、md:、lg:）調整佈局
- [ ] T035 [P] 更新 README.md 說明專案啟動方式
- [ ] T036 執行 quickstart.md 驗證清單確認所有功能正常運作

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Depends on US1 and US2 completion - Requires navigation between pages

### Within Each User Story

- E2E tests MUST be written and FAIL before implementation
- Unit tests MUST be written and FAIL before implementation
- Types before composables
- Composables before components
- Components before pages
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US2 can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1: Write E2E test (MUST fail first)
Task: T013 撰寫搜尋功能 E2E 測試於 e2e/search.spec.ts

# Step 2: Write unit test (MUST fail first)
Task: T014 撰寫 useSearch composable 單元測試

# Step 3: Launch parallel component tasks:
Task: T015 建立搜尋功能型別定義
Task: T017 建立 SearchInput 元件
Task: T018 建立 SearchResults 元件

# Step 4: Sequential implementation:
Task: T016 實作 useSearch composable
Task: T019 建立 SearchPage 頁面
Task: T020 建立搜尋功能入口
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - 搜尋歌曲
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1（搜尋歌曲）→ Test independently → Deploy/Demo (MVP!)
3. Add User Story 2（檢視歌詞詳情）→ Test independently → Deploy/Demo
4. Add User Story 3（返回搜尋）→ Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
