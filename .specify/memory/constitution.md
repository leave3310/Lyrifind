<!--
================================================================================
同步影響報告 (Sync Impact Report)
================================================================================
版本變更: 1.4.0 → 1.5.0 (新增快取策略與 API Contract 規範)
修改的原則:
  - II. 程式碼品質：新增「程式碼註解規範」子章節（維持）
新增區段:
  - XI. 快取策略規範 (TanStack Query)
  - XII. API Contract 規範 (ts-rest + Zod)
  - 技術堆疊規範：新增「資料快取」與「API Contract」區段
移除區段: 無
需要更新的範本:
  - `.specify/templates/plan-template.md` ✅ 已審查（無需更新）
  - `.specify/templates/spec-template.md` ✅ 符合規範（無需更新）
  - `.specify/templates/tasks-template.md` ✅ 符合規範（無需更新）
待辦事項: 無
================================================================================
-->

# LyriFind 專案憲章

## 核心原則

### I. 測試優先 (Test-First) — 不可協商

**規範**：
- 所有功能開發 MUST 遵循 E2E 測試 → 單元測試 → 實作 的順序
- 在撰寫任何功能程式碼之前，MUST 先完成預期的 E2E 測試（使用 Playwright）
- 在撰寫功能程式碼之前，MUST 先撰寫預期的單元測試（使用 Vitest）
- 嚴格執行 Red-Green-Refactor 循環：測試撰寫 → 測試失敗 → 實作 → 測試通過 → 重構
- 每個 Pull Request MUST 包含對應的測試程式碼

**理由**：測試優先確保程式碼的可測試性設計，減少回歸錯誤，並作為功能的活文件。

### II. 程式碼品質

**規範**：
- 所有程式碼 MUST 使用 TypeScript 撰寫，啟用嚴格模式 (`strict: true`)
- MUST 使用 ES6+ 語法特性（箭頭函式、解構、模組化等）
- 所有程式碼 MUST 通過 OxLint 檢查（零錯誤、零警告）
- 變數和函式命名 MUST 使用英文，遵循 camelCase 命名規範
- 元件命名 MUST 使用 PascalCase
- 所有程式碼註解 MUST 使用正體中文撰寫
- 單一函式 SHOULD NOT 超過 50 行；超過 MUST 提供重構理由
- 圈複雜度 (Cyclomatic Complexity) SHOULD NOT 超過 10

**程式碼註解規範**：
- 註解 SHOULD 解釋「為什麼」(Why) 而非「是什麼」(What)
- 以下情況 MUST NOT 撰寫註解（視為冗餘註解）：
  - 型別定義標籤（如 `/** Props 定義 */`、`/** Emits 定義 */`）：`interface Props` 本身已表達用途
  - 自解釋函式的 JSDoc（如 `/** 處理返回 */` 配 `handleBack()`）：函式名稱已清楚表達功能
  - 與 `v-if`/`v-else` 條件重複的 HTML 註解（如 `<!-- 載入中狀態 -->` 配 `v-if="loading"`）
  - 與語意化標籤重複的註解（如 `<!-- 歌曲資訊 -->` 配 `<header>`）
  - 與元件名稱重複的註解（如 `<!-- 歌詞內容 -->` 配 `<LyricsContent>`）
  - 與按鈕文字重複的註解（如 `<!-- 返回按鈕 -->` 配按鈕文字「返回搜尋結果」）
- 以下情況 SHOULD 撰寫註解：
  - 複雜的業務邏輯或演算法
  - 非直觀的技術決策及其理由
  - 公開 API 的 JSDoc（含參數說明、回傳值、範例）
  - 效能考量或權衡取捨
  - TODO/FIXME 標記（需包含原因和預期處理時間）

**理由**：一致的程式碼品質標準降低維護成本，提高團隊協作效率。

### III. 使用者體驗一致性

**規範**：
- 使用者介面文字 MUST 使用正體中文
- 錯誤訊息 MUST 使用正體中文，並提供清晰的問題描述與建議操作
- UI 元件 MUST 遵循一致的設計語言和互動模式
- 所有互動元素 MUST 提供適當的視覺回饋（hover、active、disabled 狀態）
- 表單驗證 MUST 即時顯示錯誤提示，並在使用者修正後即時更新
- 載入狀態 MUST 提供適當的載入指示器
- 響應式設計 MUST 支援桌面和行動裝置

**理由**：一致的使用者體驗提升使用者滿意度，減少學習成本。

### IV. 效能要求

**規範**：
- 首次內容繪製 (FCP) MUST < 1.5 秒
- 最大內容繪製 (LCP) MUST < 2.5 秒
- 累積版面配置偏移 (CLS) MUST < 0.1
- 首次輸入延遲 (FID) MUST < 100ms
- 打包後的 JavaScript 主套件 SHOULD < 200KB (gzip 壓縮後)
- 圖片 MUST 使用適當的格式（WebP 優先）並實作懶載入
- 元件 SHOULD 使用適當的記憶化策略（computed、memo）避免不必要的重新渲染

**理由**：良好的效能直接影響使用者體驗和搜尋引擎排名。

### V. 國際化與語系規範

**規範**：
- 所有專案文件（README、CHANGELOG、文件）MUST 使用正體中文撰寫
- API 文件和技術規格 MUST 使用正體中文說明
- 程式碼變數、函式、類別命名 MUST 使用英文
- 程式碼註解 MUST 使用正體中文
- 錯誤訊息和使用者介面文字 MUST 使用正體中文

**理由**：統一的語系規範確保文件的可讀性和團隊溝通的效率。

### VI. Feature-Based 架構

**規範**：
- 資料夾結構 MUST 採用 Feature-Based 組織方式
- 每個功能模組 MUST 包含自身的元件、服務、型別定義、測試
- 共用程式碼 MUST 放置於 `shared/` 或 `common/` 目錄
- 資料夾結構範例：
  ```
  src/
  ├── features/
  │   ├── search/           # 搜尋功能
  │   │   ├── components/   # 功能專屬元件
  │   │   ├── composables/  # 功能專屬組合式函式
  │   │   ├── services/     # 功能專屬服務
  │   │   ├── types/        # 功能專屬型別定義
  │   │   ├── __tests__/    # 功能單元測試
  │   │   └── index.ts      # 功能入口
  │   └── lyrics/           # 歌詞功能
  │       └── ...
  ├── shared/               # 共用程式碼
  │   ├── components/       # 共用元件
  │   ├── composables/      # 共用組合式函式
  │   ├── utils/            # 工具函式
  │   └── types/            # 共用型別定義
  └── ...
  ```
- 功能模組之間的相依 SHOULD 透過明確的介面進行，避免直接耦合

**理由**：Feature-Based 架構提高程式碼的模組化程度，便於功能的獨立開發、測試和維護。

### VII. Git Commit 規範 (Conventional Commits v1.0.0)

**規範**：
- 所有 Git commit 訊息 MUST 遵循 [Conventional Commits v1.0.0](https://www.conventionalcommits.org/zh-hant/v1.0.0/) 規範
- Commit 訊息格式 MUST 為：`<type>[optional scope]: <description>`
- Commit 訊息的 description MUST 使用正體中文撰寫
- 允許的 type 類型：
  - `feat`：新增功能
  - `fix`：修復錯誤
  - `docs`：文件變更
  - `style`：程式碼格式調整（不影響程式邏輯）
  - `refactor`：重構程式碼（不新增功能也不修復錯誤）
  - `perf`：效能改善
  - `test`：新增或修改測試
  - `build`：建構系統或外部相依套件變更
  - `ci`：CI 設定變更
  - `chore`：其他不影響原始碼的變更
  - `revert`：還原先前的 commit
- 包含破壞性變更 (BREAKING CHANGE) MUST 在 footer 中說明，或在 type 後加上 `!`
- Scope（可選）SHOULD 使用功能模組名稱（如 `feat(search):`、`fix(lyrics):`）
- 每個 commit SHOULD 只包含單一邏輯變更

**範例**：
```
feat(search): 新增歌詞搜尋功能

fix(lyrics): 修正歌詞同步顯示時間偏移問題

docs: 更新 README 安裝說明

feat!: 重新設計 API 回應格式

BREAKING CHANGE: API 回應結構已變更，需更新前端對應程式碼
```

**理由**：Conventional Commits 提供一致且機器可讀的 commit 歷史，便於自動化產生 CHANGELOG、語意化版本遞增和團隊協作。

### VIII. HTTP 請求規範 (Axios)

**規範**：
- 所有 HTTP 請求 MUST 使用 Axios 函式庫
- MUST 建立統一的 Axios instance，所有請求透過此 instance 發送
- Axios instance MUST 設定於 `src/shared/services/http.ts`
- 請求攔截器 MUST 統一處理：
  - 請求標頭設定（Content-Type、Authorization 等）
  - 請求載入狀態管理
- 回應攔截器 MUST 統一處理：
  - 錯誤回應轉換（轉為 `AppError` 型別）
  - HTTP 狀態碼對應的錯誤訊息（正體中文）
  - 401/403 未授權處理
  - 網路錯誤處理
- 請求逾時 MUST 設定合理的 timeout（建議 10 秒）
- API Base URL MUST 透過環境變數設定（`VITE_API_BASE_URL`）

**Axios Instance 結構**：
```typescript
// src/shared/services/http.ts
import axios from 'axios'
import type { AxiosInstance } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
http.interceptors.request.use(/* ... */)

// 回應攔截器
http.interceptors.response.use(/* ... */)

export { http }
```

**理由**：統一的 HTTP 請求管理確保一致的錯誤處理、載入狀態和請求設定，降低重複程式碼。

### IX. 樣式規範 (Tailwind CSS v4)

**規範**：
- 專案樣式 MUST 使用 Tailwind CSS v4
- MUST 優先使用 Tailwind 的 utility classes，避免撰寫自訂 CSS
- 自訂樣式 SHOULD 使用 Tailwind 的 `@apply` 指令或 CSS 變數
- 響應式設計 MUST 使用 Tailwind 的斷點前綴（`sm:`、`md:`、`lg:`、`xl:`、`2xl:`）
- 深色模式 SHOULD 使用 Tailwind 的 `dark:` 前綴（若有需求）
- 元件樣式 SHOULD 使用 Tailwind 的 `@layer components` 定義可重用樣式
- 顏色和間距 MUST 使用 Tailwind 的設計系統，避免使用任意值（arbitrary values）

**Tailwind CSS v4 設定**：
```css
/* src/style.css */
@import "tailwindcss";

@theme {
  /* 自訂主題變數 */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
}
```

**最佳實踐**：
- 使用語意化的類別組合（如 `btn-primary`、`card`）
- 避免過長的 class 字串，適時抽取為元件
- 使用 `clsx` 或 `tailwind-merge` 處理條件式樣式

**理由**：Tailwind CSS v4 提供 utility-first 的樣式方案，加速開發效率，並確保設計一致性。

### X. 組合式函式規範 (VueUse)

**規範**：
- 專案 MUST 使用 VueUse 作為組合式函式（composables）的工具函式庫
- 常用的瀏覽器 API 封裝 SHOULD 優先使用 VueUse 提供的實作
- 推薦使用的 VueUse 函式：
  - `useDebounceFn` / `useThrottleFn`：防抖/節流
  - `useLocalStorage` / `useSessionStorage`：本地儲存
  - `useFetch`：資料請求（配合 Axios 使用時可作為替代方案）
  - `useEventListener`：事件監聽
  - `useMediaQuery`：響應式斷點
  - `useClipboard`：剪貼簿操作
  - `useIntersectionObserver`：懶載入
  - `useTitle`：動態標題
- 自訂 composables SHOULD 遵循 VueUse 的命名慣例（`use` 前綴）
- VueUse 函式 MUST 按需引入，避免引入整個套件

**引入方式**：
```typescript
// ✅ 正確：按需引入
import { useDebounceFn, useLocalStorage } from '@vueuse/core'

// ❌ 錯誤：引入整個套件
import * as VueUse from '@vueuse/core'
```

**理由**：VueUse 提供經過測試的高品質組合式函式，減少重複造輪子，提升開發效率。

### XI. 快取策略規範 (TanStack Query)

**規範**：
- 所有 API 資料請求 MUST 使用 TanStack Query（@tanstack/vue-query）進行快取管理
- Query Key MUST 使用結構化陣列格式，確保快取的可預測性
- MUST 設定適當的 `staleTime` 和 `gcTime`（舊稱 `cacheTime`）
- 變更操作（POST、PUT、DELETE）MUST 使用 `useMutation` 並搭配 `invalidateQueries`
- Query Client MUST 於應用程式根層級設定（`src/main.ts`）
- SHOULD 使用 Query Key Factory 模式集中管理 query keys

**Query Key 設計規範**：
```typescript
// src/shared/services/queryKeys.ts
export const queryKeys = {
  lyrics: {
    all: ['lyrics'] as const,
    lists: () => [...queryKeys.lyrics.all, 'list'] as const,
    list: (filters: LyricsFilters) => [...queryKeys.lyrics.lists(), filters] as const,
    details: () => [...queryKeys.lyrics.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.lyrics.details(), id] as const,
  },
  search: {
    all: ['search'] as const,
    results: (query: string) => [...queryKeys.search.all, query] as const,
  },
}
```

**快取策略建議**：
- 搜尋結果：`staleTime: 5 * 60 * 1000`（5 分鐘）
- 歌詞詳情：`staleTime: 30 * 60 * 1000`（30 分鐘）
- 使用者偏好：`staleTime: Infinity`（手動 invalidate）
- 頻繁變動資料：`staleTime: 0`（每次重新取得）

**使用範例**：
```typescript
// 查詢
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.lyrics.detail(lyricsId),
  queryFn: () => lyricsApi.getById(lyricsId),
  staleTime: 30 * 60 * 1000,
})

// 變更
const mutation = useMutation({
  mutationFn: lyricsApi.update,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lyrics.all })
  },
})
```

**理由**：TanStack Query 提供強大的伺服器狀態管理，自動處理快取、重試、背景更新，減少重複請求並提升使用者體驗。

### XII. API Contract 規範 (ts-rest + Zod)

**規範**：
- 所有 API 端點 MUST 使用 ts-rest 定義 contract
- 請求與回應的資料結構 MUST 使用 Zod schema 驗證
- Contract 定義 MUST 放置於 `src/shared/contracts/` 目錄
- 每個功能模組 SHOULD 有獨立的 contract 檔案
- API Client MUST 透過 ts-rest 的 `initClient` 產生，確保型別安全
- Zod Schema MUST 與 TypeScript 型別保持同步（使用 `z.infer<typeof schema>`）

**Contract 結構**：
```typescript
// src/shared/contracts/lyrics.contract.ts
import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

// Zod Schemas
export const LyricsSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
})

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
})

// Contract 定義
export const lyricsContract = c.router({
  search: {
    method: 'GET',
    path: '/api/lyrics/search',
    query: SearchQuerySchema,
    responses: {
      200: z.object({
        data: z.array(LyricsSchema),
        total: z.number(),
      }),
      400: z.object({ message: z.string() }),
    },
  },
  getById: {
    method: 'GET',
    path: '/api/lyrics/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: LyricsSchema,
      404: z.object({ message: z.string() }),
    },
  },
})

// 匯出推斷型別
export type Lyrics = z.infer<typeof LyricsSchema>
export type SearchQuery = z.infer<typeof SearchQuerySchema>
```

**API Client 設定**：
```typescript
// src/shared/services/apiClient.ts
import { initClient } from '@ts-rest/core'
import { lyricsContract } from '../contracts/lyrics.contract'

export const apiClient = initClient(lyricsContract, {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  baseHeaders: {
    'Content-Type': 'application/json',
  },
})
```

**與 TanStack Query 整合**：
```typescript
// src/features/search/composables/useSearchLyrics.ts
import { useQuery } from '@tanstack/vue-query'
import { apiClient } from '@/shared/services/apiClient'
import { queryKeys } from '@/shared/services/queryKeys'

export function useSearchLyrics(query: string) {
  return useQuery({
    queryKey: queryKeys.search.results(query),
    queryFn: async () => {
      const response = await apiClient.search({ query: { query } })
      if (response.status !== 200) {
        throw new Error(response.body.message)
      }
      return response.body
    },
    enabled: query.length > 0,
  })
}
```

**理由**：ts-rest + Zod 提供端到端的型別安全，確保前後端 API 契約一致，減少執行階段錯誤並提升開發體驗。

## 技術堆疊規範

**核心技術**：
- **框架**：Vue 3 (Composition API + `<script setup>`)
- **語言**：TypeScript 5.9+，啟用嚴格模式
- **建構工具**：Vite (Rolldown)
- **套件管理**：pnpm
- **測試框架**：
  - E2E 測試：Playwright
  - 單元測試：Vitest
- **程式碼檢查**：OxLint (type-aware 模式)
- **型別檢查**：vue-tsc

**HTTP 請求**：
- **HTTP 客戶端**：Axios
- 所有 API 請求 MUST 透過統一的 Axios instance（`src/shared/services/http.ts`）

**樣式框架**：
- **CSS 框架**：Tailwind CSS v4
- **樣式輔助**：`clsx` 或 `tailwind-merge`（條件式樣式）

**工具函式庫**：
- **組合式函式**：VueUse（@vueuse/core）
- **路由**：Vue Router
- **SEO**：@unhead/vue

**資料快取**：
- **伺服器狀態管理**：TanStack Query（@tanstack/vue-query）
- Query Key MUST 使用 Factory 模式集中管理（`src/shared/services/queryKeys.ts`）

**API Contract**：
- **Contract 定義**：ts-rest（@ts-rest/core）
- **Schema 驗證**：Zod
- Contract 檔案 MUST 放置於 `src/shared/contracts/` 目錄

**相依套件管理**：
- 新增相依套件 MUST 經過團隊評估，考量套件大小、維護狀態、安全性
- 生產環境相依套件 MUST 定期更新，修復已知安全漏洞
- VueUse 函式 MUST 按需引入，避免引入整個套件
- Tailwind CSS SHOULD 啟用 PurgeCSS 移除未使用樣式

## 開發工作流程

**功能開發流程**：
1. 建立功能分支（從 `main` 分支）
2. 撰寫功能規格文件
3. 撰寫 E2E 測試（Playwright）並確認測試失敗
4. 撰寫單元測試（Vitest）並確認測試失敗
5. 實作功能程式碼，使測試通過
6. 執行程式碼檢查 (`pnpm run lint`)
7. 執行所有測試 (`pnpm run test`)
8. 提交 Pull Request 進行程式碼審查
9. 合併至 `main` 分支

**程式碼審查要點**：
- 是否遵循測試優先原則
- 測試覆蓋率是否足夠
- 程式碼是否符合品質標準
- 是否有效能問題
- 使用者體驗是否一致
- 文件和註解是否完整

**品質閘門**：
- 所有測試 MUST 通過
- OxLint 檢查 MUST 通過（零錯誤）
- TypeScript 型別檢查 MUST 通過
- 新功能 MUST 有對應的測試

## 治理機制

**憲章優先原則**：
- 本憲章優先於所有其他開發實踐和慣例
- 任何違反憲章的程式碼 MUST NOT 合併至主分支
- 複雜度例外 MUST 在程式碼中明確記錄並說明理由

**修訂程序**：
1. 提出修訂提案（包含修改內容、理由、影響評估）
2. 團隊討論並達成共識
3. 更新憲章文件並遞增版本號
4. 更新相關範本和文件
5. 通知所有團隊成員

**版本控制**：
- 採用語意化版本 (Semantic Versioning)
- MAJOR：不向後相容的治理/原則變更
- MINOR：新增原則或實質性擴充指南
- PATCH：澄清、措辭修正、非語意調整

**合規性審查**：
- 每次 Pull Request MUST 驗證是否符合憲章規範
- 定期審查專案是否持續遵循憲章原則
- 技術決策 MUST 參考憲章原則進行評估

**Version**: 1.5.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-12-04
