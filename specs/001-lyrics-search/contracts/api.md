# API 契約定義：歌詞搜尋網站

**Feature Branch**: `001-lyrics-search`  
**建立日期**: 2025-11-27  
**狀態**: 完成

## 概述

本專案為純前端應用程式，透過 Google Sheets API 讀取歌詞資料。以下定義內部服務介面契約。

---

## 服務介面定義

### GoogleSheetsService

負責與 Google Sheets API 通訊，取得原始歌詞資料。

#### 方法

##### `fetchAllSongs(): Promise<Song[]>`

取得所有歌曲資料。

**回傳值**：
- `Song[]` - 所有歌曲陣列

**錯誤情況**：
| 錯誤類型 | 條件 | 錯誤訊息 |
|----------|------|----------|
| `NetworkError` | 網路連線失敗 | 網路連線失敗，請檢查網路設定 |
| `ApiError` | API 回應非 2xx | Google Sheets API 請求失敗 |
| `RateLimitError` | 回應狀態 429 | 請求次數過多，請稍後再試 |

---

### SearchService

負責搜尋功能邏輯。

#### 方法

##### `search(query: SearchQuery): Promise<SearchResponse>`

執行搜尋並回傳結果。

**參數**：
| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `query.keyword` | `string` | ✅ | 搜尋關鍵字（至少 2 字元） |
| `query.page` | `number` | ❌ | 頁碼（預設 1） |
| `query.pageSize` | `number` | ❌ | 每頁筆數（預設 20） |

**回傳值**：
```typescript
{
  results: SearchResult[]  // 搜尋結果
  total: number           // 符合條件的總筆數
  page: number            // 目前頁碼
  pageSize: number        // 每頁筆數
  totalPages: number      // 總頁數
  keyword: string         // 搜尋關鍵字
}
```

**錯誤情況**：
| 錯誤類型 | 條件 | 錯誤訊息 |
|----------|------|----------|
| `ValidationError` | 關鍵字少於 2 字元 | 請輸入至少 2 個字元 |
| `ValidationError` | 關鍵字為空白 | 請輸入搜尋關鍵字 |

---

### LyricsService

負責歌詞詳細資料取得。

#### 方法

##### `getSongById(id: string): Promise<Song>`

根據 ID 取得歌曲詳細資料。

**參數**：
| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | `string` | ✅ | 歌曲唯一識別碼 |

**回傳值**：
- `Song` - 歌曲資料

**錯誤情況**：
| 錯誤類型 | 條件 | 錯誤訊息 |
|----------|------|----------|
| `NotFoundError` | 找不到對應 ID 的歌曲 | 找不到指定的歌曲 |
| `ValidationError` | ID 為空 | 歌曲 ID 不可為空 |

---

## Google Sheets API 規格

### 端點

```
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
```

### 請求參數

| 參數 | 位置 | 必填 | 說明 |
|------|------|------|------|
| `spreadsheetId` | Path | ✅ | Google Sheets 文件 ID |
| `range` | Path | ✅ | 資料範圍（例：`Sheet1!A2:D`） |
| `key` | Query | ✅ | API 金鑰 |
| `majorDimension` | Query | ❌ | 資料方向（預設 ROWS） |

### 回應格式

```json
{
  "range": "Sheet1!A2:D1001",
  "majorDimension": "ROWS",
  "values": [
    ["song-001", "晴天", "周杰倫", "故事的小黃花..."],
    ["song-002", "稻香", "周杰倫", "對這個世界..."]
  ]
}
```

### HTTP 狀態碼

| 狀態碼 | 說明 | 處理方式 |
|--------|------|----------|
| 200 | 成功 | 解析並轉換資料 |
| 400 | 請求參數錯誤 | 顯示錯誤訊息 |
| 403 | 權限不足 | 檢查 API 金鑰設定 |
| 404 | 試算表不存在 | 顯示錯誤訊息 |
| 429 | 請求頻率限制 | 指數退避重試 |
| 500 | 伺服器錯誤 | 重試或顯示錯誤 |

---

## 路由定義

### 前端路由

| 路徑 | 頁面 | 元件 | 說明 |
|------|------|------|------|
| `/` | 首頁 | `HomePage.vue` | 搜尋入口 |
| `/search` | 搜尋結果 | `SearchResultsPage.vue` | Query: `?q={keyword}&page={page}` |
| `/lyrics/:id` | 歌詞詳細 | `LyricsDetailPage.vue` | 動態路由 |

### URL 參數

#### `/search` 頁面

| 參數 | 型別 | 必填 | 預設值 | 說明 |
|------|------|------|--------|------|
| `q` | `string` | ✅ | - | 搜尋關鍵字 |
| `page` | `number` | ❌ | `1` | 頁碼 |

#### `/lyrics/:id` 頁面

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | `string` | ✅ | 歌曲唯一識別碼 |

---

## 錯誤處理規格

### 錯誤回應結構

```typescript
interface AppError {
  code: ErrorCode
  message: string
  retryable: boolean
}
```

### 錯誤代碼對照表

| 錯誤代碼 | HTTP 狀態 | 使用者訊息 | 可重試 |
|----------|-----------|------------|--------|
| `NETWORK_ERROR` | - | 網路連線失敗，請檢查網路設定 | ✅ |
| `API_ERROR` | 5xx | 伺服器發生錯誤，請稍後再試 | ✅ |
| `NOT_FOUND` | 404 | 找不到指定的資源 | ❌ |
| `VALIDATION_ERROR` | 400 | [依據具體驗證錯誤] | ❌ |
| `RATE_LIMIT` | 429 | 請求次數過多，請稍後再試 | ✅ |

---

## 快取策略

### L1 快取（記憶體）

| 項目 | 說明 |
|------|------|
| 儲存位置 | `Map` 物件 |
| 快取內容 | 最近 50 筆搜尋結果 |
| 過期時間 | Session 生命週期 |
| 快取鍵格式 | `search:{keyword}:{page}` |

### L2 快取（LocalStorage）

| 項目 | 說明 |
|------|------|
| 儲存位置 | `localStorage` |
| 快取內容 | 完整歌曲資料 |
| 過期時間 | 1 小時 |
| 快取鍵格式 | `lyrifind:songs` |
| 大小限制 | 5MB |

---

## 相關性排序演算法

### 分數計算

```typescript
function calculateScore(song: Song, keyword: string): number {
  let score = 0
  const lowerKeyword = keyword.toLowerCase()
  const lowerTitle = song.title.toLowerCase()
  const lowerArtist = song.artist.toLowerCase()
  const lowerLyrics = song.lyrics.toLowerCase()

  // 標題完全匹配
  if (lowerTitle === lowerKeyword) {
    score += 100
  }
  // 標題部分匹配
  else if (lowerTitle.includes(lowerKeyword)) {
    score += 80
  }

  // 歌手名稱匹配
  if (lowerArtist.includes(lowerKeyword)) {
    score += 60
  }

  // 歌詞內容匹配
  if (lowerLyrics.includes(lowerKeyword)) {
    score += 40
    // 計算匹配次數加成
    const matchCount = (lowerLyrics.match(new RegExp(lowerKeyword, 'g')) || []).length
    score += Math.min(matchCount * 5, 25) // 最多加 25 分
  }

  return score
}
```

### 排序規則

1. 優先依照 `score` 降序排列
2. 分數相同時，依照 `matchType` 優先順序：
   - `TITLE_EXACT` > `TITLE_PARTIAL` > `ARTIST` > `LYRICS`
3. 同類型時，依照歌曲名稱字母順序
