# Quickstart: 歌詞搜尋網站

**Feature**: 002-lyrics-search  
**Date**: 2025-12-05

## 環境需求

- Node.js 18+
- pnpm 8+
- 現代瀏覽器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+）

## 快速開始

### 1. 安裝相依套件

```bash
pnpm install
```

### 2. 設定環境變數

建立 `.env` 檔案：

```bash
# Google Apps Script Web App URL
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3. 啟動開發伺服器

```bash
pnpm dev
```

開啟瀏覽器訪問 http://localhost:5173

### 4. 執行測試

```bash
# 單元測試
pnpm test

# E2E 測試
pnpm test:e2e

# 測試覆蓋率
pnpm test:coverage
```

### 5. 建構生產版本

```bash
pnpm build
pnpm preview  # 預覽生產版本
```

## Google Apps Script 設定

### 1. 建立 Google Sheet

建立一個 Google Sheet，包含以下欄位（第一列為標題）：

| A | B | C | D |
|---|---|---|---|
| id | artist | title | lyrics |

### 2. 建立 Apps Script

在 Google Sheet 中，點選「擴充功能」→「Apps Script」，貼上以下程式碼：

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const rows = data.slice(1)
  
  const action = e.parameter.action || 'search'
  
  if (action === 'search') {
    return handleSearch(e, headers, rows)
  } else if (action === 'get') {
    return handleGetById(e, headers, rows)
  }
  
  return jsonResponse({ message: '無效的請求' }, 400)
}

function handleSearch(e, headers, rows) {
  const query = (e.parameter.q || '').toLowerCase()
  const page = parseInt(e.parameter.page) || 1
  const limit = parseInt(e.parameter.limit) || 20
  
  if (!query) {
    return jsonResponse({ message: '請輸入搜尋關鍵字' }, 400)
  }
  
  const results = rows
    .map(row => ({
      id: row[0],
      artist: row[1],
      title: row[2],
      lyrics: row[3],
    }))
    .filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.lyrics.toLowerCase().includes(query)
    )
  
  const total = results.length
  const start = (page - 1) * limit
  const paginatedResults = results.slice(start, start + limit).map(({ id, artist, title }) => ({
    id, artist, title
  }))
  
  return jsonResponse({ data: paginatedResults, total })
}

function handleGetById(e, headers, rows) {
  const id = e.parameter.id
  
  if (!id) {
    return jsonResponse({ message: '請提供歌曲 ID' }, 400)
  }
  
  const song = rows
    .map(row => ({
      id: row[0],
      artist: row[1],
      title: row[2],
      lyrics: row[3],
    }))
    .find(s => s.id === id)
  
  if (!song) {
    return jsonResponse({ message: '找不到此歌曲' }, 404)
  }
  
  return jsonResponse(song)
}

function jsonResponse(data, status = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
```

### 3. 部署 Web App

1. 點選「部署」→「新增部署」
2. 選擇類型「網頁應用程式」
3. 設定：
   - 執行身分：我
   - 誰可以存取：任何人
4. 點選「部署」
5. 複製 Web App URL 到 `.env` 檔案

## 專案結構

```
src/
├── features/
│   ├── search/           # 搜尋功能
│   └── lyrics/           # 歌詞詳情功能
├── shared/
│   ├── components/       # 共用元件
│   ├── contracts/        # API Contract
│   ├── services/         # HTTP 服務
│   └── types/            # 共用型別
├── router/               # 路由設定
├── App.vue
├── main.ts
└── style.css
```

## 主要路由

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | 重導向至搜尋頁 |
| `/search` | 搜尋頁 | 搜尋歌曲 |
| `/search?q=關鍵字` | 搜尋結果 | 顯示搜尋結果 |
| `/lyrics/:id` | 歌詞詳情 | 顯示完整歌詞 |

## 驗證清單

- [ ] 可在搜尋欄輸入關鍵字並送出搜尋
- [ ] 搜尋結果正確顯示歌名和歌手
- [ ] 點擊搜尋結果可導向歌詞詳情頁
- [ ] 歌詞詳情頁顯示完整歌詞、歌名、歌手
- [ ] 可從詳情頁返回搜尋結果
- [ ] 載入中顯示載入指示器
- [ ] 錯誤時顯示正體中文錯誤訊息
- [ ] 在行動裝置上正常顯示
