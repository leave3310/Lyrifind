# LyriFind 歌詞搜尋網站

LyriFind 是一個歌詞搜尋網站，讓使用者可以透過歌名、歌手名稱或歌詞片段找到想要的歌曲。

## 功能特色

- 🎵 **歌名搜尋**：輸入歌曲名稱快速找到歌詞
- 🎤 **歌手搜尋**：搜尋特定歌手的所有歌曲
- 📝 **歌詞片段搜尋**：輸入記得的歌詞片段找到完整歌曲
- 🔍 **關鍵字高亮**：搜尋結果中高亮顯示匹配的關鍵字
- 📱 **響應式設計**：支援桌面與行動裝置
- ⚡ **快速搜尋**：多層快取機制確保快速回應

## 技術架構

- **前端框架**: Vue 3 + TypeScript + Vite
- **樣式**: Tailwind CSS v4
- **路由**: Vue Router
- **HTTP 用戶端**: Axios
- **工具函式**: VueUse
- **測試**: Vitest + Playwright
- **資料來源**: Google Sheets API

## 開始使用

### 環境需求

- Node.js 18+
- pnpm 8+

### 安裝步驟

1. 複製專案
```bash
git clone https://github.com/your-username/lyrifind.git
cd lyrifind
```

2. 安裝相依套件
```bash
pnpm install
```

3. 設定環境變數
```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入您的 Google API 金鑰和試算表 ID：
```
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_SPREADSHEET_ID=your_spreadsheet_id
```

4. 啟動開發伺服器
```bash
pnpm dev
```

5. 開啟瀏覽器造訪 `http://localhost:5173`

### Google Sheets 資料格式

您的 Google Sheets 試算表需要包含以下欄位（從 A2 開始）：

| 欄位 | 說明 |
|------|------|
| A | 歌曲 ID（唯一識別碼） |
| B | 歌曲名稱 |
| C | 歌手名稱 |
| D | 歌詞內容 |

## 開發指令

```bash
# 啟動開發伺服器
pnpm dev

# 建構正式版本
pnpm build

# 預覽正式版本
pnpm preview

# 執行單元測試
pnpm test

# 執行 E2E 測試
pnpm test:e2e

# 執行型別檢查
pnpm type-check

# 執行 ESLint 檢查
pnpm lint
```

## 專案結構

```
src/
├── features/           # 功能模組
│   ├── search/         # 搜尋功能
│   │   ├── components/ # 搜尋相關元件
│   │   ├── composables/# 組合式函式
│   │   ├── services/   # 服務層
│   │   ├── types/      # 型別定義
│   │   └── views/      # 頁面元件
│   ├── lyrics/         # 歌詞功能
│   └── home/           # 首頁功能
├── shared/             # 共用程式碼
│   ├── components/     # 共用元件
│   ├── composables/    # 共用組合式函式
│   ├── services/       # 共用服務
│   ├── types/          # 共用型別
│   └── utils/          # 工具函式
├── router/             # 路由設定
├── App.vue             # 根元件
├── main.ts             # 應用程式入口
└── style.css           # 全域樣式
```

## 效能優化

- **L1 快取**: 記憶體快取（Map 物件），最多 50 筆搜尋結果
- **L2 快取**: LocalStorage 快取，歌曲資料快取 1 小時
- **程式碼分割**: 路由級懶載入
- **響應式圖片**: 針對不同裝置優化

## 授權條款

MIT License

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送至分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request
