# Research: 歌詞搜尋網站

**Feature**: 002-lyrics-search  
**Date**: 2025-12-05

## 研究任務

### 1. Google Apps Script API 整合

**決定**: 使用 Google Apps Script 作為後端 API，透過 Web App 部署提供 REST-like 端點

**理由**:
- 免費且無需額外伺服器成本
- 直接存取 Google Sheet 資料，無需資料同步
- 支援 CORS，可從前端直接呼叫
- 部署簡單，適合小型專案

**替代方案評估**:
- Firebase Functions：需要付費，對此規模專案過於複雜
- Cloudflare Workers：需要額外資料同步機制
- 直接使用 Google Sheets API：需要 OAuth 認證，對匿名使用者不友善

**實作注意事項**:
- Apps Script Web App 需設定為「任何人都可存取」
- 回應格式需為 JSON
- 需處理 CORS 標頭
- Apps Script 有執行時間限制（6 分鐘），需注意大量資料查詢效能

### 2. TanStack Query + ts-rest 整合模式

**決定**: 使用 ts-rest 定義 API contract，搭配 TanStack Query 進行快取管理

**理由**:
- ts-rest 提供端到端型別安全
- Zod schema 可同時用於驗證與型別推斷
- TanStack Query 自動處理快取、重試、背景更新
- 兩者整合可減少重複程式碼

**最佳實踐**:
```typescript
// 在 queryFn 中使用 ts-rest client
const { data } = useQuery({
  queryKey: queryKeys.search.results(keyword),
  queryFn: () => apiClient.search({ query: { q: keyword } }),
})
```

**快取策略**:
- 搜尋結果：staleTime 5 分鐘（使用者可能多次搜尋相同關鍵字）
- 歌詞詳情：staleTime 30 分鐘（歌詞內容不常變動）

### 3. Vue Router 搜尋狀態保留

**決定**: 使用 URL query parameters 保存搜尋狀態

**理由**:
- 使用者可透過瀏覽器返回按鈕回到搜尋結果
- 搜尋結果頁面可被書籤或分享
- TanStack Query 會根據 query key 自動快取

**實作方式**:
```typescript
// 路由設定
{ path: '/search', component: SearchPage }
{ path: '/lyrics/:id', component: LyricsPage }

// 搜尋時更新 URL
router.push({ path: '/search', query: { q: keyword } })

// 從 URL 讀取搜尋關鍵字
const route = useRoute()
const keyword = computed(() => route.query.q as string)
```

### 4. 響應式設計策略

**決定**: 採用 Mobile-First 設計，使用 Tailwind CSS 斷點

**理由**:
- 搜尋與歌詞閱讀在行動裝置上是常見使用情境
- Tailwind CSS v4 內建響應式工具類別
- 減少 CSS 程式碼量

**斷點規劃**:
- 預設（< 640px）：單欄佈局，全寬搜尋框
- sm（≥ 640px）：搜尋結果卡片兩欄
- md（≥ 768px）：搜尋結果卡片三欄
- lg（≥ 1024px）：歌詞詳情頁面加入側邊欄（預留未來擴充）

### 5. 錯誤處理策略

**決定**: 統一錯誤處理，區分網路錯誤與業務錯誤

**錯誤類型**:
| 類型 | 訊息 | 處理方式 |
|------|------|----------|
| 網路錯誤 | 「網路連線失敗，請檢查網路後重試」 | 顯示重試按鈕 |
| 搜尋無結果 | 「找不到符合的歌曲」 | 顯示空狀態 UI |
| 歌詞不存在 | 「找不到此歌曲」 | 導向 404 頁面 |
| 伺服器錯誤 | 「系統發生錯誤，請稍後再試」 | 顯示錯誤頁面 |

**實作方式**:
- Axios 攔截器統一處理 HTTP 錯誤
- TanStack Query 的 `onError` 回呼處理查詢錯誤
- Vue 元件使用 `ErrorBoundary` 或 `v-if="error"` 顯示錯誤狀態

### 6. 搜尋防抖策略

**決定**: 使用 VueUse 的 `useDebounceFn` 實作搜尋防抖

**理由**:
- 減少不必要的 API 請求
- 避免 Google Apps Script 執行限制
- 提升使用者體驗（減少閃爍）

**參數設定**:
- 防抖延遲：300ms（平衡即時性與效能）
- 最小搜尋長度：1 字元

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((keyword: string) => {
  // 觸發搜尋
}, 300)
```

## 技術決策摘要

| 項目 | 決定 | 理由 |
|------|------|------|
| 後端 API | Google Apps Script Web App | 免費、直接存取 Sheet |
| 狀態管理 | TanStack Query | 自動快取、重試 |
| API 型別安全 | ts-rest + Zod | 端到端型別檢查 |
| 搜尋狀態 | URL query parameters | 可書籤、可返回 |
| 響應式設計 | Tailwind Mobile-First | 行動優先 |
| 搜尋防抖 | VueUse useDebounceFn | 減少 API 請求 |
