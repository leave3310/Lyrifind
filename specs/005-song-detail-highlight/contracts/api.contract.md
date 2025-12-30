# Song Detail API Contract

**Feature**: 005-song-detail-highlight  
**Date**: 2025-12-30  
**Protocol**: REST API  
**Format**: JSON

---

## 概述

本功能使用與 004-lyrics-search 相同的 Google Apps Script API，複用 `getSong` 端點來取得歌曲完整資訊。

**重要說明**：Google Apps Script 已經在 004-lyrics-search 中完整實作 `getSong` 功能，**無需任何修改**即可直接使用。

**API 來源**：specs/004-lyrics-search/contracts/search.contract.md  
**複用端點**：`GET {APPS_SCRIPT_URL}?action=getSong&id={songId}`  
**資料來源**：Google Sheets（欄位：id, artist, title, lyrics）  
**實作狀態**：✅ 已完成（包含錯誤處理與 CORS 支援）

---

## 端點規範

### 取得歌曲詳情

本端點已在 004-lyrics-search 功能中實作，完整規範請參考：[specs/004-lyrics-search/contracts/search.contract.md](../../004-lyrics-search/contracts/search.contract.md#2-取得歌曲詳情)

#### 請求

**端點**：`GET {APPS_SCRIPT_URL}?action=getSong&id={songId}`

**查詢參數**：

| 參數名稱 | 型別 | 必填 | 說明 |
|---------|------|------|------|
| `action` | `string` | ✅ | 固定值 `getSong` |
| `id` | `string` | ✅ | 歌曲 ID（例如：`song-001`） |

**範例請求**：
```bash
curl "https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=getSong&id=song-001"
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

**400 Bad Request** - 缺少必填參數
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "缺少歌曲 ID"
  }
}
```

---

## TypeScript 型別定義

本功能複用 004-lyrics-search 的 `Song` 型別：

```typescript
// src/shared/types/common.types.ts (從 search 功能遷移而來)
export interface Song {
  id: string
  artist: string
  title: string
  lyrics: string
}

// src/features/song-detail/services/song.service.ts
export interface GetSongRequest {
  id: string
}

export interface GetSongResponse extends Song {}

export interface GetSongError {
  error: {
    code: 'SONG_NOT_FOUND' | 'INVALID_QUERY' | 'INTERNAL_ERROR'
    message: string
  }
}
```

---

## 前端服務整合範例

### SongService 實作

```typescript
// src/features/song-detail/services/song.service.ts

import type { Song } from '@/shared/types/common.types'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export class SongService {
  /**
   * 透過 ID 取得歌曲詳情
   * @param id 歌曲 ID
   * @returns Song 物件或 null（404 時）
   * @throws Error（其他錯誤）
   */
  async getSongById(id: string): Promise<Song | null> {
    if (!id || id.trim() === '') {
      throw new Error('歌曲 ID 不可為空')
    }

    const params = new URLSearchParams({
      action: 'getSong',
      id: id.trim()
    })

    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)

      // 404 表示歌曲不存在
      if (response.status === 404) {
        return null
      }

      // 其他錯誤
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error?.message || `取得歌曲失敗 (${response.status})`
        )
      }

      const song = await response.json()
      return song
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('網路錯誤，請稍後再試')
    }
  }
}

// 單例模式
export const songService = new SongService()
```

### Composable 整合範例

```typescript
// src/features/song-detail/composables/useSongDetail.ts

import { ref, computed } from 'vue'
import { songService } from '../services/song.service'
import type { Song } from '@/shared/types/common.types'
import { SongDetailError } from '../types/song-detail.types'

export function useSongDetail(songId: string) {
  const song = ref<Song | null>(null)
  const isLoading = ref(false)
  const error = ref<SongDetailError | null>(null)

  const loadSong = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await songService.getSongById(songId)
      
      if (result === null) {
        error.value = SongDetailError.NOT_FOUND
      } else {
        song.value = result
      }
    } catch (err) {
      console.error('Failed to load song:', err)
      error.value = SongDetailError.LOAD_FAILED
    } finally {
      isLoading.value = false
    }
  }

  const hasError = computed(() => error.value !== null)
  const isNotFound = computed(() => error.value === SongDetailError.NOT_FOUND)

  return {
    song,
    isLoading,
    error,
    hasError,
    isNotFound,
    loadSong
  }
}
```

---

## E2E 測試範例（Playwright）

```typescript
// e2e/song-detail.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Song Detail API', () => {
  test('應成功取得歌曲資訊', async ({ request }) => {
    const response = await request.get(
      `${process.env.VITE_APPS_SCRIPT_URL}?action=getSong&id=song-001`
    )

    expect(response.status()).toBe(200)

    const song = await response.json()
    expect(song).toMatchObject({
      id: expect.any(String),
      artist: expect.any(String),
      title: expect.any(String),
      lyrics: expect.any(String)
    })
    expect(song.id).toBe('song-001')
  })

  test('應在歌曲不存在時返回 404', async ({ request }) => {
    const response = await request.get(
      `${process.env.VITE_APPS_SCRIPT_URL}?action=getSong&id=non-existent-id`
    )

    expect(response.status()).toBe(404)

    const errorData = await response.json()
    expect(errorData).toMatchObject({
      error: {
        code: 'SONG_NOT_FOUND',
        message: expect.any(String)
      }
    })
  })

  test('應在缺少 ID 時返回 400', async ({ request }) => {
    const response = await request.get(
      `${process.env.VITE_APPS_SCRIPT_URL}?action=getSong`
    )

    expect(response.status()).toBe(400)

    const errorData = await response.json()
    expect(errorData).toMatchObject({
      error: {
        code: 'INVALID_QUERY',
        message: expect.any(String)
      }
    })
  })
})
```

---

## Google Apps Script 實作確認

### 已實作功能清單

從 `specs/004-lyrics-search/contracts/search.contract.md` 確認，以下功能已完成：

✅ **入口處理**：
```javascript
function doGet(e) {
  const action = e.parameter.action
  
  try {
    if (action === 'search') {
      return handleSearch(e.parameter.q, e.parameter.page || 1)
    } else if (action === 'getSong') {
      return handleGetSong(e.parameter.id)  // ← 已實作
    } else {
      return createJsonResponse({ error: { code: 'INVALID_ACTION', message: '無效的操作' } }, 400)
    }
  } catch (error) {
    return createJsonResponse({ error: { code: 'INTERNAL_ERROR', message: '伺服器錯誤' } }, 500)
  }
}
```

✅ **查詢實作**：
```javascript
function handleGetSong(id) {
  if (!id) {
    return createJsonResponse({ error: { code: 'INVALID_QUERY', message: '缺少歌曲 ID' } }, 400)
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Songs')
  const data = sheet.getDataRange().getValues()
  const rows = data.slice(1)
  
  const songRow = rows.find(row => row[0] === id)
  
  if (!songRow) {
    return createJsonResponse({ error: { code: 'SONG_NOT_FOUND', message: '找不到此歌曲' } }, 404)
  }
  
  return createJsonResponse({
    id: songRow[0],
    artist: songRow[1],
    title: songRow[2],
    lyrics: songRow[3]
  })
}
```

✅ **CORS 支援**：
```javascript
function createJsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
```

### 無需修改的確認

| 需求項目 | 實作狀態 | 說明 |
|---------|---------|------|
| 透過 ID 查找歌曲 | ✅ 已完成 | `handleGetSong(id)` 函式 |
| 404 錯誤處理 | ✅ 已完成 | 歌曲不存在時返回 SONG_NOT_FOUND |
| 400 錯誤處理 | ✅ 已完成 | 缺少 ID 時返回 INVALID_QUERY |
| CORS 支援 | ✅ 已完成 | createJsonResponse 已設定 CORS headers |
| 回傳完整歌詞 | ✅ 已完成 | 包含 id, artist, title, lyrics |

---

## 環境變數設定

確保前端設定正確的 API URL：

```bash
# .env.local
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec
```

---

## 重要提醒

1. **無需修改 Google Apps Script**：004-lyrics-search 已完整實作 `getSong` 端點
2. **直接使用現有 API**：僅需在前端建立 `SongService` 和 `useSongDetail` composable
3. **共用型別定義**：將 `Song` 型別從 `src/features/search/types/` 遷移至 `src/shared/types/`
4. **錯誤處理已完備**：API 已處理 404、400 和 500 錯誤情況
5. **CORS 已設定**：支援跨域請求，無需額外設定

---

## 契約版本

**當前版本**：v1.0.0  
**最後更新**：2025-12-30  
**依賴版本**：004-lyrics-search v1.0.0

**變更歷史**：
- v1.0.0 (2025-12-30): 複用 004-lyrics-search 的 getSong 端點，無需 API 修改
