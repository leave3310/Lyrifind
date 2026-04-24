# Tasks: 歌曲詳細頁與歌詞高亮顯示

**Feature**: 005-song-detail-highlight  
**Input**: 設計文件從 `/specs/005-song-detail-highlight/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本功能採用測試優先開發（Test-First），E2E 測試和單元測試為必要項目。

**Organization**: 任務按使用者故事組織，確保每個故事可獨立實作和測試。

---

## 任務格式：`[ID] [P?] [Story?] 描述與檔案路徑`

- **[P]**: 可並行執行（不同檔案、無相依性）
- **[Story]**: 歸屬的使用者故事（US1, US2, US3）
- 所有描述皆包含完整檔案路徑

---

## Phase 1: Setup（專案初始化）

**目的**：建立專案結構與基礎設定

- [X] T001 建立歌曲詳細頁功能目錄結構 `src/features/song-detail/`
- [X] T002 [P] 建立共用型別目錄 `src/shared/types/common.types.ts`
- [X] T003 [P] 建立 E2E 測試檔案 `e2e/song-detail.spec.ts`
- [X] T004 [P] 驗證環境變數 `VITE_APPS_SCRIPT_URL` 已設定（在 `.env.local`）
- [X] T005 測試 Google Apps Script getSong API 連線正常

**Checkpoint**: 目錄結構就緒，環境變數已設定，API 連線正常

---

## Phase 2: Foundational（基礎建設）

**目的**：建立所有使用者故事共用的核心基礎設施

**⚠️ CRITICAL**: 此階段必須完成後才能開始任何使用者故事的實作

- [ ] T006 將 `Song` 型別從 `src/features/search/types/search.types.ts` 遷移到 `src/shared/types/common.types.ts`
- [ ] T007 [P] 建立 SongService 類別 `src/features/song-detail/services/song.service.ts`（整合 Google Apps Script API）
- [ ] T008 [P] 建立本地型別定義 `src/features/song-detail/types/song-detail.types.ts`（HighlightParams, SongDetailView, SongDetailError）
- [ ] T009 [P] 建立工具函式 `escapeRegex` 在 `src/features/song-detail/utils/escape-regex.ts`
- [ ] T010 建立工具函式 `highlightText` 在 `src/features/song-detail/utils/highlight-text.ts`（依賴 T009 完成後開始）
- [ ] T011 [P] 新增 Vue Router 路由定義 `/song/:id` 在 `src/router/index.ts`

**Checkpoint**: 基礎建設完成 - 使用者故事實作現在可以並行開始

---

## Phase 3: User Story 1 - 從搜尋結果進入歌曲詳細頁 (Priority: P1) 🎯 MVP

**目標**：使用者能從搜尋結果點擊歌曲進入詳細頁面，查看完整歌曲資訊和歌詞

**Independent Test**：搜尋任何關鍵字 → 點擊結果 → 確認顯示完整歌曲資訊（歌名、歌手、完整歌詞）→ 確認可返回搜尋結果

### E2E 測試 User Story 1 ✅

> **NOTE: 先寫測試，確認失敗後再實作**

- [ ] T012 [P] [US1] E2E 測試：導航到詳細頁並顯示歌曲資訊 `e2e/song-detail.spec.ts`
- [ ] T013 [P] [US1] E2E 測試：返回搜尋結果並保持狀態 `e2e/song-detail.spec.ts`
- [ ] T014 [P] [US1] E2E 測試：處理無效歌曲 ID（404 錯誤）`e2e/song-detail.spec.ts`

### 單元測試 User Story 1 ✅

- [ ] T015 [P] [US1] 單元測試：SongService.getSongById() `src/features/song-detail/__tests__/song.service.spec.ts`
- [ ] T016 [P] [US1] 單元測試：useSongDetail composable `src/features/song-detail/__tests__/useSongDetail.spec.ts`

### 實作 User Story 1

- [ ] T017 [P] [US1] 實作 `useSongDetail` composable `src/features/song-detail/composables/useSongDetail.ts`（依賴 T007, T008）
- [ ] T018 [P] [US1] 建立 SongHeader 元件 `src/features/song-detail/components/SongHeader.vue`
- [ ] T019 [P] [US1] 建立 LyricsContent 元件 `src/features/song-detail/components/LyricsContent.vue`（基礎版本，無高亮）
- [ ] T020 [P] [US1] 建立 BackButton 元件 `src/features/song-detail/components/BackButton.vue`
- [ ] T021 [US1] 整合所有元件到 SongDetailPage `src/features/song-detail/SongDetailPage.vue`（依賴 T017-T020）
- [ ] T022 [US1] 更新搜尋結果頁的點擊事件，導航到詳細頁 `src/features/search/components/SearchResultItem.vue`
- [ ] T023 [US1] 實作 404 錯誤頁面（歌曲不存在時導向標準 404 錯誤視圖）`src/features/song-detail/SongDetailPage.vue`
- [ ] T023b [US1] 建立載入狀態元件 `src/features/song-detail/components/LoadingState.vue`（Constitution III：載入中 MUST 提供載入指示器）
- [ ] T024 [US1] 確認所有 E2E 和單元測試通過 ✅

**Checkpoint**: User Story 1 完全功能性且可獨立測試

---

## Phase 4: User Story 2 - 歌詞匹配片段高亮顯示 (Priority: P2)

**目標**：當使用者透過歌詞關鍵字搜尋進入詳細頁時，系統在歌詞中高亮顯示所有匹配片段（黃色背景 + 粗體）

**Independent Test**：搜尋歌詞關鍵字（如「愛」）→ 點擊結果 → 確認關鍵字在歌詞中被黃色背景標記並加粗

### E2E 測試 User Story 2 ✅

- [ ] T025 [P] [US2] E2E 測試：歌詞關鍵字搜尋後進入詳細頁顯示高亮 `e2e/song-detail.spec.ts`
- [ ] T026 [P] [US2] E2E 測試：非歌詞搜尋進入詳細頁無高亮效果 `e2e/song-detail.spec.ts`
- [ ] T027 [P] [US2] E2E 測試：直接透過 URL 訪問帶 highlight 參數顯示高亮 `e2e/song-detail.spec.ts`
- [ ] T027b [P] [US2] E2E 測試：URL highlight 參數格式錯誤時的容錯處理（如 `?highlight=` 空值、多重參數）`e2e/song-detail.spec.ts`
- [ ] T028 [P] [US2] E2E 測試：多處匹配時所有位置都高亮 `e2e/song-detail.spec.ts`

### 單元測試 User Story 2 ✅

- [ ] T029 [P] [US2] 單元測試：highlightText() 基本功能 `src/features/song-detail/__tests__/highlight-text.spec.ts`
- [ ] T030 [P] [US2] 單元測試：highlightText() 處理特殊字元 `src/features/song-detail/__tests__/highlight-text.spec.ts`
- [ ] T031 [P] [US2] 單元測試：escapeRegex() 函式 `src/features/song-detail/__tests__/escape-regex.spec.ts`
- [ ] T032 [P] [US2] 單元測試：useLyricsHighlight composable `src/features/song-detail/__tests__/useLyricsHighlight.spec.ts`

### 實作 User Story 2

- [ ] T033 [P] [US2] 實作 `useLyricsHighlight` composable `src/features/song-detail/composables/useLyricsHighlight.ts`（依賴 T010）
- [ ] T034 [US2] 更新 LyricsContent 元件支援高亮顯示 `src/features/song-detail/components/LyricsContent.vue`（依賴 T033）
- [ ] T035 [US2] 更新 SongDetailPage 整合高亮邏輯 `src/features/song-detail/SongDetailPage.vue`（依賴 T033, T034）
- [ ] T036 [US2] 新增 Tailwind CSS 高亮樣式類別 `bg-yellow-200 font-bold`（如果尚未定義）
- [ ] T037 [US2] 更新搜尋結果頁的導航，傳遞 highlight query 參數 `src/features/search/components/SearchResultItem.vue`
- [ ] T038 [US2] 確認所有 E2E 和單元測試通過 ✅

**Checkpoint**: User Stories 1 和 2 都可獨立運作

---

## Phase 5: User Story 3 - 自動捲動到第一個匹配位置 (Priority: P3)

**目標**：當使用者透過歌詞關鍵字搜尋進入詳細頁時，頁面自動捲動到第一個匹配的歌詞位置

**Independent Test**：搜尋歌曲後半部的歌詞片段 → 點擊結果 → 確認頁面自動捲動到該片段（顯示在視窗中央），而非停留在頂部

### E2E 測試 User Story 3 ✅

- [ ] T039 [P] [US3] E2E 測試：有高亮關鍵字時自動捲動到第一個匹配位置 `e2e/song-detail.spec.ts`
- [ ] T040 [P] [US3] E2E 測試：匹配位置在歌詞中間或底部時正確捲動 `e2e/song-detail.spec.ts`
- [ ] T041 [P] [US3] E2E 測試：無高亮關鍵字時頁面顯示在頂部 `e2e/song-detail.spec.ts`
- [ ] T042 [P] [US3] E2E 測試：捲動後匹配位置在可視區域內 `e2e/song-detail.spec.ts`

### 單元測試 User Story 3 ✅

- [ ] T043 [P] [US3] 單元測試：useAutoScroll composable `src/features/song-detail/__tests__/useAutoScroll.spec.ts`
- [ ] T044 [P] [US3] 單元測試：找不到 mark 元素時不執行捲動 `src/features/song-detail/__tests__/useAutoScroll.spec.ts`

### 實作 User Story 3

- [ ] T045 [US3] 實作 `useAutoScroll` composable `src/features/song-detail/composables/useAutoScroll.ts`
- [ ] T046 [US3] 整合 useAutoScroll 到 SongDetailPage `src/features/song-detail/SongDetailPage.vue`（依賴 T045）
- [ ] T047 [US3] 確認所有 E2E 和單元測試通過 ✅

**Checkpoint**: 所有使用者故事現在都可獨立運作

---

## Phase 6: Polish & Cross-Cutting Concerns（最終優化）

**目的**：影響多個使用者故事的改進

- [ ] T048 [P] UI 優化：完善 LoadingState 骨架屏樣式 `src/features/song-detail/components/LoadingState.vue`（基礎功能已在 T023b 實作）
- [ ] T049 [P] 優化錯誤訊息顯示 UI `src/features/song-detail/components/ErrorState.vue`
- [ ] T050 [P] 效能測試：100+ 關鍵字匹配的高亮顯示（確認 < 3 秒載入）
- [ ] T050b [P] 效能驗證：以 Lighthouse 或 Web Vitals 確認 CLS < 0.1、FID < 100ms、JS Bundle < 200KB（Constitution IV）
- [ ] T051 [P] 無障礙優化（ARIA labels, keyboard navigation）
- [ ] T052 [P] 響應式設計調整（手機、平板、桌面）
- [ ] T053 程式碼重構與清理（移除 console.log, 統一命名規則）
- [ ] T054 更新專案 README.md 說明新功能
- [ ] T055 執行完整的 E2E 測試套件確認所有功能正常
- [ ] T056 執行 quickstart.md 驗證流程

---

## 依賴關係與執行順序

### 階段依賴

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成 - 阻擋所有使用者故事
- **User Stories (Phase 3-5)**: 全部依賴 Foundational 階段完成
  - 使用者故事可並行進行（如果有足夠人力）
  - 或依優先順序循序執行（P1 → P2 → P3）
- **Polish (Phase 6)**: 依賴所有期望的使用者故事完成

### 使用者故事依賴

- **User Story 1 (P1)**: 可在 Foundational 完成後開始 - 對其他故事無依賴
- **User Story 2 (P2)**: 可在 Foundational 完成後開始 - 建立在 US1 的 UI 基礎上（LyricsContent 元件）
- **User Story 3 (P3)**: 可在 Foundational 完成後開始 - 需要 US2 的高亮功能已實作

### 每個使用者故事內部

- E2E 測試必須先寫並確認失敗 🔴
- 單元測試必須先寫並確認失敗 🔴
- 工具函式先於 composables
- Composables 先於元件
- 元件先於頁面整合
- 核心實作完成後再進行整合
- 故事完成後才移到下一優先級

### 並行機會

#### Setup 階段
```bash
# 可同時執行：
T002 建立共用型別目錄
T003 建立 E2E 測試檔案
T004 驗證環境變數
```

#### Foundational 階段
```bash
# 可同時執行：
T007 建立 SongService
T008 建立型別定義
T009 建立 escapeRegex
```

#### User Story 1 - E2E 測試
```bash
# 可同時執行：
T012 E2E 測試：導航到詳細頁
T013 E2E 測試：返回搜尋結果
T014 E2E 測試：404 錯誤處理
```

#### User Story 1 - 單元測試
```bash
# 可同時執行：
T015 單元測試：SongService
T016 單元測試：useSongDetail
```

#### User Story 1 - 元件實作
```bash
# 可同時執行：
T018 SongHeader 元件
T019 LyricsContent 元件
T020 BackButton 元件
```

#### User Story 2 - E2E 測試
```bash
# 可同時執行：
T025 E2E 測試：歌詞關鍵字高亮
T026 E2E 測試：非歌詞搜尋無高亮
T027 E2E 測試：URL 參數高亮
T028 E2E 測試：多處匹配高亮
```

#### User Story 2 - 單元測試
```bash
# 可同時執行：
T029 單元測試：highlightText 基本功能
T030 單元測試：highlightText 特殊字元
T031 單元測試：escapeRegex
T032 單元測試：useLyricsHighlight
```

#### User Story 3 - E2E 測試
```bash
# 可同時執行：
T039 E2E 測試：自動捲動到匹配位置
T040 E2E 測試：中間或底部正確捲動
T041 E2E 測試：無高亮時顯示頂部
T042 E2E 測試：匹配位置在可視區域
```

#### User Story 3 - 單元測試
```bash
# 可同時執行：
T043 單元測試：useAutoScroll
T044 單元測試：找不到 mark 元素處理
```

#### Polish 階段
```bash
# 可同時執行：
T048 載入狀態元件
T049 錯誤訊息元件
T050 效能測試
T051 無障礙優化
T052 響應式設計
```

---

## 並行範例：User Story 1

```bash
# 階段 1: 同時啟動所有 E2E 測試（先寫測試）
Task T012: E2E 測試：導航到詳細頁並顯示歌曲資訊 e2e/song-detail.spec.ts
Task T013: E2E 測試：返回搜尋結果並保持狀態 e2e/song-detail.spec.ts
Task T014: E2E 測試：處理無效歌曲 ID（404 錯誤）e2e/song-detail.spec.ts

# 階段 2: 同時啟動所有單元測試（先寫測試）
Task T015: 單元測試：SongService.getSongById()
Task T016: 單元測試：useSongDetail composable

# 確認所有測試失敗 🔴

# 階段 3: 並行實作元件（在不同檔案）
Task T018: SongHeader 元件 src/features/song-detail/components/SongHeader.vue
Task T019: LyricsContent 元件 src/features/song-detail/components/LyricsContent.vue
Task T020: BackButton 元件 src/features/song-detail/components/BackButton.vue

# 階段 4: 整合到主頁面（順序執行）
Task T017: useSongDetail composable
Task T021: SongDetailPage 整合
Task T022: 更新搜尋結果頁導航
Task T023: 404 錯誤處理

# 確認所有測試通過 ✅
Task T024: 執行所有測試
```

---

## 實作策略

### MVP 優先（僅 User Story 1）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（關鍵 - 阻擋所有故事）
3. 完成 Phase 3: User Story 1
4. **停止並驗證**：獨立測試 User Story 1
5. 如果就緒則部署/展示

### 漸進式交付

1. 完成 Setup + Foundational → 基礎就緒
2. 新增 User Story 1 → 獨立測試 → 部署/展示（MVP！）
3. 新增 User Story 2 → 獨立測試 → 部署/展示
4. 新增 User Story 3 → 獨立測試 → 部署/展示
5. 每個故事都在不破壞先前故事的情況下增加價值

### 並行團隊策略

有多位開發者時：

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A: User Story 1
   - 開發者 B: User Story 2（需等待 T019 LyricsContent 基礎版本）
   - 開發者 C: 協助測試或文件
3. 故事獨立完成並整合

---

## 注意事項

- [P] 任務 = 不同檔案、無依賴關係
- [Story] 標籤將任務映射到特定使用者故事以便追蹤
- 每個使用者故事應該可獨立完成和測試
- 實作前驗證測試失敗 🔴
- 每個任務或邏輯群組後提交
- 在任何檢查點停下來獨立驗證故事
- 避免：模糊任務、相同檔案衝突、破壞獨立性的跨故事依賴

---

## 任務統計

- **總任務數**: 56
- **User Story 1 任務數**: 13（E2E: 3, 單元測試: 2, 實作: 8）
- **User Story 2 任務數**: 14（E2E: 4, 單元測試: 4, 實作: 6）
- **User Story 3 任務數**: 9（E2E: 4, 單元測試: 2, 實作: 3）
- **Setup 任務數**: 5
- **Foundational 任務數**: 6
- **Polish 任務數**: 9
- **並行機會**: 35 個任務標記為 [P]（可並行執行）

---

## 建議 MVP 範圍

**最小可行產品**應包含：
- Phase 1: Setup（全部）
- Phase 2: Foundational（全部）
- Phase 3: User Story 1（僅基本導航和顯示歌曲詳細資訊）

這提供了核心價值：使用者可以從搜尋結果進入歌曲詳細頁面查看完整歌詞。

高亮顯示（US2）和自動捲動（US3）是增強功能，可在 MVP 驗證後再逐步加入。
