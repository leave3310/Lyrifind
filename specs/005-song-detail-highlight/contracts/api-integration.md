# API Integration Guide: 歌曲詳細頁

**Feature**: 005-song-detail-highlight  
**Date**: 2025-12-30  
**Protocol**: REST API via Google Apps Script  
**Format**: JSON

## 概述

本功能使用 **004-lyrics-search** 功能中已建立的 Google Apps Script API，複用 `getSong` 端點來取得歌曲詳情。**無需新增 API 端點**，僅需整合現有端點即可完成功能。

**資料來源**：Google Sheets（欄位：id, artist, title, lyrics）  
**API 提供者**：Google Apps Script Web App  
**端點 URL 格式**：`https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=getSong&id={song_id}`

**關鍵差異**：本功能不處理搜尋邏輯，僅專注於：
1. 根據 song ID 取得完整歌曲資料
2. 在前端實作歌詞高亮顯示（不依賴後端）
3. 處理 URL query parameter（`?highlight=keyword`）

---

## 使用的現有 API 端點

### 取得歌曲詳情

此端點已在 `004-lyrics-search` 中實作，參考 [search.contract.md](../../004-lyrics-search/contracts/search.contract.md) 的完整規範。

#### 請求

**端點**：`GET {APPS_SCRIPT_URL}?action=getSong`

**查詢參數**：

| 參數名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `action` | `string` | ✅ | 固定值 `getSong` |
| `id` | `string` | ✅ | 歌曲 ID（例如：`song-001`） |

**範例請求**：
```
GET https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=getSong&id=song-001
```

#### 成功回應

**狀態碼**：`200 OK`

**回應結構**：
```json
{
  "id": "song-001",
  "artist": "周杰倫",
  "title": "青花瓷",
  "lyrics": "素胚勾勒出青花筆鋒濃轉淡\n瓶身描繪的牡丹一如妳初妝\n冉冉檀香透過窗心事我了然..."
}
```

**欄位說明**：
- `id`：歌曲唯一識別碼
- `artist`：歌手名稱
- `title`：歌曲名稱
- `lyrics`：完整歌詞內容（使用 `\n` 表示換行）

#### 錯誤回應

**404 Not Found** - 歌曲不存在
```json
{
  "error": {
    "code": "SONG_NOT_FOUND",
    "message": "找不到此歌曲"
  }
}
```

**400 Bad Request** - 請求參數錯誤
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "缺少歌曲 ID"
  }
}
```

**500 Internal Server Error** - 伺服器錯誤
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "伺服器錯誤"
  }
}
```

---

## Google Apps Script 實作參考

本功能**不需要修改 Google Apps Script 程式碼**。以下為現有 `getSong` API 的實作參考（已在 004 功能中實作）：

### Code.gs - handleGetSong 函式

```javascript
// 取得單一歌曲（已在 004 功能中實作，此處僅供參考）
function handleGetSong(id) {
  if (!id) {
    return createJsonResponse({ 
      error: { 
        code: 'INVALID_QUERY', 
        message: '缺少歌曲 ID' 
      } 
    }, 400)
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs')
  const data = sheet.getDataRange().getValues()
  const rows = data.slice(1) // 跳過標題列
  
  const songRow = rows.find(row => row[0] === id)
  
  if (!songRow) {
    return createJsonResponse({ 
      error: { 
        code: 'SONG_NOT_FOUND', 
        message: '找不到此歌曲' 
      } 
    }, 404)
  }
  
  return createJsonResponse({
    id: songRow[0],
    artist: songRow[1],
    title: songRow[2],
    lyrics: songRow[3]
  })
}
```

**重要提醒**：
- 確保 Google Sheets 的欄位順序為：`id`, `artist`, `title`, `lyrics`
- 歌詞欄位應使用實際換行符號，Apps Script 會自動轉換為 `\n`
- 歌曲 ID 必須唯一且一致（與搜尋功能的 ID 格式相同）

---

## 前端服務整合

### 1. 建立 API Service

**檔案位置**：`src/features/song-detail/services/songService.ts`

```typescript
import type { Song } from '@/shared/types/common.types'

/**
 * 歌曲 API 服務
 * 負責與 Google Apps Script 後端通訊
 */
export class SongService {
  private readonly baseUrl: string
  
  constructor() {
    // 從環境變數取得 Apps Script URL
    this.baseUrl = import.meta.env.VITE_APPS_SCRIPT_URL
    
    if (!this.baseUrl) {
      throw new Error('VITE_APPS_SCRIPT_URL 環境變數未設定')
    }
  }
  
  /**
   * 根據 ID 取得歌曲詳情
   * @param id - 歌曲 ID
   * @returns 歌曲物件，若不存在則回傳 null
   * @throws 若 API 回傳非 404 的錯誤
   */
  async getSongById(id: string): Promise<Song | null> {
    const params = new URLSearchParams({
      action: 'getSong',
      id: id
    })
    
    const url = `${this.baseUrl}?${params.toString()}`
    
    try {
      const response = await fetch(url)
      
      // 404 表示歌曲不存在（正常情況）
      if (response.status === 404) {
        return null
      }
      
      // 其他錯誤狀態
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || '取得歌曲失敗')
      }
      
      // 成功回應
      const song: Song = await response.json()
      return song
      
    } catch (error) {
      // 網路錯誤或 JSON 解析錯誤
      if (error instanceof Error) {
        throw new Error(`載入歌曲失敗：${error.message}`)
      }
      throw new Error('載入歌曲失敗，請稍後再試')
    }
  }
  
  /**
   * 驗證歌曲 ID 格式
   * @param id - 要驗證的 ID
   * @returns 是否為有效格式
   */
  validateSongId(id: string): boolean {
    // 根據專案的 ID 格式進行驗證
    // 例如：song-001, song-002 等
    return /^song-\d+$/.test(id)
  }
}

// 匯出單例實例
export const songService = new SongService()
```

---

### 2. 建立 Composable 整合 API

**檔案位置**：`src/features/song-detail/composables/useSongDetail.ts`

```typescript
import { ref, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { songService } from '../services/songService'
import type { Song } from '@/shared/types/common.types'
import { SongDetailError, ERROR_MESSAGES } from '../types/song-detail.types'

export interface UseSongDetailReturn {
  song: Ref<Song | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  reload: () => Promise<void>
}

/**
 * 歌曲詳情 composable
 * 負責載入和管理歌曲資料
 */
export function useSongDetail(): UseSongDetailReturn {
  const route = useRoute()
  const song = ref<Song | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  
  /**
   * 載入歌曲資料
   */
  async function loadSong() {
    const songId = route.params.id as string
    
    // 驗證 ID 格式
    if (!songId || !songService.validateSongId(songId)) {
      error.value = ERROR_MESSAGES[SongDetailError.INVALID_ID]
      isLoading.value = false
      return
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      // 呼叫 API
      const result = await songService.getSongById(songId)
      
      if (result === null) {
        // 歌曲不存在（404）
        error.value = ERROR_MESSAGES[SongDetailError.NOT_FOUND]
      } else {
        // 成功載入
        song.value = result
      }
      
    } catch (err) {
      // 網路錯誤或其他錯誤
      console.error('載入歌曲失敗：', err)
      error.value = ERROR_MESSAGES[SongDetailError.LOAD_FAILED]
      
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 重新載入歌曲
   */
  async function reload() {
    await loadSong()
  }
  
  // 元件掛載時自動載入
  onMounted(() => {
    loadSong()
  })
  
  return {
    song,
    isLoading,
    error,
    reload
  }
}
```

---

### 3. 在 Vue 元件中使用

**檔案位置**：`src/features/song-detail/SongDetailPage.vue`

```vue
<template>
  <div class="song-detail-page">
    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading">
      <p>載入中...</p>
    </div>
    
    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error">
      <p class="error-message">{{ error }}</p>
      <button @click="goBack" class="back-button">
        返回搜尋結果
      </button>
    </div>
    
    <!-- 成功載入 -->
    <div v-else-if="song" class="song-content">
      <!-- 返回按鈕 -->
      <BackButton @click="goBack" />
      
      <!-- 歌曲標題 -->
      <SongHeader 
        :title="song.title" 
        :artist="song.artist" 
      />
      
      <!-- 歌詞內容（支援高亮） -->
      <LyricsContent 
        :lyrics="highlightedLyrics" 
        :has-highlight="hasHighlight" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSongDetail } from './composables/useSongDetail'
import { useLyricsHighlight } from './composables/useLyricsHighlight'
import { useAutoScroll } from './composables/useAutoScroll'
import SongHeader from './components/SongHeader.vue'
import LyricsContent from './components/LyricsContent.vue'
import BackButton from './components/BackButton.vue'

// 載入歌曲資料
const { song, isLoading, error } = useSongDetail()

// 歌詞高亮邏輯
const { highlightedLyrics, hasHighlight } = useLyricsHighlight(song)

// 自動捲動邏輯
useAutoScroll(hasHighlight)

// 返回功能
const router = useRouter()
function goBack() {
  router.back()
}
</script>
```

---

## 環境變數設定

### .env.local

```bash
# Google Apps Script Web App URL
# 從 Apps Script 部署後取得
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

**取得 SCRIPT_ID 的步驟**：
1. 開啟 Google Apps Script 編輯器（在 Google Sheets 中：工具 → 指令碼編輯器）
2. 點擊「部署」→「管理部署」
3. 複製「網頁應用程式網址」中的 URL
4. 貼到 `.env.local` 檔案中

---

## 錯誤處理策略

### 1. 歌曲不存在（404）

**情境**：使用者輸入不存在的歌曲 ID，或歌曲已被刪除。

**處理方式**：
```typescript
if (result === null) {
  error.value = ERROR_MESSAGES[SongDetailError.NOT_FOUND]
  // 顯示錯誤訊息：「找不到歌曲」
  // 提供返回按鈕
}
```

**使用者體驗**：
- 顯示友善的錯誤訊息
- 提供「返回搜尋結果」按鈕
- 不顯示空白頁面或載入動畫

---

### 2. 網路錯誤

**情境**：網路中斷、Apps Script 伺服器無回應、CORS 錯誤。

**處理方式**：
```typescript
catch (err) {
  console.error('載入歌曲失敗：', err)
  error.value = ERROR_MESSAGES[SongDetailError.LOAD_FAILED]
  // 顯示錯誤訊息：「載入歌曲失敗，請稍後再試」
  // 提供重試按鈕
}
```

**使用者體驗**：
- 顯示通用錯誤訊息
- 提供「重試」按鈕（呼叫 `reload()`）
- 記錄錯誤到 console 供開發者除錯

---

### 3. 無效的歌曲 ID

**情境**：URL 中的 song ID 格式不正確（例如：`/song/abc` 而非 `/song/song-001`）。

**處理方式**：
```typescript
if (!songId || !songService.validateSongId(songId)) {
  error.value = ERROR_MESSAGES[SongDetailError.INVALID_ID]
  // 不發送 API 請求，直接顯示錯誤
}
```

**使用者體驗**：
- 立即顯示錯誤（不需等待 API 回應）
- 提供返回首頁或搜尋頁的連結

---

## 測試 API 整合

### 單元測試範例（Vitest）

**檔案位置**：`src/features/song-detail/__tests__/useSongDetail.spec.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSongDetail } from '../composables/useSongDetail'
import { songService } from '../services/songService'

// Mock songService
vi.mock('../services/songService', () => ({
  songService: {
    getSongById: vi.fn(),
    validateSongId: vi.fn()
  }
}))

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'song-001' }
  })
}))

describe('useSongDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('應成功載入歌曲', async () => {
    // Arrange
    const mockSong = {
      id: 'song-001',
      artist: '周杰倫',
      title: '青花瓷',
      lyrics: '素胚勾勒出青花筆鋒濃轉淡...'
    }
    
    vi.mocked(songService.validateSongId).mockReturnValue(true)
    vi.mocked(songService.getSongById).mockResolvedValue(mockSong)
    
    // Act
    const { song, isLoading, error } = useSongDetail()
    
    // 等待 onMounted 完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Assert
    expect(song.value).toEqual(mockSong)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })
  
  it('應處理歌曲不存在（404）', async () => {
    // Arrange
    vi.mocked(songService.validateSongId).mockReturnValue(true)
    vi.mocked(songService.getSongById).mockResolvedValue(null)
    
    // Act
    const { song, error } = useSongDetail()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Assert
    expect(song.value).toBeNull()
    expect(error.value).toBe('找不到歌曲')
  })
  
  it('應處理無效的歌曲 ID', async () => {
    // Arrange
    vi.mocked(songService.validateSongId).mockReturnValue(false)
    
    // Act
    const { error } = useSongDetail()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Assert
    expect(error.value).toBe('無效的歌曲 ID')
    expect(songService.getSongById).not.toHaveBeenCalled() // 不應發送 API 請求
  })
})
```

---

### E2E 測試範例（Playwright）

**檔案位置**：`e2e/song-detail.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('歌曲詳細頁 API 整合', () => {
  test('應成功載入存在的歌曲', async ({ page }) => {
    // 直接訪問歌曲詳細頁
    await page.goto('/song/song-001')
    
    // 等待載入完成
    await page.waitForSelector('[data-testid="song-header"]')
    
    // 驗證歌曲資訊顯示
    const title = await page.textContent('[data-testid="song-title"]')
    const artist = await page.textContent('[data-testid="song-artist"]')
    
    expect(title).toBeTruthy()
    expect(artist).toBeTruthy()
  })
  
  test('應顯示 404 錯誤當歌曲不存在', async ({ page }) => {
    // 訪問不存在的歌曲
    await page.goto('/song/song-999')
    
    // 驗證錯誤訊息顯示
    await page.waitForSelector('[data-testid="error-message"]')
    const errorText = await page.textContent('[data-testid="error-message"]')
    
    expect(errorText).toContain('找不到歌曲')
  })
  
  test('應顯示錯誤當歌曲 ID 無效', async ({ page }) => {
    // 訪問無效的歌曲 ID
    await page.goto('/song/invalid-id')
    
    // 驗證錯誤訊息顯示
    const errorText = await page.textContent('[data-testid="error-message"]')
    
    expect(errorText).toContain('無效的歌曲 ID')
  })
})
```

---

## 型別安全與驗證

### Zod Schema（未來整合）

若專案引入 Zod 進行執行時期驗證，可使用以下 schema：

```typescript
import { z } from 'zod'

// 歌曲 Schema（與 004 功能共用）
export const SongSchema = z.object({
  id: z.string().regex(/^song-\d+$/, '歌曲 ID 格式錯誤'),
  artist: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  lyrics: z.string().min(1).max(10000)
})

// 驗證 API 回應
const song = await songService.getSongById(id)
const validatedSong = SongSchema.parse(song) // 若格式錯誤會拋出異常
```

---

## 常見問題與解決方案

### Q1: CORS 錯誤

**問題**：瀏覽器 console 顯示 `Access-Control-Allow-Origin` 錯誤。

**解決方案**：
1. 確認 Google Apps Script 的 `createJsonResponse` 函式有設定 CORS headers：
   ```javascript
   return ContentService
     .createTextOutput(JSON.stringify(data))
     .setMimeType(ContentService.MimeType.JSON)
     .setHeader('Access-Control-Allow-Origin', '*')  // 重要！
   ```

2. 確認 Apps Script 部署設定為「所有人」存取權。

---

### Q2: API 回應緩慢

**問題**：首次載入時間超過 2 秒（不符合 SC-001）。

**可能原因**：
- Google Apps Script 的「冷啟動」問題（第一次呼叫較慢）
- Google Sheets 資料量過大

**解決方案**：
1. 在 Google Sheets 中使用索引欄位加速查詢
2. 考慮快取策略（使用 Service Worker 或 LocalStorage）
3. 顯示載入動畫提升使用者體驗

---

### Q3: 歌詞換行符號顯示錯誤

**問題**：歌詞顯示為單行，沒有換行。

**解決方案**：
1. 確認 Google Sheets 中的歌詞使用實際換行（按 Alt+Enter）
2. 或在前端將 `\n` 轉換為 `<br>`：
   ```typescript
   const formattedLyrics = lyrics.replace(/\n/g, '<br>')
   ```

3. 或使用 CSS `white-space: pre-wrap;`：
   ```css
   .lyrics {
     white-space: pre-wrap;
   }
   ```

---

## 與 004-lyrics-search 的關聯

| 項目 | 004-lyrics-search | 005-song-detail-highlight |
|------|-------------------|---------------------------|
| **使用的 API** | `search` 端點 | `getSong` 端點 |
| **資料來源** | Google Sheets | Google Sheets（相同） |
| **高亮實作** | 後端回傳 `highlightedSnippet` | 前端實作高亮邏輯 |
| **分頁** | 需要（20 筆/頁） | 不需要（單一歌曲） |
| **URL 狀態** | 搜尋關鍵字 (`?q=`) | 高亮關鍵字 (`?highlight=`) |

**共用資源**：
- `Song` 型別定義（應移至 `src/shared/types/common.types.ts`）
- Apps Script 的 `SCRIPT_ID`（環境變數相同）
- 高亮樣式 CSS class（`bg-yellow-200 font-bold`）

---

## 參考文件

- [004-lyrics-search API Contract](../../004-lyrics-search/contracts/search.contract.md) - 完整 API 規範
- [Google Apps Script Documentation](https://developers.google.com/apps-script) - 官方文件
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - 前端 API 呼叫
- [Vue Router](https://router.vuejs.org/) - 路由與狀態管理

---

## 總結

本功能的 API 整合策略：
1. ✅ **複用現有 API**：不需要修改 Google Apps Script
2. ✅ **前端高亮邏輯**：高亮顯示由前端實作，降低後端負擔
3. ✅ **URL 狀態管理**：透過 query parameter 傳遞高亮關鍵字
4. ✅ **完善錯誤處理**：涵蓋 404、網路錯誤、無效 ID 等情境
5. ✅ **型別安全**：完整的 TypeScript 型別定義

**下一步**：參考 [quickstart.md](../quickstart.md) 開始實作測試和程式碼。
